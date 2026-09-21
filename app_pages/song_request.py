import streamlit as st
import requests

st.title(":material/music_note: Solicitar Canción")

st.info('''
🎊 **¡El Evento ha Terminado! Felicidades a los Novios** (19 de Septiembre, 2026)  
Gracias a todos los que nos acompañaron. El sistema de solicitudes de canciones estuvo activo durante el evento—esta es una de las funciones exclusivas que ofrecemos al contratar a **DJM Audio** para servicios de DJ o renta de equipo.  

*Nota: El evento ha concluido, por lo que las solicitudes enviadas ahora ya no serán recibidas por el DJ en vivo.*
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

st.write("¿Quieres escuchar algo en especial? ¡Envíanos tu solicitud y la pondremos en cola!")

with st.form("song_request_form", clear_on_submit=True):
    song_name = st.text_input("Título de la Canción (Obligatorio)*", placeholder="Ej: La Clika")
    artist = st.text_input("Artista (Opcional)", placeholder="Ej: Los De Tamaulipas")
    genre = st.selectbox("Género Musical (Opcional)", ["Seleccionar...", "Regional Mexicano", "Cumbia", "Salsa", "Reggaeton", "Pop", "Rock", "Otro"])
    link = st.text_input("Enlace de YouTube/Spotify (Opcional)", placeholder="https://...")
    requester_name = st.text_input("Tu Nombre (Opcional)", placeholder="Ej: Juan Pérez")
    req_message = st.text_area("Mensaje al DJ (Opcional)", placeholder="Ej: ¡Es para el cumpleaños de mi hermano!")
    
    st.info("Nota: El nombre del artista y el enlace son opcionales, pero el título de la canción es obligatorio.")
    
    submitted = st.form_submit_button("Enviar Solicitud", type="primary")
    
    if submitted:
        if not song_name.strip():
            st.error("⚠️ Por favor, ingresa el título de la canción.")
        else:
            # Enviar a Telegram
            import os
            try:
                bot_token = st.secrets.get("TELEGRAM_BOT_TOKEN", os.environ.get("TELEGRAM_BOT_TOKEN", ""))
                chat_id = st.secrets.get("TELEGRAM_CHAT_ID", os.environ.get("TELEGRAM_CHAT_ID", ""))
            except Exception:
                bot_token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
                chat_id = os.environ.get("TELEGRAM_CHAT_ID", "")
            
            if bot_token and chat_id:
                genre_text = genre if genre != "Seleccionar..." else "No especificado"
                message = f"🎵 *Nueva Solicitud de Canción*\n\n"
                if requester_name:
                    message += f"👤 *De:* {requester_name}\n"
                message += f"🏷️ *Canción:* {song_name}\n"
                if artist:
                    message += f"🎤 *Artista:* {artist}\n"
                message += f"🎼 *Género:* {genre_text}\n"
                if link:
                    message += f"🔗 *Enlace:* {link}\n"
                if req_message:
                    message += f"\n💬 *Mensaje:* {req_message}\n"
                
                try:
                    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
                    payload = {
                        "chat_id": chat_id,
                        "text": message,
                        "parse_mode": "Markdown"
                    }
                    response = requests.post(url, json=payload)
                    
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
