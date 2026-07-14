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
    
    MODELS_TO_TRY = [
        "meta-llama/llama-3.3-70b-instruct:free",
        "qwen/qwen3-next-80b-a3b-instruct:free",
        "meta-llama/llama-3.2-3b-instruct:free",
        "nousresearch/hermes-3-llama-3.1-405b:free"
    ]
    
    # Tools are removed because OpenRouter free tier models frequently disable tool-calling endpoints, 
    # causing 404 errors. We inject inventory via system prompt instead!

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
                        inv_str = json.dumps([{"name": i['name'], "cat": i['category'], "price": i.get('rate_daily', 0)} for i in inventory])
                    except Exception as e:
                        inv_str = f"Database error: {e}"
                        
                    # Prepend system prompt to the messages sent to LLM (hidden from UI)
                    system_prompt = {
                        "role": "system",
                        "content": f"You are the DJMAudio AI assistant. Help customers build AV rental packages. Always be polite. Here is the LIVE equipment inventory and prices: {inv_str}. Only suggest items from this list."
                    }
                    temp_messages.insert(0, system_prompt)
                    
                    # 1. Single LLM Call (No Tools needed!)
                    response = client.chat.completions.create(
                        model=MODEL_NAME,
                        messages=temp_messages
                    )
                    
                    ai_reply = response.choices[0].message.content

                    # Show reply
                    st.markdown(ai_reply)
                    
                    # Update real session state only on success
                    # (We do NOT save the system_prompt into session_state to save tokens on future turns)
                    st.session_state.messages.append({"role": "assistant", "content": ai_reply})
                    
                    # Set TTS Text so the component reads it out loud
                    st.session_state.tts_text = ai_reply
                    success = True
                    break # Break the model loop on success

                except Exception as e:
                    last_error = str(e)
                    continue # Try the next model regardless of the error
            
            if success:
                st.rerun()
            else:
                st.error(f"Error communicating with AI: {last_error}")
