import streamlit as st

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
        
        **Includes:**
        - Professional DJ for up to 5 hours
        - Full PA sound system
        - Basic lighting setup
        - Custom playlist consultation
        - MC services
        
        **Starting at $500**
        """)
        if st.button("Request quote", key="dj_party", type="primary", icon=":material/request_quote:", use_container_width=True):
            st.switch_page("app_pages/contact.py")

with col2:
    with st.container(border=True):
        st.markdown("### 💍 Wedding DJ")
        st.badge("Most Popular", color="violet")
        st.markdown("""
        Your dream wedding deserves the perfect soundtrack.
        
        **Includes:**
        - Professional DJ for up to 8 hours
        - Ceremony + cocktail hour + reception
        - Premium PA & subwoofer system
        - Dance floor lighting package
        - Wireless microphone for speeches
        - Detailed timeline planning
        - MC services for full event
        
        **Starting at $1,200**
        """)
        if st.button("Request quote", key="dj_wedding", type="primary", icon=":material/request_quote:", use_container_width=True):
            st.switch_page("app_pages/contact.py")

with col3:
    with st.container(border=True):
        st.markdown("### 🏢 Corporate Event")
        st.markdown("""
        Elevate your corporate functions with premium sound.
        
        **Includes:**
        - Professional DJ / host for up to 6 hours
        - Conference-grade PA system
        - Wireless presentation microphones
        - Background music management
        - Event branding support
        - Professional attire
        
        **Starting at $800**
        """)
        if st.button("Request quote", key="dj_corp", type="primary", icon=":material/request_quote:", use_container_width=True):
            st.switch_page("app_pages/contact.py")

# ── Why DJMAudio ─────────────────────────────────────────────
st.divider()
st.subheader("Why choose DJM Audio Productions?")

w1, w2, w3, w4 = st.columns(4)
w1.metric("Events completed", "500+")
w2.metric("Years experience", "10+")
w3.metric("5-star reviews", "200+")
w4.metric("Repeat clients", "85%")

st.markdown("""
- ✅ Fully licensed and insured (LLC)
- ✅ Bilingual MC services (English & Spanish)
- ✅ Professional-grade equipment (Allen & Heath, Electro-Voice, Shure)
- ✅ Backup equipment always on hand
- ✅ Detailed event timeline and planning
- ✅ Serving the greater Los Angeles area
""")
