import streamlit as st
import package_config as pkg

st.title(":material/celebration: Packages & Event Planning")
st.markdown("Complete event packages with DJ, sound, lighting, and special effects — all in one booking.")

# ── Initialize cart ──────────────────────────────────────────
if "cart" not in st.session_state:
    st.session_state.cart = {}

# ── Helper: add package to cart with questionnaire answers ───
def add_package_to_cart(package_key: str, extras: dict):
    """Populate the cart with a package's base items plus selected extras."""
    config = pkg.PACKAGES[package_key]

    # Add base items
    for item in config["base_items"]:
        st.session_state.cart[item["barcode"]] = {
            "name": item["name"],
            "brand": "DJM Audio",
            "category": "Services",
            "barcode": item["barcode"],
            "qty": item["qty"],
            "rate_half_day": 0,
            "rate_daily": 0,
            "rate_weekend": 0,
            "max_qty": 5,
            "is_service": True,
            "package_item": True,
        }

    # Mark package pricing on the first item
    first_bc = config["base_items"][0]["barcode"]
    st.session_state.cart[first_bc]["rate_daily"] = config["price"]
    st.session_state.cart[first_bc]["rate_weekend"] = config["price"]
    st.session_state.cart[first_bc]["rate_half_day"] = config["price"] // 2

    # Add free included services
    for free_bc in config.get("included_free", []):
        name_map = {
            pkg.SVC_VALS: "Vals Custom Mix",
            pkg.SVC_BAILE: "Baile Sorpresa Custom Mix",
            pkg.SVC_PLANNING: "Event Planning & MC Coordination",
        }
        if free_bc in name_map:
            st.session_state.cart[free_bc] = {
                "name": name_map[free_bc],
                "brand": "DJM Audio",
                "category": "Services",
                "barcode": free_bc,
                "qty": 1,
                "rate_half_day": 0,
                "rate_daily": 0,
                "rate_weekend": 0,
                "max_qty": 1,
                "is_service": True,
                "included_free": True,
                "is_hourly": False,
            }

    # Add selected extras
    extra_items = {
        "add_sparks": (pkg.ITEM_SPARKS, "Spark Machine (pair)", 300),
        "add_clouds": (pkg.ITEM_CLOUDS, "Dancing on the Clouds (2 uses)", 350),
        "add_robot": (pkg.SVC_ROBOT, "LED Robot Show (45min–1hr)", 600),
        "add_recording_ep": (pkg.SVC_POST_EP, "Post-Production (5-Song EP)", 300),
        "add_recording_album": (pkg.SVC_POST_ALBUM, "Post-Production (Full Album 1hr)", 500),
        "add_lighting": (pkg.SVC_LIGHTING, "Lighting Package (per day)", 500),
        "add_monitors": (pkg.SVC_MONITOR, "Monitor Engineer", 350),
        "add_vals": (pkg.SVC_VALS, "Vals Custom Mix", 50),
        "add_baile": (pkg.SVC_BAILE, "Baile Sorpresa Custom Mix", 50),
        "add_planning": (pkg.SVC_PLANNING, "Event Planning & MC Coordination", 200),
    }
    for extra_key, (bc, name, price) in extra_items.items():
        if extras.get(extra_key) and bc not in st.session_state.cart:
            # Check if this would be free with DJ package
            is_free = bc in pkg.FREE_WITH_DJ and any(
                st.session_state.cart.get(djp, {}).get("barcode") in pkg.DJ_PACKAGES
                for djp in st.session_state.cart
            )
            st.session_state.cart[bc] = {
                "name": name,
                "brand": "DJM Audio",
                "category": "Services",
                "barcode": bc,
                "qty": 1,
                "rate_half_day": 0 if is_free else price // 2,
                "rate_daily": 0 if is_free else price,
                "rate_weekend": 0 if is_free else price,
                "max_qty": 5,
                "is_service": True,
                "included_free": is_free,
                "is_hourly": False,
            }


# ── Full Packages ────────────────────────────────────────────
st.divider()
st.subheader(":material/package_2: Full Event Packages")

col1, col2, col3 = st.columns(3)

with col1:
    with st.container(border=True):
        st.markdown("### 🥉 Essential Package")
        st.markdown("""
        Everything you need for a great event.
        
        - Professional DJ (5 hrs)
        - 2x PA speakers + subwoofer
        - Basic LED lighting
        - Wireless microphone
        - MC services
        
        **$800**
        """)
        if st.button("Customize & Add to Cart", key="pkg_essential", type="primary", use_container_width=True):
            st.session_state["active_pkg"] = "essential"
            st.rerun()

with col2:
    with st.container(border=True):
        st.markdown("### 🥈 Premium Package")
        st.badge("Most Popular", color="violet")
        st.markdown("""
        The full experience for weddings & quinceañeras.
        
        - Professional DJ (5 hrs)
        - Full PA system + subs
        - Moving head lights + dance floor wash
        - 2x wireless microphones
        - MC services (bilingual)
        - Event timeline planning
        - Vals & baile sorpresa mixes included
        
        **$1,500**
        """)
        if st.button("Customize & Add to Cart", key="pkg_premium", type="primary", use_container_width=True):
            st.session_state["active_pkg"] = "premium"
            st.rerun()

with col3:
    with st.container(border=True):
        st.markdown("### 🥇 Ultimate Package")
        st.markdown("""
        The complete production — leave nothing to chance.
        
        - Professional DJ (5 hrs)
        - Premium PA + sub system
        - Full intelligent lighting rig with live engineer
        - Truss setup with moving heads
        - 4x wireless microphones
        - Dancing on the clouds
        - Spark machines
        - LED robot performance
        - Full MC + timeline + coordination
        - Vals & baile sorpresa mixes included
        
        **$2,500**
        """)
        if st.button("Customize & Add to Cart", key="pkg_ultimate", type="primary", use_container_width=True):
            st.session_state["active_pkg"] = "ultimate"
            st.rerun()

@st.dialog("🛒 Customize Package", width="large")
def customize_package_dialog(active):
    config = pkg.PACKAGES[active]
    st.markdown(f"Answer a few questions to build your personalized estimate for the **{config['name']}**.")

    st.markdown("##### 📋 Event Details")
    q1, q2 = st.columns(2)
    event_type = q1.selectbox(
        "Event type",
        ["Wedding", "Quinceañera", "Birthday / Party", "Corporate", "Concert / Festival", "Other"],
    )
    guest_count = q2.number_input("Expected guest count", min_value=20, max_value=2000, value=150, step=25)

    q3, q4 = st.columns(2)
    venue_type = q3.selectbox("Venue type", ["Indoor", "Outdoor", "Both / Mixed"])
    hours_total = q4.number_input("Total hours", min_value=5, max_value=15, value=5)
    st.info("ℹ️ Packages include a minimum of 5 hours. For shorter events, services are billed hourly a-la-carte.")

    st.divider()
    st.markdown("##### ✨ Add-Ons & Extras")
    questions = config["questionnaire"]

    extras = {}
    ex1, ex2, ex3 = st.columns(3)

    # Only show questions relevant to this package
    with ex1:
        if "add_sparks" in questions and pkg.ITEM_SPARKS not in [i["barcode"] for i in config["base_items"]]:
            extras["add_sparks"] = st.checkbox("🔥 Spark Machines (+$300)", key=f"q_sparks_{active}")
        if "add_clouds" in questions and pkg.ITEM_CLOUDS not in [i["barcode"] for i in config["base_items"]]:
            extras["add_clouds"] = st.checkbox("☁️ Dancing on the Clouds (+$350)", key=f"q_clouds_{active}")
        if "add_monitors" in questions:
            extras["add_monitors"] = st.checkbox("🎧 Monitor Engineer (+$350)", key=f"q_monitors_{active}")

    with ex2:
        if "add_robot" in questions and pkg.SVC_ROBOT not in [i["barcode"] for i in config["base_items"]]:
            extras["add_robot"] = st.checkbox("🤖 LED Robot Show (+$600)", key=f"q_robot_{active}")
        if "add_lighting" in questions and pkg.SVC_LIGHTING not in [i["barcode"] for i in config["base_items"]]:
            extras["add_lighting"] = st.checkbox("💡 Lighting Package (+$500/day)", key=f"q_lighting_{active}")

    with ex3:
        if "add_recording" in questions:
            recording_type = st.radio(
                "🎙️ Live Recording Post-Production",
                ["None", "5-Song EP (+$300)", "Full Album (+$500)"],
                key=f"q_recording_{active}",
            )
            if recording_type == "5-Song EP (+$300)":
                extras["add_recording_ep"] = True
            elif recording_type == "Full Album (+$500)":
                extras["add_recording_album"] = True

    # Mixes (free with DJ packages)
    if "add_mixes" in questions:
        st.divider()
        st.markdown("##### 🎵 Custom Mixes")
        mx1, mx2 = st.columns(2)
        with mx1:
            if config.get("included_free") and pkg.SVC_VALS in config["included_free"]:
                st.success("✅ Vals mix — Included free")
            else:
                extras["add_vals"] = st.checkbox("👑 Vals Custom Mix (+$50)", key=f"q_vals_{active}")
        with mx2:
            if config.get("included_free") and pkg.SVC_BAILE in config["included_free"]:
                st.success("✅ Baile sorpresa mix — Included free")
            else:
                extras["add_baile"] = st.checkbox("💃 Baile Sorpresa Mix (+$50)", key=f"q_baile_{active}")

    st.divider()
    notes = st.text_area("Any special requests?", placeholder="Specific songs, timing, setup needs...", max_chars=500)

    if st.button(f"Add {config['name']} to Cart →", type="primary", use_container_width=True, icon=":material/add_shopping_cart:"):
        add_package_to_cart(active, extras)
        st.toast("🛒 Added to cart!", icon="✅")

        # Store event details in session for checkout
        st.session_state["pkg_event_type"] = event_type
        st.session_state["pkg_guest_count"] = guest_count
        st.session_state["pkg_venue_type"] = venue_type
        st.session_state["pkg_total_hours"] = hours_total
        if notes:
            st.session_state["pkg_notes"] = notes

        del st.session_state["active_pkg"]
        st.rerun()

# ── Package Questionnaire Trigger ─────────────────────────────
active = st.session_state.get("active_pkg")
if active and active in pkg.PACKAGES:
    customize_package_dialog(active)

# ── Cultural Services ────────────────────────────────────────
st.divider()
st.subheader(":material/music_note: Quinceañera & Wedding Specialties")

q1, q2 = st.columns(2)

with q1:
    with st.container(border=True):
        st.markdown("### 💃 Baile Sorpresa Mix")
        st.markdown("""
        Custom choreography mix for your surprise dance.
        
        **What's included:**
        - Custom song mashup / remix (3–8 minutes)
        - Up to 5 songs blended seamlessly
        - Tempo-matched transitions
        - Sound effects and drops
        - Unlimited revisions before event
        - Delivered as high-quality audio file
        
        **Included** with any DJ package · Standalone starting at **$50**
        """)
        if st.button("Add to Cart", key="baile", type="primary", icon=":material/add_shopping_cart:", use_container_width=True):
            st.session_state.cart[pkg.SVC_BAILE] = {
                "name": "Baile Sorpresa Custom Mix", "brand": "DJM Audio",
                "category": "Services", "barcode": pkg.SVC_BAILE, "qty": 1,
                "rate_half_day": 0, "rate_daily": 50, "rate_weekend": 50,
                "max_qty": 1, "is_service": True, "is_hourly": False,
            }
            st.rerun()

with q2:
    with st.container(border=True):
        st.markdown("### 👑 Vals Mix")
        st.markdown("""
        Your waltz, perfectly crafted.
        
        **What's included:**
        - Custom vals arrangement
        - Smooth fade-ins and transitions
        - Optional mashup with a modern song
        - Tempo adjustments for choreography
        - Unlimited revisions before event
        - Delivered as high-quality audio file
        
        **Included** with any DJ package · Standalone starting at **$50**
        """)
        if st.button("Add to Cart", key="vals", type="primary", icon=":material/add_shopping_cart:", use_container_width=True):
            st.session_state.cart[pkg.SVC_VALS] = {
                "name": "Vals Custom Mix", "brand": "DJM Audio",
                "category": "Services", "barcode": pkg.SVC_VALS, "qty": 1,
                "rate_half_day": 0, "rate_daily": 50, "rate_weekend": 50,
                "max_qty": 1, "is_service": True, "is_hourly": False,
            }
            st.rerun()

# ── MC & Event Planning ──────────────────────────────────────
st.divider()
st.subheader(":material/event_note: MC & Event Planning")

with st.container(border=True):
    st.markdown("### 🎤 Wedding / Quinceañera MC Planning")
    st.markdown("""
    We work with you to create a detailed event timeline and MC script so everything runs smoothly.
    
    **Planning includes:**
    
    | Phase | Details |
    |-------|---------|
    | **Pre-event consultation** | Meet to discuss flow, music preferences, special moments |
    | **Timeline creation** | Minute-by-minute schedule for the entire event |
    | **MC script** | Introductions, announcements, transitions |
    | **Vendor coordination** | Sync with photographer, videographer, caterer |
    | **Ceremony support** | Music cues for processional, recessional |
    | **Reception flow** | Grand entrance → first dance → dinner → toasts → open dance → last dance |
    | **Special moments** | Bouquet toss, garter, dollar dance, cake cutting, sparkler exit |
    
    *Included with Premium and Ultimate packages. Available standalone for **$200**.*
    """)
    if st.button("Add to Cart — $200", key="planning_add", type="primary", icon=":material/add_shopping_cart:", use_container_width=True):
        st.session_state.cart[pkg.SVC_PLANNING] = {
            "name": "Event Planning & MC Coordination", "brand": "DJM Audio",
            "category": "Services", "barcode": pkg.SVC_PLANNING, "qty": 1,
            "rate_half_day": 0, "rate_daily": 200, "rate_weekend": 200,
            "max_qty": 1, "is_service": True,
        }
        st.rerun()

# ── Event Gallery ────────────────────────────────────────────
st.divider()
st.subheader(":material/photo_library: Event Setup Gallery")
st.markdown("Photos and videos from our past events — see what we bring to the table.")

st.info(
    "Gallery coming soon! We're collecting our best event photos and setup shots. "
    "In the meantime, check out our Instagram or contact us to see examples.",
    icon=":material/photo_camera:"
)

# ── Cart summary if items exist ──────────────────────────────
cart = st.session_state.get("cart", {})
if cart:
    st.divider()
    st.subheader(":material/shopping_cart: Your Cart")
    total = sum(item["qty"] * item["rate_daily"] for item in cart.values())
    for key, item in cart.items():
        c1, c2, c3 = st.columns([5, 2, 1])
        price_label = "Included ✅" if item.get("included_free") else f"${item['rate_daily'] * item['qty']:.0f}"
        c1.markdown(f"**{item['name']}**")
        c2.markdown(price_label)
        if c3.button("✕", key=f"pkg_rm_{key}"):
            del st.session_state.cart[key]
            st.rerun()
    st.metric("Estimated Total", f"${total:,.0f}")
    if st.button("Proceed to Checkout →", icon=":material/shopping_cart_checkout:", type="primary", use_container_width=True):
        st.switch_page("app_pages/request.py")
