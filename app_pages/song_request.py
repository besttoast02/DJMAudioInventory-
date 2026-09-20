import os
import streamlit as st
import requests

# ── Logo at top for mobile / QR visitors ─────────────────────
if os.path.exists("assets/logo.png"):
    st.image("assets/logo.png", width=220)

st.title(":material/music_note: Solicitar Canción")

# ── High-legibility CSS for older crowds & mobile devices ─────
st.markdown("""
<style>
/* Base typography boost for older crowds */
.stApp, .stMarkdown p, .stMarkdown span {
    font-size: 20px !important;
    line-height: 1.6 !important;
}

/* Widget labels (Canción y Artista, Mensaje, etc.) */
div[data-testid="stWidgetLabel"] p,
div[data-testid="stWidgetLabel"] label {
    font-size: 22px !important;
    font-weight: 700 !important;
    color: #ffffff !important;
    margin-bottom: 6px !important;
}

/* Captions / helper text */
.stCaption, small, div[data-testid="stCaptionContainer"] {
    font-size: 18px !important;
    color: #e0e0e0 !important;
    line-height: 1.4 !important;
}

/* Large input boxes */
.stTextInput input {
    font-size: 21px !important;
    padding: 14px 16px !important;
    border-radius: 10px !important;
    height: 54px !important;
}

/* Large text area */
.stTextArea textarea {
    font-size: 20px !important;
    padding: 14px 16px !important;
    border-radius: 10px !important;
    min-height: 110px !important;
    line-height: 1.5 !important;
}

/* Prominent action button */
.stButton > button {
    font-size: 24px !important;
    padding: 16px 24px !important;
    border-radius: 12px !important;
    font-weight: 800 !important;
    width: 100% !important;
    margin-top: 10px !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
}

/* Big titles */
h1 {
    font-size: 34px !important;
    font-weight: 800 !important;
}
</style>
""", unsafe_allow_html=True)

st.markdown("<p style='font-size: 21px; color: #e0e0e0; margin-bottom: 15px;'>¿Quieres escuchar algo en especial? ¡Envíanos tu solicitud y la pondremos en cola!</p>", unsafe_allow_html=True)

with st.form("song_request_form", clear_on_submit=True):
    song_and_artist = st.text_input(
        "Canción y Artista (Obligatorio - Incluye Ambos)*",
        placeholder="Ej: La Chona - Los Tucanes de Tijuana"
    )
    st.caption("💡 Por favor escribe el título de la canción y el nombre del artista/grupo juntos en esta misma casilla.")
    
    req_message = st.text_area("Mensaje para el DJ (Opcional)", placeholder="Ej: ¡Es para el cumpleañero! Saludos de Carlos")
    
    submitted = st.form_submit_button("🎵 Enviar Solicitud", type="primary")
    
    if submitted:
        if not song_and_artist.strip():
            st.error("⚠️ Por favor, ingresa el nombre de la canción y el artista.")
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
                message += f"🏷️ *Canción y Artista:* {song_and_artist}\n"
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
                        st.balloons()
                        # Confirmation and Thank You with DJ support info
                        st.markdown(f"""
<div style='background: rgba(76, 175, 80, 0.15); border: 2px solid #4CAF50; border-radius: 14px; padding: 22px; text-align: center; margin: 20px 0;'>
    <h2 style='color: #4CAF50; font-size: 28px; font-weight: 800; margin-bottom: 12px;'>🙏 ¡Muchas Gracias por tu Solicitud!</h2>
    <p style='font-size: 22px; font-weight: 600; color: #ffffff; margin-bottom: 15px;'>
        Hemos recibido tu solicitud: <span style='color: #FFD700;'>"{song_and_artist}"</span>.<br/>
        ¡El DJ la pondrá muy pronto para poner a bailar a todos!
    </p>
    <hr style='border: 0; border-top: 1px solid rgba(255,255,255,0.25); margin: 18px 0;'>
    <h3 style='color: #FFD700; font-size: 24px; font-weight: 800; margin-bottom: 8px;'>🎉 ¡Apoya al DJ! (Opcional)</h3>
    <p style='font-size: 20px; color: #f0f0f0; margin-bottom: 10px;'>
        Si estás disfrutando del ambiente y la música, ¡puedes apoyar o dejar una propina directamente al DJ!
    </p>
    <p style='font-size: 24px; font-weight: 800; color: #ffffff; margin: 10px 0;'>
        💸 <strong>Zelle:</strong> <span style='color: #00E676; font-size: 26px;'>(626) 763-5959</span>
    </p>
    <p style='font-size: 21px; margin: 10px 0;'>
        📺 <strong>YouTube:</strong> <a href='https://youtube.com/djmoy0' target='_blank' style='color: #FF5252; text-decoration: underline; font-weight: bold;'>youtube.com/djmoy0</a>
    </p>
    <p style='font-size: 20px; color: #e0e0e0; margin-top: 14px;'>
        ¿Tienes un evento próximo? (Bodas, Quinceañeras, Corporativos)<br/>
        📞 <strong>Llámanos: <a href='tel:6265063824' style='color: #00E676; text-decoration: underline; font-size: 24px;'>(626) 506-3824</a></strong>
    </p>
</div>
""", unsafe_allow_html=True)
                    else:
                        st.error(f"Hubo un problema enviando tu solicitud. Código: {response.status_code}")
                except Exception as e:
                    st.error(f"Error de conexión: {str(e)}")
            else:
                st.warning("El servicio de notificaciones no está configurado (Falta el Token de Telegram).")

st.divider()
st.markdown("""
<div style='text-align: center; color: #e0e0e0; font-size: 20px; line-height: 1.6; padding: 10px 5px;'>
    <h3 style='color: #4CAF50; font-size: 26px; font-weight: 800; margin-bottom: 10px;'>🎉 ¡Apoya al DJ! (Opcional)</h3>
    <p style='font-size: 20px; margin-bottom: 10px;'>Si te está gustando el ambiente y la música, ¡puedes apoyar directamente al DJ!</p>
    <p style='font-size: 24px; font-weight: 800; color: #ffffff; margin: 10px 0;'>
        💸 <strong>Zelle:</strong> <span style='color: #00E676; font-size: 26px;'>(626) 763-5959</span>
    </p>
    <p style='font-size: 21px; margin: 10px 0;'>
        📺 <strong>YouTube:</strong> <a href='https://youtube.com/djmoy0' target='_blank' style='color: #FF5252; text-decoration: underline; font-weight: bold;'>youtube.com/djmoy0</a> (¡Suscríbete!)
    </p>
    <br/>
    <div style='background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 18px; margin-top: 10px;'>
        <p style='font-size: 20px; font-weight: 600; color: #ffffff; margin-bottom: 8px;'>¿Buscas servicios de DJ profesionales para tu evento?</p>
        <p style='font-size: 24px; font-weight: 800; margin: 8px 0;'>
            📞 <strong>Llama a DJM Audio: <a href='tel:6265063824' style='color: #00E676; text-decoration: underline;'>(626) 506-3824</a></strong>
        </p>
        <p style='font-size: 18px; color: #bbbbbb; margin-top: 4px;'>Para todo tipo de eventos (Bodas, Quinceañeras, Corporativos)</p>
    </div>
    <br/>
    <small style='font-size: 16px; color: #888888;'>© 2026 DJMAudioProductions. Todos los derechos reservados.</small>
</div>
""", unsafe_allow_html=True)
