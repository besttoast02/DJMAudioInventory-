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
    st.session_state.messages = []

# ── TTS State ────────────────────────────────────────────────
if "tts_text" not in st.session_state:
    st.session_state.tts_text = ""

# ── Display Voice Component ──────────────────────────────────
# This renders the mic button and automatically handles Text-To-Speech if tts_text is set
voice_res = _voice_component(tts_text=st.session_state.tts_text, key="voice_widget")

if "proposal_pdf_bytes" in st.session_state and st.session_state.proposal_pdf_bytes:
    st.success("✅ Your Proposal is Ready!")
    st.download_button(
        label="Download Estimate PDF",
        data=st.session_state.proposal_pdf_bytes,
        file_name=f"DJM_Estimate_{st.session_state.proposal_event_name.replace(' ', '_')}.pdf",
        mime="application/pdf",
        type="primary"
    )

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
        timeout=20.0,
    )
    
    MODELS_TO_TRY = [
        "google/gemini-2.5-flash",
        "openai/gpt-4o-mini",
        "meta-llama/llama-3.3-70b-instruct",
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

    def handle_generate_proposal(args):
        import pdf_generator
        import urllib.parse
        
        c_name = args.get("client_name", "TBD")
        c_email = args.get("client_email", "")
        c_phone = args.get("client_phone", "")
        e_name = args.get("event_name", "TBD")
        e_date = args.get("event_date", "TBD")
        v_name = args.get("venue_name", "TBD")
        v_addr = args.get("venue_address", "TBD")
        notes = args.get("notes", "")

        pdf_bytes = pdf_generator.generate_ai_estimate_pdf(
            client_name=c_name,
            event_name=e_name,
            event_date=e_date,
            venue_name=v_name,
            venue_address=v_addr,
            audio_items=args.get("audio_items", []),
            lighting_items=args.get("lighting_items", []),
            video_items=args.get("video_items", []),
            notes=notes
        )
        
        # Log to Database
        combined_notes = f"AI Generated Proposal\nEmail: {c_email}\nPhone: {c_phone}\n\n{notes}"
        try:
            db.create_rental(
                event_name=e_name,
                client_name=c_name,
                client_phone=c_phone,
                event_date=e_date,
                return_date=e_date,
                venue=v_name,
                notes=combined_notes
            )
        except Exception as e:
            print(f"Failed to log AI rental: {e}")

        # Send Email
        c_email = c_email.strip()
        if c_email and "@" in c_email:
            safe_event = "".join(c if c.isalnum() or c in (' ', '_', '-') else '_' for c in e_name).strip().replace(' ', '_')
            filename = f"DJM_Estimate_{safe_event or 'Estimate'}.pdf"
            subject = f"Your DJM Audio Estimate: {e_name}"
            body = f"Hi {c_name},\n\nThank you for choosing DJM Audio! Attached is your requested estimate for {e_name}.\n\nPlease let us know if you have any questions.\n\nBest,\nDJM Audio Team"
            db.send_client_email_with_pdf(c_email, subject, body, pdf_bytes, filename)

        # Store for the UI to display a download button
        st.session_state.proposal_pdf_bytes = pdf_bytes
        st.session_state.proposal_event_name = args.get("event_name", "Estimate")
        
        prompt_3d = args.get("prompt_3d", "A DJ setup at an event")
        encoded = urllib.parse.quote(prompt_3d)
        img_url = f"https://image.pollinations.ai/prompt/{encoded}?width=1024&height=768&nologo=true"
        
        return f"Successfully generated the invoice and emailed it to {c_email}. Tell the user you've emailed it to them, and show them this 3D render image directly using markdown: ![3D Render]({img_url})"

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
        },
        {
            "type": "function",
            "function": {
                "name": "generate_proposal",
                "description": "Generate an estimate/invoice PDF and a 3D render image for the event. Do this when the user asks for a quote, estimate, or invoice. BEFORE calling this, make sure you ask for the client's name, email, phone number, the event type, the event date, and the venue location. Only call this when you have those details.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "client_name": {"type": "string"},
                        "client_email": {"type": "string"},
                        "client_phone": {"type": "string"},
                        "event_name": {"type": "string"},
                        "event_date": {"type": "string"},
                        "venue_name": {"type": "string"},
                        "venue_address": {"type": "string"},
                        "audio_items": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "name": {"type": "string"},
                                    "desc": {"type": "string"},
                                    "qty": {"type": "integer"},
                                    "price": {"type": "number"}
                                }
                            }
                        },
                        "lighting_items": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "name": {"type": "string"},
                                    "desc": {"type": "string"},
                                    "qty": {"type": "integer"},
                                    "price": {"type": "number"}
                                }
                            }
                        },
                        "video_items": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "name": {"type": "string"},
                                    "desc": {"type": "string"},
                                    "qty": {"type": "integer"},
                                    "price": {"type": "number"}
                                }
                            }
                        },
                        "notes": {"type": "string", "description": "Detailed notes for the proposal."},
                        "prompt_3d": {"type": "string", "description": "A detailed, comma-separated image generation prompt to visualize the setup physically."}
                    },
                    "required": ["client_name", "client_email", "client_phone", "event_name", "event_date", "venue_name", "venue_address", "prompt_3d"]
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
                        
                        setups = db.get_setups()
                        setups_str = ""
                        if setups:
                            setups_str = "You can also suggest these real-world setup examples (show them the image URL so they can see it): " + json.dumps(setups)
                    except Exception as e:
                        inv_str = f"Database error: {e}"
                        setups_str = ""
                        
                    # Prepend system prompt to the messages sent to LLM (hidden from UI)
                    system_prompt = {
                        "role": "system",
                        "content": f"You are the DJMAudio AI assistant. Help customers build AV rental packages. Act as a consultative salesperson—most customers do NOT know what audio equipment they need. Ask guiding questions like 'What kind of event is it?', 'How many guests are you expecting?', and 'Is it indoor or outdoor?' to recommend the right setup for them.\n\nAlways be polite. Here is the LIVE equipment inventory and prices: {inv_str}. Only suggest items from this list. You can add items to their cart for them. {setups_str}\n\nWhen a user asks for an estimate or quote, you MUST first ask them for their:\n1. Name\n2. Email Address\n3. Phone Number\n4. Event Date\n5. Venue Name & Address\n\nOnce you have gathered ALL of those details, use the `generate_proposal` tool to log the lead, email the PDF, and generate a 3D render."
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
                            elif tc.function.name == "generate_proposal":
                                args = json.loads(tc.function.arguments)
                                result = handle_generate_proposal(args)
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

                    if not ai_reply and not msg.tool_calls:
                        ai_reply = "I'm here to help with all your DJ and pro audio rental needs! What kind of event are you planning?"

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

