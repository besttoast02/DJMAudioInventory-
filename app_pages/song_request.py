import os
import streamlit as st
import requests

# ── Aesthetic Micro-Wedding Decor (Subtle, delicate, non-intrusive) ─────
st.markdown("""
<div class="wedding-decor-layer" aria-hidden="true">
    <span class="wedding-micro-decor wdecor-1" style="top: 2%; left: 3%;">💍</span>
    <span class="wedding-micro-decor wdecor-2" style="top: 4%; right: 4%;">✨</span>
    <span class="wedding-micro-decor wdecor-3" style="top: 10%; left: 92%;">🥂</span>
    <span class="wedding-micro-decor wdecor-4" style="top: 14%; left: 2%;">🤍</span>
    <span class="wedding-micro-decor wdecor-5" style="top: 22%; right: 3%;">🕊️</span>
    <span class="wedding-micro-decor wdecor-6" style="top: 29%; left: 4%;">✨</span>
    <span class="wedding-micro-decor wdecor-7" style="top: 36%; right: 5%;">💐</span>
    <span class="wedding-micro-decor wdecor-8" style="top: 44%; left: 2%;">💍</span>
    <span class="wedding-micro-decor wdecor-9" style="top: 52%; right: 4%;">🍾</span>
    <span class="wedding-micro-decor wdecor-10" style="top: 61%; left: 3%;">✨</span>
    <span class="wedding-micro-decor wdecor-11" style="top: 70%; right: 6%;">🤍</span>
    <span class="wedding-micro-decor wdecor-12" style="top: 78%; left: 2%;">🥂</span>
    <span class="wedding-micro-decor wdecor-13" style="top: 86%; right: 3%;">🕊️</span>
    <span class="wedding-micro-decor wdecor-14" style="top: 93%; left: 5%;">✨</span>
    <span class="wedding-micro-decor wdecor-15" style="top: 97%; right: 5%;">💍</span>
</div>
""", unsafe_allow_html=True)

# ── Logo at top for mobile / QR visitors ─────────────────────
if os.path.exists("assets/logo.png"):
    st.image("assets/logo.png", width=220)

# ── High-legibility CSS for older crowds & wedding aesthetic ─────
st.markdown("""
<style>
/* Subtle floating micro-decorations layer */
.wedding-decor-layer {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 99999;
    overflow: hidden;
}

.wedding-micro-decor {
    position: absolute;
    font-size: 15px !important;
    opacity: 0.58;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));
    user-select: none;
    pointer-events: none;
    animation: gentleWeddingFloat 6s ease-in-out infinite alternate;
}

@keyframes gentleWeddingFloat {
    0% { transform: translateY(0px) rotate(0deg) scale(0.95); opacity: 0.45; }
    50% { transform: translateY(-7px) rotate(6deg) scale(1.08); opacity: 0.72; }
    100% { transform: translateY(-14px) rotate(-5deg) scale(1); opacity: 0.52; }
}

.wdecor-1  { animation-delay: 0.0s; animation-duration: 5.6s; font-size: 15px !important; }
.wdecor-2  { animation-delay: 0.7s; animation-duration: 6.2s; font-size: 14px !important; }
.wdecor-3  { animation-delay: 1.4s; animation-duration: 4.9s; font-size: 16px !important; }
.wdecor-4  { animation-delay: 2.1s; animation-duration: 7.0s; font-size: 13px !important; }
.wdecor-5  { animation-delay: 0.4s; animation-duration: 5.8s; font-size: 15px !important; }
.wdecor-6  { animation-delay: 1.8s; animation-duration: 6.5s; font-size: 14px !important; }
.wdecor-7  { animation-delay: 2.9s; animation-duration: 5.3s; font-size: 16px !important; }
.wdecor-8  { animation-delay: 1.1s; animation-duration: 6.8s; font-size: 15px !important; }
.wdecor-9  { animation-delay: 2.6s; animation-duration: 5.9s; font-size: 15px !important; }
.wdecor-10 { animation-delay: 0.3s; animation-duration: 6.1s; font-size: 14px !important; }
.wdecor-11 { animation-delay: 2.0s; animation-duration: 5.5s; font-size: 14px !important; }
.wdecor-12 { animation-delay: 1.6s; animation-duration: 6.6s; font-size: 16px !important; }
.wdecor-13 { animation-delay: 3.3s; animation-duration: 5.7s; font-size: 15px !important; }
.wdecor-14 { animation-delay: 0.8s; animation-duration: 6.3s; font-size: 14px !important; }
.wdecor-15 { animation-delay: 2.4s; animation-duration: 5.4s; font-size: 15px !important; }

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
    background-color: rgba(255, 255, 255, 0.08) !important;
    border: 1px solid rgba(255, 215, 0, 0.35) !important;
}

.stTextInput input:focus {
    border: 1px solid #FFD700 !important;
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.3) !important;
}

/* Large text area */
.stTextArea textarea {
    font-size: 20px !important;
    padding: 14px 16px !important;
    border-radius: 10px !important;
    min-height: 115px !important;
    line-height: 1.5 !important;
    background-color: rgba(255, 255, 255, 0.08) !important;
    border: 1px solid rgba(255, 215, 0, 0.35) !important;
}

.stTextArea textarea:focus {
    border: 1px solid #FFD700 !important;
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.3) !important;
}

/* Prominent action button */
.stButton > button {
    font-size: 24px !important;
    padding: 16px 24px !important;
    border-radius: 12px !important;
    font-weight: 800 !important;
    width: 100% !important;
    margin-top: 10px !important;
    background: linear-gradient(135deg, #FFB300 0%, #FF8F00 100%) !important;
    color: #000000 !important;
    border: none !important;
    box-shadow: 0 4px 16px rgba(255, 179, 0, 0.4) !important;
}

.stButton > button:hover {
    background: linear-gradient(135deg, #FFC107 0%, #FFA000 100%) !important;
    box-shadow: 0 6px 20px rgba(255, 179, 0, 0.6) !important;
}

/* Wedding Hero Banner Card */
.wedding-hero-banner {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.12) 0%, rgba(255, 140, 0, 0.06) 100%);
    border: 1.5px solid rgba(255, 215, 0, 0.38);
    border-radius: 16px;
    padding: 24px 20px;
    text-align: center;
    margin-bottom: 24px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    position: relative;
    overflow: hidden;
}

.wedding-badge {
    display: inline-block;
    background: rgba(255, 215, 0, 0.2);
    border: 1px solid #FFD700;
    color: #FFD700;
    padding: 4px 16px;
    border-radius: 20px;
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 1.5px;
    margin-bottom: 10px;
}

.wedding-couple-title {
    font-size: 32px !important;
    font-weight: 800 !important;
    color: #ffffff !important;
    margin: 6px 0 4px 0 !important;
    line-height: 1.25 !important;
    text-shadow: 0 2px 8px rgba(0,0,0,0.5);
}

.wedding-subtitle {
    font-size: 20px !important;
    color: #FFD700 !important;
    font-weight: 600 !important;
    margin-bottom: 12px !important;
}

.wedding-garland {
    font-size: 14px;
    letter-spacing: 6px;
    color: rgba(255, 255, 255, 0.7);
    margin: 8px 0 14px 0;
}

.wedding-description {
    font-size: 21px !important;
    color: #f0f0f0 !important;
    line-height: 1.5 !important;
    max-width: 680px;
    margin: 0 auto !important;
}
</style>
""", unsafe_allow_html=True)

# ── Wedding Celebration Banner ───────────────────────────────
st.markdown("""
<div class="wedding-hero-banner">
    <div class="wedding-badge">💍 CELEBRACIÓN DE BODA 🥂</div>
    <div class="wedding-couple-title">Silvestre Ruiz &amp; María Contreras</div>
    <div class="wedding-subtitle">✨ Wedding Celebration • DJM Audio Live Request ✨</div>
    <div class="wedding-garland">✨ 💍 🕊️ 🤍 💐 🤍 🕊️ 💍 ✨</div>
    <div class="wedding-description">
        ¡Bienvenidos a la gran fiesta de boda de <strong>Silvestre y María</strong>! 
        ¿Quieres escuchar algo en especial o dedicarle un tema a los recién casados? 
        Envíanos tu solicitud y la pondremos en cola para llenar la pista de baile.
    </div>
</div>
""", unsafe_allow_html=True)

# ── Song Request Form ────────────────────────────────────────
with st.form("song_request_form", clear_on_submit=True):
    st.markdown("<div style='display: flex; align-items: center; gap: 8px; margin-bottom: 4px;'><span style='font-size: 16px;'>🎵</span><span style='font-size: 22px; font-weight: 700; color: #ffffff;'>Canción y Artista (Obligatorio - Incluye Ambos)*</span><span style='font-size: 14px;'>💍</span></div>", unsafe_allow_html=True)
    song_and_artist = st.text_input(
        "Canción y Artista (Obligatorio - Incluye Ambos)*",
        placeholder="Ej: Vivir Mi Vida - Marc Anthony (¡Para celebrar a Silvestre y María!)",
        label_visibility="collapsed"
    )
    st.caption("💡 Por favor escribe el título de la canción y el nombre del artista/grupo juntos en esta misma casilla. ¡Un tema para bailar o una dedicatoria para los novios!")
    
    st.markdown("<div style='display: flex; align-items: center; gap: 8px; margin-top: 14px; margin-bottom: 4px;'><span style='font-size: 16px;'>💌</span><span style='font-size: 22px; font-weight: 700; color: #ffffff;'>Mensaje / Felicitación para los Novios y el DJ (Opcional)</span><span style='font-size: 14px;'>🥂</span></div>", unsafe_allow_html=True)
    req_message = st.text_area(
        "Mensaje / Felicitación para los Novios y el DJ (Opcional)",
        placeholder="Ej: ¡Muchas felicidades a los recién casados Silvestre y María! Que viva el amor siempre, con mucho cariño de la Familia Ruiz.",
        label_visibility="collapsed"
    )
    st.caption("✨ ¡Deja una felicitación con tus mejores deseos para Silvestre y María o un saludo para el DJ!")
    
    submitted = st.form_submit_button("🎵 Enviar Solicitud a la Boda", type="primary")
    
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
                message = f"💍 *Boda: Silvestre Ruiz & María Contreras*\n"
                message += f"🎵 *Nueva Solicitud de Canción*\n\n"
                message += f"🏷️ *Canción y Artista:* {song_and_artist}\n"
                if req_message:
                    message += f"💬 *Mensaje / Felicitación:* {req_message}\n"
                
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
                        # Confirmation and Thank You with wedding touch and DJ support info
                        st.markdown(f"""
<div style='background: rgba(76, 175, 80, 0.15); border: 2px solid #4CAF50; border-radius: 14px; padding: 22px; text-align: center; margin: 20px 0;'>
    <div style='font-size: 14px; letter-spacing: 2px; color: #FFD700; margin-bottom: 6px;'>💍 BODA DE SILVESTRE RUIZ &amp; MARÍA CONTRERAS 🥂</div>
    <h2 style='color: #4CAF50; font-size: 28px; font-weight: 800; margin-bottom: 12px;'>🙏 ¡Muchas Gracias por tu Solicitud!</h2>
    <p style='font-size: 22px; font-weight: 600; color: #ffffff; margin-bottom: 15px;'>
        Hemos recibido tu solicitud para la boda de Silvestre y María: <span style='color: #FFD700;'>"{song_and_artist}"</span>.<br/>
        ¡El DJ la pondrá muy pronto para poner a bailar a todos los invitados! 🎶✨
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

# ── Footer / DJ Support ──────────────────────────────────────
st.divider()
st.markdown("""
<div style='text-align: center; color: #e0e0e0; font-size: 20px; line-height: 1.6; padding: 10px 5px;'>
    <div style='font-size: 13px; color: #FFD700; margin-bottom: 6px; letter-spacing: 2px;'>✨ 💍 SILVESTRE &amp; MARÍA 2026 🥂 ✨</div>
    <h3 style='color: #4CAF50; font-size: 26px; font-weight: 800; margin-bottom: 10px;'>🎉 ¡Apoya al DJ! (Opcional)</h3>
    <p style='font-size: 20px; margin-bottom: 10px;'>Si te está gustando el ambiente y la música de la boda, ¡puedes apoyar directamente al DJ!</p>
    <p style='font-size: 24px; font-weight: 800; color: #ffffff; margin: 10px 0;'>
        💸 <strong>Zelle:</strong> <span style='color: #00E676; font-size: 26px;'>(626) 763-5959</span>
    </p>
    <p style='font-size: 21px; margin: 10px 0;'>
        📺 <strong>YouTube:</strong> <a href='https://youtube.com/djmoy0' target='_blank' style='color: #FF5252; text-decoration: underline; font-weight: bold;'>youtube.com/djmoy0</a> (¡Suscríbete!)
    </p>
    <br/>
    <div style='background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 12px; padding: 18px; margin-top: 10px;'>
        <p style='font-size: 20px; font-weight: 600; color: #ffffff; margin-bottom: 8px;'>¿Buscas servicios de DJ profesionales para tu boda o evento?</p>
        <p style='font-size: 24px; font-weight: 800; margin: 8px 0;'>
            📞 <strong>Llama a DJM Audio: <a href='tel:6265063824' style='color: #00E676; text-decoration: underline;'>(626) 506-3824</a></strong>
        </p>
        <p style='font-size: 18px; color: #bbbbbb; margin-top: 4px;'>Especialistas en Bodas, Quinceañeras y Eventos Privados</p>
    </div>
    <br/>
    <small style='font-size: 16px; color: #888888;'>© 2026 DJMAudioProductions. Todos los derechos reservados.</small>
</div>
""", unsafe_allow_html=True)
