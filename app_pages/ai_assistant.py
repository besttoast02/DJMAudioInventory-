import streamlit as st
import streamlit.components.v1 as components
from openai import OpenAI
import db
import json
import os

st.title("🎤 DJM Audio AI Assistant")
st.markdown("Talk to our AI assistant to help you build the perfect rental cart! **Hold the mic button or type a message below.**")

# ── Load Voice Component ──────────────────────────────────────
# Declare the custom component
_voice_component = components.declare_component(
    "voice_component",
    path="assets/voice_component"
)

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
    st.session_state.tts_text = "" # Clear previous TTS

# Check voice input
if voice_res and isinstance(voice_res, dict):
    # Only trigger if the timestamp is new to prevent infinite loops
    if "last_voice_ts" not in st.session_state or voice_res.get("timestamp") != st.session_state.last_voice_ts:
        st.session_state.last_voice_ts = voice_res.get("timestamp")
        transcript = voice_res.get("text", "")
        if transcript:
            user_text = transcript
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
        openrouter_key = st.secrets.get("OPENROUTER_API_KEY", "")
    except:
        openrouter_key = os.getenv("OPENROUTER_API_KEY", "")
        
    if not openrouter_key:
        st.error("Missing OPENROUTER_API_KEY in secrets!")
        st.stop()
        
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=openrouter_key,
    )
    
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

    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):
            try:
                # 1. Initial LLM Call
                response = client.chat.completions.create(
                    model=MODEL_NAME,
                    messages=st.session_state.messages,
                    tools=tools
                )
                
                response_message = response.choices[0].message
                
                # Check for tool calls
                if response_message.tool_calls:
                    # Append the assistant's tool call request to history as a dict
                    st.session_state.messages.append(response_message.model_dump())
                    
                    for tool_call in response_message.tool_calls:
                        if tool_call.function.name == "get_inventory":
                            try:
                                inventory = db.get_available_items()
                                inv_str = json.dumps([{"name": i['name'], "cat": i['category'], "price": i.get('rate_daily', 0)} for i in inventory])
                            except Exception as e:
                                inv_str = f"Error fetching inventory: {str(e)}"
                            
                            st.session_state.messages.append({
                                "tool_call_id": tool_call.id,
                                "role": "tool",
                                "name": "get_inventory",
                                "content": inv_str
                            })
                    
                    # 2. Second LLM Call with tool results
                    second_response = client.chat.completions.create(
                        model=MODEL_NAME,
                        messages=st.session_state.messages
                    )
                    ai_reply = second_response.choices[0].message.content
                else:
                    ai_reply = response_message.content

                # Show reply
                st.markdown(ai_reply)
                st.session_state.messages.append({"role": "assistant", "content": ai_reply})
                
                # Set TTS Text so the component reads it out loud
                st.session_state.tts_text = ai_reply
                st.rerun()

            except Exception as e:
                st.error(f"Error communicating with AI: {e}")
