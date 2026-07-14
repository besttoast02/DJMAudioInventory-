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
| **Mixing Consoles** | Allen & Heath SQ-5 Digital Mixer + AR2412 Stagebox, Pioneer DJ XDJ-XZ All-In-One DJ System |
| **PA Speakers** | dB Technologies Ingenia IG3T Powered Columns (×4), Electro-Voice Evolve 50 Powered Column Systems (×2) |
| **Subwoofers** | JBL SRX828SP Dual 18″ Powered Subs (×2), DAS Event 218A Dual 18″ Powered Subs (×2) |
| **Monitors** | Yamaha DBR15 Powered Speakers (×3) |
| **Wireless Systems** | Shure QLXD24/KSM8 Digital Wireless, Shure BLX24/Beta58A Wireless Handheld, Shure Bodypack Transmitters, Antenna Distribution |
| **Vocal Microphones** | Shure Beta 58A (×6), Shure SM57 (×7) |
| **Drum Microphones** | Audix D6 Kick, Audix i5, Shure PGA52 Kick, Shure PGA56 Drum (×3), Sennheiser e904 (×3), Sennheiser e906 (×2), Shure PGA81 Condensers (×2) |
| **DI Boxes** | Radial JDI Duplex Dual Passive Direct Boxes (×2) |
| **Lighting — Moving Heads** | ADJ Vizi Beam RXONE (×2), ADJ Inno Pocket Z4 (×4), Joyfirst 7R Beam/Wash (×4) |
| **Lighting — Wash & Effects** | ADJ Element Hex Battery Uplights (×6), ADJ Dotz Flood (×3), ADJ WiFLY EXR Battery (×3), Chauvet Fog Fury Jett Pro (×2) |
| **Lighting Control** | ADJ Airstream DMX Bridge, full DMX cabling infrastructure |
| **Truss & Rigging** | Aluminum truss segments (5′–10′), clamps, safety cables |
| **Cabling** | Neutrik XLR (up to 50′), Warm Audio XLR, Roland XLR, Jumperz XLR, Seetronic/Neutrik Powercon, Cat5e data runs |
| **Stands** | On-Stage boom stands (×8), CLC boom stands (×5), low-profile stands |
""")
