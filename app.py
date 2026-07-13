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
html, body, [class*="st-"] {
    font-family: 'DM Sans', sans-serif;
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
    st.Page("app_pages/dashboard.py", title="Dashboard", icon=":material/dashboard:"),
    st.Page("app_pages/inventory.py", title="Inventory", icon=":material/inventory_2:"),
    st.Page("app_pages/quick_add.py", title="Quick add", icon=":material/auto_fix_high:"),
    st.Page("app_pages/rentals.py", title="Rentals", icon=":material/event:"),
    st.Page("app_pages/barcodes.py", title="Barcodes", icon=":material/qr_code_2:"),
]

if st.session_state.is_admin:
    nav = st.navigation({"Admin": admin_pages, "Public": public_pages})
else:
    nav = st.navigation(public_pages)

nav.run()
