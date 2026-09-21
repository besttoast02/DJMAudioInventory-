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
        st.markdown("### 🔈 Medium PA Package")
        st.image("https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800", use_container_width=True)
        st.markdown("""
        Perfect for mid-sized events looking for professional audio and dynamic lighting.
        
        **5-hour package includes:**
        - **Professional DJ & MC Services**
        - **Wireless Microphone** for speeches and announcements
        - **Audio Setup:** 2x dbTechnologies Ingenia IG3T speakers & 1x Subwoofer (DAS or JBL SRX828)
        - **Lighting Setup:** 2x Truss Towers. Each tower includes:
          - 1x Lightjoy Moving Head
          - 1x ADJ Element Hex Uplight
          - 1x Wash Light (ADJ Dotz Flood or PAR)
        - **Effects:** Smoke Machine
        - All lights are intelligently controlled via computer for a synced light show!
        
        **Starting at $800**
        """)
        if st.button("Add to Cart", key="dj_medium", type="primary", icon=":material/add_shopping_cart:", use_container_width=True):
            st.session_state.cart[pkg.PKG_DJ_PARTY] = {
                "name": "DJ — Medium PA Package (5hr)", "brand": "DJM Audio",
                "category": "Services", "barcode": pkg.PKG_DJ_PARTY, "qty": 1,
                "rate_half_day": 400, "rate_daily": 800, "rate_weekend": 800,
                "max_qty": 1, "is_service": True,
            }
            st.toast("🛒 Added to cart!", icon="✅")
            st.rerun()

with col2:
    with st.container(border=True):
        st.markdown("### 💡 Medium PA + 4 Towers")
        st.badge("Most Popular", color="violet")
        st.image("https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800", use_container_width=True)
        st.markdown("""
        Double the lighting for an immersive dance floor experience.
        
        **5-hour package includes:**
        - **Professional DJ & MC Services**
        - **Wireless Microphone** for speeches and announcements
        - **Audio Setup:** 2x dbTechnologies Ingenia IG3T speakers & 1x Subwoofer (DAS or JBL SRX828)
        - **Lighting Setup:** 4x Truss Towers. Each tower includes:
          - 1x Lightjoy Moving Head
          - 1x ADJ Element Hex Uplight
          - 1x Wash Light (ADJ Dotz Flood or PAR)
        - **Effects:** Smoke Machine
        - All lights are intelligently controlled via computer for a synced light show!
        
        **Starting at $1,000**
        """)
        if st.button("Add to Cart", key="dj_towers", type="primary", icon=":material/add_shopping_cart:", use_container_width=True):
            st.session_state.cart[pkg.PKG_DJ_WEDDING] = {
                "name": "DJ — Medium PA + 4 Towers (5hr)", "brand": "DJM Audio",
                "category": "Services", "barcode": pkg.PKG_DJ_WEDDING, "qty": 1,
                "rate_half_day": 500, "rate_daily": 1000, "rate_weekend": 1000,
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
        st.markdown("### 👑 All-Inclusive (Live Band + DJ)")
        st.image("https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800", use_container_width=True)
        st.markdown("""
        The ultimate wedding package! Save money by combining your DJ setup with full audio engineering for your live band. We share the PA, and our team handles the band's technical rider prior to the event.
        
        **5-hour package includes:**
        - **Professional DJ & Live Audio Engineer**
        - **Large PA Setup:** 4x Ingenia IG3T speakers & 4x Subwoofers (2 JBL, 2 DAS)
        - **Live Band Gear:** 32-Channel Allen & Heath SQ5 + AB168 Stagebox, 3x Yamaha monitors, up to 32 mics/stands (2 wireless vocal, Beta58s, SM57s, Audix drum kit, amp mics). *(Backline available as add-on).*
        - **Lighting Setup:** Full 36' Truss Arch overhead! Includes:
          - 4x Lightjoy Moving Heads
          - 3x ADJ Dotz Floodz
          - 4x ADJ Inno Pocket Small Moving Heads
          - Full stage uplighting
        
        **Starting at $2,000**
        """)
        if st.button("Add to Cart", key="dj_all_inclusive", type="primary", icon=":material/add_shopping_cart:", use_container_width=True):
            st.session_state.cart[pkg.PKG_DJ_CORPORATE] = {
                "name": "DJ — All Inclusive Large PA (5hr)", "brand": "DJM Audio",
                "category": "Services", "barcode": pkg.PKG_DJ_CORPORATE, "qty": 1,
                "rate_half_day": 1000, "rate_daily": 2000, "rate_weekend": 2000,
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
- ✅ Serving the greater Los Angeles area
""")
