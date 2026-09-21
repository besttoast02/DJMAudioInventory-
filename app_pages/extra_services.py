import streamlit as st
import package_config as pkg

if "cart" not in st.session_state:
    st.session_state.cart = {}

st.title(":material/auto_awesome: Extra Services")
st.markdown("Upgrade your event with premium add-on experiences.")

st.divider()

# ── Service cards ────────────────────────────────────────────
col1, col2 = st.columns(2)

with col1:
    with st.container(border=True):
        st.markdown("### 🎵 Live Album Post-Production")
        st.badge("FOH / Audio Package Add-on", color="blue")
        st.markdown("""
        When booked as your FOH engineer, we can multi-track record every channel of your performance. The pricing below covers **professional post-production** — mixing and mastering with analog outboard gear.
        
        **Post-production pricing:**
        - **5-song EP** — $300
        - **Full performance album** (1 hour) — $500
        - Scalable for longer sets — contact us
        
        **What you get:**
        - Multi-track recording available with any FOH booking
        - Professional mixing and mastering in post with analog gear
        - Delivered as a polished live album (digital)
        - Individual stems available on request
        - Turnaround: **1 week**
        """)
        
        st.divider()
        st.markdown("##### 🏷️ Danger Beats Music — Label Services")
        st.markdown("""
        Through **Danger Beats Music LLC** we also offer:
        - Album art design
        - Digital distribution (Spotify, Apple Music, etc.)
        - Promotion & placement in live events
        
        *Pricing varies — [contact us](app_pages/contact.py) to discuss your project.*
        """)
        r1, r2 = st.columns(2)
        if r1.button("Add EP ($300)", key="live_rec_ep", type="primary", icon=":material/add_shopping_cart:", use_container_width=True):
            st.session_state.cart[pkg.SVC_POST_EP] = {
                "name": "Post-Production (5-Song EP)", "brand": "Danger Beats",
                "category": "Services", "barcode": pkg.SVC_POST_EP, "qty": 1,
                "rate_half_day": 0, "rate_daily": 300, "rate_weekend": 300,
                "max_qty": 1, "is_service": True,
            }
            st.toast("🛒 Added to cart!", icon="✅")
            st.rerun()
        if r2.button("Add Album ($500)", key="live_rec_album", type="primary", icon=":material/add_shopping_cart:", use_container_width=True):
            st.session_state.cart[pkg.SVC_POST_ALBUM] = {
                "name": "Post-Production (Full Album 1hr)", "brand": "Danger Beats",
                "category": "Services", "barcode": pkg.SVC_POST_ALBUM, "qty": 1,
                "rate_half_day": 0, "rate_daily": 500, "rate_weekend": 500,
                "max_qty": 1, "is_service": True,
            }
            st.toast("🛒 Added to cart!", icon="✅")
            st.rerun()

with col2:
    with st.container(border=True):
        st.markdown("### ✨ Spark Machines")
        st.markdown("""
        Cold spark fountains for dramatic entrances and first dances.
        
        **What you get:**
        - 2x or 4x cold spark machines
        - Safe indoor-rated titanium sparks (no fire risk)
        - DMX-controlled timing
        - Operator included
        - Perfect for: first dance, cake cutting, grand entrance
        
        **Starting at $300** (pair)
        """)
        if st.button("Add to Cart — $300", key="sparks", type="primary", icon=":material/add_shopping_cart:", use_container_width=True):
            st.session_state.cart[pkg.ITEM_SPARKS] = {
                "name": "Spark Machine (pair)", "brand": "DJM Audio",
                "category": "Lighting", "barcode": pkg.ITEM_SPARKS, "qty": 1,
                "rate_half_day": 150, "rate_daily": 300, "rate_weekend": 300,
                "max_qty": 2, "is_service": False,
            }
            st.toast("🛒 Added to cart!", icon="✅")
            st.rerun()

col3, col4 = st.columns(2)

with col3:
    with st.container(border=True):
        st.markdown("### 🤖 LED Robots")
        st.markdown("""
        High-energy LED robot performers for your event.
        
        **What you get:**
        - LED-lit robot performer(s)
        - Choreographed routines
        - CO2 blast effects
        - 45-minute to 1-hour performance sets
        - Perfect for: nightclub events, quinceañeras, corporate reveals
        
        **Starting at $600** (1 robot)
        """)
        if st.button("Add to Cart — $600", key="robots", type="primary", icon=":material/add_shopping_cart:", use_container_width=True):
            st.session_state.cart[pkg.SVC_ROBOT] = {
                "name": "LED Robot Show (45min–1hr)", "brand": "DJM Audio",
                "category": "Services", "barcode": pkg.SVC_ROBOT, "qty": 1,
                "rate_half_day": 0, "rate_daily": 600, "rate_weekend": 600,
                "max_qty": 3, "is_service": True,
            }
            st.toast("🛒 Added to cart!", icon="✅")
            st.rerun()

with col4:
    with st.container(border=True):
        st.markdown("### ☁️ Dancing on the Clouds")
        st.markdown("""
        Low-lying fog creates a magical cloud effect on the dance floor.
        
        **What you get:**
        - Professional low-fog machine
        - Dense white clouds that stay on the ground
        - 2 uses included (e.g., vals + first dance)
        - Operator included
        - Perfect for: first dance, vals, grand entrance
        
        **$350** (includes 2 uses)
        """)
        if st.button("Add to Cart — $350", key="clouds", type="primary", icon=":material/add_shopping_cart:", use_container_width=True):
            st.session_state.cart[pkg.ITEM_CLOUDS] = {
                "name": "Dancing on the Clouds (2 uses)", "brand": "DJM Audio",
                "category": "Lighting", "barcode": pkg.ITEM_CLOUDS, "qty": 1,
                "rate_half_day": 175, "rate_daily": 350, "rate_weekend": 350,
                "max_qty": 1, "is_service": False,
            }
            st.toast("🛒 Added to cart!", icon="✅")
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

st.divider()

# ── Cart summary ─────────────────────────────────────────────
cart = st.session_state.get("cart", {})
extras_in_cart = {k: v for k, v in cart.items() if v.get("is_service") or v.get("category") in ("Lighting",)}
if extras_in_cart:
    st.subheader(":material/shopping_cart: Extras in your cart")
    total = 0
    for key, item in extras_in_cart.items():
        c1, c2 = st.columns([5, 1])
        eff_price = pkg.get_effective_price(key, cart)
        rate = eff_price["rate_daily"] if eff_price is not None else item["rate_daily"]
        price = item["qty"] * rate
        total += price
        price_label = "Included ✅" if item.get("included_free") or eff_price is not None else f"${price:.0f}"
        c1.markdown(f"**{item['name']}** — {price_label}")
        if c2.button("✕", key=f"ex_rm_{key}"):
            del st.session_state.cart[key]
            st.rerun()
    st.metric("Extras total", f"${total:,.0f}")
    if st.button("Proceed to Checkout →", icon=":material/shopping_cart_checkout:", type="primary", use_container_width=True):
        st.switch_page("app_pages/request.py")
else:
    st.info(
        "All extra services can be bundled with DJ or equipment rental packages for a discounted rate. "
        "Contact us for a custom quote!",
        icon=":material/sell:"
    )
