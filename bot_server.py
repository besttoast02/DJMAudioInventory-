import os
import sqlite3
import httpx
from fastapi import FastAPI, Request, HTTPException, Header, BackgroundTasks
import uvicorn
from contextlib import asynccontextmanager
import db  # Import DJMAudio existing database logic

# Read secrets if available (since Streamlit secrets aren't auto-loaded in FastAPI)
try:
    import toml
    secrets = toml.load(".streamlit/secrets.toml")
    TELEGRAM_BOT_TOKEN = secrets.get("TELEGRAM_BOT_TOKEN", "")
    TELEGRAM_WEBHOOK_SECRET = secrets.get("TELEGRAM_WEBHOOK_SECRET", "")
    OPENROUTER_API_KEY = secrets.get("OPENROUTER_API_KEY", "")
except Exception:
    TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
    TELEGRAM_WEBHOOK_SECRET = os.getenv("TELEGRAM_WEBHOOK_SECRET", "")
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")

# Setup SQLite Database for Conversation Memory
def init_db():
    conn = sqlite3.connect('bot_memory.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            role TEXT,
            content TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(lifespan=lifespan)

# Telegram Helper
async def send_telegram_message(chat_id: str, text: str):
    if not TELEGRAM_BOT_TOKEN:
        print("Missing TELEGRAM_BOT_TOKEN")
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    async with httpx.AsyncClient() as client:
        await client.post(url, json={"chat_id": chat_id, "text": text})

# OpenAI LLM Pipeline
async def process_with_llm(user_id: str, user_text: str):
    # Save user message
    conn = sqlite3.connect('bot_memory.db')
    c = conn.cursor()
    c.execute("INSERT INTO messages (user_id, role, content) VALUES (?, ?, ?)", (user_id, 'user', user_text))
    conn.commit()

    # Get chat history
    c.execute("SELECT role, content FROM messages WHERE user_id = ? ORDER BY timestamp DESC LIMIT 10", (user_id,))
    history = c.fetchall()
    conn.close()
    
    # Reorder history (oldest first)
    messages = [{"role": "system", "content": "You are the DJM Audio AI Assistant. Help customers build rental carts by answering questions about AV gear."}]
    for role, content in reversed(history):
        messages.append({"role": role, "content": content})
    
    if not OPENROUTER_API_KEY:
        return "I'm offline right now (Missing OpenRouter API Key). Tell the admin to update secrets.toml!"

    # Call OpenRouter (using OpenAI SDK)
    from openai import AsyncOpenAI
    client = AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=OPENROUTER_API_KEY,
    )
    
    # We use a fast, free model capable of tool calling
    MODEL_NAME = "meta-llama/llama-3.3-70b-instruct:free"
    
    tools = [
        {
            "type": "function",
            "function": {
                "name": "get_inventory",
                "description": "Get the live DJMAudio inventory of rental equipment to suggest to the user.",
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            }
        }
    ]

    # We loop through a list of models to gracefully handle rate limits on the free tier
    MODELS_TO_TRY = [
        "meta-llama/llama-3.3-70b-instruct:free",
        "google/gemma-4-31b-it:free",
        "nousresearch/hermes-3-llama-3.1-405b:free"
    ]
    
    last_error = None
    import json
    
    for MODEL_NAME in MODELS_TO_TRY:
        # Use a temporary list for this model's attempt
        temp_messages = list(messages)
        try:
            response = await client.chat.completions.create(
                model=MODEL_NAME,
                messages=temp_messages,
                tools=tools
            )
            
            response_message = response.choices[0].message
            
            # Check if model wants to call a tool
            if response_message.tool_calls:
                temp_messages.append(response_message.model_dump())
                for tool_call in response_message.tool_calls:
                    if tool_call.function.name == "get_inventory":
                        # Call the actual DB
                        try:
                            inventory = db.get_available_items()
                            # Summarize to save tokens
                            inv_str = json.dumps([{"name": i['name'], "cat": i['category'], "price": i.get('rate_daily', 0)} for i in inventory])
                        except Exception as e:
                            inv_str = f"Error fetching inventory: {str(e)}"
                        
                        temp_messages.append({
                            "tool_call_id": tool_call.id,
                            "role": "tool",
                            "name": "get_inventory",
                            "content": inv_str
                        })
                
                # Get final response after tool call
                second_response = await client.chat.completions.create(
                    model=MODEL_NAME,
                    messages=temp_messages
                )
                ai_reply = second_response.choices[0].message.content
            else:
                ai_reply = response_message.content
            
            # Save AI reply
            conn = sqlite3.connect('bot_memory.db')
            c = conn.cursor()
            c.execute("INSERT INTO messages (user_id, role, content) VALUES (?, ?, ?)", (user_id, 'assistant', ai_reply))
            conn.commit()
            conn.close()
            
            return ai_reply
            
        except Exception as e:
            last_error = str(e)
            if "429" in last_error or "rate-limit" in last_error.lower():
                continue
            else:
                break
                
    return "Sorry, I am currently experiencing high traffic and my servers are rate-limited. Please try again in 30 seconds."


# 1. Telegram Webhook Endpoint
@app.post("/api/telegram/webhook")
async def telegram_webhook(request: Request, background_tasks: BackgroundTasks, x_telegram_bot_api_secret_token: str = Header(None)):
    # Validate Secret
    if TELEGRAM_WEBHOOK_SECRET and x_telegram_bot_api_secret_token != TELEGRAM_WEBHOOK_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    update = await request.json()
    message = update.get("message", {})
    chat_id = str(message.get("chat", {}).get("id", ""))
    text = message.get("text", "").strip()

    if not chat_id or not text:
        return {"ok": True}

    if text in ["/start", "/help"]:
        background_tasks.add_task(send_telegram_message, chat_id, "Welcome to DJM Audio! I'm your AI assistant. Tell me what kind of event you're throwing, and I'll help you build an AV equipment cart.")
        return {"ok": True}

    # Pass to internal message pipeline asynchronously to prevent Telegram timeouts
    async def process_and_reply(cid, txt):
        try:
            ai_reply = await process_with_llm(cid, txt)
            await send_telegram_message(cid, ai_reply)
        except Exception as e:
            print("Pipeline error:", e)
            await send_telegram_message(cid, "Sorry, I'm experiencing high traffic right now and couldn't process your request.")

    background_tasks.add_task(process_and_reply, chat_id, text)
    
    return {"ok": True}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3002)
