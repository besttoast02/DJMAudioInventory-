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
                  event_date: str, return_date: str, venue: str, notes: str) -> dict:
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
