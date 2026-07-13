import streamlit as st

def hero_section():
    st.markdown("""
    <div style="text-align: center; padding: 4rem 1rem;">
        <h1 style="font-size: 3.5rem; font-weight: 700; margin-bottom: 0;">Great sound,</h1>
        <h1 style="font-size: 3.5rem; font-weight: 700; color: #c54ee9; margin-top: 0;">greater memories.</h1>
        <p style="font-size: 1.2rem; color: #CFCFCF; max-width: 600px; margin: 1.5rem auto;">
            We provide tailored service to make your event truly unforgettable. Audio is the heartbeat of a live event.
        </p>
    </div>
    """, unsafe_allow_html=True)

    c1, c2, c3 = st.columns([1, 1, 1])
    with c2:
        if st.button("View Rental Catalog", type="primary", use_container_width=True):
            st.switch_page("app_pages/browse.py")

def about_section():
    st.divider()
    c1, c2 = st.columns(2, gap="large", vertical_alignment="center")
    
    with c1:
        st.subheader("About Us")
        st.markdown("### We take your event to the next level.")
        st.markdown("""
        Our method focuses on precision, reliability, and delivering the highest quality audio-visual experience. 
        Whether it's an intimate gathering or a massive community festival, good sound creates great moments.
        """)
    with c2:
        st.image("https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80", use_container_width=True, caption="Live sound engineering")

def services_section():
    st.divider()
    st.markdown("<h2 style='text-align: center;'>Our Services</h2>", unsafe_allow_html=True)
    st.markdown("<br>", unsafe_allow_html=True)
    
    s1, s2, s3, s4 = st.columns(4)
    
    with s1:
        st.markdown("### 🎛️ Sound & DJ")
        st.caption("Weddings, Quinceañeras, Parties")
        
    with s2:
        st.markdown("### 💡 Lighting")
        st.caption("Corporate & Nonprofit Events")
        
    with s3:
        st.markdown("### 📸 Photo & Video")
        st.caption("City & Community Events")
        
    with s4:
        st.markdown("### 🏗️ Stage & Screens")
        st.caption("Festivals & Concerts")

def past_events_section():
    st.divider()
    st.markdown("<h2 style='text-align: center;'>Past Events</h2>", unsafe_allow_html=True)
    st.markdown("<br>", unsafe_allow_html=True)
    
    e1, e2, e3, e4 = st.columns(4)
    e1.info("**December 2024**\n\nSW Cleanup Inc. Christmas Celebration\n\n*Alhambra, CA*")
    e2.info("**August 2024**\n\nNational Night Out\n\n*Boyle Heights, CA*")
    e3.info("**June 2024**\n\nJuneteenth Festival\n\n*El Segundo, CA*")
    e4.info("**May 2023**\n\nSt John the Baptist Festival\n\n*Baldwin Park, CA*")

# ── Render Page ──────────────────────────────────────────────
hero_section()
about_section()
services_section()
past_events_section()

st.markdown("<br><br><br><center><p style='color: #555;'>© 2025 DJM Audio Productions</p></center>", unsafe_allow_html=True)
