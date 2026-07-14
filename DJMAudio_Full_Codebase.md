# DJM Audio Inventory - Full Codebase Dump

This document contains the core application architecture schematic followed by the complete source code for all Python files in the repository.

# DJM Audio Inventory - Architecture & Code Schematic

This document serves as a comprehensive overview of the DJMAudio Inventory application. It is designed to be parsed by other AI agents to quickly understand the project structure, routing, database schema, and styling architecture.

## 1. Tech Stack
- **Framework**: Streamlit (Python)
- **Database**: Supabase (PostgreSQL) via `supabase-py` REST API client
- **UI/Styling**: Streamlit native components + aggressive custom CSS injection (`st.markdown('<style>...</style>')`)
- **Authentication**: PyOTP for 2FA / Passcode-based login (Admin/Employee roles)
- **State Management**: Streamlit `st.session_state`

## 2. Directory Structure
```text
.
├── app.py                      # Main entry point and router (st.navigation)
├── db.py                       # Supabase database connection and query functions
├── assets/                     # Local asset storage (mostly UI images/backgrounds)
│   └── inventory_images/       # Downloaded product images
├── app_pages/                  # Streamlit Page components
│   ├── home.py                 # Public landing page (Hero, Testimonials, Services)
│   ├── browse.py               # Public catalog & filtering
│   ├── request.py              # Public cart & rental quote requests
│   ├── contact.py              # Public contact form
│   ├── command_center.py       # Admin Dashboard (Analytics, Pending Requests, KPI)
│   ├── inventory.py            # Admin Inventory Management (CRUD operations)
│   ├── rentals.py              # Admin Rental tracking (Check-out / Check-in)
│   ├── calendar_view.py        # Admin visual schedule
│   ├── barcodes.py             # Admin barcode generation/printing
│   ├── scan.py                 # Admin fast barcode scanning interface
│   ├── maintenance.py          # Admin equipment repair logs
│   ├── labor.py                # Admin labor dispatch & crew scheduling
│   ├── contracts.py            # Admin PDF contract generation
│   ├── compliance.py           # Admin vehicle / insurance tracking
│   ├── quick_add.py            # Admin rapid gear ingestion
│   ├── analytics.py            # Admin deep-dive data & revenue charts
│   └── discounts.py            # Admin coupon/discount code management
```

## 3. Core Files Overview

### `app.py`
The entry point of the application. It handles:
- **Global Config**: `st.set_page_config()`
- **Global CSS**: Injects standard glassmorphism UI, neon magenta/blue UI accents, and hides default Streamlit headers/footers.
- **Authentication State**: Checks `st.session_state.get('role')`.
- **Routing (`st.navigation`)**: Dynamically loads pages from `app_pages/` depending on the user's role:
  - If no role: Shows `[Home, Browse, Request, Contact]` and a hidden "Login" page.
  - If Admin/Employee: Shows the public pages + a full suite of Admin features grouped by `Management`, `Operations`, `Logs`, and `Data`.

### `db.py`
The single source of truth for database interactions. 
- Authenticates with Supabase using `@st.cache_resource` on `create_client()`.
- Provides helper functions for CRUD operations:
  - `get_available_items()`: Fetches all inventory, hiding "add-on" categories from public view.
  - `add_item()`, `update_item()`, `delete_item()`: Inventory modification.
  - `get_requests()`, `add_request()`, `update_request_status()`: Quote management.
  - Defines `CATEGORY_PREFIXES` (e.g., "Microphones" -> "MIC") for SKU generation.
  - Defines `ADDON_CATEGORIES` (e.g., "Hardware", "Cables") which are hidden from the public catalog.

## 4. UI / UX Design System
- **Theme**: Dark mode by default (`rgba(10, 10, 15)` backgrounds).
- **Brand Colors**: Neon Magenta (`#d946ef`) and Neon Blue (`#3b82f6`). 
- **Glassmorphism**: Heavy use of `backdrop-filter: blur(16px)` on sidebars, cards, and hero text overlays.
- **Micro-interactions**: Hover states on metric cards and primary buttons trigger a dual-color magenta/blue neon shadow (`box-shadow`).
- **Hero Section**: `home.py` features a custom HTML/CSS animated equalizer spectrum using CSS keyframes, acting as an interactive backdrop behind the main value proposition.

## 5. State Management
The app relies heavily on `st.session_state` for:
- `st.session_state.cart`: List of dictionaries representing items a user wants to rent.
- `st.session_state.role`: Defines user permissions (`None`, `admin`, `employee`).
- `st.session_state.login_passcode`: Temporary state for the OTP modal logic.

## 6. How to Run / Develop
1. Ensure `.env` or Streamlit secrets contain Supabase keys: `SUPABASE_URL`, `SUPABASE_KEY`.
2. Run standard local environment: `streamlit run app.py`
3. All UI pages must be registered via `st.Page()` in `app.py`.

*(End of Schematic)*


---

# SOURCE CODE

## File: `app.py`

```python
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
   HIDE DEPLOY BUTTON, MENU, AND FOOTER
   ═══════════════════════════════════════════════════════════ */
.stDeployButton,
button[data-testid="stBaseButton-headerNoPadding"],
#MainMenu,
header[data-testid="stHeader"] button[kind="header"],
div[data-testid="stToolbar"],
div[data-testid="stDecoration"],
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

# ── Secret admin gate ────────────────────────────────────────
# Access admin login ONLY via: ?gate=<ADMIN_GATE_CODE>
# No visible login button for public visitors.
ADMIN_GATE_CODE = st.secrets.get("ADMIN_GATE_CODE", "3KcWvK9v_kGqEe5H1lwxtOspg7tChhuI")
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
                            st.session_state.is_admin = True
                            from datetime import datetime, timezone
                            st.session_state.admin_login_time = datetime.now(timezone.utc)
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
            st.rerun()

# ── Navigation ───────────────────────────────────────────────
public_pages = [
    st.Page("app_pages/home.py", title="Home", icon=":material/home:"),
    st.Page("app_pages/browse.py", title="Rentals", icon=":material/search:"),
    st.Page("app_pages/request.py", title="Checkout", icon=":material/shopping_cart_checkout:"),
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

```

## File: `db.py`

```python
"""
Supabase client helper for DJMAudio Inventory app.
Handles all database operations.
"""

import streamlit as st
from supabase import create_client, Client
import json

# ── Category → barcode prefix mapping ────────────────────────
CATEGORY_PREFIXES = {
    "XLR Cables": "XLR",
    "DMX Cables": "DMX",
    "TRS Cables": "TRS",
    "Power": "PWR",
    "Microphones": "MIC",
    "Wireless": "WRL",
    "Adapters": "ADP",
    "Hardware": "HRD",
    "Stands": "STD",
    "Lighting": "LGT",
    "Mixers": "MIX",
    "Data": "DAT",
    "DI / Signal": "DI",
    "Coaxial": "COX",
    "PA Systems": "PA",
}

# Categories that are add-on only (not publicly rentable)
ADDON_CATEGORIES = {
    "XLR Cables", "DMX Cables", "TRS Cables", "Power",
    "Adapters", "Hardware", "Stands", "Data",
    "DI / Signal", "Coaxial",
}


def get_prefix(category: str) -> str:
    return CATEGORY_PREFIXES.get(category, "GEN")


@st.cache_resource
def get_client() -> Client:
    url = st.secrets["SUPABASE_URL"]
    key = st.secrets["SUPABASE_KEY"]
    return create_client(url, key)


def is_connected() -> bool:
    try:
        _ = st.secrets["SUPABASE_URL"]
        _ = st.secrets["SUPABASE_KEY"]
        return True
    except (KeyError, FileNotFoundError):
        return False


# ── Items ────────────────────────────────────────────────────

def get_all_items() -> list[dict]:
    sb = get_client()
    res = sb.table("items").select("*").order("barcode").execute()
    return res.data


def get_items_by_status(status: str) -> list[dict]:
    sb = get_client()
    res = sb.table("items").select("*").eq("status", status).order("barcode").execute()
    return res.data


def get_available_items() -> list[dict]:
    return get_items_by_status("available")


def get_item_count() -> dict:
    items = get_all_items()
    counts = {"total": len(items), "available": 0, "in_use": 0, "damaged": 0, "lost": 0}
    for item in items:
        s = item.get("status", "available")
        if s in counts:
            counts[s] += 1
    # Calculate total asset value
    counts["total_purchase"] = sum(float(i.get("purchase_price") or 0) for i in items)
    counts["total_current"] = sum(float(i.get("current_value") or 0) for i in items)
    return counts


def add_item(barcode: str, name: str, brand: str, category: str, storage_case: str,
             notes: str = "", purchase_price: float = 0, current_value: float = 0,
             rate_half_day: float = 0, rate_daily: float = 0, rate_weekend: float = 0,
             rentable: bool | None = None) -> dict:
    sb = get_client()
    # Auto-determine rentable from category if not explicitly set
    if rentable is None:
        rentable = category not in ADDON_CATEGORIES
    data = {
        "barcode": barcode,
        "name": name,
        "brand": brand,
        "category": category,
        "storage_case": storage_case,
        "status": "available",
        "notes": notes,
        "purchase_price": purchase_price,
        "current_value": current_value,
        "rate_half_day": rate_half_day,
        "rate_daily": rate_daily,
        "rate_weekend": rate_weekend,
        "rentable": rentable,
    }
    res = sb.table("items").insert(data).execute()
    return res.data


def update_item(item_id: str, updates: dict) -> dict:
    sb = get_client()
    res = sb.table("items").update(updates).eq("id", item_id).execute()
    return res.data


def batch_update_items(updates: list[dict]):
    """Update multiple items. Each dict must have 'id' plus fields to change."""
    sb = get_client()
    for u in updates:
        item_id = u.pop("id")
        if u:  # only update if there are fields to change
            sb.table("items").update(u).eq("id", item_id).execute()


def update_items_status(item_ids: list[str], status: str):
    sb = get_client()
    for iid in item_ids:
        sb.table("items").update({"status": status}).eq("id", iid).execute()


def get_next_barcode(category: str) -> str:
    prefix = get_prefix(category)
    sb = get_client()
    res = sb.table("items").select("barcode").like("barcode", f"DJM-{prefix}-%").order("barcode", desc=True).limit(1).execute()
    if res.data:
        last = res.data[0]["barcode"]
        try:
            num = int(last.split("-")[-1]) + 1
        except ValueError:
            num = 1
    else:
        num = 1
    return f"DJM-{prefix}-{num:04d}"


def delete_item(item_id: str):
    sb = get_client()
    sb.table("items").delete().eq("id", item_id).execute()


def delete_items(item_ids: list[str]):
    sb = get_client()
    for iid in item_ids:
        sb.table("items").delete().eq("id", iid).execute()


# ── Double-booking prevention ────────────────────────────────

def get_booked_counts_for_dates(event_date: str, return_date: str) -> dict[str, int]:
    """
    Returns a dict of {item_name: count_booked} for items committed
    during the given date range (approved rentals whose dates overlap).
    """
    sb = get_client()
    # Get approved/pending rentals that overlap with the requested dates
    # Overlap: rental.event_date <= requested.return_date AND rental.return_date >= requested.event_date
    overlapping = (
        sb.table("rentals")
        .select("id, event_date, return_date, status")
        .in_("status", ["approved", "pending"])
        .lte("event_date", return_date)
        .gte("return_date", event_date)
        .execute()
    )

    if not overlapping.data:
        return {}

    # Get all item IDs linked to those rentals
    booked_counts: dict[str, int] = {}
    for rental in overlapping.data:
        ri = get_rental_items(rental["id"])
        for entry in ri:
            item = entry.get("items", {})
            if item:
                name = item.get("name", "")
                booked_counts[name] = booked_counts.get(name, 0) + 1

    return booked_counts


# ── Rentals ──────────────────────────────────────────────────

def get_all_rentals() -> list[dict]:
    sb = get_client()
    res = sb.table("rentals").select("*").order("created_at", desc=True).execute()
    return res.data


def get_rentals_by_status(status: str) -> list[dict]:
    sb = get_client()
    res = sb.table("rentals").select("*").eq("status", status).order("event_date").execute()
    return res.data


def create_rental(event_name: str, client_name: str, client_phone: str,
                  event_date: str, return_date: str, venue: str, notes: str,
                  estimated_cost: float = 0) -> dict:
    sb = get_client()
    data = {
        "event_name": event_name,
        "client_name": client_name,
        "client_phone": client_phone,
        "event_date": event_date,
        "return_date": return_date,
        "venue": venue,
        "status": "pending",
        "notes": notes,
        "estimated_cost": estimated_cost,
    }
    res = sb.table("rentals").insert(data).execute()
    return res.data[0] if res.data else {}



def update_rental_status(rental_id: str, status: str):
    sb = get_client()
    sb.table("rentals").update({"status": status}).eq("id", rental_id).execute()


# ── Rental Items (junction) ──────────────────────────────────

def link_items_to_rental(rental_id: str, item_ids: list[str]):
    sb = get_client()
    rows = [{"rental_id": rental_id, "item_id": iid} for iid in item_ids]
    sb.table("rental_items").insert(rows).execute()


def get_rental_items(rental_id: str) -> list[dict]:
    sb = get_client()
    res = sb.table("rental_items").select("item_id, items(*)").eq("rental_id", rental_id).execute()
    return res.data


def unlink_rental_items(rental_id: str):
    sb = get_client()
    sb.table("rental_items").delete().eq("rental_id", rental_id).execute()


# ── Approve / Return workflows ───────────────────────────────

def approve_rental(rental_id: str, item_ids: list[str]):
    link_items_to_rental(rental_id, item_ids)
    update_items_status(item_ids, "in_use")
    update_rental_status(rental_id, "approved")


def return_rental(rental_id: str):
    ri = get_rental_items(rental_id)
    item_ids = [r["item_id"] for r in ri]
    update_items_status(item_ids, "available")
    update_rental_status(rental_id, "returned")


def cancel_rental(rental_id: str):
    ri = get_rental_items(rental_id)
    if ri:
        item_ids = [r["item_id"] for r in ri]
        update_items_status(item_ids, "available")
        unlink_rental_items(rental_id)
    update_rental_status(rental_id, "cancelled")


# ── Seeding ──────────────────────────────────────────────────

def seed_from_json(json_path: str) -> int:
    with open(json_path, "r") as f:
        data = json.load(f)

    count = 0
    counters: dict[str, int] = {}

    for case in data["cases"]:
        case_name = case["name"]
        for item in case["items"]:
            cat = item["category"]
            prefix = get_prefix(cat)
            qty = item.get("qty", 1)

            # Skip items with 0 quantity (e.g. missing power cable)
            if qty <= 0:
                continue

            for _ in range(qty):
                if prefix not in counters:
                    counters[prefix] = 0
                counters[prefix] += 1
                barcode = f"DJM-{prefix}-{counters[prefix]:04d}"

                add_item(
                    barcode=barcode,
                    name=item["name"],
                    brand=item.get("brand", "Generic"),
                    category=cat,
                    storage_case=case_name,
                    notes=item.get("notes", ""),
                    purchase_price=item.get("purchase_price", 0),
                    current_value=item.get("current_value", 0),
                    rate_half_day=item.get("rate_half_day", 0),
                    rate_daily=item.get("rate_daily", 0),
                    rate_weekend=item.get("rate_weekend", 0),
                )
                count += 1

    return count


# ── Phase 2: Estimates, Employees, and Labor Tracking ────────

def set_final_cost(rental_id: str, final_cost: float):
    sb = get_client()
    sb.table("rentals").update({"final_cost": final_cost}).eq("id", rental_id).execute()


# Employees
def get_employees() -> list:
    sb = get_client()
    res = sb.table("employees").select("*").order("name").execute()
    return res.data

def add_employee(name: str, role: str, phone: str = "", email: str = ""):
    sb = get_client()
    sb.table("employees").insert({"name": name, "role": role, "phone": phone, "email": email}).execute()


# Rental Assignments
def assign_employee(rental_id: str, employee_id: str, role_for_event: str):
    sb = get_client()
    sb.table("rental_assignments").insert({
        "rental_id": rental_id,
        "employee_id": employee_id,
        "role_for_event": role_for_event
    }).execute()

def get_assignments_for_rental(rental_id: str) -> list:
    sb = get_client()
    res = sb.table("rental_assignments").select("*, employees(*)").eq("rental_id", rental_id).execute()
    return res.data


# Time Logs
def log_time(rental_id: str, employee_id: str, hours: float, task: str, logged_date: str):
    sb = get_client()
    sb.table("time_logs").insert({
        "rental_id": rental_id,
        "employee_id": employee_id,
        "hours": hours,
        "task_description": task,
        "logged_date": logged_date
    }).execute()

def get_time_logs_for_rental(rental_id: str) -> list:
    sb = get_client()
    res = sb.table("time_logs").select("*, employees(*)").eq("rental_id", rental_id).execute()
    return res.data

def get_all_time_logs() -> list:
    sb = get_client()
    res = sb.table("time_logs").select("*, employees(*), rentals(event_name)").order("logged_date", desc=True).execute()
    return res.data


# Contractor Payments
def log_payment(rental_id: str, employee_id: str, amount: float, payment_date: str, notes: str):
    sb = get_client()
    sb.table("contractor_payments").insert({
        "rental_id": rental_id,
        "employee_id": employee_id,
        "amount": amount,
        "payment_date": payment_date,
        "notes": notes
    }).execute()

def get_payments_for_rental(rental_id: str) -> list:
    sb = get_client()
    res = sb.table("contractor_payments").select("*, employees(*)").eq("rental_id", rental_id).execute()
    return res.data

def get_all_payments() -> list:
    sb = get_client()
    res = sb.table("contractor_payments").select("*, employees(*), rentals(event_name)").order("payment_date", desc=True).execute()
    return res.data


# ── Discount Codes ───────────────────────────────────────────

def create_discount_code(code: str, percent_off: int, max_uses: int = 0, expires_at: str = None):
    sb = get_client()
    row = {
        "code": code.strip().upper(),
        "percent_off": percent_off,
        "max_uses": max_uses,
        "times_used": 0,
        "active": True,
    }
    if expires_at:
        row["expires_at"] = expires_at
    sb.table("discount_codes").insert(row).execute()


def get_all_discount_codes() -> list:
    sb = get_client()
    res = sb.table("discount_codes").select("*").order("created_at", desc=True).execute()
    return res.data


def validate_discount_code(code: str) -> dict | None:
    """Returns the discount row if valid, else None."""
    sb = get_client()
    res = sb.table("discount_codes").select("*").eq("code", code.strip().upper()).eq("active", True).execute()
    if not res.data:
        return None
    row = res.data[0]
    # Check max uses (0 = unlimited)
    if row["max_uses"] > 0 and row["times_used"] >= row["max_uses"]:
        return None
    # Check expiry
    if row.get("expires_at"):
        from datetime import datetime, timezone
        try:
            exp = datetime.fromisoformat(row["expires_at"].replace("Z", "+00:00"))
            if datetime.now(timezone.utc) > exp:
                return None
        except Exception:
            pass
    return row


def use_discount_code(code_id: str):
    """Increment times_used by 1."""
    sb = get_client()
    row = sb.table("discount_codes").select("times_used").eq("id", code_id).execute().data[0]
    sb.table("discount_codes").update({"times_used": row["times_used"] + 1}).eq("id", code_id).execute()


def toggle_discount_code(code_id: str, active: bool):
    sb = get_client()
    sb.table("discount_codes").update({"active": active}).eq("id", code_id).execute()


def delete_discount_code(code_id: str):
    sb = get_client()
    sb.table("discount_codes").delete().eq("id", code_id).execute()


# ── Todos ────────────────────────────────────────────────────

def create_todo(title: str, due_date: str = None, rental_id: str = None):
    sb = get_client()
    row = {"title": title, "done": False}
    if due_date:
        row["due_date"] = due_date
    if rental_id:
        row["rental_id"] = rental_id
    sb.table("todos").insert(row).execute()


def get_todos(show_done: bool = False) -> list:
    sb = get_client()
    q = sb.table("todos").select("*, rentals(event_name)").order("created_at", desc=True)
    if not show_done:
        q = q.eq("done", False)
    return q.execute().data


def toggle_todo(todo_id: str, done: bool):
    sb = get_client()
    sb.table("todos").update({"done": done}).eq("id", todo_id).execute()


def delete_todo(todo_id: str):
    sb = get_client()
    sb.table("todos").delete().eq("id", todo_id).execute()


# ── Activity Log ─────────────────────────────────────────────

def log_activity(action: str, detail: str = None, rental_id: str = None):
    sb = get_client()
    row = {"action": action}
    if detail:
        row["detail"] = detail
    if rental_id:
        row["rental_id"] = rental_id
    try:
        sb.table("activity_log").insert(row).execute()
    except Exception:
        pass  # Don't break the app if logging fails


def get_recent_activity(limit: int = 15) -> list:
    sb = get_client()
    res = sb.table("activity_log").select("*").order("created_at", desc=True).limit(limit).execute()
    return res.data


# ── Email Notifications ──────────────────────────────────────

def send_email_notification(subject: str, body: str):
    """Send an email notification using Gmail SMTP."""
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart

    try:
        smtp_user = st.secrets.get("SMTP_USER")
        smtp_pass = st.secrets.get("SMTP_APP_PASSWORD")
        notify_to = st.secrets.get("NOTIFY_EMAIL")

        if not all([smtp_user, smtp_pass, notify_to]):
            return  # Silently skip if not configured

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"DJM Audio Alerts <{smtp_user}>"
        msg["To"] = notify_to

        # Plain text
        msg.attach(MIMEText(body, "plain"))

        # HTML version
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px 12px 0 0;">
                <h2 style="color: white; margin: 0;">🎵 DJM Audio</h2>
            </div>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 12px 12px; border: 1px solid #e9ecef;">
                <h3>{subject}</h3>
                <div style="white-space: pre-wrap; line-height: 1.6;">{body}</div>
                <hr style="border: none; border-top: 1px solid #dee2e6; margin: 16px 0;">
                <p style="color: #6c757d; font-size: 12px;">Sent from DJM Audio Inventory System</p>
            </div>
        </div>
        """
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, notify_to, msg.as_string())

    except Exception as e:
        # Log but don't crash
        print(f"Email notification failed: {e}")


def send_sms_notification(message: str):
    """Send SMS via Twilio if configured."""
    try:
        account_sid = st.secrets.get("TWILIO_SID")
        auth_token = st.secrets.get("TWILIO_TOKEN")
        from_number = st.secrets.get("TWILIO_FROM")
        to_number = st.secrets.get("NOTIFY_PHONE")

        if not all([account_sid, auth_token, from_number, to_number]):
            return  # Silently skip if not configured

        from twilio.rest import Client as TwilioClient
        client = TwilioClient(account_sid, auth_token)
        client.messages.create(body=message, from_=from_number, to=to_number)
    except ImportError:
        pass  # twilio not installed
    except Exception as e:
        print(f"SMS notification failed: {e}")


def notify(subject: str, body: str):
    """Send both email and SMS notifications."""
    send_email_notification(subject, body)
    # SMS gets a shortened version
    sms_text = f"DJM Audio: {subject}"
    send_sms_notification(sms_text)


# ── Maintenance Log ──────────────────────────────────────────

def log_maintenance(item_id: str, action: str, notes: str = "", cost: float = 0):
    sb = get_client()
    sb.table("maintenance_log").insert({
        "item_id": item_id,
        "action": action,
        "notes": notes,
        "cost": cost,
    }).execute()


def get_maintenance_for_item(item_id: str) -> list:
    sb = get_client()
    res = sb.table("maintenance_log").select("*").eq("item_id", item_id).order("created_at", desc=True).execute()
    return res.data


def get_all_maintenance() -> list:
    sb = get_client()
    res = sb.table("maintenance_log").select("*, items(name, barcode, brand)").order("created_at", desc=True).limit(50).execute()
    return res.data


# ── Feedback ─────────────────────────────────────────────────

def submit_feedback(rental_id: str, rating: int, comment: str = ""):
    sb = get_client()
    sb.table("feedback").insert({
        "rental_id": rental_id,
        "rating": rating,
        "comment": comment,
    }).execute()


def get_feedback_for_rental(rental_id: str) -> list:
    sb = get_client()
    res = sb.table("feedback").select("*").eq("rental_id", rental_id).execute()
    return res.data


def get_all_feedback() -> list:
    sb = get_client()
    res = sb.table("feedback").select("*, rentals(event_name, client_name)").order("created_at", desc=True).execute()
    return res.data


# ── Waivers ──────────────────────────────────────────────────

def save_waiver(rental_id: str, client_name: str, signature_data: str, waiver_text: str):
    sb = get_client()
    sb.table("waivers").insert({
        "rental_id": rental_id,
        "client_name": client_name,
        "signature_data": signature_data,
        "waiver_text": waiver_text,
    }).execute()


def get_waiver_for_rental(rental_id: str) -> dict | None:
    sb = get_client()
    res = sb.table("waivers").select("*").eq("rental_id", rental_id).execute()
    return res.data[0] if res.data else None


# ── Check-in / Check-out Scanning ────────────────────────────

def checkin_item(item_id: str, rental_id: str = None):
    """Mark item as returned/available."""
    sb = get_client()
    sb.table("items").update({"status": "available"}).eq("id", item_id).execute()
    log_activity("Gear checked in", f"Item returned to inventory", rental_id)


def checkout_item(item_id: str, rental_id: str = None):
    """Mark item as deployed/in_use."""
    sb = get_client()
    sb.table("items").update({"status": "in_use"}).eq("id", item_id).execute()
    log_activity("Gear checked out", f"Item deployed for event", rental_id)


def get_item_by_barcode(barcode: str) -> dict | None:
    sb = get_client()
    res = sb.table("items").select("*").eq("barcode", barcode).execute()
    return res.data[0] if res.data else None


# ── Invoice / PDF Generation ─────────────────────────────────

def generate_invoice_pdf(rental: dict, items: list) -> bytes:
    """Generate a professional PDF invoice and return as bytes."""
    from fpdf import FPDF
    from datetime import datetime

    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    # Header
    pdf.set_fill_color(102, 126, 234)
    pdf.rect(0, 0, 210, 40, "F")
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 24)
    pdf.set_y(10)
    pdf.cell(0, 10, "DJM AUDIO", ln=True, align="L")
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 6, "Professional Audio & Lighting Rentals | Los Angeles, CA", ln=True)

    # Invoice info
    pdf.set_text_color(0, 0, 0)
    pdf.set_y(50)
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, "INVOICE", ln=True)

    pdf.set_font("Helvetica", "", 10)
    pdf.cell(95, 6, f"Date: {datetime.now().strftime('%B %d, %Y')}")
    pdf.cell(95, 6, f"Invoice #: INV-{rental.get('id', 'N/A')[:8].upper()}", ln=True)

    pdf.ln(5)
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(0, 6, "Bill To:", ln=True)
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 5, f"{rental.get('client_name', 'N/A')}", ln=True)
    pdf.cell(0, 5, f"Phone: {rental.get('client_phone', 'N/A')}", ln=True)

    pdf.ln(5)
    pdf.cell(95, 5, f"Event: {rental.get('event_name', 'N/A')}")
    pdf.cell(95, 5, f"Venue: {rental.get('venue', 'TBD')}", ln=True)
    pdf.cell(95, 5, f"Event Date: {rental.get('event_date', 'N/A')}")
    pdf.cell(95, 5, f"Return Date: {rental.get('return_date', 'N/A')}", ln=True)

    # Items table
    pdf.ln(10)
    pdf.set_fill_color(240, 240, 240)
    pdf.set_font("Helvetica", "B", 10)
    pdf.cell(90, 8, "Item", border=1, fill=True)
    pdf.cell(30, 8, "Qty", border=1, fill=True, align="C")
    pdf.cell(35, 8, "Rate", border=1, fill=True, align="C")
    pdf.cell(35, 8, "Subtotal", border=1, fill=True, align="C")
    pdf.ln()

    pdf.set_font("Helvetica", "", 10)
    total = 0
    for item in items:
        i = item.get("items", {})
        if not i:
            continue
        rate = float(i.get("rate_daily") or 0)
        total += rate
        pdf.cell(90, 7, f"{i.get('brand', '')} {i.get('name', '')}"[:45], border=1)
        pdf.cell(30, 7, "1", border=1, align="C")
        pdf.cell(35, 7, f"${rate:.2f}", border=1, align="C")
        pdf.cell(35, 7, f"${rate:.2f}", border=1, align="C")
        pdf.ln()

    # Total
    final_cost = float(rental.get("final_cost") or rental.get("estimated_cost") or total)
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(155, 8, "TOTAL", border=1, align="R")
    pdf.cell(35, 8, f"${final_cost:.2f}", border=1, align="C")
    pdf.ln()

    # Footer
    pdf.ln(15)
    pdf.set_font("Helvetica", "I", 9)
    pdf.multi_cell(0, 5,
        "Thank you for choosing DJM Audio! Payment is due upon delivery. "
        "All equipment must be returned in the same condition. "
        "Late returns will be charged at the daily rate. "
        "Contact: djmaudiopro@gmail.com"
    )

    return pdf.output()


def generate_waiver_pdf(rental: dict, signature_data: str = "") -> bytes:
    """Generate a liability waiver PDF."""
    from fpdf import FPDF
    from datetime import datetime

    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    # Header
    pdf.set_fill_color(102, 126, 234)
    pdf.rect(0, 0, 210, 35, "F")
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 20)
    pdf.set_y(8)
    pdf.cell(0, 10, "DJM AUDIO - LIABILITY WAIVER", ln=True, align="C")
    pdf.set_font("Helvetica", "", 9)
    pdf.cell(0, 6, "Equipment Rental Agreement & Liability Release", ln=True, align="C")

    pdf.set_text_color(0, 0, 0)
    pdf.set_y(45)
    pdf.set_font("Helvetica", "", 10)

    client = rental.get("client_name", "________________")
    event = rental.get("event_name", "________________")
    evt_date = rental.get("event_date", "____")
    ret_date = rental.get("return_date", "____")

    waiver_text = f"""EQUIPMENT RENTAL AGREEMENT

This Equipment Rental Agreement ("Agreement") is entered into between DJM Audio ("Company") and {client} ("Renter") on {datetime.now().strftime('%B %d, %Y')}.

EVENT DETAILS:
Event: {event}
Event Date: {evt_date}
Return Date: {ret_date}
Venue: {rental.get('venue', 'TBD')}

TERMS AND CONDITIONS:

1. RENTAL PERIOD: Equipment must be returned by the Return Date specified above. Late returns will be charged at the applicable daily rate.

2. CARE OF EQUIPMENT: Renter agrees to exercise reasonable care in the use, handling, and storage of all rented equipment. Equipment must be returned in the same condition as received.

3. DAMAGE & LOSS: Renter is fully responsible for any damage, loss, or theft of equipment from the time of pickup/delivery until return. Renter agrees to pay the full replacement cost for any lost or irreparably damaged equipment.

4. LIABILITY RELEASE: Renter assumes all risk associated with the use of rented equipment. DJM Audio shall not be liable for any injury, damage, or loss arising from the use of rented equipment.

5. INDEMNIFICATION: Renter agrees to indemnify and hold harmless DJM Audio from any claims, damages, or expenses arising from Renter's use of the equipment.

6. CANCELLATION: Cancellations made less than 48 hours before the event date may be subject to a cancellation fee of up to 50% of the rental cost.

7. PAYMENT: Full payment is due upon delivery/pickup of equipment unless otherwise agreed in writing.

By signing below, Renter acknowledges that they have read, understood, and agree to all terms and conditions outlined in this Agreement."""

    pdf.multi_cell(0, 5, waiver_text)

    pdf.ln(10)
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(95, 8, f"Renter: {client}")
    pdf.cell(95, 8, f"Date: {datetime.now().strftime('%m/%d/%Y')}", ln=True)
    pdf.ln(5)
    pdf.cell(95, 8, "Signature: ________________________")
    pdf.cell(95, 8, "DJM Audio Rep: ________________________", ln=True)

    return pdf.output()


def send_feedback_request_email(rental: dict):
    """Send post-event feedback request to client."""
    client_name = rental.get("client_name", "Valued Customer")
    event_name = rental.get("event_name", "your event")

    # We don't have client email, so notify admin to follow up
    body = (
        f"Rental '{event_name}' for {client_name} is complete.\n\n"
        f"Consider following up with {client_name} at {rental.get('client_phone', 'N/A')} "
        f"to collect feedback and ask for a review.\n\n"
        f"Feedback link: Share your app's feedback page with them."
    )
    send_email_notification(f"📝 Follow up: {event_name}", body)


# ── Compliance Deadlines ─────────────────────────────────────

def create_deadline(entity: str, title: str, category: str, due_date: str,
                    recurrence_months: int = None, notes: str = ""):
    sb = get_client()
    sb.table("compliance_deadlines").insert({
        "entity": entity,
        "title": title,
        "category": category,
        "due_date": due_date,
        "recurrence_months": recurrence_months,
        "notes": notes,
    }).execute()


def get_deadlines(show_completed: bool = False) -> list:
    sb = get_client()
    q = sb.table("compliance_deadlines").select("*").order("due_date")
    if not show_completed:
        q = q.is_("completed_at", "null")
    return q.execute().data


def complete_deadline(deadline_id: str):
    from datetime import datetime, timezone
    sb = get_client()
    sb.table("compliance_deadlines").update(
        {"completed_at": datetime.now(timezone.utc).isoformat()}
    ).eq("id", deadline_id).execute()

    # Auto-create next occurrence if recurring
    d = sb.table("compliance_deadlines").select("*").eq("id", deadline_id).execute().data
    if d and d[0].get("recurrence_months"):
        from dateutil.relativedelta import relativedelta
        import dateutil  # noqa
        old = d[0]
        next_date = (datetime.fromisoformat(old["due_date"]) +
                     relativedelta(months=old["recurrence_months"])).date()
        create_deadline(
            entity=old["entity"],
            title=old["title"],
            category=old["category"],
            due_date=str(next_date),
            recurrence_months=old["recurrence_months"],
            notes=old.get("notes", ""),
        )


def delete_deadline(deadline_id: str):
    sb = get_client()
    sb.table("compliance_deadlines").delete().eq("id", deadline_id).execute()


# ── Jurisdiction Tax Rates ───────────────────────────────────

# California base rate + LA-area district taxes (verified from CDTFA)
JURISDICTION_TAX_RATES = {
    "Alhambra": 0.1025,       # 7.25% + 3.00% district
    "Baldwin Park": 0.1025,   # 7.25% + 3.00% district
    "LA City": 0.095,         # 7.25% + 2.25% district
    "LA County Unincorp": 0.1025,
    "Pasadena": 0.1025,
    "Other": 0.0725,          # Base rate only — override manually
}

JURISDICTION_FLAGS = {
    "Baldwin Park": ["⚠️ Business license required for out-of-city businesses performing work in Baldwin Park"],
    "LA City": [],  # Tent flag added dynamically
    "LA County Unincorp": [
        "⚠️ Noise management plan required",
        "⚠️ Traffic/parking plan required",
        "⚠️ Emergency management plan required",
    ],
}


def get_tax_rate(jurisdiction: str) -> float:
    return JURISDICTION_TAX_RATES.get(jurisdiction, 0.0725)


def get_jurisdiction_flags(jurisdiction: str, has_tent_over_450sqft: bool = False) -> list[str]:
    flags = list(JURISDICTION_FLAGS.get(jurisdiction, []))
    if jurisdiction == "LA City" and has_tent_over_450sqft:
        flags.append("⚠️ LAFD approval required for tent >= 450 sq ft")
    return flags


# ── Contract PDF Generators ──────────────────────────────────

def generate_dj_services_pdf(rental: dict) -> bytes:
    """Generate DJ & Production Services Agreement PDF."""
    from fpdf import FPDF
    from datetime import datetime

    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    # Header
    pdf.set_fill_color(102, 126, 234)
    pdf.rect(0, 0, 210, 35, "F")
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 18)
    pdf.set_y(8)
    pdf.cell(0, 10, "DJ & PRODUCTION SERVICES AGREEMENT", ln=True, align="C")
    pdf.set_font("Helvetica", "", 9)
    pdf.cell(0, 6, "DJM Audio Productions LLC", ln=True, align="C")

    pdf.set_text_color(0, 0, 0)
    pdf.set_y(45)

    client = rental.get("client_name", "________________")
    event = rental.get("event_name", "________________")
    evt_date = rental.get("event_date", "____")
    ret_date = rental.get("return_date", "____")
    venue = rental.get("venue", "TBD")
    cost = float(rental.get("final_cost") or rental.get("estimated_cost") or 0)

    sections = f"""DJ & PRODUCTION SERVICES AGREEMENT

This Agreement is between DJM Audio Productions LLC ("Company") and {client} ("Client").

1. EVENT DETAILS
Event: {event}
Date: {evt_date}
Venue: {venue}
Services: DJ performance, MC services, sound reinforcement, lighting, and/or additional production services as described in the booking.

2. PERFORMANCE STANDARDS
Company will provide professional-quality DJ and production services, including appropriate transitions, volume levels, and crowd-appropriate selections. Client may provide reasonable requests and do-not-play lists.

3. EQUIPMENT & TECHNICAL REQUIREMENTS
Company will provide the equipment listed in the booking. Client is responsible for ensuring the venue provides suitable power, staging, access, and any required permits. Additional equipment or labor requested on-site may incur extra charges.

4. MUSIC LICENSING
Client understands that venues are generally responsible for obtaining public performance licenses. This allocation is negotiable - see booking notes for specifics.

5. PAYMENT TERMS
Total Fee: ${cost:,.2f}
Deposit: Due upon booking (non-refundable after 48 hours before Event).
Balance: Due by event date.
Overtime: Billed at applicable hourly rate per hour or portion thereof.

6. CANCELLATION & FORCE MAJEURE
Cancellations less than 48 hours before the event may be subject to a fee of up to 50% of the total. Neither party is liable for failure to perform due to events beyond their control.

7. CLIENT RESPONSIBILITIES
Client will: (a) Provide accurate event details, (b) Ensure safe conditions, (c) Provide secure staging area and safe access routes, (d) Obtain necessary permits and insurance.

8. LIMITATION OF LIABILITY
Company's liability shall not exceed the total fees paid by Client. Client agrees to indemnify and hold harmless Company from claims arising from Client's conduct or venue conditions.

9. GOVERNING LAW
This Agreement is governed by the laws of the State of California.

Generated: {datetime.now().strftime('%B %d, %Y')}"""

    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(0, 5, sections)

    pdf.ln(10)
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(95, 8, f"Client: {client}")
    pdf.cell(95, 8, f"Date: {datetime.now().strftime('%m/%d/%Y')}", ln=True)
    pdf.ln(5)
    pdf.cell(95, 8, "Client Signature: ________________________")
    pdf.cell(95, 8, "DJM Audio Rep: ________________________", ln=True)

    return pdf.output()


def generate_studio_use_pdf(rental: dict) -> bytes:
    """Generate Studio Use & Equipment Liability Agreement PDF (Danger Beats)."""
    from fpdf import FPDF
    from datetime import datetime

    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    # Header
    pdf.set_fill_color(45, 45, 45)
    pdf.rect(0, 0, 210, 35, "F")
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 18)
    pdf.set_y(8)
    pdf.cell(0, 10, "STUDIO USE & EQUIPMENT LIABILITY", ln=True, align="C")
    pdf.set_font("Helvetica", "", 9)
    pdf.cell(0, 6, "Danger Beats Music LLC", ln=True, align="C")

    pdf.set_text_color(0, 0, 0)
    pdf.set_y(45)

    client = rental.get("client_name", "________________")
    event = rental.get("event_name", "________________")
    evt_date = rental.get("event_date", "____")

    sections = f"""STUDIO USE AND EQUIPMENT LIABILITY AGREEMENT

This Agreement is between Danger Beats Music LLC ("Studio") and {client} ("Client").

1. STUDIO USE GRANT
Studio grants Client a limited, non-transferable license to use the recording studio for the agreed session date(s) and time(s) solely for audio recording, production, and related creative activities.

2. SESSION SCHEDULE
Session: {event}
Date: {evt_date}
Studio will conduct a check-in walkthrough at the start and check-out walkthrough at the end to document equipment condition.

3. STUDIO RULES
Client agrees to: (a) No smoking, vaping, or open flames inside the premises, (b) No illegal drug use on premises, (c) No tampering with building systems, (d) Reasonable noise control - doors and windows must remain closed during loud playback, (e) Maximum occupancy limits as specified by Studio.

Studio may terminate the session immediately for serious violations, with no refund.

4. EQUIPMENT INVENTORY & CONDITION
Prior to each session, Studio will identify available equipment and document its condition. All equipment remains Studio property. Client access is limited to the session duration.

5. DAMAGE AND REPLACEMENT COST
Client is financially responsible for any loss, theft, or damage beyond reasonable wear and tear. Replacement cost will be based on current non-depreciated market price including tax, shipping, and installation costs.

6. NO SUBLEASE OR TENANCY
This Agreement grants a limited license only and does not create a lease, tenancy, or any real property rights. Client may not assign or sublet studio time without prior written consent.

7. PAYMENT & CANCELLATION
Session fees, deposits, and overtime rates per booking summary. Deposits are refundable if canceled with sufficient advance notice as specified in booking terms.

8. INDEMNIFICATION
Client agrees to indemnify and hold harmless Studio from any claims arising from Client's use of the premises. Studio's total liability shall not exceed total session fees paid.

Generated: {datetime.now().strftime('%B %d, %Y')}"""

    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(0, 5, sections)

    pdf.ln(10)
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(95, 8, f"Client: {client}")
    pdf.cell(95, 8, f"Date: {datetime.now().strftime('%m/%d/%Y')}", ln=True)
    pdf.ln(5)
    pdf.cell(95, 8, "Client Signature: ________________________")
    pdf.cell(95, 8, "Danger Beats Rep: ________________________", ln=True)

    return pdf.output()

```

## File: `app_pages/analytics.py`

```python
import streamlit as st
import db
import pandas as pd
from datetime import datetime, date, timedelta

st.title(":material/analytics: Revenue Analytics")

# ── Load data ────────────────────────────────────────────────
all_rentals = db.get_all_rentals()

if not all_rentals:
    st.info("No rental data yet. Analytics will populate as you get bookings.", icon=":material/info:")
    st.stop()

df = pd.DataFrame(all_rentals)
df["event_date"] = pd.to_datetime(df["event_date"], errors="coerce")
df["estimated_cost"] = pd.to_numeric(df.get("estimated_cost", 0), errors="coerce").fillna(0)
df["final_cost"] = pd.to_numeric(df.get("final_cost", 0), errors="coerce").fillna(0)
df["revenue"] = df["final_cost"].where(df["final_cost"] > 0, df["estimated_cost"])

# ── KPIs ─────────────────────────────────────────────────────
now = datetime.now()
this_month = df[df["event_date"].dt.month == now.month]
last_month = df[df["event_date"].dt.month == (now.month - 1 if now.month > 1 else 12)]

m1, m2, m3, m4 = st.columns(4)
m1.metric("Total Rentals", len(df))
m2.metric("This Month", len(this_month))
total_rev = df["revenue"].sum()
m3.metric("Total Revenue", f"${total_rev:,.0f}")
this_month_rev = this_month["revenue"].sum()
last_month_rev = last_month["revenue"].sum()
delta = this_month_rev - last_month_rev if last_month_rev > 0 else None
m4.metric("This Month Rev", f"${this_month_rev:,.0f}", 
          delta=f"${delta:+,.0f}" if delta else None)

# ── Monthly Revenue Chart ────────────────────────────────────
st.divider()
st.subheader(":material/bar_chart: Monthly Revenue")

monthly = df.groupby(df["event_date"].dt.to_period("M"))["revenue"].sum()
monthly.index = monthly.index.astype(str)
if len(monthly) > 0:
    st.bar_chart(monthly, use_container_width=True)
else:
    st.caption("Not enough data for chart yet.")

# ── Status Breakdown ─────────────────────────────────────────
st.divider()
st.subheader(":material/pie_chart: Rental Status Breakdown")

status_counts = df["status"].value_counts()
sc1, sc2 = st.columns([1, 2])
with sc1:
    for status, count in status_counts.items():
        color = {"pending": "orange", "approved": "blue", "completed": "green", "returned": "green", "cancelled": "red"}.get(status, "gray")
        st.badge(f"{status.title()}: {count}", color=color)
with sc2:
    st.bar_chart(status_counts, use_container_width=True)

# ── Top Items ────────────────────────────────────────────────
st.divider()
st.subheader(":material/star: Most Requested Gear")

# Parse gear from notes
gear_counter = {}
for _, row in df.iterrows():
    notes = str(row.get("notes", ""))
    if "REQUESTED GEAR" in notes:
        lines = notes.split("REQUESTED GEAR")[1].split("===")[0].strip().split("\n")
        for line in lines:
            line = line.strip("• ·-").strip()
            if line and "×" in line:
                parts = line.split("×", 1)
                try:
                    qty = int(parts[0].strip())
                    name = parts[1].strip()
                    gear_counter[name] = gear_counter.get(name, 0) + qty
                except (ValueError, IndexError):
                    pass

if gear_counter:
    top_gear = sorted(gear_counter.items(), key=lambda x: x[1], reverse=True)[:10]
    for name, count in top_gear:
        st.markdown(f"**{count}×** {name}")
else:
    st.caption("Gear tracking data will appear after rental requests come in.")

# ── Average Order Value ──────────────────────────────────────
st.divider()
st.subheader(":material/payments: Financial Summary")

paid_rentals = df[df["revenue"] > 0]
fc1, fc2, fc3 = st.columns(3)
fc1.metric("Avg. Order Value", f"${paid_rentals['revenue'].mean():,.0f}" if len(paid_rentals) > 0 else "$0")
fc2.metric("Highest Rental", f"${paid_rentals['revenue'].max():,.0f}" if len(paid_rentals) > 0 else "$0")
fc3.metric("Completed Rentals", len(df[df["status"].isin(["completed", "returned"])]))

# ── Client Leaderboard ───────────────────────────────────────
st.divider()
st.subheader(":material/group: Top Clients")

client_rev = df.groupby("client_name")["revenue"].agg(["sum", "count"]).sort_values("sum", ascending=False)
client_rev.columns = ["Total Spent", "Bookings"]
if len(client_rev) > 0:
    st.dataframe(
        client_rev.head(10).style.format({"Total Spent": "${:,.0f}"}),
        use_container_width=True
    )

# ── Export ───────────────────────────────────────────────────
st.divider()
csv = df[["event_name", "client_name", "client_phone", "event_date", "venue", "status", "estimated_cost", "final_cost"]].to_csv(index=False)
st.download_button(
    "📥 Export all rental data (CSV)",
    data=csv,
    file_name=f"djm_audio_rentals_{date.today()}.csv",
    mime="text/csv",
    use_container_width=True
)

```

## File: `app_pages/barcodes.py`

```python
import streamlit as st
import db
import io

st.title(":material/qr_code_2: Barcode generator")

items = db.get_all_items()

if not items:
    st.info("No items yet. Seed your inventory first.", icon=":material/info:")
    st.stop()

st.markdown("Generate printable barcodes for your gear. Each item has a unique barcode you can print on label paper.")

# ── Filters ──────────────────────────────────────────────────
fc1, fc2 = st.columns(2)
categories = sorted(set(i["category"] for i in items))
cases = sorted(set(i["storage_case"] for i in items if i["storage_case"]))

filt_cat = fc1.selectbox("Filter by category", ["All"] + categories, key="bc_cat")
filt_case = fc2.selectbox("Filter by case", ["All"] + cases, key="bc_case")

filtered = items
if filt_cat != "All":
    filtered = [i for i in filtered if i["category"] == filt_cat]
if filt_case != "All":
    filtered = [i for i in filtered if i["storage_case"] == filt_case]

st.caption(f"{len(filtered)} items")

# ── Generate barcodes ────────────────────────────────────────
try:
    import barcode
    from barcode.writer import ImageWriter
    from PIL import Image

    # Display in grid
    cols_per_row = 4
    for idx in range(0, len(filtered), cols_per_row):
        cols = st.columns(cols_per_row)
        for j, col in enumerate(cols):
            if idx + j < len(filtered):
                item = filtered[idx + j]
                with col:
                    # Generate barcode image
                    code128 = barcode.get_barcode_class("code128")
                    buf = io.BytesIO()
                    bc = code128(item["barcode"], writer=ImageWriter())
                    bc.write(buf, options={
                        "module_width": 0.3,
                        "module_height": 8,
                        "font_size": 8,
                        "text_distance": 3,
                        "quiet_zone": 2,
                    })
                    buf.seek(0)
                    st.image(buf, use_container_width=True)
                    st.caption(f"{item['brand']} {item['name']}")

except ImportError:
    st.warning("Install `python-barcode` and `Pillow` for barcode generation.", icon=":material/warning:")
    # Fallback: just show text barcodes
    for item in filtered:
        with st.container(border=True):
            st.code(item["barcode"], language=None)
            st.caption(f"{item['brand']} {item['name']} — {item['storage_case']}")

```

## File: `app_pages/browse.py`

```python
import streamlit as st
import db
from datetime import datetime, date, timedelta

st.title(":material/search: Rental catalog")
st.markdown("Browse our gear, add what you need to your cart, and request a quote.")

# ── Initialize cart ──────────────────────────────────────────
if "cart" not in st.session_state:
    st.session_state.cart = {}  # {display_key: {name, brand, category, qty, rate_half_day, rate_daily, rate_weekend, max_qty}}

# ── Date picker for availability check ───────────────────────
st.markdown("##### When is your event?")
dc1, dc2 = st.columns(2)
event_date = dc1.date_input("Event date", value=date.today() + timedelta(days=7), key="browse_event_date")
return_date = dc2.date_input("Return date", value=date.today() + timedelta(days=9), key="browse_return_date")

# Store dates in session for checkout
st.session_state["event_date"] = event_date
st.session_state["return_date"] = return_date

items = db.get_available_items()

if not items:
    st.info("No gear available right now. Check back soon!", icon=":material/info:")
    st.stop()

# Get items already booked for these dates
booked_counts = db.get_booked_counts_for_dates(str(event_date), str(return_date))

# ── Map to public display categories ────────────────────────
def get_display_category(item: dict) -> str:
    cat = item.get("category", "")
    name = item.get("name", "").lower()
    if "truss" in name and "clamp" not in name:
        return "Truss"
    if cat == "Wireless":
        return "Microphones" if "system" in name else "_hidden"
    mapping = {
        "PA Systems": "Speakers",
        "Microphones": "Microphones",
        "Mixers": "Mixers",
        "Lighting": "Lighting / DMX",
    }
    return mapping.get(cat, "_hidden")

DISPLAY_ORDER = ["Speakers", "Mic Kits", "Mixers", "Microphones", "Lighting / DMX", "Truss"]
POPULARITY = {
    "evolve 50": 1, "column pa": 1,
    "xdj-xz": 2, "sq-5": 3, "ddj": 4, "djm": 4,
    "wireless": 5, "ksm8": 5,
    "moving head": 8, "fog": 9, "hex": 10, "par": 11, "dotz": 12,
    "beta 58a": 13, "sm58": 16,
    "sm57": 17, "e906": 18, "e904": 19, "i5": 20, "i6": 21,
    "pga52": 22, "pga56": 23, "pga57": 24, "pga81": 25,
    "truss": 35,
}

def get_popularity(name: str) -> int:
    name_lower = name.lower()
    for kw, score in sorted(POPULARITY.items(), key=lambda x: -len(x[0])):
        if kw in name_lower:
            return score
    return 50

# ── Build catalog ────────────────────────────────────────────
for i in items:
    i["_display_cat"] = get_display_category(i)

rentable = [i for i in items if i["_display_cat"] not in ("_hidden",)]

# Group by type (use name only so items with slightly different brands still merge)
grouped = {}
for i in rentable:
    key = i['name']
    if key not in grouped:
        grouped[key] = {
            "name": i["name"],
            "brand": i["brand"],
            "display_cat": i["_display_cat"],
            "qty": 0,
            "rate_half_day": float(i.get("rate_half_day") or 0),
            "rate_daily": float(i.get("rate_daily") or 0),
            "rate_weekend": float(i.get("rate_weekend") or 0),
            "specs_markdown": i.get("specs_markdown", ""),
        }
    grouped[key]["qty"] += 1
    # Subtract booked units for the selected dates
    booked = booked_counts.get(i["name"], 0)
    grouped[key]["qty"] = max(0, grouped[key]["qty"] - booked)
    # Prefer specs from whichever unit has them
    if not grouped[key]["specs_markdown"] and i.get("specs_markdown"):
        grouped[key]["specs_markdown"] = i["specs_markdown"]

# ── Category filter ──────────────────────────────────────────
active_cats = sorted(
    set(v["display_cat"] for v in grouped.values()),
    key=lambda c: DISPLAY_ORDER.index(c) if c in DISPLAY_ORDER else 99
)
filt = st.pills("Filter", ["All"] + active_cats, default="All", key="cat_filter")

by_cat = {}
for key, info in grouped.items():
    if filt not in ("All",) and info["display_cat"] != filt:
        continue
    cat = info["display_cat"]
    if cat not in by_cat:
        by_cat[cat] = []
    by_cat[cat].append((key, info))

# ── Render catalog cards ─────────────────────────────────────
for cat in [c for c in DISPLAY_ORDER if c in by_cat]:
    st.subheader(cat)
    cols = st.columns(3)
    sorted_items = sorted(by_cat[cat], key=lambda x: get_popularity(x[1]["name"]))

    for idx, (key, info) in enumerate(sorted_items):
        with cols[idx % 3]:
            with st.container(border=True):
                display_brand = "" if info['brand'].lower() == "generic" else f"**{info['brand']}** "
                st.markdown(f"#### {display_brand}{info['name']}")
                
                # Image
                import os
                safe_name = info['name'].replace(" ", "_").replace("/", "_")
                img_path = f"assets/inventory_images/{safe_name}.png"
                if os.path.exists(img_path):
                    img_col1, img_col2, img_col3 = st.columns([1, 2, 1])
                    try:
                        img_col2.image(img_path, use_container_width=True)
                    except Exception:
                        pass

                st.badge(f"{info['qty']} available", color="green")

                if info["rate_daily"] > 0:
                    st.markdown(
                        f"<div style='margin: 0.5rem 0 1rem; color: rgba(224,224,232,0.8);'>"
                        f"½ day: <strong>${info['rate_half_day']:.0f}</strong> · "
                        f"Daily: <strong>${info['rate_daily']:.0f}</strong> · "
                        f"Wknd: <strong>${info['rate_weekend']:.0f}</strong>"
                        f"</div>",
                        unsafe_allow_html=True
                    )
                
                if info.get("specs_markdown"):
                    with st.popover("View Specs & Details", use_container_width=True):
                        st.markdown(info["specs_markdown"])


                # Cart controls
                in_cart = st.session_state.cart.get(key, {}).get("qty", 0)
                max_avail = info["qty"]

                c1, c2 = st.columns([1, 2])
                qty_sel = c1.number_input(
                    "Qty", min_value=0, max_value=max_avail,
                    value=in_cart, key=f"qty_{key}", label_visibility="collapsed"
                )
                
                # Dynamic button text
                btn_text = "Update Cart" if in_cart > 0 else "Add to Rental"
                if c2.button(btn_text, key=f"add_{key}", use_container_width=True, type="primary"):
                    if qty_sel > 0:
                        st.session_state.cart[key] = {
                            "name": info["name"],
                            "brand": info["brand"],
                            "category": info["display_cat"],
                            "qty": qty_sel,
                            "rate_half_day": info["rate_half_day"],
                            "rate_daily": info["rate_daily"],
                            "rate_weekend": info["rate_weekend"],
                            "max_qty": max_avail,
                        }
                        st.rerun()
                    elif key in st.session_state.cart:
                        del st.session_state.cart[key]
                        st.rerun()

                if in_cart > 0:
                    st.info(f"✅ {in_cart} added to request")

# ── Drum Mic Kits ────────────────────────────────────────────
if filt in ("All", "Mic Kits"):
    st.subheader("Mic Kits")
    st.caption("Pre-configured drum mic packages. One click to add the whole kit.")
    
    # Calculate kit prices from current DB rates
    mic_rates = {}
    for i in items:
        if i["category"] == "Microphones":
            name = i["name"]
            if name not in mic_rates:
                mic_rates[name] = {
                    "rate_half_day": float(i.get("rate_half_day") or 0),
                    "rate_daily": float(i.get("rate_daily") or 0),
                    "rate_weekend": float(i.get("rate_weekend") or 0),
                    "avail": 0,
                }
            mic_rates[name]["avail"] += 1
    
    # Check PGA81 availability for overhead fallback
    pga81_avail = mic_rates.get("PGA81 Condenser Instrument Microphone", {}).get("avail", 0)
    overhead_name = "PGA81 Condenser Instrument Microphone" if pga81_avail >= 2 else "SM57 Dynamic Instrument Microphone"
    overhead_label = "Shure PGA81" if pga81_avail >= 2 else "Shure SM57 (alt)"
    
    def get_rate(mic_name, field):
        return mic_rates.get(mic_name, {}).get(field, 0)
    
    KITS = [
        {
            "key": "kit_pga_drum",
            "name": "PGA Drum Mic Kit",
            "brand": "Shure",
            "desc": "Budget-friendly 7-mic drum package",
            "mics": [
                ("Kick", "Shure PGA52", 1, "PGA52 Kick Drum Microphone"),
                ("Snare", "Shure PGA57", 1, "PGA57 Dynamic Instrument Microphone"),
                ("Toms ×3", "Shure PGA56", 3, "PGA56 Drum/Instrument Microphone"),
                ("Overheads ×2", overhead_label, 2, overhead_name),
            ],
        },
        {
            "key": "kit_pro_drum",
            "name": "Pro Drum Mic Kit",
            "brand": "Sennheiser / Audix",
            "desc": "Premium clip-on 7-mic drum package",
            "mics": [
                ("Kick", "Audix i6", 1, "i6 Kick Drum Microphone"),
                ("Snare", "Audix i5", 1, "i5 Dynamic Instrument Microphone"),
                ("Toms ×3", "Sennheiser e904", 3, "e904 Drum Microphone"),
                ("Overheads ×2", overhead_label, 2, overhead_name),
            ],
        },
    ]
    
    kc1, kc2 = st.columns(2)
    for idx, kit in enumerate(KITS):
        col = kc1 if idx == 0 else kc2
        with col:
            with st.container(border=True):
                st.markdown(f"### 🥁 {kit['name']}")
                st.caption(kit["desc"])
                
                kit_half = 0
                kit_daily = 0
                kit_weekend = 0
                
                for position, label, qty, db_name in kit["mics"]:
                    r_d = get_rate(db_name, "rate_daily")
                    r_h = get_rate(db_name, "rate_half_day")
                    r_w = get_rate(db_name, "rate_weekend")
                    kit_half += r_h * qty
                    kit_daily += r_d * qty
                    kit_weekend += r_w * qty
                    st.markdown(f"- **{position}**: {label}")
                
                st.divider()
                st.markdown(
                    f"**½ day ${kit_half:.0f}** · "
                    f"**daily ${kit_daily:.0f}** · "
                    f"**weekend ${kit_weekend:.0f}**"
                )
                
                # Add kit to cart
                kit_key = kit["key"]
                kit_in_cart = kit_key in st.session_state.cart
                
                if kit_in_cart:
                    st.badge("In cart", color="blue")
                    if st.button("Remove kit", key=f"rm_{kit_key}", use_container_width=True):
                        del st.session_state.cart[kit_key]
                        st.rerun()
                else:
                    if st.button(f"Add to cart", key=f"add_{kit_key}", type="primary", use_container_width=True, icon=":material/add_shopping_cart:"):
                        st.session_state.cart[kit_key] = {
                            "name": kit["name"],
                            "brand": kit["brand"],
                            "category": "Mic Kits",
                            "qty": 1,
                            "rate_half_day": kit_half,
                            "rate_daily": kit_daily,
                            "rate_weekend": kit_weekend,
                            "max_qty": 1,
                        }
                        st.rerun()
                
                # Optional SM57 snare bottom
                snare_key = f"{kit_key}_snare_bottom"
                sm57_daily = get_rate("SM57 Dynamic Instrument Microphone", "rate_daily")
                sm57_half = get_rate("SM57 Dynamic Instrument Microphone", "rate_half_day")
                sm57_wknd = get_rate("SM57 Dynamic Instrument Microphone", "rate_weekend")
                
                snare_in_cart = snare_key in st.session_state.cart
                if snare_in_cart:
                    st.caption("✅ SM57 snare bottom added")
                else:
                    if st.button(f"+ SM57 snare bottom (+${sm57_daily:.0f}/day)", key=f"add_{snare_key}", use_container_width=True):
                        st.session_state.cart[snare_key] = {
                            "name": f"{kit['name']} — SM57 Snare Bottom",
                            "brand": "Shure",
                            "category": "Mic Kits",
                            "qty": 1,
                            "rate_half_day": sm57_half,
                            "rate_daily": sm57_daily,
                            "rate_weekend": sm57_wknd,
                            "max_qty": 1,
                        }
                        st.rerun()

# ── Add-ons section ──────────────────────────────────────────
hidden = [i for i in items if i.get("_display_cat") == "_hidden"]
if hidden and filt == "All":
    st.divider()

    # Group add-ons by simplified category (no specifics)
    addon_cats = {}
    ADDON_LABELS = {
        "XLR Cables": "XLR cables",
        "DMX Cables": "DMX cables",
        "TRS Cables": "TRS / instrument cables",
        "Power": "Power cables & strips",
        "Adapters": "Adapters & converters",
        "Hardware": "Hardware & accessories",
        "Stands": "Microphone stands",
        "Data": "Ethernet & data cables",
        "DI / Signal": "DI boxes",
        "Coaxial": "Antenna cables",
        "Wireless": "Wireless accessories",
    }
    for i in hidden:
        label = ADDON_LABELS.get(i["category"], i["category"])
        if label not in addon_cats:
            addon_cats[label] = 0
        addon_cats[label] += 1

    with st.expander(":material/extension: **Optional add-ons** — included with your rental on request"):
        st.caption("Let us know what you need and we'll include the right cables, stands, and accessories.")
        acols = st.columns(3)
        
        with acols[0]:
            st.checkbox("Cable Covers / Ramps", key="addon_Cable Covers / Ramps")
            
        for idx, (label, count) in enumerate(sorted(addon_cats.items())):
            with acols[(idx + 1) % 3]:
                st.checkbox(f"{label} ({count})", key=f"addon_{label}")

# ── Floating cart summary ────────────────────────────────────
cart = st.session_state.cart
if cart:
    st.divider()
    st.subheader(":material/shopping_cart: Your cart")

    total_half = 0
    total_daily = 0
    total_weekend = 0
    cart_rows = []

    for key, item in cart.items():
        line_half = item["qty"] * item["rate_half_day"]
        line_daily = item["qty"] * item["rate_daily"]
        line_weekend = item["qty"] * item["rate_weekend"]
        total_half += line_half
        total_daily += line_daily
        total_weekend += line_weekend
        display_brand = "" if item['brand'].lower() == "generic" else f"{item['brand']} "
        cart_rows.append({
            "key": key,
            "label": f"{display_brand}{item['name']}",
            "qty": item["qty"],
            "daily": f"${line_daily:.0f}",
            "weekend": f"${line_weekend:.0f}",
        })

    for row in cart_rows:
        c1, c2, c3, c4 = st.columns([4, 1, 1, 1])
        c1.markdown(f"**{row['label']}**")
        c2.markdown(f"×{row['qty']}")
        c3.markdown(row["daily"])
        if c4.button("✕", key=f"rm_{row['key']}"):
            del st.session_state.cart[row["key"]]
            st.rerun()

    st.divider()
    tc1, tc2, tc3 = st.columns(3)
    tc1.metric("½ day total", f"${total_half:.0f}")
    tc2.metric("Daily total", f"${total_daily:.0f}")
    tc3.metric("Weekend total", f"${total_weekend:.0f}")

    # Selected add-ons
    selected_addons = [k.replace("addon_", "") for k, v in st.session_state.items() if k.startswith("addon_") and v]

    st.markdown("")
    if st.button("Proceed to checkout →", icon=":material/shopping_cart_checkout:", type="primary", use_container_width=True):
        st.session_state.checkout = True
        st.session_state.selected_addons = selected_addons
        st.switch_page("app_pages/request.py")

```

## File: `app_pages/calendar_view.py`

```python
import streamlit as st
import db
import pandas as pd
from datetime import datetime

st.title(":material/calendar_month: Event Calendar")

active_rentals = db.get_rentals_by_status("approved")

if not active_rentals:
    st.info("No upcoming active events. Check your pending requests.", icon=":material/info:")
    st.stop()

# Convert to dataframe for timeline
data = []
for r in active_rentals:
    data.append({
        "Event": r['event_name'],
        "Client": r['client_name'],
        "Start": pd.to_datetime(r['event_date']),
        "End": pd.to_datetime(r.get('return_date', r['event_date'])),
        "Venue": r.get('venue', 'TBD'),
        "Status": "Upcoming" if pd.to_datetime(r['event_date']).date() >= datetime.today().date() else "Ongoing/Past"
    })

df = pd.DataFrame(data)
df = df.sort_values(by="Start")

st.markdown("### Upcoming Schedule")

for _, row in df.iterrows():
    color = "blue" if row["Status"] == "Upcoming" else "gray"
    with st.container(border=True):
        c1, c2 = st.columns([1, 4])
        with c1:
            st.markdown(f"**{row['Start'].strftime('%b %d')}**")
            if row['Start'] != row['End']:
                st.caption(f"to {row['End'].strftime('%b %d')}")
        with c2:
            st.markdown(f"#### {row['Event']}")
            st.markdown(f":material/person: {row['Client']} | :material/location_on: {row['Venue']}")

st.divider()
st.markdown("### Grid View")
st.dataframe(
    df,
    column_config={
        "Start": st.column_config.DateColumn("Start Date", format="MMM DD, YYYY"),
        "End": st.column_config.DateColumn("Return Date", format="MMM DD, YYYY")
    },
    hide_index=True,
    use_container_width=True
)

```

## File: `app_pages/command_center.py`

```python
import streamlit as st
import db
import pandas as pd
from datetime import datetime, date, timedelta

st.title(":material/command_line: Command Center")

# ── KPI Metrics ──────────────────────────────────────────────
counts = db.get_item_count()
pending = db.get_rentals_by_status("pending")
approved = db.get_rentals_by_status("approved")
completed = db.get_rentals_by_status("completed")
all_rentals = pending + approved + completed

# Revenue calculations
revenue_approved = sum(float(r.get("final_cost") or r.get("estimated_cost") or 0) for r in approved)
revenue_completed = sum(float(r.get("final_cost") or r.get("estimated_cost") or 0) for r in completed)
revenue_pipeline = sum(float(r.get("estimated_cost") or 0) for r in pending)

m1, m2, m3, m4 = st.columns(4)
m1.metric("Pending", len(pending), help="Awaiting your approval")
m2.metric("Active", len(approved), help="Approved and gear deployed")
m3.metric("Revenue (active)", f"${revenue_approved:,.0f}")
m4.metric("Pipeline", f"${revenue_pipeline:,.0f}", help="Pending request value")

# ── Notification Bar ─────────────────────────────────────────
if pending:
    st.warning(
        f"🔔 **{len(pending)} new request{'s' if len(pending) > 1 else ''}** waiting for approval!",
        icon=":material/notifications:"
    )
    if st.button("Review now →", type="primary", key="go_review"):
        st.switch_page("app_pages/rentals.py")

# ── Kanban Pipeline ──────────────────────────────────────────
st.divider()
st.subheader(":material/view_kanban: Pipeline")

tab_new, tab_approved, tab_complete = st.tabs([
    f"📥 New ({len(pending)})",
    f"✅ Active ({len(approved)})",
    f"📦 Completed ({len(completed)})",
])

def render_kanban_card(r, show_approve=False, show_complete=False):
    """Render a rental as a compact kanban card."""
    with st.container(border=True):
        st.markdown(f"**{r['event_name']}**")
        st.caption(
            f":material/person: {r['client_name']} · "
            f":material/phone: {r.get('client_phone', 'N/A')}"
        )
        st.caption(
            f":material/calendar_today: {r['event_date']} · "
            f":material/location_on: {r.get('venue', 'TBD')}"
        )
        cost = float(r.get("final_cost") or r.get("estimated_cost") or 0)
        if cost > 0:
            st.caption(f":material/payments: **${cost:,.0f}**")

        bc1, bc2 = st.columns(2)
        if show_approve:
            if bc1.button("Review", key=f"kanban_review_{r['id']}", use_container_width=True, type="primary"):
                st.session_state["rentals_tab"] = "pending"
                st.switch_page("app_pages/rentals.py")
        if show_complete:
            if bc1.button("Mark complete", key=f"kanban_done_{r['id']}", use_container_width=True):
                sb = db.get_client()
                sb.table("rentals").update({"status": "completed"}).eq("id", r["id"]).execute()
                # Return items
                ri = db.get_rental_items(r["id"])
                for entry in ri:
                    item = entry.get("items", {})
                    if item:
                        sb.table("items").update({"status": "available"}).eq("id", item["id"]).execute()
                db.log_activity("Rental completed", f"{r['event_name']} — {r['client_name']}", r["id"])
                st.rerun()

with tab_new:
    if not pending:
        st.info("All clear! No pending requests.", icon=":material/check_circle:")
    for r in pending:
        render_kanban_card(r, show_approve=True)

with tab_approved:
    if not approved:
        st.info("No active rentals right now.", icon=":material/info:")
    for r in approved:
        render_kanban_card(r, show_complete=True)

with tab_complete:
    if not completed:
        st.info("No completed rentals yet.", icon=":material/info:")
    for r in completed[:10]:  # Last 10
        render_kanban_card(r)

# ── Upcoming Events Timeline ─────────────────────────────────
st.divider()
st.subheader(":material/calendar_month: Next 14 Days")

upcoming = [r for r in approved if r.get("event_date")]
upcoming_sorted = sorted(upcoming, key=lambda r: r["event_date"])

if upcoming_sorted:
    for r in upcoming_sorted:
        try:
            evt_date = pd.to_datetime(r["event_date"]).date()
        except Exception:
            continue
        
        if evt_date > date.today() + timedelta(days=14):
            continue
            
        days_away = (evt_date - date.today()).days
        if days_away < 0:
            tag = "🔴 Ongoing"
            color = "red"
        elif days_away == 0:
            tag = "🟡 TODAY"
            color = "orange"
        elif days_away <= 3:
            tag = f"🟠 In {days_away} day{'s' if days_away > 1 else ''}"
            color = "orange"
        else:
            tag = f"🟢 In {days_away} days"
            color = "green"

        with st.container(border=True):
            c1, c2 = st.columns([1, 4])
            c1.markdown(f"**{evt_date.strftime('%b %d')}**")
            c1.badge(tag, color=color)
            c2.markdown(f"**{r['event_name']}**")
            c2.caption(
                f":material/person: {r['client_name']} · "
                f":material/location_on: {r.get('venue', 'TBD')} · "
                f"${float(r.get('final_cost') or 0):,.0f}"
            )
else:
    st.info("No upcoming events in the next 14 days.", icon=":material/event_busy:")

# ── Todo List ────────────────────────────────────────────────
st.divider()
st.subheader(":material/checklist: To-Do List")

show_done = st.toggle("Show completed", value=False, key="show_done_todos")

try:
    todos = db.get_todos(show_done=show_done)
except Exception:
    todos = []
    st.caption("*Run the SQL to create the todos table first.*")

for t in todos:
    c1, c2, c3 = st.columns([1, 6, 1])
    is_done = t.get("done", False)
    if c1.button("✅" if is_done else "⬜", key=f"todo_toggle_{t['id']}"):
        db.toggle_todo(t["id"], not is_done)
        st.rerun()
    
    label = f"~~{t['title']}~~" if is_done else f"**{t['title']}**"
    rental_link = ""
    if t.get("rentals") and t["rentals"].get("event_name"):
        rental_link = f" · 🔗 {t['rentals']['event_name']}"
    due = ""
    if t.get("due_date"):
        due = f" · 📅 {t['due_date']}"
    c2.markdown(f"{label}{rental_link}{due}")
    
    if c3.button("🗑️", key=f"todo_del_{t['id']}"):
        db.delete_todo(t["id"])
        st.rerun()

# Add new todo
with st.expander("➕ Add task"):
    with st.form("add_todo_form", clear_on_submit=True):
        todo_title = st.text_input("Task", placeholder="Follow up with client, order cables...")
        tc1, tc2 = st.columns(2)
        todo_due = tc1.date_input("Due date (optional)", value=None)
        
        # Optional rental link
        rental_options = {"None": None}
        for r in all_rentals:
            rental_options[f"{r['event_name']} — {r['client_name']}"] = r["id"]
        todo_rental = tc2.selectbox("Link to rental (optional)", list(rental_options.keys()))
        
        if st.form_submit_button("Add", type="primary", icon=":material/add:"):
            if todo_title:
                db.create_todo(
                    title=todo_title,
                    due_date=str(todo_due) if todo_due else None,
                    rental_id=rental_options[todo_rental]
                )
                st.rerun()

# ── Activity Log ─────────────────────────────────────────────
st.divider()
st.subheader(":material/history: Recent Activity")

try:
    activity = db.get_recent_activity(limit=10)
    if activity:
        for a in activity:
            ts = pd.to_datetime(a["created_at"]).strftime("%b %d, %I:%M %p")
            icon = "📋" if "request" in a["action"].lower() else "✅" if "approved" in a["action"].lower() else "❌" if "reject" in a["action"].lower() else "📦" if "complete" in a["action"].lower() else "📌"
            st.caption(f"{icon} **{a['action']}** — {a.get('detail', '')} · *{ts}*")
    else:
        st.caption("No activity yet. Events will appear here as requests come in.")
except Exception:
    st.caption("*Run the SQL to create the activity_log table first.*")

# ── Quick Nav ────────────────────────────────────────────────
st.divider()
st.subheader(":material/bolt: Quick Actions")
qa1, qa2, qa3, qa4 = st.columns(4)
if qa1.button("Inventory", icon=":material/inventory_2:", use_container_width=True):
    st.switch_page("app_pages/inventory.py")
if qa2.button("Rentals", icon=":material/event:", use_container_width=True):
    st.switch_page("app_pages/rentals.py")
if qa3.button("Discounts", icon=":material/sell:", use_container_width=True):
    st.switch_page("app_pages/discounts.py")
if qa4.button("Staff", icon=":material/engineering:", use_container_width=True):
    st.switch_page("app_pages/labor.py")

```

## File: `app_pages/compliance.py`

```python
import streamlit as st
import db
import pandas as pd
from datetime import date, timedelta

st.title(":material/verified: Compliance Calendar")
st.markdown("Track deadlines for LLC filings, city licenses, tax filings, and insurance renewals.")

# ── KPI Bar ──────────────────────────────────────────────────
try:
    deadlines = db.get_deadlines(show_completed=False)
except Exception:
    deadlines = []
    st.info("Run the SQL to create the compliance_deadlines table first.")

overdue = [d for d in deadlines if d.get("due_date") and d["due_date"] < str(date.today())]
due_soon = [d for d in deadlines if d.get("due_date") and str(date.today()) <= d["due_date"] <= str(date.today() + timedelta(days=30))]

m1, m2, m3 = st.columns(3)
m1.metric("Overdue", len(overdue))
m2.metric("Due in 30 days", len(due_soon))
m3.metric("Total pending", len(deadlines))

if overdue:
    st.error(f"🚨 **{len(overdue)} overdue item{'s' if len(overdue) > 1 else ''}!** Handle these immediately.")

# ── Timeline ─────────────────────────────────────────────────
st.divider()

category_icons = {
    "license": "🏛️",
    "tax": "💰",
    "insurance": "🛡️",
    "filing": "📄",
    "training": "📚",
    "other": "📌",
}

entity_colors = {
    "DJM Audio": "blue",
    "Danger Beats": "violet",
    "Both": "green",
}

for d in deadlines:
    due = d.get("due_date", "")
    days_away = (date.fromisoformat(due) - date.today()).days if due else 999

    if days_away < 0:
        urgency_color = "red"
        urgency_tag = f"🔴 {abs(days_away)} days OVERDUE"
    elif days_away == 0:
        urgency_color = "orange"
        urgency_tag = "🟡 DUE TODAY"
    elif days_away <= 14:
        urgency_color = "orange"
        urgency_tag = f"🟠 {days_away} days left"
    elif days_away <= 30:
        urgency_color = "yellow"
        urgency_tag = f"🟡 {days_away} days"
    else:
        urgency_color = "green"
        urgency_tag = f"🟢 {days_away} days"

    cat_icon = category_icons.get(d.get("category", ""), "📌")
    entity = d.get("entity", "")
    ent_color = entity_colors.get(entity, "gray")

    with st.container(border=True):
        c1, c2, c3 = st.columns([4, 2, 1])
        c1.markdown(f"{cat_icon} **{d['title']}**")
        c1.caption(
            f"Due: **{due}** · "
            f"{'🔄 Recurs every ' + str(d.get('recurrence_months', '')) + ' months' if d.get('recurrence_months') else 'One-time'}"
        )
        if d.get("notes"):
            c1.caption(d["notes"])

        c2.badge(entity, color=ent_color)
        c2.badge(urgency_tag, color=urgency_color)

        if c3.button("✅", key=f"done_{d['id']}", help="Mark complete"):
            db.complete_deadline(d["id"])
            db.log_activity("Compliance completed", d["title"])
            st.rerun()

if not deadlines:
    st.info("No pending deadlines. Add your first one below!", icon=":material/check_circle:")

# ── Completed (toggle) ───────────────────────────────────────
show_done = st.toggle("Show completed", value=False, key="show_done_compliance")
if show_done:
    completed = db.get_deadlines(show_completed=True)
    completed = [d for d in completed if d.get("completed_at")]
    if completed:
        for d in completed[:10]:
            st.caption(f"✅ ~~{d['title']}~~ — completed {d['completed_at'][:10]}")
    else:
        st.caption("None completed yet.")

# ── Add deadline ─────────────────────────────────────────────
st.divider()
st.subheader("➕ Add Deadline")

with st.form("add_deadline", clear_on_submit=True):
    fc1, fc2 = st.columns(2)
    title = fc1.text_input("Title *", placeholder="LLC Statement of Information, City license renewal...")
    entity = fc2.selectbox("Entity", ["DJM Audio", "Danger Beats", "Both"])

    fc3, fc4, fc5 = st.columns(3)
    category = fc3.selectbox("Category", ["license", "tax", "insurance", "filing", "other"])
    due_date = fc4.date_input("Due date", value=date.today() + timedelta(days=30))
    recurrence = fc5.selectbox("Recurrence", [
        ("None (one-time)", None),
        ("Monthly", 1),
        ("Quarterly", 3),
        ("Semi-annual", 6),
        ("Annual", 12),
        ("Biennial (2 years)", 24),
    ], format_func=lambda x: x[0])

    notes = st.text_input("Notes (optional)", placeholder="File online at sos.ca.gov, costs $20...")

    if st.form_submit_button("Add Deadline", type="primary", icon=":material/add:"):
        if title:
            db.create_deadline(entity, title, category, str(due_date), recurrence[1], notes)
            st.success(f"Added: {title}")
            st.rerun()

# ── Quick-seed common deadlines ──────────────────────────────
st.divider()
if st.button("🌱 Seed standard deadlines for DJM Audio + Danger Beats", use_container_width=True):
    seeds = [
        ("DJM Audio", "LLC Statement of Information", "filing", str(date.today() + timedelta(days=60)), 24,
         "File at bizfile.sos.ca.gov — $20 fee"),
        ("Danger Beats", "LLC Statement of Information", "filing", str(date.today() + timedelta(days=60)), 24,
         "File at bizfile.sos.ca.gov — $20 fee"),
        ("DJM Audio", "Alhambra Business License Renewal", "license", str(date(date.today().year + 1, 1, 31)), 12,
         "Renew at alhambraca.gov/171/Business-License"),
        ("DJM Audio", "CDTFA Sales Tax Filing", "tax", str(date(date.today().year, 9, 30)), 3,
         "Quarterly filing at cdtfa.ca.gov"),
        ("Both", "General Liability Insurance Renewal", "insurance", str(date(date.today().year + 1, 1, 1)), 12,
         "Review coverage limits, add inland marine for equipment"),
        ("DJM Audio", "Equipment Insurance (Inland Marine) Renewal", "insurance", str(date(date.today().year + 1, 1, 1)), 12,
         "Covers gear in transit and at events"),
    ]
    for s in seeds:
        db.create_deadline(*s)
    db.log_activity("Compliance seeded", "Standard deadlines for both LLCs")
    st.success(f"Seeded {len(seeds)} deadlines!")
    st.rerun()

```

## File: `app_pages/contact.py`

```python
import streamlit as st

st.title("Contact Us")
st.markdown("Have a question about an upcoming event? Send us a message and we'll get back to you shortly.")

with st.form("contact_form", border=True):
    name = st.text_input("Name *")
    email = st.text_input("Email address *")
    phone = st.text_input("Phone number")
    
    event_type = st.selectbox("What type of event are you planning?", [
        "Wedding / Quinceañera",
        "Corporate / Nonprofit Event",
        "City / Community Event",
        "Festival / Concert",
        "Other"
    ])
    
    message = st.text_area("How can we help? *", height=150)
    
    submitted = st.form_submit_button("Send Message", type="primary", use_container_width=True)
    
    if submitted:
        if not name or not email or not message:
            st.error("Please fill out all required fields (Name, Email, Message).", icon="⚠️")
        else:
            st.success("Message sent! We'll be in touch soon.", icon="✅")
            st.balloons()

st.divider()

c1, c2 = st.columns(2)
with c1:
    st.markdown("### Location")
    st.markdown("Los Angeles, CA & Surrounding Areas")
with c2:
    st.markdown("### Contact Info")
    st.markdown("📧 rentals@djmaudio.com")
    # You can update the email address and add a phone number here later

```

## File: `app_pages/contracts.py`

```python
import streamlit as st
import db

st.title(":material/description: Contracts & Documents")
st.markdown("Generate professional PDF contracts auto-populated from your rental data.")

# ── Contract Type Selection ──────────────────────────────────
tab_rental, tab_dj, tab_studio, tab_contractor = st.tabs([
    "📦 Equipment Rental",
    "🎧 DJ Services",
    "🎙️ Studio Use",
    "🤝 Contractor Agreement",
])

# ── Get rentals for auto-population ──────────────────────────
all_rentals = db.get_all_rentals()
rental_options = {"(Manual entry)": None}
for r in all_rentals:
    label = f"{r['event_name']} — {r['client_name']} ({r['event_date']})"
    rental_options[label] = r

# ── Equipment Rental Agreement ───────────────────────────────
with tab_rental:
    st.subheader("Equipment Rental Agreement")
    st.caption("DJM Audio Productions LLC — includes gear list, damage/loss liability, cancellation terms.")

    selected = st.selectbox("Auto-fill from booking", list(rental_options.keys()), key="rental_sel")
    rental = rental_options[selected] or {}

    with st.form("rental_contract_form"):
        rc1, rc2 = st.columns(2)
        client = rc1.text_input("Client name", value=rental.get("client_name", ""), key="rc_client")
        phone = rc2.text_input("Phone", value=rental.get("client_phone", ""), key="rc_phone")

        rc3, rc4 = st.columns(2)
        event = rc3.text_input("Event name", value=rental.get("event_name", ""), key="rc_event")
        venue = rc4.text_input("Venue", value=rental.get("venue", ""), key="rc_venue")

        rc5, rc6 = st.columns(2)
        evt_date = rc5.text_input("Event date", value=rental.get("event_date", ""), key="rc_edate")
        ret_date = rc6.text_input("Return date", value=rental.get("return_date", ""), key="rc_rdate")

        cost = st.number_input("Total cost ($)", value=float(rental.get("final_cost") or rental.get("estimated_cost") or 0), key="rc_cost")

        if st.form_submit_button("Generate Rental Agreement PDF", type="primary", icon=":material/picture_as_pdf:"):
            data = {
                "id": rental.get("id", "MANUAL"),
                "client_name": client, "client_phone": phone,
                "event_name": event, "venue": venue,
                "event_date": evt_date, "return_date": ret_date,
                "final_cost": cost, "estimated_cost": cost,
            }
            # Get items if linked to a real rental
            items = db.get_rental_items(rental["id"]) if rental.get("id") else []
            pdf_bytes = db.generate_invoice_pdf(data, items)  # Reuse invoice format with full terms
            waiver_bytes = db.generate_waiver_pdf(data)

            st.download_button("📄 Download Rental Agreement", data=waiver_bytes,
                             file_name=f"DJM_Rental_Agreement_{client[:15]}.pdf",
                             mime="application/pdf", key="dl_rental")
            st.download_button("📄 Download Invoice", data=pdf_bytes,
                             file_name=f"DJM_Invoice_{client[:15]}.pdf",
                             mime="application/pdf", key="dl_inv")

# ── DJ Services Agreement ────────────────────────────────────
with tab_dj:
    st.subheader("DJ & Production Services Agreement")
    st.caption("DJM Audio Productions LLC — covers set times, content, equipment, payment, cancellation.")

    selected_dj = st.selectbox("Auto-fill from booking", list(rental_options.keys()), key="dj_sel")
    rental_dj = rental_options[selected_dj] or {}

    with st.form("dj_contract_form"):
        dc1, dc2 = st.columns(2)
        client_dj = dc1.text_input("Client name", value=rental_dj.get("client_name", ""), key="dj_client")
        phone_dj = dc2.text_input("Phone", value=rental_dj.get("client_phone", ""), key="dj_phone")

        dc3, dc4 = st.columns(2)
        event_dj = dc3.text_input("Event name", value=rental_dj.get("event_name", ""), key="dj_event")
        venue_dj = dc4.text_input("Venue", value=rental_dj.get("venue", ""), key="dj_venue")

        dc5, dc6 = st.columns(2)
        edate_dj = dc5.text_input("Event date", value=rental_dj.get("event_date", ""), key="dj_edate")
        rdate_dj = dc6.text_input("Return date", value=rental_dj.get("return_date", ""), key="dj_rdate")

        cost_dj = st.number_input("Total fee ($)", value=float(rental_dj.get("final_cost") or rental_dj.get("estimated_cost") or 0), key="dj_cost")

        licensing = st.radio("Music licensing responsibility", ["Venue is responsible", "Company (DJM Audio) is responsible"], key="dj_lic")

        if st.form_submit_button("Generate DJ Services Agreement PDF", type="primary", icon=":material/picture_as_pdf:"):
            data = {
                "client_name": client_dj, "client_phone": phone_dj,
                "event_name": event_dj, "venue": venue_dj,
                "event_date": edate_dj, "return_date": rdate_dj,
                "final_cost": cost_dj, "estimated_cost": cost_dj,
            }
            pdf_bytes = db.generate_dj_services_pdf(data)
            st.download_button("📄 Download DJ Services Agreement", data=pdf_bytes,
                             file_name=f"DJM_DJ_Agreement_{client_dj[:15]}.pdf",
                             mime="application/pdf", key="dl_dj")

# ── Studio Use Agreement ─────────────────────────────────────
with tab_studio:
    st.subheader("Studio Use & Equipment Liability Agreement")
    st.caption("Danger Beats Music LLC — covers session time, studio rules, damage liability.")

    with st.form("studio_contract_form"):
        sc1, sc2 = st.columns(2)
        client_st = sc1.text_input("Client name", key="st_client")
        phone_st = sc2.text_input("Phone", key="st_phone")

        sc3, sc4 = st.columns(2)
        session = sc3.text_input("Session name", placeholder="Recording session, mixing session...", key="st_session")
        sdate = sc4.text_input("Session date", key="st_date")

        cost_st = st.number_input("Session fee ($)", value=0.0, key="st_cost")

        if st.form_submit_button("Generate Studio Agreement PDF", type="primary", icon=":material/picture_as_pdf:"):
            data = {
                "client_name": client_st, "client_phone": phone_st,
                "event_name": session, "event_date": sdate,
                "venue": "Danger Beats Studio", "final_cost": cost_st,
            }
            pdf_bytes = db.generate_studio_use_pdf(data)
            st.download_button("📄 Download Studio Agreement", data=pdf_bytes,
                             file_name=f"DangerBeats_Studio_{client_st[:15]}.pdf",
                             mime="application/pdf", key="dl_studio")

# ── Independent Contractor Agreement ─────────────────────────
with tab_contractor:
    st.subheader("Independent Contractor Agreement")
    st.caption("For DJs, techs, and assistants you hire per-gig. Sole proprietor — no W-2 employees.")

    with st.form("contractor_form"):
        cc1, cc2 = st.columns(2)
        contractor_name = cc1.text_input("Contractor name", key="cc_name")
        contractor_phone = cc2.text_input("Phone", key="cc_phone")

        cc3, cc4 = st.columns(2)
        gig_name = cc3.text_input("Event/gig", key="cc_gig")
        gig_date = cc4.text_input("Date", key="cc_date")

        cc5, cc6 = st.columns(2)
        rate = cc5.number_input("Rate ($)", min_value=0.0, key="cc_rate")
        rate_type = cc6.selectbox("Rate type", ["Flat rate per gig", "Hourly", "Daily"], key="cc_rtype")

        scope = st.text_area("Scope of work", placeholder="DJ second stage, run lighting board, assist with load-in/out...", key="cc_scope")

        if st.form_submit_button("Generate Contractor Agreement PDF", type="primary", icon=":material/picture_as_pdf:"):
            from fpdf import FPDF
            from datetime import datetime

            pdf = FPDF()
            pdf.add_page()
            pdf.set_auto_page_break(auto=True, margin=15)

            pdf.set_fill_color(102, 126, 234)
            pdf.rect(0, 0, 210, 35, "F")
            pdf.set_text_color(255, 255, 255)
            pdf.set_font("Helvetica", "B", 18)
            pdf.set_y(8)
            pdf.cell(0, 10, "INDEPENDENT CONTRACTOR AGREEMENT", ln=True, align="C")
            pdf.set_font("Helvetica", "", 9)
            pdf.cell(0, 6, "DJM Audio Productions LLC", ln=True, align="C")

            pdf.set_text_color(0, 0, 0)
            pdf.set_y(45)
            pdf.set_font("Helvetica", "", 10)

            text = f"""INDEPENDENT CONTRACTOR AGREEMENT

This Agreement is between DJM Audio Productions LLC ("Company") and {contractor_name} ("Contractor").

1. ENGAGEMENT
Company engages Contractor as an independent contractor for:
Event: {gig_name}
Date: {gig_date}
Scope: {scope or 'As described verbally and confirmed in writing.'}

2. COMPENSATION
Rate: ${rate:,.2f} ({rate_type})
Payment will be made within 7 days of completed work via agreed method.

3. INDEPENDENT CONTRACTOR STATUS
Contractor is an independent contractor, NOT an employee. Contractor is responsible for their own:
- Federal and state income taxes
- Self-employment taxes
- Health insurance and benefits
- Workers compensation (if applicable)
- Equipment and tools (unless otherwise specified)

Company will issue a 1099-NEC for payments of $600 or more in a calendar year.

4. EQUIPMENT
Unless specified otherwise, Contractor provides their own tools and equipment. Any Company equipment provided must be returned in the same condition.

5. SCOPE AND CONTROL
Company defines the desired result, but Contractor controls the manner and means of performing the work. Contractor sets their own schedule and methods.

6. CONFIDENTIALITY
Contractor agrees not to disclose client lists, pricing, or business strategies of Company.

7. NO EXCLUSIVITY
Contractor is free to work for other companies and clients. This agreement does not create an exclusive relationship.

8. TERMINATION
Either party may terminate this agreement with reasonable notice. Payment will be made for work already completed.

9. INDEMNIFICATION
Contractor agrees to indemnify and hold harmless Company from claims arising from Contractor's negligence or misconduct.

10. GOVERNING LAW
This Agreement is governed by the laws of the State of California.

Generated: {datetime.now().strftime('%B %d, %Y')}"""

            pdf.multi_cell(0, 5, text)

            pdf.ln(10)
            pdf.set_font("Helvetica", "B", 11)
            pdf.cell(95, 8, f"Contractor: {contractor_name}")
            pdf.cell(95, 8, f"Date: {datetime.now().strftime('%m/%d/%Y')}", ln=True)
            pdf.ln(5)
            pdf.cell(95, 8, "Contractor Signature: ____________________")
            pdf.cell(95, 8, "DJM Audio Rep: ____________________", ln=True)

            pdf_bytes = pdf.output()
            st.download_button("📄 Download Contractor Agreement", data=pdf_bytes,
                             file_name=f"DJM_Contractor_{contractor_name[:15]}.pdf",
                             mime="application/pdf", key="dl_contractor")

```

## File: `app_pages/dashboard.py`

```python
import streamlit as st
import db
from datetime import date, timedelta

st.title(":material/dashboard: Dashboard")

# ── Stats ────────────────────────────────────────────────────
counts = db.get_item_count()
pending = db.get_rentals_by_status("pending")
approved = db.get_rentals_by_status("approved")

c1, c2, c3, c4 = st.columns(4)
c1.metric("Total gear", counts["total"], help="Individual tracked items")
c2.metric("Available", counts["available"])
c3.metric("In use", counts["in_use"])
c4.metric("Pending requests", len(pending), help="Click to review below")

# Clickable shortcut buttons under the metrics
mc1, mc2, mc3, mc4 = st.columns(4)
if mc3.button("→ In use", key="goto_active", use_container_width=True):
    st.session_state["rentals_tab"] = "active"
    st.switch_page("app_pages/rentals.py")
if mc4.button("→ Review requests", key="goto_pending", type="primary", use_container_width=True):
    st.session_state["rentals_tab"] = "pending"
    st.switch_page("app_pages/rentals.py")

# ── Seed button (first run) ─────────────────────────────────
if counts["total"] == 0:
    st.space("medium")
    st.warning("Your inventory is empty.", icon=":material/inventory_2:")
    st.markdown("Click below to load your full gear inventory from the data file.")
    if st.button("Seed inventory from JSON", icon=":material/upload:", type="primary"):
        with st.spinner("Creating individual items with barcodes…"):
            n = db.seed_from_json("inventory_data.json")
        st.success(f"Created **{n}** items with unique barcodes!", icon=":material/check_circle:")
        st.rerun()

# ── Quick actions ────────────────────────────────────────────
st.space("medium")
st.subheader(":material/bolt: Quick actions")
qa1, qa2, qa3 = st.columns(3)
if qa1.button("Edit Inventory", icon=":material/edit:", use_container_width=True):
    st.switch_page("app_pages/inventory.py")
if qa2.button("View Rentals", icon=":material/event:", use_container_width=True):
    st.switch_page("app_pages/rentals.py")
if qa3.button("View Calendar", icon=":material/calendar_month:", use_container_width=True):
    st.switch_page("app_pages/calendar_view.py")

# ── Pending requests ─────────────────────────────────────────
if pending:
    st.space("medium")
    st.subheader(f":material/pending: Pending requests ({len(pending)})")
    for r in pending:
        with st.container(border=True):
            col_info, col_btn = st.columns([4, 1])
            col_info.markdown(f"**{r['event_name']}**")
            col_info.caption(f"{r['client_name']} · :material/calendar_today: {r['event_date']} · :material/location_on: {r.get('venue', 'TBD')}")
            if col_btn.button("Review →", key=f"dash_review_{r['id']}", type="primary", use_container_width=True):
                st.session_state["rentals_tab"] = "pending"
                st.switch_page("app_pages/rentals.py")

# ── Active rentals ───────────────────────────────────────────
if approved:
    st.space("medium")
    st.subheader(f":material/event_available: Active rentals ({len(approved)})")
    for r in approved:
        with st.container(border=True):
            ri = db.get_rental_items(r["id"])
            col_info, col_btn = st.columns([4, 1])
            col_info.markdown(f"**{r['event_name']}**")
            col_info.caption(f"{r['client_name']} · :material/calendar_today: {r['event_date']} · :material/location_on: {r.get('venue', 'TBD')} · {len(ri)} items")
            if col_btn.button("Manage →", key=f"dash_active_{r['id']}", use_container_width=True):
                st.session_state["rentals_tab"] = "active"
                st.switch_page("app_pages/rentals.py")

# ── Quick status breakdown by category ───────────────────────
st.space("medium")
st.subheader(":material/pie_chart: Inventory by category")
items = db.get_all_items()
if items:
    cat_data = {}
    for item in items:
        cat = item["category"]
        if cat not in cat_data:
            cat_data[cat] = {"available": 0, "in_use": 0, "damaged": 0, "lost": 0}
        s = item["status"]
        if s in cat_data[cat]:
            cat_data[cat][s] += 1

    import pandas as pd
    df = pd.DataFrame([
        {"Category": cat, "Available": v["available"], "In use": v["in_use"],
         "Damaged": v["damaged"], "Lost": v["lost"]}
        for cat, v in sorted(cat_data.items())
    ])
    st.dataframe(df, width="stretch", hide_index=True)

```

## File: `app_pages/discounts.py`

```python
import streamlit as st
import db
import pandas as pd
import string
import random
from datetime import date, timedelta

st.title(":material/sell: Discount Codes")

tab_manage, tab_create = st.tabs(["Manage Codes", "Generate New"])

# ── Manage existing codes ────────────────────────────────────
with tab_manage:
    codes = db.get_all_discount_codes()
    if codes:
        for c in codes:
            with st.container(border=True):
                c1, c2, c3 = st.columns([3, 2, 2])
                c1.markdown(f"### `{c['code']}`")
                c2.metric(f"{c['percent_off']}% off", f"{c['times_used']}/{c['max_uses'] or '∞'} uses")
                
                status = "🟢 Active" if c["active"] else "🔴 Inactive"
                exp = c.get("expires_at") or "Never"
                c3.caption(f"{status}\nExpires: {exp}")
                
                bc1, bc2 = st.columns(2)
                if c["active"]:
                    if bc1.button("Deactivate", key=f"deact_{c['id']}", use_container_width=True):
                        db.toggle_discount_code(c["id"], False)
                        st.rerun()
                else:
                    if bc1.button("Activate", key=f"act_{c['id']}", type="primary", use_container_width=True):
                        db.toggle_discount_code(c["id"], True)
                        st.rerun()
                
                if bc2.button("Delete", key=f"del_{c['id']}", use_container_width=True):
                    db.delete_discount_code(c["id"])
                    st.success("Deleted!")
                    st.rerun()
    else:
        st.info("No discount codes yet. Create one in the 'Generate New' tab!")

# ── Generate new codes ───────────────────────────────────────
with tab_create:
    st.subheader("Create a Discount Code")
    
    with st.form("create_code_form"):
        mode = st.radio("Code type", ["Custom code", "Auto-generate random code"], horizontal=True)
        
        custom_code = st.text_input("Custom code (if selected above)", placeholder="DJMFAMILY15")
        
        pc1, pc2 = st.columns(2)
        percent = pc1.number_input("Discount %", min_value=1, max_value=100, value=15)
        max_uses = pc2.number_input("Max uses (0 = unlimited)", min_value=0, value=0)
        
        has_expiry = st.checkbox("Set expiration date")
        exp_date = None
        if has_expiry:
            exp_date = st.date_input("Expires on", value=date.today() + timedelta(days=30))
        
        if st.form_submit_button("Create Code", icon=":material/add:", type="primary"):
            if mode == "Custom code":
                code = custom_code.strip().upper()
                if not code:
                    st.error("Enter a code!")
                    st.stop()
            else:
                code = "DJM" + "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
            
            try:
                db.create_discount_code(
                    code=code,
                    percent_off=percent,
                    max_uses=max_uses,
                    expires_at=str(exp_date) if exp_date else None
                )
                st.success(f"Created code **{code}** for {percent}% off!")
                st.rerun()
            except Exception as e:
                st.error(f"Error: {e}")
    
    st.divider()
    st.subheader("Quick Generate")
    st.caption("One-click buttons to create common codes.")
    q1, q2 = st.columns(2)
    if q1.button("Create 15% code", icon=":material/bolt:", use_container_width=True):
        code = "DJM15-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
        db.create_discount_code(code=code, percent_off=15)
        st.success(f"Created **{code}**")
        st.rerun()
    if q2.button("Create 25% code", icon=":material/bolt:", use_container_width=True):
        code = "DJM25-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
        db.create_discount_code(code=code, percent_off=25)
        st.success(f"Created **{code}**")
        st.rerun()

```

## File: `app_pages/home.py`

```python
import streamlit as st

# ── Hero Section with Background Video ───────────────────────
st.markdown("""
<style>
/* Make Streamlit's header transparent so the video shows underneath */
[data-testid="stHeader"] {
    background: rgba(10, 10, 15, 0.5) !important;
    backdrop-filter: blur(10px);
}

/* Background EQ container fixed to the top */
#bg-eq-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 70vh;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    gap: clamp(2px, 0.5vw, 6px);
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
    padding-bottom: 5vh;
}
#bg-eq-container::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, rgba(14, 17, 23, 0.4) 0%, rgba(14, 17, 23, 1) 100%);
    z-index: 1;
}

.eq-bar {
    width: clamp(10px, 2vw, 30px);
    background: linear-gradient(to top, rgba(217,70,239,0.5), rgba(59,130,246,0.9));
    border-radius: 4px 4px 0 0;
    animation: eq-bounce 1s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
    animation-delay: var(--d);
    height: var(--h);
    z-index: 0;
}

@keyframes eq-bounce {
    0% { height: 10%; }
    100% { height: var(--h); }
}

/* Ensure content sits above the video */
[data-testid="stMainBlockContainer"] {
    position: relative;
    z-index: 2;
}

.hero-wrapper {
    text-align: center;
    padding: 3rem 2rem;
    background: rgba(10, 10, 15, 0.75);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    max-width: 850px;
    margin: 2rem auto 3rem;
    box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 40px rgba(217,70,239,0.15);
}
.hero-title {
    font-size: 3.5rem;
    font-weight: 800;
    line-height: 1.15;
    margin-bottom: 1.2rem;
    text-shadow: 0 4px 15px rgba(0,0,0,1);
    color: #ffffff;
}
.hero-sub {
    font-size: 1.3rem;
    color: rgba(255, 255, 255, 0.95);
    max-width: 650px;
    margin: 0 auto 1.5rem;
    line-height: 1.6;
    text-shadow: 0 2px 10px rgba(0,0,0,1);
}
</style>

<div id="bg-eq-container">
    <div class="eq-bar" style="--d: 1.49s; --h: 35%"></div>
    <div class="eq-bar" style="--d: 0.31s; --h: 84%"></div>
    <div class="eq-bar" style="--d: 0.79s; --h: 43%"></div>
    <div class="eq-bar" style="--d: 0.4s; --h: 45%"></div>
    <div class="eq-bar" style="--d: 0.95s; --h: 77%"></div>
    <div class="eq-bar" style="--d: 1.37s; --h: 38%"></div>
    <div class="eq-bar" style="--d: 1.18s; --h: 84%"></div>
    <div class="eq-bar" style="--d: 0.79s; --h: 58%"></div>
    <div class="eq-bar" style="--d: 1.36s; --h: 81%"></div>
    <div class="eq-bar" style="--d: 0.38s; --h: 34%"></div>
    <div class="eq-bar" style="--d: 0.95s; --h: 66%"></div>
    <div class="eq-bar" style="--d: 0.53s; --h: 78%"></div>
    <div class="eq-bar" style="--d: 1.23s; --h: 55%"></div>
    <div class="eq-bar" style="--d: 1.25s; --h: 69%"></div>
    <div class="eq-bar" style="--d: 0.17s; --h: 35%"></div>
    <div class="eq-bar" style="--d: 1.1s; --h: 63%"></div>
    <div class="eq-bar" style="--d: 1.45s; --h: 84%"></div>
    <div class="eq-bar" style="--d: 1.38s; --h: 48%"></div>
    <div class="eq-bar" style="--d: 1.17s; --h: 77%"></div>
    <div class="eq-bar" style="--d: 0.15s; --h: 49%"></div>
    <div class="eq-bar" style="--d: 1.18s; --h: 46%"></div>
    <div class="eq-bar" style="--d: 0.18s; --h: 95%"></div>
    <div class="eq-bar" style="--d: 1.38s; --h: 68%"></div>
    <div class="eq-bar" style="--d: 0.96s; --h: 83%"></div>
    <div class="eq-bar" style="--d: 0.51s; --h: 53%"></div>
    <div class="eq-bar" style="--d: 0.31s; --h: 68%"></div>
    <div class="eq-bar" style="--d: 0.82s; --h: 51%"></div>
    <div class="eq-bar" style="--d: 0.91s; --h: 48%"></div>
    <div class="eq-bar" style="--d: 0.49s; --h: 57%"></div>
    <div class="eq-bar" style="--d: 0.43s; --h: 31%"></div>
    <div class="eq-bar" style="--d: 1.17s; --h: 88%"></div>
    <div class="eq-bar" style="--d: 0.56s; --h: 72%"></div>
    <div class="eq-bar" style="--d: 0.56s; --h: 44%"></div>
    <div class="eq-bar" style="--d: 0.05s; --h: 62%"></div>
    <div class="eq-bar" style="--d: 1.12s; --h: 59%"></div>
    <div class="eq-bar" style="--d: 0.6s; --h: 52%"></div>
    <div class="eq-bar" style="--d: 0.04s; --h: 71%"></div>
    <div class="eq-bar" style="--d: 0.37s; --h: 90%"></div>
    <div class="eq-bar" style="--d: 0.09s; --h: 73%"></div>
    <div class="eq-bar" style="--d: 0.46s; --h: 69%"></div>
</div>

<div class="hero-wrapper">
    <h1 class="hero-title">Pro Audio Rental for Live Events in LA.</h1>
    <p class="hero-sub">
        Quality gear, reliable delivery, and on-site engineering to make your event sound perfect.
    </p>
</div>
""", unsafe_allow_html=True)

# Primary CTA
hc1, hc2, hc3 = st.columns([1, 1, 1])
with hc2:
    if st.button("Browse Gear", type="primary", use_container_width=True):
        st.switch_page("app_pages/browse.py")

st.markdown("<div style='height: 4rem;'></div>", unsafe_allow_html=True)

# ── How It Works ─────────────────────────────────────────────
st.divider()

st.markdown("""
<h2 style="text-align:center; margin-bottom: 2rem;">How it works</h2>
""", unsafe_allow_html=True)

hw1, hw2, hw3 = st.columns(3)
with hw1:
    with st.container(border=True):
        st.markdown("### 1. Browse gear")
        st.caption("Find the speakers, mics, lighting, or packages you need in our catalog.")
with hw2:
    with st.container(border=True):
        st.markdown("### 2. Submit request")
        st.caption("Add items to your cart, select your dates, and send us your event details.")
with hw3:
    with st.container(border=True):
        st.markdown("### 3. Get confirmation")
        st.caption("We review availability within 24 hours and send you a finalized quote.")


# ── Services ─────────────────────────────────────────────────
st.divider()

st.markdown("""
<h2 style="text-align:center; margin-bottom: 0.5rem;">Our services</h2>
<p style="text-align:center; color: rgba(224,224,232,0.5); margin-bottom: 2rem;">Everything you need for your event under one roof</p>
""", unsafe_allow_html=True)

s1, s2, s3, s4 = st.columns(4)

with s1:
    with st.container(border=True):
        st.markdown("### :material/speaker: Sound")
        st.caption("Weddings, Corporate, Parties")

with s2:
    with st.container(border=True):
        st.markdown("### :material/lightbulb: Lighting")
        st.caption("Uplighting, Moving Heads")

with s3:
    with st.container(border=True):
        st.markdown("### :material/photo_camera: Photo")
        st.caption("Event Coverage, 360 Booths")

with s4:
    with st.container(border=True):
        st.markdown("### :material/tv: Stage")
        st.caption("Trussing, Stage Setups")


# ── Trust & Past Events ──────────────────────────────────────
st.divider()

st.markdown("""
<h2 style="text-align:center; margin-bottom: 0.5rem;">Trusted locally</h2>
<p style="text-align:center; color: rgba(224,224,232,0.5); margin-bottom: 2rem;">We work with organizations across Los Angeles</p>
""", unsafe_allow_html=True)

e1, e2, e3, e4 = st.columns(4)

with e1:
    with st.container(border=True):
        st.markdown("**St. Louis of France Festival**")
        st.caption("La Puente, CA")

with e2:
    with st.container(border=True):
        st.markdown("**LAPD Hollenbeck**")
        st.caption("Boyle Heights, CA")

with e3:
    with st.container(border=True):
        st.markdown("**Black In Mayberry**")
        st.caption("El Segundo, CA")

with e4:
    with st.container(border=True):
        st.markdown("**St John the Baptist**")
        st.caption("Baldwin Park, CA")

# ── Footer CTA ───────────────────────────────────────────────
st.divider()

st.markdown("""
<div style="text-align:center; padding: 2rem 0;">
    <h2 style="margin-bottom: 1rem;">Ready to start?</h2>
</div>
""", unsafe_allow_html=True)

cc1, cc2, cc3 = st.columns([1, 2, 1])
with cc2:
    if st.button("Start a Rental Request", type="primary", use_container_width=True):
        st.switch_page("app_pages/browse.py")

# Footer Trust Info
st.divider()

fc1, fc2, fc3 = st.columns([2, 3, 2])
with fc2:
    st.image("https://djmaudio.com/wp-content/uploads/2025/02/DJM-Logo-copy-300x300.png", use_container_width=True)

st.markdown("""
<div style="text-align:center; padding: 1rem 0 3rem; color: rgba(255,255,255,0.9);">
    <p style="font-size: 2.2rem; margin-top: 0.5rem; font-weight: 700; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">(626) 506-3824</p>
    <p style="font-size: 1.4rem; color: #b182ff; font-weight: 600;">djmaudio.com</p>
    <br/>
    <span style="opacity: 0.5; font-size: 0.9rem;">Los Angeles, CA · © 2025 DJM Audio Productions LLC</span>
</div>
""", unsafe_allow_html=True)

```

## File: `app_pages/inventory.py`

```python
import streamlit as st
import db
import pandas as pd

st.title(":material/inventory_2: Inventory")

items = db.get_all_items()

if not items:
    st.info("No items yet. Go to the Dashboard to seed your inventory.", icon=":material/info:")
    st.stop()

# ── View mode toggle ─────────────────────────────────────────
view = st.pills("View", ["Table", "Edit mode", "Add new", "Bulk update", "Data Sheets"], default="Table")

# ── Filters (shared) ─────────────────────────────────────────
categories = sorted(set(i["category"] for i in items))
cases = sorted(set(i["storage_case"] for i in items if i.get("storage_case")))
statuses = ["All", "available", "in_use", "damaged", "lost"]

fc1, fc2 = st.columns(2)
filt_status = fc1.selectbox("Status", statuses, index=0)
filt_cat = fc2.selectbox("Category", ["All"] + categories, index=0)
fc3, fc4 = st.columns(2)
filt_case = fc3.selectbox("Storage case", ["All"] + cases, index=0)
search = fc4.text_input("Search", placeholder="Name, brand, barcode…")

# ── Apply filters ────────────────────────────────────────────
filtered = items
if filt_status != "All":
    filtered = [i for i in filtered if i["status"] == filt_status]
if filt_cat != "All":
    filtered = [i for i in filtered if i["category"] == filt_cat]
if filt_case != "All":
    filtered = [i for i in filtered if i.get("storage_case") == filt_case]
if search:
    q = search.lower()
    filtered = [i for i in filtered if
                q in i["name"].lower() or
                q in i["brand"].lower() or
                q in i["barcode"].lower() or
                q in (i.get("notes") or "").lower()]

st.caption(f"Showing {len(filtered)} of {len(items)} items")

# ── TABLE VIEW (grouped by name) ─────────────────────────────
if view == "Table":
    if filtered:
        # Group items by name
        grouped_inv = {}
        for i in filtered:
            key = i["name"]
            if key not in grouped_inv:
                grouped_inv[key] = {
                    "name": i["name"],
                    "brand": i["brand"],
                    "category": i["category"],
                    "rate_half_day": float(i.get("rate_half_day") or 0),
                    "rate_daily": float(i.get("rate_daily") or 0),
                    "rate_weekend": float(i.get("rate_weekend") or 0),
                    "units": [],
                }
            grouped_inv[key]["units"].append(i)

        # Summary table
        summary_rows = []
        for name, info in sorted(grouped_inv.items()):
            units = info["units"]
            avail = sum(1 for u in units if u["status"] == "available")
            total_val = sum(float(u.get("current_value") or 0) for u in units)
            summary_rows.append({
                "Name": name,
                "Brand": info["brand"],
                "Category": info["category"],
                "Qty": len(units),
                "Available": avail,
                "Daily": f"${info['rate_daily']:.0f}",
                "Value": f"${total_val:,.0f}",
            })

        df = pd.DataFrame(summary_rows)
        st.dataframe(df, width="stretch", hide_index=True)

        # Expandable detail per item group
        for name, info in sorted(grouped_inv.items()):
            units = info["units"]
            if len(units) > 1:
                with st.expander(f"**{info['brand']}** {name} — {len(units)} units"):
                    for u in units:
                        status_color = {"available": "green", "in_use": "blue", "damaged": "orange", "lost": "red"}.get(u["status"], "gray")
                        c1, c2, c3 = st.columns([3, 2, 2])
                        c1.code(u["barcode"])
                        c2.badge(u["status"], color=status_color)
                        c3.caption(u.get("storage_case") or "—")

        # Summary metrics
        total_purchase = sum(float(i.get("purchase_price") or 0) for i in filtered)
        total_value = sum(float(i.get("current_value") or 0) for i in filtered)
        sc1, sc2, sc3 = st.columns(3)
        sc1.metric("Items shown", len(filtered))
        sc2.metric("Total purchased", f"${total_purchase:,.0f}")
        sc3.metric("Current value", f"${total_value:,.0f}")

# ── EDIT MODE (inline spreadsheet editor) ────────────────────
elif view == "Edit mode":
    st.markdown("Click any cell to edit. Hit **Save changes** when done.")

    df = pd.DataFrame([{
        "id": i["id"],
        "barcode": i["barcode"],
        "name": i["name"],
        "brand": i["brand"],
        "category": i["category"],
        "storage_case": i.get("storage_case") or "",
        "status": i["status"],
        "purchase_price": float(i.get("purchase_price") or 0),
        "current_value": float(i.get("current_value") or 0),
        "rate_half_day": float(i.get("rate_half_day") or 0),
        "rate_daily": float(i.get("rate_daily") or 0),
        "rate_weekend": float(i.get("rate_weekend") or 0),
        "notes": i.get("notes") or "",
    } for i in filtered])

    edited = st.data_editor(
        df,
        width="stretch",
        hide_index=True,
        num_rows="fixed",
        disabled=["id", "barcode"],
        column_config={
            "id": st.column_config.TextColumn("ID", width="small"),
            "barcode": st.column_config.TextColumn("Barcode", width="medium"),
            "status": st.column_config.SelectboxColumn(
                "Status", options=["available", "in_use", "damaged", "lost"], width="small"
            ),
            "category": st.column_config.SelectboxColumn(
                "Category", options=sorted(db.CATEGORY_PREFIXES.keys()), width="medium"
            ),
            "purchase_price": st.column_config.NumberColumn("Purchased $", format="$%.2f", min_value=0),
            "current_value": st.column_config.NumberColumn("Value $", format="$%.2f", min_value=0),
            "rate_half_day": st.column_config.NumberColumn("½ Day $", format="$%.2f", min_value=0),
            "rate_daily": st.column_config.NumberColumn("Daily $", format="$%.2f", min_value=0),
            "rate_weekend": st.column_config.NumberColumn("Weekend $", format="$%.2f", min_value=0),
        },
        key="inventory_editor",
    )

    if st.button("Save changes", icon=":material/save:", type="primary"):
        changes = 0
        for idx, row in edited.iterrows():
            orig = df.iloc[idx]
            updates = {}
            for col in ["name", "brand", "category", "storage_case", "status",
                        "purchase_price", "current_value", "rate_half_day",
                        "rate_daily", "rate_weekend", "notes"]:
                if row[col] != orig[col]:
                    updates[col] = row[col]
            if updates:
                db.update_item(row["id"], updates)
                changes += 1
        if changes:
            st.success(f"Saved {changes} item(s)!", icon=":material/check_circle:")
            st.rerun()
        else:
            st.info("No changes detected.")

    # Delete items
    st.space("medium")
    with st.expander(":material/delete: Delete items"):
        del_barcodes = st.text_input("Barcodes to delete (comma-separated)",
                                      placeholder="DJM-XLR-0001, DJM-MIC-0003")
        if st.button("Delete", icon=":material/delete:", type="secondary"):
            barcodes = [b.strip() for b in del_barcodes.split(",") if b.strip()]
            ids_to_delete = [i["id"] for i in items if i["barcode"] in barcodes]
            if ids_to_delete:
                db.delete_items(ids_to_delete)
                st.success(f"Deleted {len(ids_to_delete)} item(s).", icon=":material/check_circle:")
                st.rerun()
            else:
                st.warning("No matching barcodes found.")

# ── ADD NEW ──────────────────────────────────────────────────
elif view == "Add new":
    st.markdown("Add new gear to your inventory. Each unit gets its own barcode.")

    with st.form("add_item", border=True):
        ac1, ac2 = st.columns(2)
        new_name = ac1.text_input("Item name", placeholder="25' XLR cable")
        new_brand = ac2.text_input("Brand", placeholder="Neutrik")
        ac3, ac4 = st.columns(2)
        new_cat = ac3.selectbox("Category", sorted(db.CATEGORY_PREFIXES.keys()))
        new_case = ac4.text_input("Storage case", placeholder="Blue Makita Bag 1")

        st.markdown("**Pricing**")
        pc1, pc2 = st.columns(2)
        new_purchase = pc1.number_input("Purchase $", min_value=0.0, step=1.0, format="%.2f")
        new_value = pc2.number_input("Current value $", min_value=0.0, step=1.0, format="%.2f")
        pc3, pc4, pc5 = st.columns(3)
        new_half = pc3.number_input("½ Day $", min_value=0.0, step=1.0, format="%.2f")
        new_daily = pc4.number_input("Daily $", min_value=0.0, step=1.0, format="%.2f")
        new_weekend = pc5.number_input("Wknd $", min_value=0.0, step=1.0, format="%.2f")

        ac5, ac6 = st.columns(2)
        new_qty = ac5.number_input("Quantity to add", min_value=1, max_value=50, value=1,
                                    help="Creates this many individual items with unique barcodes")
        new_notes = ac6.text_input("Notes (optional)")

        if st.form_submit_button("Add items", icon=":material/add:", type="primary"):
            if not new_name:
                st.error("Name is required")
            else:
                added = []
                for _ in range(new_qty):
                    bc = db.get_next_barcode(new_cat)
                    db.add_item(bc, new_name, new_brand or "Generic", new_cat, new_case,
                                new_notes, new_purchase, new_value, new_half, new_daily, new_weekend)
                    added.append(bc)
                st.success(f"Added {new_qty} item(s): {', '.join(added)}", icon=":material/check_circle:")
                st.rerun()

# ── BULK UPDATE ──────────────────────────────────────────────
elif view == "Bulk update":
    st.markdown("Update status or pricing for multiple items at once.")

    with st.form("bulk_status", border=True):
        st.markdown("**Change status**")
        barcode_input = st.text_area("Barcodes (one per line or comma-separated)",
                                      placeholder="DJM-XLR-0001\nDJM-MIC-0003\nDJM-LGT-0001",
                                      height=100)
        new_status = st.selectbox("New status", ["available", "in_use", "damaged", "lost"])
        if st.form_submit_button("Update status", icon=":material/sync:", type="primary"):
            raw = barcode_input.replace(",", "\n")
            barcodes = [b.strip() for b in raw.split("\n") if b.strip()]
            if not barcodes:
                st.error("Enter at least one barcode")
            else:
                updated = 0
                for bc in barcodes:
                    matching = [i for i in items if i["barcode"] == bc]
                    if matching:
                        db.update_item(matching[0]["id"], {"status": new_status})
                        updated += 1
                if updated:
                    st.success(f"Updated {updated} item(s) to '{new_status}'", icon=":material/check_circle:")
                    st.rerun()
                else:
                    st.warning("No matching barcodes found")

    st.space("medium")

    with st.form("bulk_price", border=True):
        st.markdown("**Bulk pricing update** — set rates for all items matching a name + brand")
        bp1, bp2 = st.columns(2)
        match_name = bp1.text_input("Item name contains", placeholder="XLR cable")
        match_brand = bp2.text_input("Brand contains (optional)")
        bpc1, bpc2, bpc3, bpc4, bpc5 = st.columns(5)
        bp_purchase = bpc1.number_input("Purchase $", min_value=0.0, step=1.0, format="%.2f", key="bp_p")
        bp_value = bpc2.number_input("Value $", min_value=0.0, step=1.0, format="%.2f", key="bp_v")
        bp_half = bpc3.number_input("½ Day $", min_value=0.0, step=1.0, format="%.2f", key="bp_h")
        bp_daily = bpc4.number_input("Daily $", min_value=0.0, step=1.0, format="%.2f", key="bp_d")
        bp_weekend = bpc5.number_input("Weekend $", min_value=0.0, step=1.0, format="%.2f", key="bp_w")

        if st.form_submit_button("Apply pricing", icon=":material/attach_money:"):
            if not match_name:
                st.error("Enter an item name to match")
            else:
                q = match_name.lower()
                matched = [i for i in items if q in i["name"].lower()]
                if match_brand:
                    qb = match_brand.lower()
                    matched = [i for i in matched if qb in i["brand"].lower()]
                if matched:
                    updates = {}
                    if bp_purchase > 0: updates["purchase_price"] = bp_purchase
                    if bp_value > 0: updates["current_value"] = bp_value
                    if bp_half > 0: updates["rate_half_day"] = bp_half
                    if bp_daily > 0: updates["rate_daily"] = bp_daily
                    if bp_weekend > 0: updates["rate_weekend"] = bp_weekend
                    if updates:
                        for i in matched:
                            db.update_item(i["id"], updates)
                        st.success(f"Updated pricing for {len(matched)} items!", icon=":material/check_circle:")
                        st.rerun()
                    else:
                        st.warning("Enter at least one price > $0")
                else:
                    st.warning("No matching items found")

# ── DATA SHEETS ──────────────────────────────────────────────
elif view == "Data Sheets":
    st.markdown("Edit Data Sheets & Coverage specs for your speakers (Markdown supported).")
    pa_systems = [i for i in items if i["category"] in ["PA Systems", "Lighting", "Mixers", "Microphones"]]
    if not pa_systems:
        st.info("No supported items found.")
    else:
        # Group by name to edit the spec once per model, not per barcode
        grouped = {}
        for i in pa_systems:
            key = i["name"]
            if key not in grouped:
                grouped[key] = i
        
        for name, info in grouped.items():
            with st.expander(f"**{info['brand']}** {name}"):
                with st.form(f"form_specs_{info['id']}"):
                    new_specs = st.text_area("Data Sheet (Markdown)", value=info.get("specs_markdown") or "", height=300)
                    if st.form_submit_button("Save Specs", icon=":material/save:", type="primary"):
                        # update all items with this name
                        to_update = [x["id"] for x in items if x["name"] == name]
                        for uid in to_update:
                            db.update_item(uid, {"specs_markdown": new_specs})
                        st.success(f"Specs saved for all {len(to_update)} unit(s)!", icon=":material/check_circle:")
                        st.rerun()

```

## File: `app_pages/labor.py`

```python
import streamlit as st
import db
import pandas as pd

st.title(":material/engineering: Staff & Labor")

tab_staff, tab_time, tab_pay = st.tabs(["Staff & Contractors", "Time Logs", "Contractor Payments"])

# ── Staff ────────────────────────────────────────────────────
with tab_staff:
    st.subheader("Team Roster")
    employees = db.get_employees()
    if employees:
        df_emp = pd.DataFrame(employees)
        st.dataframe(df_emp[["name", "role", "phone", "email"]], hide_index=True, use_container_width=True)
    else:
        st.info("No staff added yet.")
        
    with st.expander("Add New Team Member"):
        with st.form("add_emp_form"):
            e_name = st.text_input("Name *")
            e_role = st.selectbox("Role", ["admin", "contractor"])
            e_phone = st.text_input("Phone")
            e_email = st.text_input("Email")
            
            if st.form_submit_button("Add Member", type="primary"):
                if not e_name:
                    st.error("Name is required.")
                else:
                    db.add_employee(e_name, e_role, e_phone, e_email)
                    st.success("Added!")
                    st.rerun()

# ── Time Logs ────────────────────────────────────────────────
with tab_time:
    st.subheader("Time Logged")
    logs = db.get_all_time_logs()
    if logs:
        data = []
        for l in logs:
            data.append({
                "Date": l['logged_date'],
                "Event": l['rentals']['event_name'] if l.get('rentals') else "Unknown",
                "Employee": l['employees']['name'] if l.get('employees') else "Unknown",
                "Hours": l['hours'],
                "Task": l['task_description']
            })
        df_logs = pd.DataFrame(data)
        st.dataframe(df_logs, hide_index=True, use_container_width=True)
        
        total_hours = sum(l['hours'] for l in logs)
        st.metric("Total Hours Logged", total_hours)
    else:
        st.info("No time logged yet. Log time directly from the Rentals page.")

# ── Contractor Payments ──────────────────────────────────────
with tab_pay:
    st.subheader("Contractor Payments")
    payments = db.get_all_payments()
    if payments:
        data = []
        for p in payments:
            data.append({
                "Date": p['payment_date'],
                "Event": p['rentals']['event_name'] if p.get('rentals') else "Unknown",
                "Contractor": p['employees']['name'] if p.get('employees') else "Unknown",
                "Amount": p['amount'],
                "Notes": p['notes']
            })
        df_pay = pd.DataFrame(data)
        
        st.dataframe(
            df_pay,
            column_config={
                "Amount": st.column_config.NumberColumn("Amount", format="$%.2f")
            },
            hide_index=True,
            use_container_width=True
        )
        
        total_pay = sum(p['amount'] for p in payments)
        st.metric("Total Contractor Payments", f"${total_pay:.2f}")
    else:
        st.info("No payments logged yet. Log payments directly from the Rentals page.")

```

## File: `app_pages/maintenance.py`

```python
import streamlit as st
import db
import pandas as pd

st.title(":material/build: Maintenance Log")

tab_log, tab_add = st.tabs(["History", "Log New"])

# ── History ──────────────────────────────────────────────────
with tab_log:
    try:
        logs = db.get_all_maintenance()
    except Exception:
        logs = []
        st.info("Run the SQL to create the maintenance_log table first.")
    
    if logs:
        for m in logs:
            item = m.get("items", {})
            with st.container(border=True):
                c1, c2 = st.columns([3, 1])
                c1.markdown(f"**{item.get('brand', '')} {item.get('name', '')}**")
                c1.caption(f"`{item.get('barcode', '')}` · {m['action']}")
                if m.get("notes"):
                    c1.caption(m["notes"])
                c2.caption(m["created_at"][:10])
                if m.get("cost") and float(m["cost"]) > 0:
                    c2.badge(f"${float(m['cost']):.0f}", color="red")
        
        # Summary stats
        st.divider()
        total_cost = sum(float(m.get("cost") or 0) for m in logs)
        st.metric("Total maintenance cost", f"${total_cost:,.0f}")
    else:
        st.info("No maintenance records yet. Use the scan page or log one below.")

# ── Add new ──────────────────────────────────────────────────
with tab_add:
    items = db.get_all_items()
    if not items:
        st.info("No items in inventory.")
        st.stop()
    
    item_options = {f"{i['barcode']} — {i['brand']} {i['name']}": i["id"] for i in items}
    
    with st.form("maint_add_form", clear_on_submit=True):
        selected = st.selectbox("Select item", list(item_options.keys()))
        action = st.selectbox("Action", ["Inspection", "Repair", "Cleaning", "Cable replacement", "Firmware update", "Damage assessment", "Other"])
        notes = st.text_area("Notes", placeholder="Describe the work done or issue found...")
        cost = st.number_input("Cost ($)", min_value=0.0, value=0.0, step=5.0)
        
        if st.form_submit_button("Log Maintenance", type="primary", icon=":material/build:"):
            db.log_maintenance(item_options[selected], action, notes, cost)
            db.log_activity("Maintenance logged", f"{action} on {selected.split(' — ')[1]}")
            st.success("Logged!")
            st.rerun()

```

## File: `app_pages/quick_add.py`

```python
import streamlit as st
import db
from parser import parse_text, KNOWN_GEAR, CABLE_TYPES

st.title(":material/auto_fix_high: Quick add")
st.markdown("Type items how you'd normally describe them. The system auto-fills names, brands, categories & pricing.")

# ── Examples ─────────────────────────────────────────────────
with st.expander("Examples of what you can type"):
    st.code("""3x 25ft xlr neutrik
2 sm57
boom stand
5 6ft dmx cables
beta58a
1 moving head, $350
10ft ethernet
radial di
fog machine chauvet
pioneer xdj-xz""", language=None)

# ── Input ────────────────────────────────────────────────────
raw = st.text_area(
    "Type your items (one per line)",
    height=200,
    placeholder="3x 25ft xlr neutrik\n2 sm57\nboom stand\nbeta58a wireless",
)

STORAGE_CASES = [
    "",
    "Blue Makita Bag 1",
    "Makita Bag 2",
    "Black Box Yellow Cap A",
    "Black Box Yellow Cap B",
    "Black Box Yellow Cap C",
    "Light Case",
    "LightJoy Rolling Case A",
    "LightJoy Rolling Case B",
    "Microphone Case A",
    "Microphone Case B",
    "Microphone Bag Gator A",
    "Microphone Bag Gator B",
]

storage = st.selectbox("Storage case (applied to all)", STORAGE_CASES, index=0)

if st.button("Parse items", icon=":material/auto_fix_high:", type="primary") and raw:
    items = parse_text(raw)

    if not items:
        st.warning("Couldn't parse anything. Try one item per line.")
        st.stop()

    st.session_state["parsed_items"] = items
    st.session_state["parsed_storage"] = storage

# ── Show parsed results ──────────────────────────────────────
if "parsed_items" in st.session_state and st.session_state["parsed_items"]:
    items = st.session_state["parsed_items"]
    storage_case = st.session_state.get("parsed_storage", "")

    st.success(f"Parsed **{len(items)}** item(s) — review below, edit if needed, then save.", icon=":material/check_circle:")

    import pandas as pd

    df = pd.DataFrame([{
        "qty": i["qty"],
        "name": i["name"],
        "brand": i["brand"],
        "category": i["category"],
        "purchase_price": i["purchase_price"],
        "current_value": i["current_value"],
        "rate_half_day": i["rate_half_day"],
        "rate_daily": i["rate_daily"],
        "rate_weekend": i["rate_weekend"],
        "notes": i["notes"],
    } for i in items])

    edited = st.data_editor(
        df,
        width="stretch",
        hide_index=True,
        column_config={
            "qty": st.column_config.NumberColumn("Qty", min_value=1, max_value=100, width="small"),
            "category": st.column_config.SelectboxColumn("Category", options=sorted(db.CATEGORY_PREFIXES.keys()), width="medium"),
            "purchase_price": st.column_config.NumberColumn("Purchased $", format="$%.0f", min_value=0),
            "current_value": st.column_config.NumberColumn("Value $", format="$%.0f", min_value=0),
            "rate_half_day": st.column_config.NumberColumn("½ Day $", format="$%.0f", min_value=0),
            "rate_daily": st.column_config.NumberColumn("Daily $", format="$%.0f", min_value=0),
            "rate_weekend": st.column_config.NumberColumn("Wknd $", format="$%.0f", min_value=0),
        },
        key="quick_add_editor",
    )

    c1, c2 = st.columns([1, 3])
    if c1.button("Add all to inventory", icon=":material/add_circle:", type="primary"):
        total_added = 0
        barcodes = []
        for _, row in edited.iterrows():
            for _ in range(int(row["qty"])):
                bc = db.get_next_barcode(row["category"])
                db.add_item(
                    barcode=bc,
                    name=row["name"],
                    brand=row["brand"],
                    category=row["category"],
                    storage_case=storage_case,
                    notes=row["notes"],
                    purchase_price=float(row["purchase_price"]),
                    current_value=float(row["current_value"]),
                    rate_half_day=float(row["rate_half_day"]),
                    rate_daily=float(row["rate_daily"]),
                    rate_weekend=float(row["rate_weekend"]),
                )
                barcodes.append(bc)
                total_added += 1

        st.session_state["parsed_items"] = []
        st.success(f"Added **{total_added}** items to inventory!", icon=":material/check_circle:")
        with st.expander("Barcodes created"):
            st.code("\n".join(barcodes))
        st.rerun()

    if c2.button("Clear", icon=":material/delete:"):
        st.session_state["parsed_items"] = []
        st.rerun()

```

## File: `app_pages/rentals.py`

```python
import streamlit as st
import db
from datetime import datetime
import gear_requirements as gr

st.title(":material/event: Rentals")

# ── Deep-link: jump to correct tab if coming from dashboard ──
# Other pages set st.session_state["rentals_tab"] = "pending" | "active" | "history"
_default_tab = st.session_state.pop("rentals_tab", "pending")
_tab_index = {"pending": 0, "active": 1, "history": 2, "new": 3}.get(_default_tab, 0)

# ── Tabs ─────────────────────────────────────────────────────
tabs = st.tabs([
    ":material/pending: Pending",
    ":material/event_available: Active",
    ":material/history: History",
    ":material/add: New request",
])
tab_pending, tab_active, tab_history, tab_new = tabs

# ── Pending tab ──────────────────────────────────────────────
with tab_pending:
    pending = db.get_rentals_by_status("pending")
    if not pending:
        st.info("No pending requests.", icon=":material/check_circle:")

    for r in pending:
        with st.container(border=True):
            c1, c2 = st.columns([3, 1])
            with c1:
                st.markdown(f"### {r['event_name']}")
                st.markdown(
                    f":material/person: **{r['client_name']}** · "
                    f":material/phone: {r.get('client_phone', 'N/A')}  \n"
                    f":material/calendar_today: {r['event_date']} → {r.get('return_date', 'TBD')}  \n"
                    f":material/location_on: {r.get('venue', 'TBD')}  \n"
                    f":material/payments: Est. Cost: **${r.get('estimated_cost') or 0:.2f}**"
                )
                if r.get("notes"):
                    st.caption(f"Notes: {r['notes']}")

            with c2:
                st.space("small")

                # ── Approve — smart gear suggestion panel ──────────────────
                with st.expander("✅ Approve", expanded=st.session_state.get(f"expand_approve_{r['id']}", False)):
                    available = db.get_available_items()
                    if not available:
                        st.warning("No available items in inventory.")
                    else:
                        st.markdown("#### Step 1 — Select gear")
                        cats = sorted(set(i["category"] for i in available))
                        selected_ids = []
                        selected_items_data = []

                        for cat in cats:
                            cat_items = [i for i in available if i["category"] == cat]
                            with st.expander(f"{cat} ({len(cat_items)} available)"):
                                for item in cat_items:
                                    label = f"`{item['barcode']}` — {item['brand']} {item['name']}"
                                    # Show spec sheet inline as help text
                                    specs = gr.get_item_spec_sheet(item)
                                    help_txt = "  •  ".join(specs) if specs else None
                                    checked = st.checkbox(label, key=f"approve_{r['id']}_{item['id']}", help=help_txt)
                                    if checked:
                                        selected_ids.append(item["id"])
                                        selected_items_data.append(item)

                        # ── Live Smart Suggestions ──────────────────────────
                        if selected_items_data:
                            st.divider()
                            st.markdown("#### Step 2 — Pack check ✅")
                            analysis = gr.get_suggestions(selected_items_data, available)

                            # Warnings first
                            for w in analysis["warnings"]:
                                st.error(w, icon=":material/error:")

                            if not analysis["suggestions"] and not analysis["warnings"]:
                                st.success("All required accessories are already selected!", icon=":material/check_circle:")

                            for s in analysis["suggestions"]:
                                is_advisory = s.get("advisory", False)
                                icon = ":material/info:" if is_advisory else ":material/warning:"
                                color = "blue" if is_advisory else "orange"

                                if is_advisory:
                                    label = f"**Consider:** {s['category']}"
                                else:
                                    label = f"**Missing {s['qty_needed']}x {s['category']}** — {s['qty_available']} available"

                                with st.container(border=True):
                                    hc1, hc2 = st.columns([3, 1])
                                    with hc1:
                                        st.markdown(f"{':material/warning:' if not is_advisory else ':material/lightbulb:'} {label}")
                                        st.caption(s["reason"])

                                    # Quick-select buttons for each matching available item
                                    if s["items"]:
                                        with st.expander(f"{'Add' if not is_advisory else 'View'} {s['category']} →"):
                                            for acc in s["items"]:
                                                st.checkbox(
                                                    f"`{acc['barcode']}` {acc['brand']} {acc['name']}",
                                                    key=f"sugg_{r['id']}_{acc['id']}",
                                                )
                                                # Track suggestion selections too
                                                if st.session_state.get(f"sugg_{r['id']}_{acc['id']}"):
                                                    if acc["id"] not in selected_ids:
                                                        selected_ids.append(acc["id"])

                        st.divider()
                        st.markdown("#### Step 3 — Confirm")
                        if selected_ids:
                            st.success(f"{len(selected_ids)} items ready to assign", icon=":material/inventory_2:")
                        final_cost = st.number_input(
                            "Final Approved Cost ($)",
                            value=float(r.get("estimated_cost") or 0.0),
                            key=f"cost_{r['id']}"
                        )
                        if st.button("Confirm approval", key=f"confirm_{r['id']}",
                                     type="primary", icon=":material/gavel:",
                                     disabled=len(selected_ids) == 0):
                            db.approve_rental(r["id"], selected_ids)
                            db.set_final_cost(r["id"], final_cost)
                            db.log_activity("Rental approved", f"{r['event_name']} — {r['client_name']} — ${final_cost:.0f}", r["id"])
                            db.notify(
                                f"✅ Approved: {r['event_name']}",
                                f"Rental approved for {r['client_name']}\n\nEvent: {r['event_name']}\nDate: {r['event_date']}\nVenue: {r.get('venue', 'TBD')}\nFinal cost: ${final_cost:.0f}\nItems assigned: {len(selected_ids)}"
                            )
                            st.success(f"Approved! {len(selected_ids)} items assigned.", icon=":material/check_circle:")
                            st.rerun()


                if st.button("Reject", key=f"reject_{r['id']}",
                             icon=":material/close:", use_container_width=True):
                    db.cancel_rental(r["id"])
                    db.log_activity("Rental rejected", f"{r['event_name']} — {r['client_name']}", r["id"])
                    st.rerun()

# ── Active tab ───────────────────────────────────────────────
with tab_active:
    active = db.get_rentals_by_status("approved")
    if not active:
        st.info("No active rentals.", icon=":material/check_circle:")
    for r in active:
        with st.container(border=True):
            c1, c2 = st.columns([3, 1])
            with c1:
                st.markdown(f"### {r['event_name']}")
                st.markdown(
                    f":material/person: **{r['client_name']}**  \n"
                    f":material/calendar_today: {r['event_date']} → {r.get('return_date', 'TBD')}  \n"
                    f":material/location_on: {r.get('venue', 'TBD')}  \n"
                    f":material/payments: Final Cost: **${r.get('final_cost') or 0:.2f}**"
                )
                ri = db.get_rental_items(r["id"])
                if ri:
                    st.caption(f"**{len(ri)} items assigned:**")
                    for entry in ri:
                        item = entry.get("items", {})
                        if item:
                            st.caption(f"  · `{item['barcode']}` {item['brand']} {item['name']}")

                with st.expander("Staffing & Labor", icon=":material/engineering:"):
                    employees = db.get_employees()
                    if not employees:
                        st.info("No staff added yet. Add them in the Labor tab.")
                    else:
                        emp_options = {e["id"]: f"{e['name']} ({e['role']})" for e in employees}
                        with st.form(f"assign_form_{r['id']}"):
                            fa1, fa2, fa3 = st.columns(3)
                            emp_sel = fa1.selectbox("Contractor", options=list(emp_options.keys()),
                                                    format_func=lambda x: emp_options[x], key=f"emp_{r['id']}")
                            role_val = fa2.text_input("Role", key=f"role_{r['id']}")
                            hours = fa3.number_input("Hours", min_value=0.25, step=0.25, key=f"hours_{r['id']}")
                            if st.form_submit_button("Assign & log", type="primary"):
                                db.assign_employee(r["id"], emp_sel, role_val)
                                if hours > 0:
                                    db.log_time(r["id"], emp_sel, hours, role_val, str(datetime.now().date()))
                                st.rerun()

                        assignments = db.get_assignments_for_rental(r["id"])
                        if assignments:
                            st.caption("Assigned: " + ", ".join(
                                [f"{a['employees']['name']} ({a['role_for_event']})" for a in assignments]
                            ))

            with c2:
                st.space("small")
                ri_for_pdf = db.get_rental_items(r["id"])
                try:
                    invoice_bytes = db.generate_invoice_pdf(r, ri_for_pdf)
                    st.download_button(
                        "📄 Invoice", data=invoice_bytes,
                        file_name=f"DJM_Invoice_{r['event_name'][:20]}.pdf",
                        mime="application/pdf", key=f"inv_{r['id']}",
                        use_container_width=True
                    )
                except Exception:
                    pass
                try:
                    waiver_bytes = db.generate_waiver_pdf(r)
                    st.download_button(
                        "📋 Waiver", data=waiver_bytes,
                        file_name=f"DJM_Waiver_{r['event_name'][:20]}.pdf",
                        mime="application/pdf", key=f"waiver_{r['id']}",
                        use_container_width=True
                    )
                except Exception:
                    pass
                if st.button("Mark returned", key=f"return_{r['id']}",
                             icon=":material/assignment_return:", type="primary",
                             use_container_width=True):
                    db.return_rental(r["id"])
                    db.log_activity("Rental returned", f"{r['event_name']} — {r['client_name']}", r["id"])
                    db.send_feedback_request_email(r)
                    st.success("Marked as returned!", icon=":material/check_circle:")
                    st.rerun()

# ── History tab ──────────────────────────────────────────────
with tab_history:
    all_rentals = db.get_all_rentals()
    past = [r for r in all_rentals if r["status"] in ("returned", "cancelled")]
    if not past:
        st.info("No past rentals yet.", icon=":material/info:")
    for r in past:
        status_icon = ":material/check_circle:" if r["status"] == "returned" else ":material/cancel:"
        with st.container(border=True):
            cols = st.columns([3, 2, 2, 1])
            cols[0].markdown(f"**{r['event_name']}**  \n{r['client_name']}")
            cols[1].markdown(f":material/calendar_today: {r['event_date']}")
            cols[2].markdown(f":material/location_on: {r.get('venue', 'TBD')}")
            cols[3].badge(r["status"], icon=status_icon,
                          color="green" if r["status"] == "returned" else "gray")

# ── New request tab (admin version) ──────────────────────────
with tab_new:
    st.markdown("Create a rental request on behalf of a client.")
    with st.form("new_rental", border=True):
        rc1, rc2 = st.columns(2)
        event_name = rc1.text_input("Event name", placeholder="Corporate Awards Gala")
        client_name = rc2.text_input("Client name", placeholder="John Doe")
        rc3, rc4 = st.columns(2)
        client_phone = rc3.text_input("Client phone", placeholder="(555) 123-4567")
        venue = rc4.text_input("Venue", placeholder="Downtown Convention Center")
        rc5, rc6 = st.columns(2)
        event_date = rc5.date_input("Event date")
        return_date = rc6.date_input("Return date")
        notes = st.text_area("Notes / gear requests",
                             placeholder="Needs 2 wireless mics, PA system, 4 moving heads…",
                             height=100)
        if st.form_submit_button("Create request", icon=":material/send:", type="primary"):
            if not event_name or not client_name:
                st.error("Event name and client name are required")
            else:
                db.create_rental(
                    event_name=event_name, client_name=client_name,
                    client_phone=client_phone, event_date=str(event_date),
                    return_date=str(return_date), venue=venue, notes=notes,
                )
                st.success("Request created!", icon=":material/check_circle:")
                st.rerun()

# ── Jump to correct tab via JS ────────────────────────────────
# Streamlit doesn't support programmatic tab switching, so we show a
# prominent banner when arriving from a deep-link so the right section is obvious
if _default_tab == "pending" and _tab_index == 0:
    pass  # Already on first tab — default behaviour is correct

```

## File: `app_pages/request.py`

```python
import streamlit as st
import db
from datetime import date, timedelta, datetime

# ── Rate limiting ────────────────────────────────────────────
MAX_SUBMISSIONS_PER_HOUR = 3

if "submit_timestamps" not in st.session_state:
    st.session_state.submit_timestamps = []

def check_rate_limit() -> bool:
    """Returns True if the user is within rate limits."""
    now = datetime.now()
    cutoff = now.timestamp() - 3600  # 1 hour ago
    st.session_state.submit_timestamps = [
        t for t in st.session_state.submit_timestamps if t > cutoff
    ]
    return len(st.session_state.submit_timestamps) < MAX_SUBMISSIONS_PER_HOUR

# ── Page setup ───────────────────────────────────────────────
cart = st.session_state.get("cart", {})
selected_addons = st.session_state.get("selected_addons", [])

if not cart:
    st.title(":material/shopping_cart_checkout: Checkout")
    st.info("Your cart is empty. Head to **Browse catalog** to add gear.", icon=":material/remove_shopping_cart:")
    if st.button("← Browse catalog", type="primary"):
        st.switch_page("app_pages/browse.py")
    st.stop()

st.title(":material/shopping_cart_checkout: Checkout")

# ── Progress Indicator ───────────────────────────────────────
st.markdown("""
<div style="display: flex; justify-content: space-between; margin-bottom: 2rem; color: rgba(224,224,232,0.6); font-size: 0.9rem;">
    <div style="text-align: center; flex: 1;"><strong>✓ Step 1</strong><br/>Gear</div>
    <div style="text-align: center; flex: 1; border-bottom: 2px solid #8b5cf6; color: white;"><strong>Step 2</strong><br/>Details</div>
    <div style="text-align: center; flex: 1;"><strong>Step 3</strong><br/>Confirm</div>
</div>
""", unsafe_allow_html=True)

st.markdown("Review your gear, fill in your details, and submit for a quote.")

# ── Order summary ────────────────────────────────────────────
st.subheader("Order summary")

total_half = 0
total_daily = 0
total_weekend = 0

for key, item in cart.items():
    line_half = item["qty"] * item["rate_half_day"]
    line_daily = item["qty"] * item["rate_daily"]
    line_weekend = item["qty"] * item["rate_weekend"]
    total_half += line_half
    total_daily += line_daily
    total_weekend += line_weekend

    c1, c2, c3, c4 = st.columns([5, 1, 1, 1])
    c1.markdown(f"**{item['brand']}** {item['name']}")
    c2.markdown(f"×{item['qty']}")
    c3.caption(f"${line_daily:.0f}/day")
    c4.caption(f"${line_weekend:.0f}/wknd")

if selected_addons:
    st.caption("**Requested add-ons:** " + ", ".join(selected_addons))

# ── Discount code ────────────────────────────────────────────
st.divider()
dc1, dc2 = st.columns([3, 1])
discount_input = dc1.text_input("Have a discount code?", placeholder="Enter code", key="discount_code_input")
discount_row = None
discount_pct = 0

if dc2.button("Apply", key="apply_discount", use_container_width=True):
    if discount_input:
        result = db.validate_discount_code(discount_input)
        if result:
            st.session_state["applied_discount"] = result
            st.rerun()
        else:
            st.error("Invalid, expired, or fully used code.", icon=":material/error:")

if "applied_discount" in st.session_state:
    discount_row = st.session_state["applied_discount"]
    discount_pct = discount_row["percent_off"]
    st.success(f"Code **{discount_row['code']}** applied — {discount_pct}% off!", icon=":material/sell:")
    if st.button("Remove code", key="remove_discount"):
        del st.session_state["applied_discount"]
        st.rerun()

# Apply discount
if discount_pct > 0:
    multiplier = 1 - (discount_pct / 100)
    final_half = total_half * multiplier
    final_daily = total_daily * multiplier
    final_weekend = total_weekend * multiplier
else:
    final_half = total_half
    final_daily = total_daily
    final_weekend = total_weekend

st.divider()
tc1, tc2, tc3 = st.columns(3)
if discount_pct > 0:
    tc1.metric("½ day estimate", f"${final_half:.0f}", delta=f"-${total_half - final_half:.0f}", delta_color="inverse")
    tc2.metric("Daily estimate", f"${final_daily:.0f}", delta=f"-${total_daily - final_daily:.0f}", delta_color="inverse")
    tc3.metric("Weekend estimate", f"${final_weekend:.0f}", delta=f"-${total_weekend - final_weekend:.0f}", delta_color="inverse")
else:
    tc1.metric("½ day estimate", f"${final_half:.0f}")
    tc2.metric("Daily estimate", f"${final_daily:.0f}")
    tc3.metric("Weekend estimate", f"${final_weekend:.0f}")

st.caption("*Final pricing confirmed after review. Rates may vary for multi-day or custom packages.*")

# ── Client info form ─────────────────────────────────────────
st.divider()

# Honeypot — invisible field to catch bots
honeypot_css = """<div style="position:absolute;left:-9999px;"><input id="hp_field" /></div>"""
st.markdown(honeypot_css, unsafe_allow_html=True)
hp_val = st.text_input("Company website", key="hp_website", label_visibility="collapsed")

with st.form("checkout_form", border=True):
    st.markdown("### Contact Details")
    rc1, rc2 = st.columns(2)
    client_name = rc1.text_input("Your name *", placeholder="John Doe", max_chars=100)
    client_phone = rc2.text_input("Phone number *", placeholder="(555) 123-4567", max_chars=20)

    st.markdown("### Event Info")
    rc3, rc4 = st.columns(2)
    event_name = rc3.text_input("Event name *", placeholder="Wedding reception, corporate gala...", max_chars=200)
    venue = rc4.text_input("Venue / location", placeholder="Hotel ballroom, outdoor venue...", max_chars=200)

    rc5, rc6 = st.columns(2)
    default_event = st.session_state.get("event_date", date.today() + timedelta(days=7))
    default_return = st.session_state.get("return_date", date.today() + timedelta(days=9))
    event_date = rc5.date_input("Event date", value=default_event)
    return_date = rc6.date_input("Return date", value=default_return)

    st.markdown("### Pickup / Delivery")
    # ── Jurisdiction & entity (admin sees flags) ─────────
    rc7, rc8 = st.columns(2)
    jurisdictions = list(db.JURISDICTION_TAX_RATES.keys())
    jurisdiction = rc7.selectbox("City / Jurisdiction", jurisdictions, index=0)
    entity = rc8.selectbox("Service type", ["DJM Audio (DJ / Rentals)", "Danger Beats (Studio)"])
    has_tent = st.checkbox("Event includes tent >= 450 sq ft")

    # Show auto-flags
    flags = db.get_jurisdiction_flags(jurisdiction, has_tent)
    for flag in flags:
        st.warning(flag)

    notes = st.text_area(
        "Additional notes (Optional)",
        placeholder="Any special requests, setup requirements, delivery details...",
        height=100,
        max_chars=1000,
    )

    st.markdown("<br/>", unsafe_allow_html=True)
    submitted = st.form_submit_button("Submit Rental Request", icon=":material/send:", type="primary", use_container_width=True)

    if submitted:
        # ── Honeypot check ───────────────────────────────────
        if hp_val:
            st.error("Something went wrong. Please try again.", icon=":material/error:")
            st.stop()

        # ── Validation ───────────────────────────────────────
        if not client_name or not client_phone or not event_name:
            st.error("Please fill in all required fields (marked with *).", icon=":material/error:")
            st.stop()

        if len(client_name) < 2:
            st.error("Please enter a valid name.", icon=":material/error:")
            st.stop()

        if event_date < date.today():
            st.error("Event date cannot be in the past.", icon=":material/error:")
            st.stop()

        if return_date <= event_date:
            st.error("Return date must be after the event date.", icon=":material/error:")
            st.stop()

        # ── Rate limit check ─────────────────────────────────
        if not check_rate_limit():
            st.error("Too many requests. Please wait before submitting again.", icon=":material/block:")
            st.stop()

        # ── Build itemized notes ─────────────────────────────
        gear_lines = []
        for key, item in cart.items():
            gear_lines.append(f"• {item['qty']}× {item['brand']} {item['name']}")

        full_notes = "=== REQUESTED GEAR ===\n"
        full_notes += "\n".join(gear_lines)

        if selected_addons:
            full_notes += "\n\n=== ADD-ONS ===\n"
            full_notes += "\n".join(f"• {a}" for a in selected_addons)
            if "Cable Covers / Ramps" in selected_addons:
                full_notes += "\n\n=== ACTION REQUIRED ===\n"
                full_notes += "Cable Covers / Ramps requested. Need a plan to examine how much linear feet of covers are needed and what can be done with just gaffer tape."

        full_notes += f"\n\n=== ESTIMATED PRICING ===\n"
        full_notes += f"½ day: ${final_half:.0f} | Daily: ${final_daily:.0f} | Weekend: ${final_weekend:.0f}"
        if discount_pct > 0:
            full_notes += f"\nDiscount: {discount_row['code']} ({discount_pct}% off)"
            full_notes += f"\nOriginal daily: ${total_daily:.0f} → Discounted: ${final_daily:.0f}"

        if notes:
            full_notes += f"\n\n=== CLIENT NOTES ===\n{notes}"

        # ── Submit to database ───────────────────────────────
        db.create_rental(
            event_name=event_name,
            client_name=client_name,
            client_phone=client_phone,
            event_date=str(event_date),
            return_date=str(return_date),
            venue=venue,
            notes=full_notes,
            estimated_cost=float(final_daily)
        )

        # Mark discount code as used
        if discount_row:
            db.use_discount_code(discount_row['id'])
            if 'applied_discount' in st.session_state:
                del st.session_state['applied_discount']

        # ── Notify admin ─────────────────────────────────────
        notify_body = (
            f"New rental request from {client_name}\n\n"
            f"Event: {event_name}\n"
            f"Date: {event_date} → {return_date}\n"
            f"Venue: {venue or 'TBD'}\n"
            f"Phone: {client_phone}\n"
            f"Estimated daily: ${final_daily:.0f}\n\n"
            f"Gear:\n" + "\n".join(gear_lines)
        )
        db.notify(f"📋 New Request: {event_name}", notify_body)
        db.log_activity("New rental request", f"{client_name} — {event_name} on {event_date}")

        # Track submission for rate limiting
        st.session_state.submit_timestamps.append(datetime.now().timestamp())

        # Clear cart
        st.session_state.cart = {}
        st.session_state.selected_addons = []

        st.success(
            "Rental request submitted! We'll review and get back to you within 24 hours.",
            icon=":material/check_circle:"
        )
        st.balloons()

# ── Back button ──────────────────────────────────────────────
st.markdown("")
if st.button("← Back to catalog"):
    st.switch_page("app_pages/browse.py")

```

## File: `app_pages/scan.py`

```python
import streamlit as st
import db

st.title(":material/qr_code_scanner: Gear Check-in / Check-out")
st.markdown("Scan or type a barcode to check gear in or out.")

# ── Barcode input ────────────────────────────────────────────
barcode = st.text_input(
    "Scan or type barcode",
    placeholder="DJM-PA-0001",
    key="scan_barcode",
    help="Use a barcode scanner or type the code manually"
)

if barcode:
    item = db.get_item_by_barcode(barcode.strip())
    
    if not item:
        st.error(f"No item found with barcode `{barcode}`", icon=":material/error:")
    else:
        with st.container(border=True):
            st.markdown(f"### {item['brand']} {item['name']}")
            st.caption(f"Barcode: `{item['barcode']}` · Category: {item['category']}")
            
            status = item.get("status", "available")
            if status == "available":
                st.badge("Available", color="green")
            elif status == "in_use":
                st.badge("Deployed", color="orange")
            elif status == "damaged":
                st.badge("Damaged", color="red")
            else:
                st.badge(status.title(), color="gray")
            
            st.divider()
            
            c1, c2 = st.columns(2)
            
            if status == "available":
                if c1.button("📤 Check OUT", type="primary", use_container_width=True, key="do_checkout"):
                    db.checkout_item(item["id"])
                    st.success(f"✅ `{item['barcode']}` checked OUT — marked as deployed", icon=":material/output:")
                    st.rerun()
            
            elif status == "in_use":
                if c1.button("📥 Check IN", type="primary", use_container_width=True, key="do_checkin"):
                    db.checkin_item(item["id"])
                    st.success(f"✅ `{item['barcode']}` checked IN — returned to inventory", icon=":material/input:")
                    st.rerun()
            
            # Maintenance quick-log
            if c2.button("🔧 Log Maintenance", use_container_width=True, key="log_maint"):
                st.session_state["maint_item_id"] = item["id"]
                st.session_state["maint_item_name"] = f"{item['brand']} {item['name']}"

            # Show maintenance history
            maint = db.get_maintenance_for_item(item["id"])
            if maint:
                st.divider()
                st.caption("**Maintenance History:**")
                for m in maint[:5]:
                    st.caption(f"· {m['action']} — {m.get('notes', '')} ({m['created_at'][:10]})")

# ── Maintenance quick-form ───────────────────────────────────
if st.session_state.get("maint_item_id"):
    st.divider()
    st.subheader(f"🔧 Log Maintenance: {st.session_state.get('maint_item_name', '')}")
    with st.form("maint_form", clear_on_submit=True):
        action = st.selectbox("Action", ["Inspection", "Repair", "Cleaning", "Cable replacement", "Firmware update", "Other"])
        notes = st.text_area("Notes", placeholder="Describe the issue or work done...")
        cost = st.number_input("Cost ($)", min_value=0.0, value=0.0, step=5.0)
        
        if st.form_submit_button("Log", type="primary", icon=":material/build:"):
            db.log_maintenance(st.session_state["maint_item_id"], action, notes, cost)
            st.success("Maintenance logged!")
            del st.session_state["maint_item_id"]
            st.rerun()

# ── Recently scanned ─────────────────────────────────────────
st.divider()
st.subheader(":material/history: Recent Check-ins/Outs")
try:
    activity = db.get_recent_activity(limit=10)
    scan_events = [a for a in activity if "check" in a["action"].lower()]
    if scan_events:
        for a in scan_events:
            icon = "📥" if "in" in a["action"].lower() else "📤"
            st.caption(f"{icon} **{a['action']}** — {a.get('detail', '')} · {a['created_at'][:16]}")
    else:
        st.caption("No recent scan activity.")
except Exception:
    st.caption("Activity log not yet initialized.")

```

