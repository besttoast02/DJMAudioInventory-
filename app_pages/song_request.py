import streamlit as st
import requests

st.title(":material/music_note: Song Request")

st.info('''
🎶 **Request a Song for Your Event**  
When you hire **DJM Audio** for DJ services, this live song request system is available to your guests during the event. Submit your requests below and we'll queue them up!
''', icon="ℹ️")

st.markdown("""
<style>
.stTextInput > div > div > input {
    border-radius: 8px;
}
.stButton > button {
    border-radius: 8px;
    font-weight: 600;
    width: 100%;
}
</style>
""", unsafe_allow_html=True)

st.write("Want to hear something special? Send us your song request and we'll add it to the queue!")

with st.form("song_request_form", clear_on_submit=True):
    song_name = st.text_input("Song Title (Required)*", placeholder="e.g. Blinding Lights")
    artist = st.text_input("Artist (Optional)", placeholder="e.g. The Weeknd")
    genre = st.selectbox("Genre (Optional)", ["Select...", "Hip-Hop / R&B", "Latin / Reggaeton", "Pop", "Rock", "EDM / Electronic", "Country", "Regional Mexican", "Cumbia / Salsa", "Other"])
    link = st.text_input("YouTube/Spotify Link (Optional)", placeholder="https://...")
    requester_name = st.text_input("Your Name (Optional)", placeholder="e.g. John")
    req_message = st.text_area("Message to the DJ (Optional)", placeholder="e.g. It's my friend's birthday!")
    
    st.info("Note: The artist and link are optional, but the song title is required.")
    
    submitted = st.form_submit_button("Submit Request", type="primary")
    
    if submitted:
        if not song_name.strip():
            st.error("⚠️ Please enter a song title.")
        else:
            # Send to Telegram
            import os
            try:
                bot_token = st.secrets.get("TELEGRAM_BOT_TOKEN", os.environ.get("TELEGRAM_BOT_TOKEN", ""))
                chat_id = st.secrets.get("TELEGRAM_CHAT_ID", os.environ.get("TELEGRAM_CHAT_ID", ""))
            except Exception:
                bot_token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
                chat_id = os.environ.get("TELEGRAM_CHAT_ID", "")
            
            if bot_token and chat_id:
                genre_text = genre if genre != "Select..." else "Not specified"
                message = f"🎵 *New Song Request*\n\n"
                if requester_name:
                    message += f"👤 *From:* {requester_name}\n"
                message += f"🏷️ *Song:* {song_name}\n"
                if artist:
                    message += f"🎤 *Artist:* {artist}\n"
                message += f"🎼 *Genre:* {genre_text}\n"
                if link:
                    message += f"🔗 *Link:* {link}\n"
                if req_message:
                    message += f"\n💬 *Message:* {req_message}\n"
                
                try:
                    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
                    payload = {
                        "chat_id": chat_id,
                        "text": message,
                        "parse_mode": "Markdown"
                    }
                    response = requests.post(url, json=payload)
                    
                    if response.status_code == 200:
                        st.success("✅ Your song request has been submitted! We'll queue it up soon.")
                        st.balloons()
                    else:
                        st.error(f"There was a problem sending your request. Code: {response.status_code}")
                except Exception as e:
                    st.error(f"Connection error: {str(e)}")
            else:
                st.warning("The notification service is not configured (Telegram token missing).")

st.divider()
st.markdown("""
<div style='text-align: center; color: #888;'>
    <h3 style='color: #4CAF50;'>🎉 Tip the DJ! (Optional)</h3>
    <p>If you're enjoying the vibes, you can support the DJ directly!</p>
    <p>💸 <strong>Zelle:</strong> (626) 763-5959</p>
    <p>📺 <strong>YouTube:</strong> <a href='https://youtube.com/djmoy0' target='_blank' style='color: #FF0000; text-decoration: none;'>youtube.com/djmoy0</a> (Subscribe!)</p>
    <br/>
    <p>Looking for professional DJ services?</p>
    <p>📞 <strong>Call DJM Audio Productions: <a href="tel:+16265063824" style="color:inherit;">(626) 506-3824</a></strong><br/>
    For all types of events (Weddings, Quinceañeras, Corporate)</p>
    <br/>
    <small>© 2026 DJM Audio Productions LLC. All rights reserved.</small>
</div>
""", unsafe_allow_html=True)
