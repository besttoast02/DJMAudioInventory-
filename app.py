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
st.logo("assets/logo.png", link="https://djmaudio.com")

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
   AMBIENT BACKGROUND GLOW — non-interfering, no overlays
   ═══════════════════════════════════════════════════════════ */
.stApp {
    background:
        radial-gradient(ellipse at 50% 100%, rgba(197,78,233,0.03) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.02) 0%, transparent 40%),
        radial-gradient(ellipse at 20% 60%, rgba(139,92,246,0.02) 0%, transparent 40%) !important;
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
    border-color: rgba(217,70,239,0.3) !important;
    box-shadow: 0 4px 24px rgba(59,130,246,0.15), 0 -2px 10px rgba(217,70,239,0.1);
}

/* ═══════════════════════════════════════════════════════════
   BUTTONS
   ═══════════════════════════════════════════════════════════ */
button[data-testid="stBaseButton-primary"] {
    background: linear-gradient(135deg, #d946ef 0%, #3b82f6 100%) !important;
    border: none !important;
    border-radius: 10px !important;
    font-weight: 600 !important;
    letter-spacing: 0.3px;
    transition: all 0.3s ease !important;
    box-shadow: 0 2px 15px rgba(217,70,239,0.4), 0 2px 15px rgba(59,130,246,0.4);
}

button[data-testid="stBaseButton-primary"]:hover {
    box-shadow: 0 4px 25px rgba(217,70,239,0.6), 0 4px 25px rgba(59,130,246,0.6) !important;
    transform: translateY(-2px);
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
    border-color: rgba(59,130,246,0.4);
    box-shadow: 0 0 20px rgba(217,70,239,0.15), 0 0 20px rgba(59,130,246,0.15);
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
    border: 0 !important;
    height: 1px !important;
    background: linear-gradient(90deg, transparent, rgba(217,70,239,0.8), rgba(59,130,246,0.8), transparent) !important;
    box-shadow: 0 0 10px rgba(217,70,239,0.5), 0 0 10px rgba(59,130,246,0.5) !important;
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

/* ═══════════════════════════════════════════════════════════
   NEON DATE PICKER / CALENDAR
   ═══════════════════════════════════════════════════════════ */
/* Date input wrapper — neon border glow */
div[data-testid="stDateInput"] {
    border: 2px solid rgba(99, 102, 241, 0.6) !important;
    border-radius: 14px !important;
    padding: 8px 12px !important;
    background: rgba(18, 18, 30, 0.8) !important;
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.25), 0 0 15px rgba(197, 78, 233, 0.15) !important;
    transition: all 0.3s ease !important;
}

div[data-testid="stDateInput"]:hover,
div[data-testid="stDateInput"]:focus-within {
    border-color: rgba(197, 78, 233, 0.8) !important;
    box-shadow: 0 0 25px rgba(99, 102, 241, 0.4), 0 0 25px rgba(197, 78, 233, 0.3) !important;
}

/* Date input label */
div[data-testid="stDateInput"] label {
    font-size: 0.95rem !important;
    font-weight: 600 !important;
    color: #e0e0e8 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
}

/* Date input field text */
div[data-testid="stDateInput"] input {
    font-size: 1.1rem !important;
    font-weight: 600 !important;
    color: #fff !important;
    border: none !important;
    background: transparent !important;
}

/* Calendar popup — neon styled */
div[data-baseweb="calendar"] {
    background: rgba(12, 12, 20, 0.98) !important;
    border: 2px solid rgba(99, 102, 241, 0.5) !important;
    border-radius: 16px !important;
    box-shadow: 0 8px 40px rgba(99, 102, 241, 0.3), 0 4px 20px rgba(197, 78, 233, 0.2) !important;
    padding: 8px !important;
}

/* Calendar header (month/year nav) */
div[data-baseweb="calendar"] [data-baseweb="calendar-header"] {
    background: transparent !important;
}

div[data-baseweb="calendar"] [data-baseweb="calendar-header"] button {
    color: #c54ee9 !important;
    font-weight: 700 !important;
}

/* Day cells */
div[data-baseweb="calendar"] [role="gridcell"] button {
    border-radius: 10px !important;
    font-weight: 500 !important;
    transition: all 0.2s ease !important;
}

div[data-baseweb="calendar"] [role="gridcell"] button:hover {
    background: rgba(99, 102, 241, 0.3) !important;
    box-shadow: 0 0 10px rgba(99, 102, 241, 0.4) !important;
}

/* Selected day */
div[data-baseweb="calendar"] [role="gridcell"] button[aria-selected="true"],
div[data-baseweb="calendar"] [role="gridcell"] div[aria-selected="true"] {
    background: linear-gradient(135deg, #c54ee9, #6366f1) !important;
    color: #fff !important;
    font-weight: 700 !important;
    box-shadow: 0 0 20px rgba(197, 78, 233, 0.5), 0 0 20px rgba(99, 102, 241, 0.5) !important;
}

/* Logo — ensure no background */
img[data-testid="stLogo"] {
    background: transparent !important;
}

/* ═══════════════════════════════════════════════════════════
   HIDE DEPLOY BUTTON, MENU, AND FOOTER
   ═══════════════════════════════════════════════════════════ */
.stDeployButton,
button[data-testid="stBaseButton-headerNoPadding"],
#MainMenu,
header[data-testid="stHeader"] button[kind="header"],
div[data-testid="stToolbar"],
div[data-testid="stDecoration"],
.viewerBadge_container,
.viewerBadge_link,
footer,
footer a {
    display: none !important;
    visibility: hidden !important;
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
import hashlib
from datetime import datetime, timezone

if "is_admin" not in st.session_state:
    st.session_state.is_admin = False
    st.session_state.admin_login_time = None

# Session timeout (8 hours)
SESSION_TIMEOUT_SECONDS = 28800

# ── Persistent admin token via query params ──────────────────
# On login, we set ?admin_token=<hash> so refreshes keep the session alive.
ADMIN_PASSWORD = db.get_secret("ADMIN_PASSWORD", "")
ADMIN_TOKEN_SALT = "djmaudio_admin_2024"

def _make_admin_token() -> str:
    """Generate a simple admin session token."""
    raw = f"{ADMIN_PASSWORD}:{ADMIN_TOKEN_SALT}"
    return hashlib.sha256(raw.encode()).hexdigest()[:24]

# Check if admin token exists in URL (restores session after refresh)
query_admin_token = st.query_params.get("admin_token", "")
if query_admin_token and query_admin_token == _make_admin_token():
    if not st.session_state.is_admin:
        st.session_state.is_admin = True
        st.session_state.admin_login_time = datetime.now(timezone.utc)

# Session timeout check
if st.session_state.is_admin and st.session_state.get("admin_login_time"):
    elapsed = (datetime.now(timezone.utc) - st.session_state.admin_login_time).total_seconds()
    if elapsed > SESSION_TIMEOUT_SECONDS:
        st.session_state.is_admin = False
        st.session_state.admin_login_time = None
        st.query_params.pop("admin_token", None)
        st.toast("Session expired. Please log in again.", icon=":material/timer_off:")

# ── Secret admin gate ────────────────────────────────────────
# Access admin login ONLY via: ?gate=<ADMIN_GATE_CODE>
# No visible login button for public visitors.
ADMIN_GATE_CODE = db.get_secret("ADMIN_GATE_CODE", "3KcWvK9v_kGqEe5H1lwxtOspg7tChhuI")
query_gate = st.query_params.get("gate", "")

# If gate code matches, flag the session so the login form appears
if query_gate == ADMIN_GATE_CODE:
    st.session_state["gate_unlocked"] = True
    # Clear the gate param from URL so it's not visible/shareable
    st.query_params.clear()

# ── Sidebar ──────────────────────────────────────────────────
with st.sidebar:
    # Internal branding only visible to admin
    if st.session_state.is_admin:
        st.title(":material/speaker: DJMAudio")
        st.caption("Inventory & rental manager")
        st.space("medium")

    if not st.session_state.is_admin:
        # Only show login if gate was unlocked via secret URL
        if st.session_state.get("gate_unlocked", False):
            st.divider()
            st.caption(":material/lock: Admin login")
            pw = st.text_input("Password", type="password", key="admin_pw")
            totp_code = st.text_input("2FA code", type="password", key="admin_2fa",
                                      placeholder="Google Authenticator")

            if st.button("Log in", icon=":material/login:", type="primary",
                         key="admin_login_btn"):
                try:
                    if pw == ADMIN_PASSWORD:
                        admin_2fa_secret = db.get_secret("ADMIN_2FA_SECRET")
                        if admin_2fa_secret:
                            totp = pyotp.TOTP(admin_2fa_secret)
                            if totp.verify(totp_code):
                                st.session_state.is_admin = True
                                st.session_state.admin_login_time = datetime.now(timezone.utc)
                                st.query_params["admin_token"] = _make_admin_token()
                                st.rerun()
                            else:
                                st.error("Invalid 2FA code")
                        else:
                            st.session_state.is_admin = True
                            st.session_state.admin_login_time = datetime.now(timezone.utc)
                            st.query_params["admin_token"] = _make_admin_token()
                            st.rerun()
                    else:
                        st.error("Wrong password")
                except KeyError:
                    st.error("ADMIN_PASSWORD not set in secrets")
        # else: nothing visible — public sees only the title
    else:
        st.divider()
        st.badge("Admin", icon=":material/verified_user:", color="green")
        if st.button("Log out", icon=":material/logout:", key="admin_logout_btn"):
            st.session_state.is_admin = False
            st.session_state["gate_unlocked"] = False
            st.query_params.pop("admin_token", None)
            st.rerun()

# ── Navigation ───────────────────────────────────────────────
public_pages = [
    st.Page("app_pages/home.py", title="Home", icon=":material/home:"),
    st.Page("app_pages/dj_services.py", title="DJ Services", icon=":material/headphones:"),
    st.Page("app_pages/live_audio.py", title="Live Audio", icon=":material/graphic_eq:"),
    st.Page("app_pages/packages.py", title="Packages", icon=":material/celebration:"),
    st.Page("app_pages/extra_services.py", title="Extras", icon=":material/auto_awesome:"),
    st.Page("app_pages/browse.py", title="Rentals", icon=":material/search:"),
    st.Page("app_pages/request.py", title="Checkout", icon=":material/shopping_cart_checkout:"),
    st.Page("app_pages/ai_assistant.py", title="AI Assistant", icon=":material/smart_toy:"),
    st.Page("app_pages/contact.py", title="Contact", icon=":material/mail:"),
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
