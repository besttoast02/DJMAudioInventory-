import streamlit as st
import db
import pyotp

# ── Page config ──────────────────────────────────────────────
st.set_page_config(
    page_title="DJMAudio Inventory",
    page_icon=":material/speaker:",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Branding & Styles ────────────────────────────────────────
st.logo("https://djmaudio.com/wp-content/uploads/2025/02/DJM-Logo-copy-300x300.png", link="https://djmaudio.com")

st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
html, body, .stApp {
    font-family: 'DM Sans', sans-serif;
}
/* Protect icons */
span.material-symbols-rounded, i, .stIcon, [class*="material-symbols"] {
    font-family: 'Material Symbols Rounded' !important;
}

/* ═══════════════════════════════════════════════════════════
   EQ VISUALIZER BACKGROUND — pure CSS, always-on
   ═══════════════════════════════════════════════════════════ */
@keyframes eqPulse1 { 0%,100%{height:8%} 50%{height:45%} }
@keyframes eqPulse2 { 0%,100%{height:12%} 50%{height:60%} }
@keyframes eqPulse3 { 0%,100%{height:6%} 50%{height:35%} }
@keyframes eqPulse4 { 0%,100%{height:15%} 50%{height:55%} }
@keyframes eqPulse5 { 0%,100%{height:10%} 50%{height:50%} }

.stApp::before {
    content: '';
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100vh;
    z-index: 0;
    pointer-events: none;
    background:
        /* EQ bar 1 */
        linear-gradient(0deg, rgba(197,78,233,0.06) 0%, transparent 100%) no-repeat,
        /* EQ bar 2 */
        linear-gradient(0deg, rgba(99,102,241,0.05) 0%, transparent 100%) no-repeat,
        /* Subtle radial glow */
        radial-gradient(ellipse at 50% 100%, rgba(197,78,233,0.04) 0%, transparent 60%);
}

/* EQ bars container */
.stApp::after {
    content: '';
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 200px;
    z-index: 0;
    pointer-events: none;
    background:
        repeating-linear-gradient(
            90deg,
            transparent,
            transparent 18px,
            rgba(197,78,233,0.025) 18px,
            rgba(197,78,233,0.025) 20px
        );
    mask-image: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%);
    -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%);
}

/* Animated EQ bars via box-shadows */
.stApp .stMainBlockContainer::before {
    content: '';
    position: fixed;
    bottom: 0;
    left: 5%;
    width: 90%;
    height: 0;
    z-index: 0;
    pointer-events: none;
    box-shadow:
        0vw 0 0 2px rgba(197,78,233,0.08),
        3vw 0 0 2px rgba(139,92,246,0.08),
        6vw 0 0 2px rgba(99,102,241,0.08),
        9vw 0 0 2px rgba(197,78,233,0.06),
        12vw 0 0 2px rgba(139,92,246,0.06),
        15vw 0 0 2px rgba(99,102,241,0.06),
        18vw 0 0 2px rgba(197,78,233,0.05),
        21vw 0 0 2px rgba(139,92,246,0.05),
        24vw 0 0 2px rgba(99,102,241,0.05),
        27vw 0 0 2px rgba(197,78,233,0.04),
        30vw 0 0 2px rgba(139,92,246,0.04),
        33vw 0 0 2px rgba(99,102,241,0.04),
        36vw 0 0 2px rgba(197,78,233,0.05),
        39vw 0 0 2px rgba(139,92,246,0.06),
        42vw 0 0 2px rgba(99,102,241,0.07),
        45vw 0 0 2px rgba(197,78,233,0.08),
        48vw 0 0 2px rgba(139,92,246,0.07),
        51vw 0 0 2px rgba(99,102,241,0.06),
        54vw 0 0 2px rgba(197,78,233,0.05),
        57vw 0 0 2px rgba(139,92,246,0.04),
        60vw 0 0 2px rgba(99,102,241,0.05),
        63vw 0 0 2px rgba(197,78,233,0.06),
        66vw 0 0 2px rgba(139,92,246,0.07),
        69vw 0 0 2px rgba(99,102,241,0.08),
        72vw 0 0 2px rgba(197,78,233,0.06),
        75vw 0 0 2px rgba(139,92,246,0.05),
        78vw 0 0 2px rgba(99,102,241,0.04),
        81vw 0 0 2px rgba(197,78,233,0.05),
        84vw 0 0 2px rgba(139,92,246,0.06),
        87vw 0 0 2px rgba(99,102,241,0.07);
}

/* ═══════════════════════════════════════════════════════════
   GLASSMORPHISM SIDEBAR
   ═══════════════════════════════════════════════════════════ */
section[data-testid="stSidebar"] {
    background: rgba(12, 12, 20, 0.85) !important;
    backdrop-filter: blur(20px) !important;
    -webkit-backdrop-filter: blur(20px) !important;
    border-right: 1px solid rgba(197,78,233,0.1) !important;
}

section[data-testid="stSidebar"] .stPageLink {
    border-radius: 8px;
    transition: all 0.2s ease;
}

section[data-testid="stSidebar"] .stPageLink:hover {
    background: rgba(197,78,233,0.08);
}

/* ═══════════════════════════════════════════════════════════
   PREMIUM CARDS & CONTAINERS
   ═══════════════════════════════════════════════════════════ */
div[data-testid="stVerticalBlock"] > div[data-testid="stContainer"] {
    border: 1px solid rgba(197,78,233,0.1) !important;
    border-radius: 12px !important;
    background: rgba(18, 18, 26, 0.7) !important;
    backdrop-filter: blur(8px);
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

div[data-testid="stVerticalBlock"] > div[data-testid="stContainer"]:hover {
    border-color: rgba(197,78,233,0.25) !important;
    box-shadow: 0 4px 24px rgba(197,78,233,0.06);
}

/* ═══════════════════════════════════════════════════════════
   BUTTONS
   ═══════════════════════════════════════════════════════════ */
button[data-testid="stBaseButton-primary"] {
    background: linear-gradient(135deg, #c54ee9 0%, #8b5cf6 100%) !important;
    border: none !important;
    border-radius: 10px !important;
    font-weight: 600 !important;
    letter-spacing: 0.3px;
    transition: all 0.3s ease !important;
    box-shadow: 0 2px 12px rgba(197,78,233,0.25);
}

button[data-testid="stBaseButton-primary"]:hover {
    box-shadow: 0 4px 20px rgba(197,78,233,0.4) !important;
    transform: translateY(-1px);
}

button[data-testid="stBaseButton-secondary"] {
    border-radius: 10px !important;
    border: 1px solid rgba(197,78,233,0.2) !important;
    transition: all 0.2s ease !important;
}

button[data-testid="stBaseButton-secondary"]:hover {
    border-color: rgba(197,78,233,0.5) !important;
    background: rgba(197,78,233,0.06) !important;
}

/* ═══════════════════════════════════════════════════════════
   METRICS (KPI cards)
   ═══════════════════════════════════════════════════════════ */
div[data-testid="stMetric"] {
    background: rgba(18, 18, 26, 0.6);
    border: 1px solid rgba(197,78,233,0.1);
    border-radius: 12px;
    padding: 16px 20px;
    transition: all 0.3s ease;
}

div[data-testid="stMetric"]:hover {
    border-color: rgba(197,78,233,0.3);
    box-shadow: 0 0 20px rgba(197,78,233,0.08);
}

div[data-testid="stMetric"] label {
    color: rgba(224, 224, 232, 0.6) !important;
    font-size: 0.8rem !important;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

div[data-testid="stMetric"] [data-testid="stMetricValue"] {
    font-weight: 700 !important;
}

/* ═══════════════════════════════════════════════════════════
   INPUTS & FORMS
   ═══════════════════════════════════════════════════════════ */
input, textarea, select, div[data-baseweb="select"] {
    border-radius: 10px !important;
}

div[data-testid="stForm"] {
    border: 1px solid rgba(197,78,233,0.12) !important;
    border-radius: 14px !important;
    padding: 24px !important;
    background: rgba(18, 18, 26, 0.5) !important;
}

/* ═══════════════════════════════════════════════════════════
   TABS
   ═══════════════════════════════════════════════════════════ */
button[data-baseweb="tab"] {
    border-radius: 8px 8px 0 0 !important;
    font-weight: 500 !important;
}

/* ═══════════════════════════════════════════════════════════
   DIVIDERS
   ═══════════════════════════════════════════════════════════ */
hr {
    border-color: rgba(197,78,233,0.1) !important;
}

/* ═══════════════════════════════════════════════════════════
   MOBILE RESPONSIVE
   ═══════════════════════════════════════════════════════════ */
@media (max-width: 768px) {
    .stApp .stMainBlockContainer {
        padding-left: 1rem !important;
        padding-right: 1rem !important;
    }
    
    h1 { font-size: 1.8rem !important; }
    h2 { font-size: 1.4rem !important; }
    h3 { font-size: 1.1rem !important; }
    
    /* Stack columns on mobile */
    div[data-testid="stHorizontalBlock"] {
        flex-wrap: wrap !important;
    }
    
    div[data-testid="stHorizontalBlock"] > div {
        min-width: 100% !important;
        flex: 1 1 100% !important;
    }
    
    /* Metrics smaller on mobile */
    div[data-testid="stMetric"] {
        padding: 10px 14px;
    }
    
    div[data-testid="stMetric"] [data-testid="stMetricValue"] {
        font-size: 1.3rem !important;
    }
    
    /* Sidebar overlay on mobile */
    section[data-testid="stSidebar"] {
        z-index: 999 !important;
    }
}

@media (max-width: 480px) {
    h1 { font-size: 1.5rem !important; }
    
    button[data-testid="stBaseButton-primary"],
    button[data-testid="stBaseButton-secondary"] {
        padding: 10px 16px !important;
        font-size: 0.85rem !important;
    }
}

/* ═══════════════════════════════════════════════════════════
   SCROLLBAR
   ═══════════════════════════════════════════════════════════ */
::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}
::-webkit-scrollbar-track {
    background: rgba(10, 10, 15, 0.5);
}
::-webkit-scrollbar-thumb {
    background: rgba(197,78,233,0.25);
    border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
    background: rgba(197,78,233,0.4);
}

/* ═══════════════════════════════════════════════════════════
   DOWNLOAD BUTTONS
   ═══════════════════════════════════════════════════════════ */
button[data-testid="stBaseButton-elementToolbar"] {
    border-radius: 8px !important;
}

/* ═══════════════════════════════════════════════════════════
   BADGES
   ═══════════════════════════════════════════════════════════ */
span[data-testid="stBadge"] {
    border-radius: 20px !important;
    font-weight: 500 !important;
}

</style>
""", unsafe_allow_html=True)

# ── Check Supabase connection ────────────────────────────────
if not db.is_connected():
    st.title(":material/speaker: DJMAudio Inventory")
    st.error("Supabase not connected", icon=":material/error:")
    st.markdown("""
    ### Quick setup

    1. Go to [supabase.com](https://supabase.com) and create a free project
    2. Open the **SQL Editor** and paste the contents of `setup.sql`
    3. Go to **Settings → API** and copy your **Project URL** and **anon/public key**
    4. Create `.streamlit/secrets.toml` with:

    ```toml
    SUPABASE_URL = "https://your-project.supabase.co"
    SUPABASE_KEY = "your-anon-key-here"
    ADMIN_PASSWORD = "pick-any-password"
    ```

    5. Restart the app
    """)
    st.stop()

# ── Auth state ───────────────────────────────────────────────
if "is_admin" not in st.session_state:
    st.session_state.is_admin = False
    st.session_state.admin_login_time = None

# Session timeout (2 hours)
SESSION_TIMEOUT_SECONDS = 7200
if st.session_state.is_admin and st.session_state.get("admin_login_time"):
    from datetime import datetime, timezone
    elapsed = (datetime.now(timezone.utc) - st.session_state.admin_login_time).total_seconds()
    if elapsed > SESSION_TIMEOUT_SECONDS:
        st.session_state.is_admin = False
        st.session_state.admin_login_time = None
        st.toast("Session expired. Please log in again.", icon=":material/timer_off:")

# ── Sidebar ──────────────────────────────────────────────────
with st.sidebar:
    st.title(":material/speaker: DJMAudio")
    st.caption("Inventory & rental manager")

    st.space("medium")

    if not st.session_state.is_admin:
        with st.popover("Admin login", icon=":material/lock:"):
            pw = st.text_input("Password", type="password", key="admin_pw")
            totp_code = st.text_input("2FA Code (Google Authenticator)", type="password", key="admin_2fa")
            
            if st.button("Log in", icon=":material/login:"):
                try:
                    if pw == st.secrets["ADMIN_PASSWORD"]:
                        admin_2fa_secret = st.secrets.get("ADMIN_2FA_SECRET")
                        if admin_2fa_secret:
                            totp = pyotp.TOTP(admin_2fa_secret)
                            if totp.verify(totp_code):
                                st.session_state.is_admin = True
                                from datetime import datetime, timezone
                                st.session_state.admin_login_time = datetime.now(timezone.utc)
                                st.rerun()
                            else:
                                st.error("Invalid 2FA code")
                        else:
                            # Fallback if no 2FA secret is configured
                            st.session_state.is_admin = True
                            st.rerun()
                    else:
                        st.error("Wrong password")
                except KeyError:
                    st.error("ADMIN_PASSWORD not set in secrets")
    else:
        st.badge("Admin", icon=":material/verified_user:", color="green")
        if st.button("Log out", icon=":material/logout:"):
            st.session_state.is_admin = False
            st.rerun()

# ── Navigation ───────────────────────────────────────────────
public_pages = [
    st.Page("app_pages/home.py", title="Home", icon=":material/home:"),
    st.Page("app_pages/browse.py", title="Rental catalog", icon=":material/search:"),
    st.Page("app_pages/request.py", title="Checkout", icon=":material/shopping_cart_checkout:"),
    st.Page("app_pages/contact.py", title="Contact Us", icon=":material/mail:"),
]

admin_pages = [
    st.Page("app_pages/command_center.py", title="Command Center", icon=":material/terminal:", default=True),
    st.Page("app_pages/dashboard.py", title="Dashboard", icon=":material/dashboard:"),
    st.Page("app_pages/inventory.py", title="Inventory", icon=":material/inventory_2:"),
    st.Page("app_pages/quick_add.py", title="Quick add", icon=":material/auto_fix_high:"),
    st.Page("app_pages/rentals.py", title="Rentals", icon=":material/event:"),
    st.Page("app_pages/contracts.py", title="Contracts", icon=":material/description:"),
    st.Page("app_pages/scan.py", title="Scan In/Out", icon=":material/qr_code_scanner:"),
    st.Page("app_pages/calendar_view.py", title="Calendar", icon=":material/calendar_month:"),
    st.Page("app_pages/analytics.py", title="Analytics", icon=":material/analytics:"),
    st.Page("app_pages/compliance.py", title="Compliance", icon=":material/verified:"),
    st.Page("app_pages/maintenance.py", title="Maintenance", icon=":material/build:"),
    st.Page("app_pages/labor.py", title="Contractors", icon=":material/engineering:"),
    st.Page("app_pages/discounts.py", title="Discount Codes", icon=":material/sell:"),
    st.Page("app_pages/barcodes.py", title="Barcodes", icon=":material/qr_code_2:"),
]

if st.session_state.is_admin:
    nav = st.navigation({"Admin": admin_pages, "Public": public_pages})
else:
    nav = st.navigation(public_pages)

nav.run()
