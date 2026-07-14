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
        
        **Services:**
        - Full FOH mixing for bands and performers
        - System tuning and optimization
        - Monitor mixing from FOH
        - Multi-channel recording capability
        - Soundcheck coordination
        
        **Starting at $400 / event**
        """)
        if st.button("Request quote", key="foh", type="primary", icon=":material/request_quote:", use_container_width=True):
            st.switch_page("app_pages/contact.py")

with col2:
    with st.container(border=True):
        st.markdown("### 🎧 Monitor Engineering")
        st.markdown("""
        Dedicated monitor mixes for performers on stage.
        
        **Services:**
        - Individual monitor mixes per musician
        - In-ear monitor (IEM) management
        - Wedge monitor positioning
        - Real-time adjustments during performance
        - Stage patch and input management
        
        **Starting at $350 / event**
        """)
        if st.button("Request quote", key="mon", type="primary", icon=":material/request_quote:", use_container_width=True):
            st.switch_page("app_pages/contact.py")

st.divider()

with st.container(border=True):
    st.markdown("### 🏟️ Full Production Package")
    st.badge("Best Value", color="green")
    st.markdown("""
    Complete audio production for large events — we bring everything.
    
    **Includes:**
    - FOH engineer + dedicated monitor engineer
    - Full PA system (mains + subs + monitors)
    - Digital mixing console (Allen & Heath SQ-5/SQ-6)
    - All microphones, DI boxes, and cabling
    - System tuning with measurement tools
    - Load-in, setup, soundcheck, teardown
    - Multi-track recording of the event
    
    **Starting at $2,500 / event**
    """)
    if st.button("Request quote", key="full_prod", type="primary", icon=":material/request_quote:", use_container_width=True):
        st.switch_page("app_pages/contact.py")

st.divider()
st.subheader("Equipment we bring")
st.markdown("""
| Category | Equipment |
|----------|-----------|
| **Consoles** | Allen & Heath SQ-5, SQ-6 |
| **PA Systems** | Electro-Voice Evolve 50, DAS Vantec subs |
| **Microphones** | Shure SM57/58, Beta 58A, Sennheiser e935/e945 |
| **Wireless** | Shure BLX systems |
| **Processing** | dbx, Radial DI boxes |
| **Monitoring** | Yamaha DBR15, custom IEM systems |
""")
