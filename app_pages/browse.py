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
                st.markdown(f"{display_brand}{info['name']}")
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
