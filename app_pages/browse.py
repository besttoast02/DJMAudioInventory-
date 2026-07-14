import streamlit as st
import db
from datetime import datetime

st.title(":material/search: Rental catalog")
st.markdown("Browse our gear, add what you need to your cart, and request a quote.")

# ── Initialize cart ──────────────────────────────────────────
if "cart" not in st.session_state:
    st.session_state.cart = {}  # {display_key: {name, brand, category, qty, rate_half_day, rate_daily, rate_weekend, max_qty}}

items = db.get_available_items()

if not items:
    st.info("No gear available right now. Check back soon!", icon=":material/info:")
    st.stop()

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

DISPLAY_ORDER = ["Speakers", "Mixers", "Microphones", "Lighting / DMX", "Truss"]
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
                st.markdown(f"**{info['brand']}** {info['name']}")
                st.badge(f"{info['qty']} available", color="green")

                if info["rate_daily"] > 0:
                    st.caption(
                        f"½ day ${info['rate_half_day']:.0f} · "
                        f"daily ${info['rate_daily']:.0f} · "
                        f"weekend ${info['rate_weekend']:.0f}"
                    )
                
                if info.get("specs_markdown"):
                    with st.popover("View Specs & Coverage", use_container_width=True):
                        st.markdown(info["specs_markdown"])


                # Cart controls
                in_cart = st.session_state.cart.get(key, {}).get("qty", 0)
                max_avail = info["qty"]

                c1, c2 = st.columns([2, 1])
                qty_sel = c1.number_input(
                    "Qty", min_value=0, max_value=max_avail,
                    value=in_cart, key=f"qty_{key}", label_visibility="collapsed"
                )
                if c2.button("🛒", key=f"add_{key}", use_container_width=True):
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
                    st.badge(f"{in_cart} in cart", color="blue")

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
        for idx, (label, count) in enumerate(sorted(addon_cats.items())):
            with acols[idx % 3]:
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
        cart_rows.append({
            "key": key,
            "label": f"{item['brand']} {item['name']}",
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
