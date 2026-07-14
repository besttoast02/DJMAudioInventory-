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
