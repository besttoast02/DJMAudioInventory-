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


# ── Equipment Degradation / Depreciation (INTERNAL) ─────────
# Estimated useful life in uses (rentals) before needing replacement.
# purchase_price / useful_life = cost per use (depreciation per rental).
CATEGORY_USEFUL_LIFE = {
    "PA Systems": 200,       # Speakers/subs — very durable
    "Mixers": 300,           # Digital mixers — long-lasting
    "Microphones": 250,      # Mics — robust
    "Wireless": 200,         # Wireless systems — moderate wear
    "Lighting": 150,         # Moving heads, wash — motors wear
    "DI / Signal": 400,      # DI boxes — nearly indestructible
    "XLR Cables": 100,       # Cables — frequent wear/damage
    "DMX Cables": 100,
    "TRS Cables": 100,
    "Power": 150,            # Power cables/strips
    "Adapters": 300,         # Small adapters
    "Hardware": 200,         # Clamps, rigging
    "Stands": 200,           # Mic stands, truss
    "Data": 150,             # Ethernet
    "Coaxial": 150,          # Antenna cables
    "Services": 0,           # No physical depreciation
}


def get_depreciation_per_use(item: dict) -> float:
    """Calculate the depreciation cost each time this item is rented.
    Uses purchase_price / estimated useful life (in # of rentals).
    """
    cat = item.get("category", "")
    if cat == "Services":
        return 0.0
    purchase = float(item.get("purchase_price", 0) or 0)
    if purchase <= 0:
        return 0.0
    useful_life = CATEGORY_USEFUL_LIFE.get(cat, 200)
    return round(purchase / useful_life, 2)


def calculate_rental_profit(rental_items: list[dict], service_items: list[dict],
                            revenue: float, labor_hours: float = 5.0) -> dict:
    """Full profit breakdown for a rental/event.
    
    Args:
        rental_items: list of physical item dicts from the rental
        service_items: list of service item dicts (with barcode) from the rental
        revenue: total client-facing price charged
        labor_hours: total hours worked by staff
    
    Returns dict with:
        revenue, labor_cost, depreciation_cost, total_cost, profit, margin_pct
        plus breakdowns of each component.
    """
    # Labor cost
    labor_breakdown = []
    total_labor = 0.0
    roles_used = set()
    for svc in service_items:
        bc = svc.get("barcode", "")
        cost_info = get_staff_cost(bc, labor_hours)
        if cost_info and cost_info["role"] not in roles_used:
            labor_breakdown.append(cost_info)
            total_labor += cost_info["total_cost"]
            roles_used.add(cost_info["role"])

    # Equipment depreciation
    depreciation_breakdown = []
    total_depreciation = 0.0
    for item in rental_items:
        dep = get_depreciation_per_use(item)
        qty = int(item.get("qty", 1))
        item_dep = dep * qty
        total_depreciation += item_dep
        if dep > 0:
            depreciation_breakdown.append({
                "name": item.get("name", "Unknown"),
                "category": item.get("category", ""),
                "purchase_price": float(item.get("purchase_price", 0) or 0),
                "per_use_cost": dep,
                "qty": qty,
                "total_depreciation": item_dep,
            })

    total_cost = total_labor + total_depreciation
    profit = revenue - total_cost
    margin = (profit / revenue * 100) if revenue > 0 else 0

    return {
        "revenue": revenue,
        "labor_cost": total_labor,
        "labor_breakdown": labor_breakdown,
        "depreciation_cost": total_depreciation,
        "depreciation_breakdown": sorted(depreciation_breakdown,
                                         key=lambda x: x["total_depreciation"],
                                         reverse=True),
        "total_cost": total_cost,
        "profit": profit,
        "margin_pct": margin,
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
    # ── Essential Package ($750) ─────────────────────────
    "essential": {
        "name": "Essential Package",
        "price": 750,
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
        ],
        "included_free": [SVC_VALS, SVC_BAILE, SVC_PLANNING],
        "questionnaire": [
            "event_type", "guest_count", "venue_type",
            "add_clouds", "add_sparks", "add_robot", "add_recording", "extra_hours",
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


def calculate_service_rate(hourly_rate: float, hours: float) -> float:
    """
    Calculate the effective hourly rate based on the duration of the service.
    - Minimum 5 hours is standard (1.0x multiplier)
    - 3-4 hours: 1.25x multiplier
    - 1-2 hours: 1.5x multiplier
    """
    if hours < 3:
        multiplier = 1.5
    elif hours < 5:
        multiplier = 1.25
    else:
        multiplier = 1.0
    
    return hourly_rate * multiplier
