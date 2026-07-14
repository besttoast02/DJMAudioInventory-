import streamlit as st

st.title(":material/celebration: Packages & Event Planning")
st.markdown("Complete event packages with DJ, sound, lighting, and special effects — all in one booking.")

# ── Full Packages ────────────────────────────────────────────
st.divider()
st.subheader(":material/package_2: Full Event Packages")

col1, col2, col3 = st.columns(3)

with col1:
    with st.container(border=True):
        st.markdown("### 🥉 Essential Package")
        st.markdown("""
        Everything you need for a great event.
        
        - Professional DJ (up to 5 hrs)
        - 2x PA speakers + subwoofer
        - Basic LED lighting
        - Wireless microphone
        - MC services
        
        **$800**
        """)
        if st.button("Book this package", key="pkg_essential", type="primary", use_container_width=True):
            st.switch_page("app_pages/contact.py")

with col2:
    with st.container(border=True):
        st.markdown("### 🥈 Premium Package")
        st.badge("Most Popular", color="violet")
        st.markdown("""
        The full experience for weddings & quinceañeras.
        
        - Professional DJ (up to 8 hrs)
        - Full PA system + subs
        - Moving head lights + dance floor wash
        - 2x wireless microphones
        - Dancing on the clouds effect
        - MC services (bilingual)
        - Event timeline planning
        
        **$1,500**
        """)
        if st.button("Book this package", key="pkg_premium", type="primary", use_container_width=True):
            st.switch_page("app_pages/contact.py")

with col3:
    with st.container(border=True):
        st.markdown("### 🥇 Ultimate Package")
        st.markdown("""
        The complete production — leave nothing to chance.
        
        - Professional DJ (up to 10 hrs)
        - Premium PA + sub system
        - Full intelligent lighting rig
        - Truss setup with moving heads
        - 4x wireless microphones
        - Dancing on the clouds
        - Spark machines
        - LED robot performance
        - Dedicated sound tech
        - Full MC + timeline + coordination
        
        **$2,500**
        """)
        if st.button("Book this package", key="pkg_ultimate", type="primary", use_container_width=True):
            st.switch_page("app_pages/contact.py")

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
        if st.button("Request custom mix", key="baile", type="primary", icon=":material/request_quote:", use_container_width=True):
            st.switch_page("app_pages/contact.py")

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
        if st.button("Request custom mix", key="vals", type="primary", icon=":material/request_quote:", use_container_width=True):
            st.switch_page("app_pages/contact.py")

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
    
    *Included with all Premium and Ultimate packages. Available standalone for **$200**.*
    """)

# ── Event Gallery ────────────────────────────────────────────
st.divider()
st.subheader(":material/photo_library: Event Setup Gallery")
st.markdown("Photos and videos from our past events — see what we bring to the table.")

st.info(
    "Gallery coming soon! We're collecting our best event photos and setup shots. "
    "In the meantime, check out our Instagram or contact us to see examples.",
    icon=":material/photo_camera:"
)

st.divider()
if st.button("Contact us for a custom package", icon=":material/mail:", type="primary", use_container_width=True):
    st.switch_page("app_pages/contact.py")
