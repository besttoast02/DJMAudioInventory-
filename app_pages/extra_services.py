import streamlit as st

st.title(":material/auto_awesome: Extra Services")
st.markdown("Upgrade your event with premium add-on experiences.")

st.divider()

# ── Service cards ────────────────────────────────────────────
col1, col2 = st.columns(2)

with col1:
    with st.container(border=True):
        st.markdown("### 🎵 Live Recording & Post-Production")
        st.markdown("""
        Capture your live performance forever.
        
        **What you get:**
        - Multi-track recording of your live event
        - Professional mixing and mastering in post
        - Delivered as a polished live album (digital)
        - Individual stems available on request
        - Turnaround: 2–4 weeks
        
        **Starting at $500**
        """)
        if st.button("Request quote", key="live_rec", type="primary", icon=":material/request_quote:", use_container_width=True):
            st.switch_page("app_pages/contact.py")

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
        if st.button("Request quote", key="sparks", type="primary", icon=":material/request_quote:", use_container_width=True):
            st.switch_page("app_pages/contact.py")

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
        - 15–30 minute performance sets
        - Perfect for: nightclub events, quinceañeras, corporate reveals
        
        **Starting at $600** (1 robot)
        """)
        if st.button("Request quote", key="robots", type="primary", icon=":material/request_quote:", use_container_width=True):
            st.switch_page("app_pages/contact.py")

with col4:
    with st.container(border=True):
        st.markdown("### ☁️ Dancing on the Clouds")
        st.markdown("""
        Low-lying fog creates a magical cloud effect on the dance floor.
        
        **What you get:**
        - Professional low-fog machine
        - Dense white clouds that stay on the ground
        - No smoke smell, no residue
        - Operator included
        - Perfect for: first dance, vals, special moments
        
        **Starting at $250**
        """)
        if st.button("Request quote", key="clouds", type="primary", icon=":material/request_quote:", use_container_width=True):
            st.switch_page("app_pages/contact.py")

st.divider()
st.info(
    "All extra services can be bundled with DJ or equipment rental packages for a discounted rate. "
    "Contact us for a custom quote!",
    icon=":material/sell:"
)
