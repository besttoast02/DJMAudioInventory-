import streamlit as st

st.title(":material/graphic_eq: Live Audio Engineering")
st.markdown("Professional sound engineering for concerts, live events, worship services, and corporate productions.")

st.divider()

col1, col2 = st.columns(2)

with col1:
    with st.container(border=True):
        st.markdown("### 🎛️ Front of House (FOH) Mixing")
        st.markdown("""
        Expert live sound mixing for your audience.
        
        **5-hour package includes:**
        - Full FOH mixing for bands and performers
        - Allen & Heath digital mixer & stagebox
        - Laptop for optional recording *(additional fee)*
        - Soundcheck coordination
        
        **Optional add-on:**
        - Multi-track recording + post-production of live performance / album
        
        **Starting at $500**
        """)
        if st.button("Request quote", key="foh", type="primary", icon=":material/request_quote:", use_container_width=True):
            st.switch_page("app_pages/contact.py")

with col2:
    with st.container(border=True):
        st.markdown("### 💡 Lighting Package")
        st.badge("Add-on", color="blue")
        st.markdown("""
        Professional lighting design and live operation.
        
        **Includes:**
        - Moving head fixtures
        - Wash lights
        - Uplighting
        - Computer-programmed light show
        - Live lighting engineer adjusting in real-time according to event schedule
        
        **Starting at $500 / day**
        """)
        if st.button("Request quote", key="lighting", type="primary", icon=":material/request_quote:", use_container_width=True):
            st.switch_page("app_pages/contact.py")

st.divider()

col3, col4 = st.columns(2)

with col3:
    with st.container(border=True):
        st.markdown("### 🎧 Monitor Engineering")
        st.markdown("""
        Dedicated monitor mixes for performers on stage.
        
        **Includes:**
        - Individual monitor mixes per musician
        - In-ear monitor (IEM) management
        - Wedge monitor positioning
        - Real-time adjustments during performance
        - Stage patch and input management
        
        **Starting at $350 / event**
        """)
        if st.button("Request quote", key="mon", type="primary", icon=":material/request_quote:", use_container_width=True):
            st.switch_page("app_pages/contact.py")

with col4:
    st.empty()  # Balanced layout

st.divider()

with st.container(border=True):
    st.markdown("### 🏟️ Complete Live Audio Package")
    st.badge("Best Value", color="green")
    st.markdown("""
    Complete audio production for large events — we bring everything.
    
    **Includes:**
    - FOH engineer + dedicated monitor engineer
    - Full PA system (mains + subs + monitors)
    - Allen & Heath digital mixing console & stagebox
    - All microphones, DI boxes, and cabling
    - System tuning with measurement tools
    - Load-in, setup, soundcheck, teardown
    
    **Optional add-on:**
    - Multi-track recording + post-production of live performance / album
    - Lighting package ($500/day)
    
    **$1,000 / day**
    """)
    if st.button("Request quote", key="full_prod", type="primary", icon=":material/request_quote:", use_container_width=True):
        st.switch_page("app_pages/contact.py")

st.divider()
st.subheader("Equipment we bring")
st.markdown("""
| Category | Equipment |
|----------|-----------|
| **Consoles** | Allen & Heath SQ-5, SQ-6 + stagebox |
| **PA Systems** | DbTech speakers, DAS Vantec subs |
| **Microphones** | Shure SM57/58, Beta 58A, Sennheiser e935/e945 |
| **Wireless** | Shure BLX systems |
| **Processing** | dbx, Radial DI boxes |
| **Monitoring** | Yamaha DBR15, custom IEM systems |
| **Lighting** | ADJ moving heads, wash lights, uplights |
""")
