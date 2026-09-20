import os
import streamlit as st
import requests

# ── High-Contrast, Night-Friendly CSS (Zero Yellow, High Contrast, Flawless Buttons) ─────
st.markdown("""
<style>
/* Clean dark background & crisp contrast for dim night venues */
.stApp {
    background-color: #0b0f19 !important;
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif !important;
}

/* Base text sizing for older crowds */
.stApp, .stMarkdown p, .stMarkdown span, .stMarkdown div {
    font-size: 21px !important;
    line-height: 1.5 !important;
    color: #ffffff !important;
}

/* Section step badges - Crisp white with pitch black number */
.step-number {
    display: inline-block;
    background: #ffffff !important;
    color: #000000 !important;
    font-weight: 900 !important;
    font-size: 20px !important;
    border-radius: 50%;
    width: 34px;
    height: 34px;
    text-align: center;
    line-height: 34px;
    margin-right: 8px;
    -webkit-text-fill-color: #000000 !important;
}

.step-title {
    font-size: 24px !important;
    font-weight: 800 !important;
    color: #ffffff !important;
    vertical-align: middle;
}

/* Extra large, easy-to-tap input boxes (crisp white borders) */
.stTextInput input {
    font-size: 22px !important;
    font-weight: 600 !important;
    padding: 16px !important;
    border-radius: 12px !important;
    height: 60px !important;
    background-color: #1a2234 !important;
    color: #ffffff !important;
    border: 2px solid #ffffff !important;
}

.stTextInput input::placeholder {
    color: #94a3b8 !important;
    font-size: 19px !important;
    font-weight: 400 !important;
}

.stTextInput input:focus {
    border: 2px solid #00E676 !important;
    background-color: #212c42 !important;
    box-shadow: 0 0 12px rgba(0, 230, 118, 0.4) !important;
}

/* Extra large textarea */
.stTextArea textarea {
    font-size: 20px !important;
    font-weight: 500 !important;
    padding: 16px !important;
    border-radius: 12px !important;
    min-height: 110px !important;
    background-color: #1a2234 !important;
    color: #ffffff !important;
    border: 2px solid rgba(255, 255, 255, 0.6) !important;
}

.stTextArea textarea::placeholder {
    color: #94a3b8 !important;
    font-size: 18px !important;
}

.stTextArea textarea:focus {
    border: 2px solid #00E676 !important;
    background-color: #212c42 !important;
    box-shadow: 0 0 12px rgba(0, 230, 118, 0.4) !important;
}

/* Captions / instructions - clean & legible */
.stCaption, div[data-testid="stCaptionContainer"] {
    font-size: 18px !important;
    color: #cbd5e1 !important;
    margin-top: 4px !important;
    margin-bottom: 12px !important;
}

/* ── SUBMIT BUTTON: Target ALL button variants and force high contrast ── */
div[data-testid="stFormSubmitButton"] > button,
div[data-testid="stFormSubmitButton"] button,
.stButton > button,
button[kind="primary"],
button[kind="secondary"],
button[kind="formSubmit"] {
    background-color: #00E676 !important;
    background: #00E676 !important;
    color: #000000 !important;
    font-size: 26px !important;
    font-weight: 900 !important;
    padding: 18px 24px !important;
    border-radius: 14px !important;
    width: 100% !important;
    height: 72px !important;
    margin-top: 14px !important;
    border: 3px solid #ffffff !important;
    box-shadow: 0 6px 20px rgba(0, 230, 118, 0.4) !important;
    cursor: pointer !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
}

/* CRITICAL: Force inner text/paragraphs/spans inside the button to be deep solid black */
div[data-testid="stFormSubmitButton"] button *,
div[data-testid="stFormSubmitButton"] button p,
div[data-testid="stFormSubmitButton"] button span,
div[data-testid="stFormSubmitButton"] button div,
.stButton button *,
.stButton button p,
.stButton button span,
.stButton button div {
    color: #000000 !important;
    font-size: 25px !important;
    font-weight: 900 !important;
    -webkit-text-fill-color: #000000 !important;
}

div[data-testid="stFormSubmitButton"] button:hover,
.stButton button:hover {
    background-color: #00c853 !important;
    background: #00c853 !important;
    border: 3px solid #ffffff !important;
}

div[data-testid="stFormSubmitButton"] button:hover *,
.stButton button:hover * {
    color: #000000 !important;
    -webkit-text-fill-color: #000000 !important;
}

/* Clean, static wedding header (No yellow, clean platinum/white frame) */
.wedding-card {
    background: #141b2d;
    border: 2px solid #ffffff;
    border-radius: 16px;
    padding: 20px 16px;
    text-align: center;
    margin-bottom: 22px;
}

.wedding-pill {
    display: inline-block;
    background: #ffffff !important;
    color: #000000 !important;
    font-size: 15px !important;
    font-weight: 800 !important;
    padding: 4px 16px;
    border-radius: 20px;
    margin-bottom: 8px;
    letter-spacing: 1px;
    -webkit-text-fill-color: #000000 !important;
}

.wedding-names {
    font-size: 30px !important;
    font-weight: 900 !important;
    color: #ffffff !important;
    margin: 4px 0 6px 0 !important;
    line-height: 1.25 !important;
}

.wedding-decor-bar {
    font-size: 16px;
    color: #ffffff;
    margin: 6px 0 10px 0;
}

.wedding-sub {
    font-size: 21px !important;
    font-weight: 600 !important;
    color: #e2e8f0 !important;
    margin: 0 !important;
}
</style>
""", unsafe_allow_html=True)

# ── Logo at top ──────────────────────────────────────────────
if os.path.exists("assets/logo.png"):
    st.image("assets/logo.png", width=180)

# ── Clear, Static Wedding Header ─────────────────────────────
st.markdown("""
<div class="wedding-card">
    <div class="wedding-pill">💍 BODA DE MARÍA &amp; SILVESTRE 🥂</div>
    <div class="wedding-names">Maria &amp; Silvestre's Wedding Celebration</div>
    <div class="wedding-decor-bar">✨ 🤍 💍 💐 🥂 🤍 ✨</div>
    <div class="wedding-sub">🎵 ¡Pide tu canción al DJ y celebremos con María y Silvestre en la pista!</div>
</div>
""", unsafe_allow_html=True)

# ── Foolproof, Step-by-Step Form ─────────────────────────────
with st.form("song_request_form", clear_on_submit=True):
    # Paso 1: Canción y Artista
    st.markdown("""
    <div style='margin-bottom: 6px;'>
        <span class='step-number'>1</span>
        <span class='step-title'>¿Qué canción quieres escuchar? *</span>
    </div>
    """, unsafe_allow_html=True)
    
    song_and_artist = st.text_input(
        "Canción y Artista",
        placeholder="Ej: Vivir Mi Vida - Marc Anthony (o La Chona)",
        label_visibility="collapsed"
    )
    st.caption("💡 Escribe el nombre de la canción y el artista juntos en esta casilla.")
    
    # Paso 2: Mensaje Opcional
    st.markdown("""
    <div style='margin-top: 18px; margin-bottom: 6px;'>
        <span class='step-number'>2</span>
        <span class='step-title'>Mensaje o Felicitación (Opcional)</span>
    </div>
    """, unsafe_allow_html=True)
    
    req_message = st.text_area(
        "Mensaje",
        placeholder="Ej: ¡Muchas felicidades a María y Silvestre! Con cariño de la familia.",
        label_visibility="collapsed"
    )
    st.caption("💌 Mensaje para los novios o dedicatoria para el DJ.")
    
    # Paso 3: Botón Gigante (Explicit primary type)
    submitted = st.form_submit_button("👉 ENVIAR CANCIÓN AL DJ 🎵", type="primary")
    
    if submitted:
        if not song_and_artist.strip():
            st.error("⚠️ POR FAVOR, ESCRIBE EL NOMBRE DE TU CANCIÓN.")
        else:
            # Enviar a Telegram
            try:
                bot_token = st.secrets.get("TELEGRAM_BOT_TOKEN", os.environ.get("TELEGRAM_BOT_TOKEN", ""))
                chat_id = st.secrets.get("TELEGRAM_CHAT_ID", os.environ.get("TELEGRAM_CHAT_ID", ""))
            except Exception:
                bot_token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
                chat_id = os.environ.get("TELEGRAM_CHAT_ID", "")
            
            if bot_token and chat_id:
                message = f"💍 *Boda: María & Silvestre*\n"
                message += f"🎵 *Nueva Solicitud de Canción*\n\n"
                message += f"🏷️ *Canción:* {song_and_artist}\n"
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
                        # Confirmation and Thank You
                        st.markdown(f"""
<div style='background: #142e1d; border: 3px solid #00E676; border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0;'>
    <div style='font-size: 16px; letter-spacing: 2px; color: #ffffff; font-weight: 800; margin-bottom: 8px;'>💍 BODA DE MARÍA &amp; SILVESTRE 🥂</div>
    <h2 style='color: #00E676; font-size: 32px; font-weight: 900; margin-bottom: 12px;'>✅ ¡SOLICITUD ENVIADA!</h2>
    <p style='font-size: 24px; font-weight: 700; color: #ffffff; margin-bottom: 14px;'>
        Canción recibida: <br/><span style='color: #00E676; font-size: 26px;'>"{song_and_artist}"</span>
    </p>
    <p style='font-size: 21px; color: #e2e8f0;'>
        ¡El DJ la pondrá muy pronto para que bailemos todos con María y Silvestre!
    </p>
    <hr style='border: 0; border-top: 1px solid rgba(255,255,255,0.2); margin: 20px 0;'>
    <h3 style='color: #ffffff; font-size: 24px; font-weight: 800; margin-bottom: 8px;'>🎉 ¿Quieres apoyar al DJ? (Opcional)</h3>
    <p style='font-size: 22px; font-weight: 700; color: #ffffff; margin: 10px 0;'>
        💸 <strong>Zelle:</strong> <span style='color: #00E676; font-size: 26px;'>(626) 763-5959</span>
    </p>
    <p style='font-size: 20px; color: #ffffff; margin: 8px 0;'>
        📺 <strong>YouTube:</strong> <a href='https://youtube.com/djmoy0' target='_blank' style='color: #FF5252; text-decoration: underline; font-weight: bold;'>youtube.com/djmoy0</a>
    </p>
    <p style='font-size: 20px; color: #e0e0e0; margin-top: 12px;'>
        📞 <strong>Contrataciones: <a href='tel:6265063824' style='color: #00E676; text-decoration: underline;'>(626) 506-3824</a></strong>
    </p>
</div>
""", unsafe_allow_html=True)
                    else:
                        st.error(f"Error enviando la solicitud ({response.status_code}). Inténtalo de nuevo.")
                except Exception as e:
                    st.error(f"Error de conexión: {str(e)}")
            else:
                st.warning("Servicio de alertas no disponible temporalmente.")

# ── Simple, Clean Footer ─────────────────────────────────────
st.divider()
st.markdown("""
<div style='text-align: center; color: #ffffff; font-size: 20px; padding: 10px 5px;'>
    <div style='font-size: 14px; color: #ffffff; margin-bottom: 6px; font-weight: 700;'>✨ 💍 MARÍA &amp; SILVESTRE • 2026 🥂 ✨</div>
    <p style='font-size: 20px; margin-bottom: 8px;'>¿Disfrutando de la música de la boda?</p>
    <p style='font-size: 24px; font-weight: 800; color: #ffffff; margin: 6px 0;'>
        💸 <strong>Zelle al DJ:</strong> <span style='color: #00E676;'>(626) 763-5959</span>
    </p>
    <p style='font-size: 20px; margin: 6px 0;'>
        📞 <strong>Contrataciones DJM: <a href='tel:6265063824' style='color: #00E676; text-decoration: underline;'>(626) 506-3824</a></strong>
    </p>
    <br/>
    <small style='font-size: 15px; color: #94a3b8;'>© 2026 DJMAudioProductions</small>
</div>
""", unsafe_allow_html=True)
