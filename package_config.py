"""
Package definitions and inclusion rules for DJM Audio service packages.
Maps package barcodes to their included services and questionnaire config.
"""

# ── Owner / Staff (INTERNAL — never shown to customers) ──────
OWNER_ID = "8d622daf-b12b-4d9a-91df-bedf342b16d5"  # Jair Davalos
OWNER_NAME = "Jair Davalos"

# Internal hourly cost rates (for profit tracking & assignment)
STAFF_RATES = {
    OWNER_ID: {
        "name": OWNER_NAME,
        "role": "owner",
        "rates": {
            "dj": 75.00,          # $/hr — DJ (no gear, just the person)
            "foh_engineer": 50.00, # $/hr — Front of House mixing
            "monitor_engineer": 35.00,  # $/hr — Monitor engineer
        },
    },
}

# Map service barcodes → staff role needed (for auto-assignment)
SERVICE_ROLE_MAP = {
    "DJM-SVC-0001": "dj",          # Party DJ
    "DJM-SVC-0002": "dj",          # Wedding DJ
    "DJM-SVC-0003": "dj",          # Corporate DJ
    "DJM-SVC-0004": "foh_engineer", # FOH
    "DJM-SVC-0005": "monitor_engineer",  # Monitor
    "DJM-SVC-0008": "dj",          # Lighting (operated by Jair)
}


def get_staff_cost(service_barcode: str, hours: float = 5.0) -> dict:
    """Calculate internal labor cost for a service.
    Returns {'employee_id', 'employee_name', 'role', 'hourly_rate', 'hours', 'total_cost'}
    """
    role = SERVICE_ROLE_MAP.get(service_barcode)
    if not role:
        return None
    staff = STAFF_RATES[OWNER_ID]
    rate = staff["rates"].get(role, 0)
    return {
        "employee_id": OWNER_ID,
        "employee_name": staff["name"],
        "role": role,
        "hourly_rate": rate,
        "hours": hours,
        "total_cost": rate * hours,
    }

# ── Barcode constants ────────────────────────────────────────
# DJ Packages
PKG_DJ_PARTY = "DJM-SVC-0001"
PKG_DJ_WEDDING = "DJM-SVC-0002"
PKG_DJ_CORPORATE = "DJM-SVC-0003"

# Audio Services
SVC_FOH = "DJM-SVC-0004"
SVC_MONITOR = "DJM-SVC-0005"
SVC_POST_EP = "DJM-SVC-0006"
SVC_POST_ALBUM = "DJM-SVC-0007"
SVC_LIGHTING = "DJM-SVC-0008"
SVC_ROBOT = "DJM-SVC-0009"
SVC_VALS = "DJM-SVC-0010"
SVC_BAILE = "DJM-SVC-0011"
SVC_PLANNING = "DJM-SVC-0012"

# Physical Items (effects)
ITEM_CLOUDS = "DJM-LGT-0029"
ITEM_SPARKS = "DJM-LGT-0030"

# ── All DJ package barcodes ──────────────────────────────────
DJ_PACKAGES = {PKG_DJ_PARTY, PKG_DJ_WEDDING, PKG_DJ_CORPORATE}

# ── Services that are FREE when a DJ package is in the cart ──
FREE_WITH_DJ = {SVC_VALS, SVC_BAILE}

# ── Package definitions ──────────────────────────────────────
PACKAGES = {
    # ── Essential Package ($800) ─────────────────────────
    "essential": {
        "name": "Essential Package",
        "price": 800,
        "base_items": [
            {"barcode": PKG_DJ_PARTY, "name": "DJ — Party Package (5hr)", "qty": 1},
        ],
        "included_free": [],
        "questionnaire": [
            "event_type", "guest_count", "venue_type",
            "add_sparks", "add_clouds", "add_mixes", "extra_hours",
        ],
    },
    # ── Premium Package ($1,500) ─────────────────────────
    "premium": {
        "name": "Premium Package",
        "price": 1500,
        "base_items": [
            {"barcode": PKG_DJ_WEDDING, "name": "DJ — Wedding Package (5hr)", "qty": 1},
            {"barcode": ITEM_CLOUDS, "name": "Dancing on the Clouds (2 uses)", "qty": 1},
        ],
        "included_free": [SVC_VALS, SVC_BAILE, SVC_PLANNING],
        "questionnaire": [
            "event_type", "guest_count", "venue_type",
            "add_sparks", "add_robot", "add_recording", "extra_hours",
        ],
    },
    # ── Ultimate Package ($2,500) ────────────────────────
    "ultimate": {
        "name": "Ultimate Package",
        "price": 2500,
        "base_items": [
            {"barcode": PKG_DJ_WEDDING, "name": "DJ — Wedding Package (5hr)", "qty": 1},
            {"barcode": ITEM_CLOUDS, "name": "Dancing on the Clouds (2 uses)", "qty": 1},
            {"barcode": ITEM_SPARKS, "name": "Spark Machine (pair)", "qty": 1},
            {"barcode": SVC_ROBOT, "name": "LED Robot Show (45min–1hr)", "qty": 1},
            {"barcode": SVC_LIGHTING, "name": "Lighting Package (per day)", "qty": 1},
        ],
        "included_free": [SVC_VALS, SVC_BAILE, SVC_PLANNING],
        "questionnaire": [
            "event_type", "guest_count", "venue_type",
            "add_recording", "extra_hours",
        ],
    },
    # ── FOH / Complete Audio ─────────────────────────────
    "foh": {
        "name": "FOH Engineer (5hr)",
        "price": 500,
        "base_items": [
            {"barcode": SVC_FOH, "name": "FOH Engineer (5hr)", "qty": 1},
        ],
        "included_free": [],
        "questionnaire": [
            "band_size", "venue_type", "add_monitors", "add_recording",
            "add_lighting",
        ],
    },
    "complete_audio": {
        "name": "Complete Live Audio Package",
        "price": 1000,
        "base_items": [
            {"barcode": SVC_FOH, "name": "FOH Engineer (5hr)", "qty": 1},
            {"barcode": SVC_MONITOR, "name": "Monitor Engineer", "qty": 1},
        ],
        "included_free": [],
        "questionnaire": [
            "band_size", "venue_type", "add_recording", "add_lighting",
        ],
    },
}


def is_dj_package_in_cart(cart: dict) -> bool:
    """Check if any DJ package is in the cart."""
    for key, item in cart.items():
        if item.get("barcode") in DJ_PACKAGES:
            return True
    return False


def get_effective_price(barcode: str, cart: dict) -> dict:
    """Return the effective price for a service, accounting for package inclusions.
    Returns dict with rate_half_day, rate_daily, rate_weekend (possibly zeroed).
    """
    if barcode in FREE_WITH_DJ and is_dj_package_in_cart(cart):
        return {"rate_half_day": 0, "rate_daily": 0, "rate_weekend": 0}
    # Planning is free with Premium/Ultimate
    if barcode == SVC_PLANNING:
        for key, item in cart.items():
            pkg_bc = item.get("barcode")
            if pkg_bc in (PKG_DJ_WEDDING,):
                # Check if it's part of premium/ultimate (wedding package)
                return {"rate_half_day": 0, "rate_daily": 0, "rate_weekend": 0}
    return None  # Use normal pricing
