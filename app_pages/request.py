import streamlit as st
import db
import package_config as pkg
from datetime import date, timedelta, datetime

# ── Rate limiting ────────────────────────────────────────────
MAX_SUBMISSIONS_PER_HOUR = 3

if "submit_timestamps" not in st.session_state:
    st.session_state.submit_timestamps = []

def check_rate_limit() -> bool:
    now = datetime.now()
    cutoff = now.timestamp() - 3600
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

st.title(":material/shopping_cart_checkout: Event Checkout")

# ── Wizard State ─────────────────────────────────────────────
if "checkout_step" not in st.session_state:
    st.session_state.checkout_step = 1

def next_step():
    st.session_state.checkout_step += 1
    
def prev_step():
    st.session_state.checkout_step -= 1

# Progress Bar
st.progress(st.session_state.checkout_step / 5.0)

# ── Step 1: Event Details & Hours ────────────────────────────
if st.session_state.checkout_step == 1:
    st.subheader("Step 1: Event Details & Duration")
    
    st.session_state.chk_event_type = st.selectbox(
        "Event type",
        ["Wedding", "Quinceañera", "Birthday / Party", "Corporate", "Concert / Festival", "Other"],
        index=["Wedding", "Quinceañera", "Birthday / Party", "Corporate", "Concert / Festival", "Other"].index(
            st.session_state.get("chk_event_type", st.session_state.get("pkg_event_type", "Wedding"))
        )
    )
    
    st.session_state.chk_event_name = st.text_input(
        "Event Name / Title", 
        value=st.session_state.get("chk_event_name", ""),
        placeholder="e.g. Maria's Quinceañera"
    )
    
    st.markdown("### Service Hours")
    st.markdown("Most events require a minimum of 5 hours. Shorter events have a higher hourly rate.")
    
    st.session_state.chk_hours = st.number_input(
        "Total service hours requested", 
        min_value=1, max_value=24, 
        value=st.session_state.get("chk_hours", st.session_state.get("pkg_total_hours", 5))
    )
    
    # Show multiplier info
    if st.session_state.chk_hours < 3:
        st.info("ℹ️ 1-2 hours selected: Hourly rates are multiplied by 1.5x")
    elif st.session_state.chk_hours < 5:
        st.info("ℹ️ 3-4 hours selected: Hourly rates are multiplied by 1.25x")
    else:
        st.success("ℹ️ 5+ hours selected: Standard hourly rates apply")

    if st.button("Next: Location & Size →", type="primary"):
        if not st.session_state.chk_event_name:
            st.error("Please enter an event name.")
        else:
            next_step()
            st.rerun()

# ── Step 2: Location & Size ──────────────────────────────────
elif st.session_state.checkout_step == 2:
    st.subheader("Step 2: Location & Size")
    
    st.markdown("### Venue Location")
    st.session_state.chk_venue = st.text_input(
        "Enter the venue address or name:", 
        value=st.session_state.get("chk_venue", st.session_state.get("pkg_venue_type", "")),
        placeholder="123 Main St, Los Angeles, CA"
    )
    
    st.markdown("### Event Size & Placement")
    
    col_g, col_p = st.columns(2)
    with col_g:
        st.session_state.chk_guests = st.number_input(
            "Expected guest count", 
            min_value=10, max_value=5000, step=50,
            value=st.session_state.get("chk_guests", st.session_state.get("pkg_guest_count", 150))
        )
    with col_p:
        st.session_state.chk_placement = st.radio(
            "Venue Placement",
            options=["Indoor", "Outdoor"],
            index=0 if st.session_state.get("chk_placement", "Indoor") == "Indoor" else 1,
            horizontal=True
        )

    # Audio Capacity Evaluator
    guests = st.session_state.chk_guests
    is_indoor = (st.session_state.chk_placement == "Indoor")
    
    if is_indoor:
        if guests <= 75:
            req, status = "2x EV Evolve 50s (Included in base package)", "ok"
        elif guests <= 100:
            req, status = "2x EV Evolve 50s + 1x 18\" Subwoofer (Upgrade recommended)", "warn"
        elif guests <= 250:
            req, status = "2x dBTech Ingenias + 1x 18\" Subwoofer (Upgrade required)", "warn"
        elif guests <= 400:
            req, status = "2x dBTech Ingenias + 2x 18\" Subwoofers (Upgrade required)", "warn"
        elif guests <= 1000:
            req, status = "4x dBTech Ingenias + 4x 18\" Subwoofers (Custom quote required)", "alert"
        else:
            req, status = "Custom concert-scale PA system (Internal note: Extra gear needed)", "alert"
    else:
        if guests <= 100:
            req, status = "2x EV Evolve 50s (Included in base package)", "ok"
        elif guests <= 150:
            req, status = "2x EV Evolve 50s + 1x 18\" Subwoofer (Upgrade recommended)", "warn"
        elif guests <= 200:
            req, status = "2x dBTech Ingenias + 1x 18\" Subwoofer (Upgrade required)", "warn"
        elif guests <= 400:
            req, status = "2x dBTech Ingenias + 2x 18\" Subwoofers (Upgrade required)", "warn"
        elif guests <= 800:
            req, status = "4x dBTech Ingenias + 4x 18\" Subwoofers (Custom quote required)", "alert"
        else:
            req, status = "Custom concert-scale PA system (Internal note: Extra gear needed)", "alert"
            
    st.markdown("##### 🔊 Audio Equipment Recommendation")
    if status == "ok":
        st.info(f"**Based on {guests} guests ({st.session_state.chk_placement}):**\\n{req}")
    elif status == "warn":
        st.warning(f"**Based on {guests} guests ({st.session_state.chk_placement}):**\\n{req}")
    else:
        st.error(f"**Based on {guests} guests ({st.session_state.chk_placement}):**\\n{req}")
    
    col1, col2 = st.columns([1, 4])
    if col1.button("← Back"):
        prev_step()
        st.rerun()
    if col2.button("Next: Add-ons →", type="primary"):
        if not st.session_state.chk_venue:
            st.error("Please provide a venue or address.")
        else:
            next_step()
            st.rerun()

# ── Step 3: Conditional Add-ons ──────────────────────────────
elif st.session_state.checkout_step == 3:
    st.subheader("Step 3: Recommended Add-ons")
    
    event_type = st.session_state.get("chk_event_type", "")
    show_addons = False
    
    if event_type == "Quinceañera":
        show_addons = True
        st.markdown("### 💃 Baile Sorpresa / Surprise Dance")
        st.markdown("Would you like us to create a custom mix for your surprise dance? ($50/mix)")
        st.session_state.chk_add_baile = st.checkbox("Yes, add Baile Sorpresa mix", value=st.session_state.get("chk_add_baile", False))
        
    elif event_type == "Wedding":
        show_addons = True
        st.markdown("### 👑 Vals Mix")
        st.markdown("Would you like us to create a custom vals arrangement? ($50/mix)")
        st.session_state.chk_add_vals = st.checkbox("Yes, add Vals mix", value=st.session_state.get("chk_add_vals", False))
        
    else:
        st.info("No specific recommendations for this event type. Proceed to the next step.")
        
    st.divider()
    col1, col2 = st.columns([1, 4])
    if col1.button("← Back"):
        prev_step()
        st.rerun()
    if col2.button("Next: Scheduling →", type="primary"):
        next_step()
        st.rerun()

# ── Step 4: Scheduling & Logistics ───────────────────────────
elif st.session_state.checkout_step == 4:
    st.subheader("Step 4: Scheduling")
    
    c1, c2 = st.columns(2)
    default_event = st.session_state.get("chk_event_date", date.today() + timedelta(days=7))
    st.session_state.chk_event_date = c1.date_input("Event start date", value=default_event)
    
    default_return = st.session_state.get("chk_return_date", st.session_state.chk_event_date + timedelta(days=1))
    st.session_state.chk_return_date = c2.date_input("Event end / Return date", value=default_return)
    
    st.session_state.chk_multiday = st.checkbox(
        "Does this event span multiple days (e.g. gear left overnight)?", 
        value=st.session_state.get("chk_multiday", False),
        help="If checked, physical equipment will be charged at the weekend/multi-day rate, while service labor remains charged strictly by the hours requested in Step 1."
    )
    
    st.divider()
    col1, col2 = st.columns([1, 4])
    if col1.button("← Back"):
        prev_step()
        st.rerun()
    if col2.button("Next: Review & Submit →", type="primary"):
        if st.session_state.chk_return_date < st.session_state.chk_event_date:
            st.error("Return date must be on or after the event date.")
        else:
            next_step()
            st.rerun()

# ── Step 5: Review & Submit ──────────────────────────────────
elif st.session_state.checkout_step == 5:
    st.subheader("Step 5: Review & Submit")
    
    # Add optional services if selected
    temp_cart = dict(cart)
    
    # Mixes are free as long as the client is hiring us for any other event item/package
    has_event_items = any(
        item.get("barcode") not in [pkg.SVC_BAILE, pkg.SVC_VALS]
        for item in temp_cart.values()
    )
    
    if st.session_state.get("chk_add_baile"):
        if pkg.SVC_BAILE not in temp_cart:
            temp_cart[pkg.SVC_BAILE] = {
                "name": "Baile Sorpresa Custom Mix", "brand": "DJM Audio", "category": "Services", "barcode": pkg.SVC_BAILE, "qty": 1, "rate_daily": 0 if has_event_items else 50, "rate_weekend": 0 if has_event_items else 50, "rate_hourly": 0, "is_service": True, "is_hourly": False
            }
    if st.session_state.get("chk_add_vals"):
        if pkg.SVC_VALS not in temp_cart:
            temp_cart[pkg.SVC_VALS] = {
                "name": "Vals Custom Mix", "brand": "DJM Audio", "category": "Services", "barcode": pkg.SVC_VALS, "qty": 1, "rate_daily": 0 if has_event_items else 50, "rate_weekend": 0 if has_event_items else 50, "rate_hourly": 0, "is_service": True, "is_hourly": False
            }

    equipment_items = {k: v for k, v in temp_cart.items() if not v.get("is_service") and not v.get("package_item")}
    service_items = {k: v for k, v in temp_cart.items() if v.get("is_service") or v.get("package_item")}
    
    hours = st.session_state.get("chk_hours", 5)
    multiday = st.session_state.get("chk_multiday", False)
    
    total_equip = 0
    total_services = 0
    
    # Display Cart
    st.markdown("#### Cart Summary")
    
    if equipment_items:
        st.markdown("**Equipment**")
        for k, v in equipment_items.items():
            rate = v["rate_weekend"] if multiday else v["rate_daily"]
            qty = v["qty"]
            line = rate * qty
            total_equip += line
            st.markdown(f"- {qty}x {v['brand']} {v['name']} @ ${rate:.0f} (Total: ${line:.0f})")
            
    if service_items:
        st.markdown("**Services & Packages (Adjusted for hours)**")
        for k, v in service_items.items():
            name_display = v['name']
            if "(5hr)" in name_display:
                name_display = name_display.replace("(5hr)", f"({hours} hrs)")
                
            eff_price = pkg.get_effective_price(k, temp_cart)
            if v.get("included_free") or eff_price is not None:
                st.markdown(f"- {v['qty']}x {name_display} (Included)")
                continue
                
            qty = v["qty"]
            
            # Flat-rate items (e.g. Packages, Spark Machines, Custom Mixes)
            if v.get("is_hourly") is False:
                rate = eff_price["rate_daily"] if eff_price is not None else v["rate_daily"]
                line = rate * qty
                total_services += line
                if rate == 0:
                    st.markdown(f"- {qty}x {name_display} (Included)")
                else:
                    st.markdown(f"- {qty}x {name_display} (Total: ${line:.0f})")
                continue

            # Base hourly rate fallback
            hourly = float(v.get("rate_hourly") or 0)
            if hourly == 0 and float(v.get("rate_daily") or 0) > 0:
                hourly = float(v.get("rate_daily")) / 5.0  # Implied hourly rate based on 5h base
                
            adjusted_hourly = pkg.calculate_service_rate(hourly, hours)
            line = adjusted_hourly * hours * qty
            total_services += line
            
            st.markdown(f"- {qty}x {name_display} (Total: ${line:.0f})")
            
    total = total_equip + total_services
    st.metric("Total Estimate", f"${total:,.0f}")
    
    # Liability Hold
    total_retail = sum(item.get("purchase_price", 0) * item.get("qty", 1) for item in temp_cart.values())
    if total_retail > 0:
        st.markdown(
            f"> :material/credit_card: **Equipment liability hold**: A credit card authorization "
            f"of **${total_retail:,.0f}** (total retail value) will be placed at pickup and "
            f"released upon safe return of all equipment."
        )

    # Return to shopping links
    st.markdown("---")
    al1, al2, al3 = st.columns(3)
    if al1.button("← Add more gear", use_container_width=True):
        st.switch_page("app_pages/browse.py")
    if al2.button("← Add services", use_container_width=True):
        st.switch_page("app_pages/dj_services.py")
    if al3.button("← Browse packages", use_container_width=True):
        st.switch_page("app_pages/packages.py")

    st.divider()
    with st.form("final_submit", border=True):
        st.markdown("#### Contact Details")
        rc1, rc2 = st.columns(2)
        client_name = rc1.text_input("Your name *", placeholder="John Doe")
        client_phone = rc2.text_input("Phone number *", placeholder="(555) 123-4567")
        
        notes = st.text_area("Additional notes (Optional)", placeholder="Any special requests, setup requirements...", max_chars=1000)
        
        submitted = st.form_submit_button("Submit Rental Request", icon=":material/send:", type="primary", use_container_width=True)
        
        if submitted:
            if not client_name or not client_phone:
                st.error("Please fill in your contact details.")
                st.stop()
                
            if not check_rate_limit():
                st.error("Too many requests from this device. Please wait before submitting again.", icon=":material/block:")
                st.stop()
                
            if not db.check_recent_requests(client_phone, max_requests=3, hours=1):
                st.error("Too many requests from this phone number. Please wait before submitting again.", icon=":material/block:")
                st.stop()
                
            # Compile full notes
            full_notes = "=== REQUESTED GEAR / SERVICES ===\n"
            for k, v in temp_cart.items():
                full_notes += f"• {v['qty']}x {v['brand']} {v['name']}\n"
                
            full_notes += f"\n=== EVENT DETAILS ===\n"
            full_notes += f"Event: {st.session_state.chk_event_name} ({st.session_state.chk_event_type})\n"
            full_notes += f"Guests: {st.session_state.chk_guests}\n"
            full_notes += f"Hours: {hours} hrs\n"
            full_notes += f"Multiday: {'Yes' if multiday else 'No'}\n"
            full_notes += f"Venue: {st.session_state.chk_venue}\n"
            if notes:
                full_notes += f"\n=== CLIENT NOTES ===\n{notes}"
                
            db.create_rental(
                event_name=st.session_state.chk_event_name,
                client_name=client_name,
                client_phone=client_phone,
                event_date=str(st.session_state.chk_event_date),
                return_date=str(st.session_state.chk_return_date),
                venue=st.session_state.chk_venue,
                notes=full_notes,
                estimated_cost=float(total)
            )
            
            db.notify(f"📋 New Request: {st.session_state.chk_event_name}", full_notes)
            
            # Track submission for rate limiting
            st.session_state.submit_timestamps.append(datetime.now().timestamp())
            
            # Reset
            st.session_state.cart = {}
            st.session_state.checkout_step = 1
            
            st.success("Rental request submitted! We'll review and get back to you within 24 hours.", icon=":material/check_circle:")
            st.balloons()
            st.stop()
            
    if st.button("← Back to Scheduling"):
        prev_step()
        st.rerun()
