import streamlit as st
import package_config as pkg

if "cart" not in st.session_state:
    st.session_state.cart = {}

st.title(":material/headphones: DJ Services")
st.markdown("Professional DJ services for weddings, quinceañeras, corporate events, and private parties.")

# ── Service tiers ────────────────────────────────────────────
st.divider()

col1, col2, col3 = st.columns(3)

with col1:
    with st.container(border=True):
        st.markdown("### 🎉 Party DJ")
        st.markdown("""
        Perfect for birthdays, house parties, and casual events.
        
        **5-hour package includes:**
        - Professional DJ
        - Full PA sound system
        - Basic lighting setup
        - Custom playlist consultation
        - MC services
        
        **Starting at $750**
        """)
        if st.button("Add to Cart", key="dj_party", type="primary", icon=":material/add_shopping_cart:", use_container_width=True):
            st.session_state.cart[pkg.PKG_DJ_PARTY] = {
                "name": "DJ — Party Package (5hr)", "brand": "DJM Audio",
                "category": "Services", "barcode": pkg.PKG_DJ_PARTY, "qty": 1,
                "rate_half_day": 375, "rate_daily": 750, "rate_weekend": 1200,
                "max_qty": 1, "is_service": True,
            }
            st.toast("🛒 Added to cart!", icon="✅")
            st.rerun()

with col2:
    with st.container(border=True):
        st.markdown("### 💍 Wedding DJ")
        st.badge("Most Popular", color="violet")
        st.markdown("""
        Your dream wedding deserves the perfect soundtrack.
        
        **5-hour package includes:**
        - Professional DJ
        - Ceremony + cocktail hour + reception
        - Premium PA & subwoofer system
        - Dance floor lighting package
        - Wireless microphone for speeches
        - Detailed timeline planning
        - MC services for full event
        
        **Starting at $1,200**
        """)
        if st.button("Add to Cart", key="dj_wedding", type="primary", icon=":material/add_shopping_cart:", use_container_width=True):
            st.session_state.cart[pkg.PKG_DJ_WEDDING] = {
                "name": "DJ — Wedding Package (5hr)", "brand": "DJM Audio",
                "category": "Services", "barcode": pkg.PKG_DJ_WEDDING, "qty": 1,
                "rate_half_day": 600, "rate_daily": 1200, "rate_weekend": 1800,
                "max_qty": 1, "is_service": True,
            }
            # Auto-add free mixes
            for bc, name in [(pkg.SVC_VALS, "Vals Custom Mix"), (pkg.SVC_BAILE, "Baile Sorpresa Custom Mix")]:
                st.session_state.cart[bc] = {
                    "name": name, "brand": "DJM Audio", "category": "Services",
                    "barcode": bc, "qty": 1, "rate_half_day": 0, "rate_daily": 0,
                    "rate_weekend": 0, "max_qty": 1, "is_service": True, "included_free": True,
                }
            st.toast("🛒 Added to cart!", icon="✅")
            st.rerun()

with col3:
    with st.container(border=True):
        st.markdown("### 🏢 Corporate Event")
        st.markdown("""
        Elevate your corporate functions with premium sound.
        
        **5-hour package includes:**
        - Professional DJ / host
        - Conference-grade PA system
        - Wireless presentation microphones
        - Background music management
        - Event branding support
        - Professional attire
        
        **Starting at $750**
        """)
        if st.button("Add to Cart", key="dj_corp", type="primary", icon=":material/add_shopping_cart:", use_container_width=True):
            st.session_state.cart[pkg.PKG_DJ_CORPORATE] = {
                "name": "DJ — Corporate Package (5hr)", "brand": "DJM Audio",
                "category": "Services", "barcode": pkg.PKG_DJ_CORPORATE, "qty": 1,
                "rate_half_day": 375, "rate_daily": 750, "rate_weekend": 1200,
                "max_qty": 1, "is_service": True,
            }
            st.toast("🛒 Added to cart!", icon="✅")
            st.rerun()

# ── Why DJMAudio ─────────────────────────────────────────────
st.divider()
st.subheader("Why choose DJM Audio Productions?")

w1, w2 = st.columns(2)
w1.metric("Events completed", "250+")
w2.metric("Years experience", "9+")

st.markdown("""
- ✅ Fully licensed and insured (LLC)
- ✅ Bilingual MC services (English & Spanish)
- ✅ Professional-grade equipment (Allen & Heath, DbTech, Shure)
- ✅ Backup equipment always on hand
- ✅ Detailed event timeline and planning
- ✅ Serving the greater Los Angeles area
""")
