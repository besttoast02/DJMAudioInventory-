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

# ── Editable Order Summary ───────────────────────────────────
st.subheader("Your Estimate")
st.caption("Edit quantities, remove items, or add more before submitting.")

# Separate equipment from services
equipment_items = {k: v for k, v in cart.items() if not v.get("is_service")}
service_items = {k: v for k, v in cart.items() if v.get("is_service")}

total_half = 0
total_daily = 0
total_weekend = 0
items_to_remove = []

# ── Equipment section ────────────────────────────────────
if equipment_items:
    st.markdown("##### 🔊 Equipment")
    for key, item in equipment_items.items():
        c1, c2, c3, c4, c5 = st.columns([4, 1.5, 1, 1, 0.5])
        display_brand = "" if item['brand'].lower() == "generic" else f"{item['brand']} "
        c1.markdown(f"**{display_brand}{item['name']}**")

        new_qty = c2.number_input(
            "Qty", min_value=0, max_value=item.get("max_qty", 10),
            value=item["qty"], key=f"ck_qty_{key}", label_visibility="collapsed",
        )
        if new_qty != item["qty"]:
            if new_qty == 0:
                items_to_remove.append(key)
            else:
                st.session_state.cart[key]["qty"] = new_qty

        line_daily = new_qty * item["rate_daily"]
        line_weekend = new_qty * item["rate_weekend"]
        line_half = new_qty * item["rate_half_day"]
        total_half += line_half
        total_daily += line_daily
        total_weekend += line_weekend

        c3.caption(f"${line_daily:.0f}/day")
        c4.caption(f"${line_weekend:.0f}/wknd")
        if c5.button("✕", key=f"ck_rm_{key}"):
            items_to_remove.append(key)

# ── Services section ─────────────────────────────────────
if service_items:
    st.markdown("##### 🎤 Services")
    for key, item in service_items.items():
        c1, c2, c3, c4, c5 = st.columns([4, 1.5, 1, 1, 0.5])

        is_free = item.get("included_free", False)
        name_suffix = " ✅ Included" if is_free else ""
        c1.markdown(f"**{item['name']}**{name_suffix}")

        new_qty = c2.number_input(
            "Qty", min_value=0, max_value=item.get("max_qty", 5),
            value=item["qty"], key=f"ck_qty_{key}", label_visibility="collapsed",
        )
        if new_qty != item["qty"]:
            if new_qty == 0:
                items_to_remove.append(key)
            else:
                st.session_state.cart[key]["qty"] = new_qty

        line_daily = new_qty * item["rate_daily"]
        line_weekend = new_qty * item["rate_weekend"]
        line_half = new_qty * item["rate_half_day"]
        total_half += line_half
        total_daily += line_daily
        total_weekend += line_weekend

        price_label = "Included" if is_free else f"${line_daily:.0f}"
        c3.caption(price_label)
        c4.caption("" if is_free else f"${line_weekend:.0f}/wknd")
        if c5.button("✕", key=f"ck_rm_{key}"):
            items_to_remove.append(key)

# Handle removals
for key in items_to_remove:
    if key in st.session_state.cart:
        del st.session_state.cart[key]
if items_to_remove:
    st.rerun()

# ── Add more links ───────────────────────────────────────
al1, al2, al3 = st.columns(3)
if al1.button("← Add more gear", key="add_gear_link", use_container_width=True):
    st.switch_page("app_pages/browse.py")
if al2.button("← Add services", key="add_svc_link", use_container_width=True):
    st.switch_page("app_pages/browse.py")
if al3.button("← Browse packages", key="add_pkg_link", use_container_width=True):
    st.switch_page("app_pages/packages.py")

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
    # ── Jurisdiction & entity ─────────────────────────────
    rc7, rc8 = st.columns(2)
    jurisdictions = list(db.JURISDICTION_TAX_RATES.keys())
    jurisdiction = rc7.selectbox("City / Jurisdiction", jurisdictions, index=0)
    entity = rc8.selectbox("Service type", ["DJM Audio (DJ / Rentals)", "Danger Beats (Studio)"])
    has_tent = st.checkbox("Event includes tent >= 450 sq ft")

    # Jurisdiction flags are stored internally for admin use only — not shown to clients

    # ── Delivery option ──────────────────────────────────
    fulfillment = st.radio(
        "How would you like to get your gear?",
        ["Pickup (free)", "Delivery (+fee)"],
        horizontal=True,
    )
    delivery_fee = 0.0
    if fulfillment == "Delivery (+fee)":
        delivery_address = st.text_input("Delivery address", placeholder="123 Main St, City, CA 91234")
        DELIVERY_ZONES = {
            "Within 10 miles (Baldwin Park area)": 50.0,
            "10–25 miles (SGV / Pasadena / Pomona)": 85.0,
            "25–40 miles (Downtown LA / OC / IE)": 125.0,
            "40+ miles (custom quote)": 175.0,
        }
        zone = st.selectbox("Delivery zone", list(DELIVERY_ZONES.keys()))
        delivery_fee = DELIVERY_ZONES[zone]
        st.info(f"Delivery fee: **${delivery_fee:.0f}** (round trip)", icon=":material/local_shipping:")

    # ── Pickup / Return time slots ───────────────────────
    st.markdown("##### Preferred times")
    t1, t2 = st.columns(2)
    from datetime import time as dt_time
    pickup_time = t1.time_input("Pickup time", value=dt_time(10, 0), key="pickup_time")
    return_time = t2.time_input("Return time", value=dt_time(18, 0), key="return_time")
    st.caption("*Times are tentative — we'll confirm exact availability after reviewing your request.*")

    # ── Liability hold notice ────────────────────────────
    total_retail = sum(item.get("purchase_price", 0) * item.get("qty", 1) for item in cart.values() if isinstance(item, dict))
    if total_retail > 0:
        st.markdown(
            f"> :material/credit_card: **Equipment liability hold**: A credit card authorization "
            f"of **${total_retail:,.0f}** (total retail value) will be placed at pickup and "
            f"released upon safe return of all equipment."
        )

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
        if delivery_fee > 0:
            full_notes += f"\nDelivery fee: ${delivery_fee:.0f}"
            full_notes += f"\nTotal w/ delivery (daily): ${final_daily + delivery_fee:.0f}"
        if discount_pct > 0:
            full_notes += f"\nDiscount: {discount_row['code']} ({discount_pct}% off)"
            full_notes += f"\nOriginal daily: ${total_daily:.0f} → Discounted: ${final_daily:.0f}"

        # Fulfillment details
        full_notes += f"\n\n=== FULFILLMENT ===\n"
        full_notes += f"Method: {fulfillment}\n"
        if fulfillment == "Delivery (+fee)":
            full_notes += f"Delivery address: {delivery_address}\n"
            full_notes += f"Delivery zone: {zone}\n"
        full_notes += f"Preferred pickup time: {pickup_time.strftime('%I:%M %p')}\n"
        full_notes += f"Preferred return time: {return_time.strftime('%I:%M %p')}"

        # Liability hold
        if total_retail > 0:
            full_notes += f"\n\n=== LIABILITY HOLD ===\n"
            full_notes += f"Equipment retail value (hold amount): ${total_retail:,.0f}"

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
            estimated_cost=float(final_daily + delivery_fee)
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
