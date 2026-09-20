import os
import streamlit as st
import requests

# ── Logo at top for mobile / QR visitors ─────────────────────
if os.path.exists("assets/logo.png"):
    st.image("assets/logo.png", width=180)

st.title(":material/music_note: Solicitar Canción")

st.markdown("""
<style>
.stTextInput > div > div > input {
    border-radius: 8px;
}
.stTextArea > div > div > textarea {
    border-radius: 8px;
}
.stButton > button {
    border-radius: 8px;
    font-weight: 600;
    width: 100%;
}
</style>
""", unsafe_allow_html=True)

st.write("¿Quieres escuchar algo en especial? ¡Envíanos tu solicitud y la pondremos en cola!")

with st.form("song_request_form", clear_on_submit=True):
    song_name = st.text_input("Nombre de la Canción (Obligatorio)*", placeholder="Ej: La Chona")
    req_message = st.text_area("Mensaje para el DJ (Opcional)", placeholder="Ej: ¡Es para el cumpleañero! Saludos de Carlos")
    
    submitted = st.form_submit_button("Enviar Solicitud", type="primary")
    
    if submitted:
        if not song_name.strip():
            st.error("⚠️ Por favor, ingresa el nombre de la canción.")
        else:
            # Enviar a Telegram
            try:
                bot_token = st.secrets.get("TELEGRAM_BOT_TOKEN", os.environ.get("TELEGRAM_BOT_TOKEN", ""))
                chat_id = st.secrets.get("TELEGRAM_CHAT_ID", os.environ.get("TELEGRAM_CHAT_ID", ""))
            except Exception:
                bot_token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
                chat_id = os.environ.get("TELEGRAM_CHAT_ID", "")
            
            if bot_token and chat_id:
                message = f"🎵 *Nueva Solicitud de Canción*\n\n"
                message += f"🏷️ *Canción:* {song_name}\n"
                if req_message:
                    message += f"💬 *Mensaje:* {req_message}\n"
                
                try:
                    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
                    payload = {
                        "chat_id": chat_id,
                        "text": message,
                        "parse_mode": "Markdown"
                    }
                    response = requests.post(url, json=payload, timeout=10)
                    
                    if response.status_code == 200:
                        st.success("✅ ¡Tu solicitud ha sido enviada con éxito! La pondremos pronto.")
                        st.balloons()
                    else:
                        st.error(f"Hubo un problema enviando tu solicitud. Código: {response.status_code}")
                except Exception as e:
                    st.error(f"Error de conexión: {str(e)}")
            else:
                st.warning("El servicio de notificaciones no está configurado (Falta el Token de Telegram).")

st.divider()
st.markdown("""
<div style='text-align: center; color: #888;'>
    <h3 style='color: #4CAF50;'>🎉 ¡Apoya al DJ! (Opcional)</h3>
    <p>Si te está gustando el ambiente, ¡puedes apoyar directamente al DJ!</p>
    <p>💸 <strong>Zelle:</strong> (626) 763-5959</p>
    <p>📺 <strong>YouTube:</strong> <a href='https://youtube.com/djmoy0' target='_blank' style='color: #FF0000; text-decoration: none;'>youtube.com/djmoy0</a> (¡Suscríbete!)</p>
    <br/>
    <p>¿Buscas servicios de DJ profesionales?</p>
    <p>📞 <strong>Llama a DJM Audio Productions: (626) 506-3824</strong><br/>
    Para todo tipo de eventos (Bodas, Quinceañeras, Corporativos)</p>
    <br/>
    <small>© 2026 DJMAudioProductions. Todos los derechos reservados.</small>
</div>
""", unsafe_allow_html=True)
