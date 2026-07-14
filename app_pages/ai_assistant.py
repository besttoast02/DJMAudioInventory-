import streamlit as st
import streamlit.components.v1 as components
from openai import OpenAI
import db
import json
import os

st.title("🎤 DJM Audio AI Assistant")
st.markdown("Talk to our AI assistant to help you build the perfect rental cart! **Hold the mic button or type a message below.**")

# ── Load Voice Component ──────────────────────────────────────
from custom_widgets import _voice_component

# ── Initialize State ──────────────────────────────────────────
if "messages" not in st.session_state:
    st.session_state.messages = [
        {"role": "system", "content": "You are the DJM Audio AI Assistant. Help customers build rental carts by answering questions about AV gear. Keep your answers concise, conversational, and friendly."}
    ]

# ── TTS State ────────────────────────────────────────────────
if "tts_text" not in st.session_state:
    st.session_state.tts_text = ""

# ── Display Voice Component ──────────────────────────────────
# This renders the mic button and automatically handles Text-To-Speech if tts_text is set
voice_res = _voice_component(tts_text=st.session_state.tts_text, key="voice_widget")

# ── Handle Input ──────────────────────────────────────────────
user_text = ""

# Check text input
if prompt := st.chat_input("Type your message here..."):
    user_text = prompt
    st.session_state.input_method = "text"
    st.session_state.tts_text = "" # Clear previous TTS

# Check voice input
if voice_res and isinstance(voice_res, dict):
    # Only trigger if the timestamp is new to prevent infinite loops
    if "last_voice_ts" not in st.session_state or voice_res.get("timestamp") != st.session_state.last_voice_ts:
        st.session_state.last_voice_ts = voice_res.get("timestamp")
        transcript = voice_res.get("text", "")
        if transcript:
            user_text = transcript
            st.session_state.input_method = "voice"
            st.session_state.tts_text = ""

# ── Display Chat History ──────────────────────────────────────
for msg in st.session_state.messages:
    # Ensure msg is a dict (fallback for Pydantic objects)
    msg_dict = msg if isinstance(msg, dict) else msg.model_dump()
    
    if msg_dict["role"] != "system" and msg_dict["role"] != "tool":
        # Don't show raw tool calls to the user
        if not msg_dict.get("tool_calls") and msg_dict.get("content"):
            with st.chat_message(msg_dict["role"]):
                st.markdown(msg_dict["content"])

# ── Process LLM ───────────────────────────────────────────────
if user_text:
    # Show user message
    with st.chat_message("user"):
        st.markdown(user_text)
    
    st.session_state.messages.append({"role": "user", "content": user_text})
    
    # Get Keys
    openrouter_key = ""
    try:
        openrouter_key = db.get_secret("OPENROUTER_API_KEY", "")
    except:
        openrouter_key = os.getenv("OPENROUTER_API_KEY", "")
        
    if not openrouter_key:
        st.error("Missing OPENROUTER_API_KEY in secrets!")
        st.stop()
        
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=openrouter_key,
    )
    
    MODELS_TO_TRY = [
        "google/gemini-2.5-flash",
        "google/gemini-2.5-flash-lite",
    ]
    
    def add_item_to_cart(barcode: str, qty: int = 1):
        inventory = db.get_available_items()
        item = next((i for i in inventory if i["barcode"] == barcode), None)
        if not item:
            return f"Item {barcode} not found in inventory."
            
        if "cart" not in st.session_state:
            st.session_state.cart = {}
            
        if barcode in st.session_state.cart:
            st.session_state.cart[barcode]["qty"] += qty
        else:
            st.session_state.cart[barcode] = {
                "name": item["name"],
                "brand": item.get("brand", ""),
                "category": item.get("category", ""),
                "barcode": barcode,
                "qty": qty,
                "rate_daily": item.get("rate_daily", 0),
                "rate_weekend": item.get("rate_weekend", 0),
                "rate_half_day": item.get("rate_half_day", 0),
                "max_qty": item.get("quantity", 1),
                "is_service": False,
            }
        return f"Successfully added {qty}x {item['name']} to cart."

    tools = [
        {
            "type": "function",
            "function": {
                "name": "add_item_to_cart",
                "description": "Add an item to the user's rental cart. Use the barcode from the inventory.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "barcode": {"type": "string", "description": "The exact barcode of the item"},
                        "qty": {"type": "integer", "description": "Quantity to add"}
                    },
                    "required": ["barcode", "qty"]
                }
            }
        }
    ]

    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):
            success = False
            last_error = None
            
            for MODEL_NAME in MODELS_TO_TRY:
                # Use a temporary list for this model's attempt to avoid polluting history on failure
                temp_messages = list(st.session_state.messages)
                
                try:
                    # Fetch live inventory immediately
                    try:
                        inventory = db.get_available_items()
                        inv_str = json.dumps([{"name": i['name'], "cat": i['category'], "price": i.get('rate_daily', 0), "barcode": i['barcode']} for i in inventory])
                    except Exception as e:
                        inv_str = f"Database error: {e}"
                        
                    # Prepend system prompt to the messages sent to LLM (hidden from UI)
                    system_prompt = {
                        "role": "system",
                        "content": f"You are the DJMAudio AI assistant. Help customers build AV rental packages. Always be polite. Here is the LIVE equipment inventory and prices: {inv_str}. Only suggest items from this list. You can add items to their cart for them."
                    }
                    temp_messages.insert(0, system_prompt)
                    
                    # 1. LLM Call
                    response = client.chat.completions.create(
                        model=MODEL_NAME,
                        messages=temp_messages,
                        tools=tools
                    )
                    
                    msg = response.choices[0].message
                    ai_reply = msg.content

                    if msg.tool_calls:
                        temp_messages.append(msg.model_dump())
                        for tc in msg.tool_calls:
                            if tc.function.name == "add_item_to_cart":
                                args = json.loads(tc.function.arguments)
                                result = add_item_to_cart(args.get("barcode"), args.get("qty", 1))
                                temp_messages.append({
                                    "role": "tool",
                                    "tool_call_id": tc.id,
                                    "name": tc.function.name,
                                    "content": result
                                })
                        
                        response2 = client.chat.completions.create(
                            model=MODEL_NAME,
                            messages=temp_messages
                        )
                        ai_reply = response2.choices[0].message.content
                        
                        # Add tool calls to history
                        st.session_state.messages.append(msg.model_dump())
                        for m in temp_messages:
                            if m.get("role") == "tool":
                                st.session_state.messages.append(m)

                    if ai_reply:
                        st.markdown(ai_reply)
                        st.session_state.messages.append({"role": "assistant", "content": ai_reply})
                        if st.session_state.get("input_method") == "voice":
                            st.session_state.tts_text = ai_reply
                        
                    success = True
                    break

                except Exception as e:
                    last_error = str(e)
                    continue 
            
            if success:
                st.rerun()
            else:
                st.error(f"Error communicating with AI: {last_error}")
