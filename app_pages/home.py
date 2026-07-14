import streamlit as st

# ── Animated EQ Hero ─────────────────────────────────────────
st.markdown("""
<style>
@keyframes eqBar1 { 0%,100%{height:20px} 25%{height:60px} 50%{height:40px} 75%{height:70px} }
@keyframes eqBar2 { 0%,100%{height:45px} 25%{height:25px} 50%{height:65px} 75%{height:35px} }
@keyframes eqBar3 { 0%,100%{height:30px} 25%{height:70px} 50%{height:50px} 75%{height:20px} }
@keyframes eqBar4 { 0%,100%{height:55px} 25%{height:35px} 50%{height:75px} 75%{height:45px} }
@keyframes eqBar5 { 0%,100%{height:35px} 25%{height:55px} 50%{height:25px} 75%{height:65px} }
@keyframes eqBar6 { 0%,100%{height:50px} 25%{height:30px} 50%{height:60px} 75%{height:40px} }
@keyframes eqBar7 { 0%,100%{height:25px} 25%{height:65px} 50%{height:45px} 75%{height:55px} }
@keyframes fadeInUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }

.hero-wrapper {
    position: relative;
    text-align: center;
    padding: 3rem 1rem 4rem;
    overflow: hidden;
}

.eq-container {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 6px;
    height: 80px;
    margin-bottom: 2rem;
}

.eq-bar {
    width: 4px;
    border-radius: 4px;
    background: linear-gradient(to top, #c54ee9, #8b5cf6);
    opacity: 0.6;
}

.eq-bar:nth-child(1) { animation: eqBar1 1.2s ease-in-out infinite; }
.eq-bar:nth-child(2) { animation: eqBar2 1.0s ease-in-out infinite; }
.eq-bar:nth-child(3) { animation: eqBar3 0.9s ease-in-out infinite; }
.eq-bar:nth-child(4) { animation: eqBar4 1.1s ease-in-out infinite; }
.eq-bar:nth-child(5) { animation: eqBar5 0.8s ease-in-out infinite; }
.eq-bar:nth-child(6) { animation: eqBar6 1.3s ease-in-out infinite; }
.eq-bar:nth-child(7) { animation: eqBar7 1.0s ease-in-out infinite; }
.eq-bar:nth-child(8) { animation: eqBar1 0.7s ease-in-out infinite; }
.eq-bar:nth-child(9) { animation: eqBar3 1.1s ease-in-out infinite; }
.eq-bar:nth-child(10) { animation: eqBar5 0.9s ease-in-out infinite; }
.eq-bar:nth-child(11) { animation: eqBar2 1.2s ease-in-out infinite; }
.eq-bar:nth-child(12) { animation: eqBar4 0.8s ease-in-out infinite; }
.eq-bar:nth-child(13) { animation: eqBar6 1.0s ease-in-out infinite; }
.eq-bar:nth-child(14) { animation: eqBar1 1.1s ease-in-out infinite; }
.eq-bar:nth-child(15) { animation: eqBar7 0.9s ease-in-out infinite; }
.eq-bar:nth-child(16) { animation: eqBar3 1.3s ease-in-out infinite; }
.eq-bar:nth-child(17) { animation: eqBar5 1.0s ease-in-out infinite; }
.eq-bar:nth-child(18) { animation: eqBar2 0.8s ease-in-out infinite; }
.eq-bar:nth-child(19) { animation: eqBar4 1.2s ease-in-out infinite; }
.eq-bar:nth-child(20) { animation: eqBar6 0.7s ease-in-out infinite; }

.hero-title {
    font-size: 3rem;
    font-weight: 700;
    line-height: 1.1;
    margin: 0;
    animation: fadeInUp 0.8s ease-out;
}

.hero-title-accent {
    font-size: 3rem;
    font-weight: 700;
    background: linear-gradient(135deg, #c54ee9, #8b5cf6, #6366f1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    animation: fadeInUp 0.8s ease-out 0.2s both;
}

.hero-sub {
    font-size: 1.15rem;
    color: rgba(224,224,232,0.7);
    max-width: 550px;
    margin: 1.5rem auto 0;
    line-height: 1.6;
    animation: fadeInUp 0.8s ease-out 0.4s both;
}

/* Mobile hero */
@media (max-width: 768px) {
    .hero-title, .hero-title-accent { font-size: 2rem; }
    .hero-sub { font-size: 1rem; }
    .eq-container { gap: 4px; height: 60px; }
    .eq-bar { width: 3px; }
}
</style>

<div class="hero-wrapper">
    <div class="eq-container">
        <div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div>
        <div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div>
        <div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div>
        <div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div>
        <div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div>
        <div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div>
        <div class="eq-bar"></div><div class="eq-bar"></div>
    </div>
    <h1 class="hero-title">Great sound,</h1>
    <h1 class="hero-title-accent">greater memories.</h1>
    <p class="hero-sub">
        We provide tailored audio-visual service to make your event truly unforgettable. 
        Audio is the heartbeat of a live event.
    </p>
</div>
""", unsafe_allow_html=True)

# CTA button
c1, c2, c3 = st.columns([1, 1, 1])
with c2:
    if st.button("View rental catalog", type="primary", icon=":material/search:", use_container_width=True):
        st.switch_page("app_pages/browse.py")

# ── About ────────────────────────────────────────────────────
st.divider()

c1, c2 = st.columns(2, gap="large", vertical_alignment="center")

with c1:
    st.subheader("About us")
    st.markdown("### We take your event to the next level.")
    st.markdown("""
    Our method focuses on precision, reliability, and delivering the highest quality audio-visual experience. 
    Whether it's an intimate gathering or a massive community festival, good sound creates great moments.
    """)
with c2:
    st.image("https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
             caption="Live sound engineering")

# ── Services ─────────────────────────────────────────────────
st.divider()

st.markdown("""
<h2 style="text-align:center; margin-bottom: 0.5rem;">Our services</h2>
<p style="text-align:center; color: rgba(224,224,232,0.5); margin-bottom: 2rem;">Everything you need for your event under one roof</p>
""", unsafe_allow_html=True)

s1, s2, s3, s4 = st.columns(4)

with s1:
    with st.container(border=True):
        st.markdown("### :material/speaker: Sound & DJ")
        st.caption("Weddings, Quinceañeras, Corporate Events, Parties")

with s2:
    with st.container(border=True):
        st.markdown("### :material/lightbulb: Lighting")
        st.caption("Uplighting, Moving Heads, Lasers, LED Walls")

with s3:
    with st.container(border=True):
        st.markdown("### :material/photo_camera: Photo & Video")
        st.caption("Event Coverage, 360 Booths, Live Streaming")

with s4:
    with st.container(border=True):
        st.markdown("### :material/tv: Stage & Screens")
        st.caption("LED Screens, Trussing, Stage Setups, Backdrops")

# ── Past Events ──────────────────────────────────────────────
st.divider()

st.markdown("""
<h2 style="text-align:center; margin-bottom: 0.5rem;">Past events</h2>
<p style="text-align:center; color: rgba(224,224,232,0.5); margin-bottom: 2rem;">Trusted by organizations across Los Angeles</p>
""", unsafe_allow_html=True)

e1, e2, e3, e4 = st.columns(4)

with e1:
    with st.container(border=True):
        st.badge("December 2025", color="violet")
        st.markdown("**SW Cleanup Inc.**")
        st.caption("Christmas Celebration · Alhambra, CA")

with e2:
    with st.container(border=True):
        st.badge("August 2025", color="blue")
        st.markdown("**LAPD Hollenbeck**")
        st.caption("National Night Out · Boyle Heights, CA")

with e3:
    with st.container(border=True):
        st.badge("June 2024", color="green")
        st.markdown("**Black In Mayberry**")
        st.caption("Juneteenth Festival · El Segundo, CA")

with e4:
    with st.container(border=True):
        st.badge("May 2026", color="orange")
        st.markdown("**St John the Baptist**")
        st.caption("Parish Festival · Baldwin Park, CA")

# ── CTA ──────────────────────────────────────────────────────
st.divider()

st.markdown("""
<div style="text-align:center; padding: 2rem 0;">
    <h2 style="margin-bottom: 0.5rem;">Ready to book?</h2>
    <p style="color: rgba(224,224,232,0.5);">Browse our catalog, build your package, and request a quote in minutes.</p>
</div>
""", unsafe_allow_html=True)

cc1, cc2, cc3 = st.columns([1, 2, 1])
with cc2:
    bc1, bc2 = st.columns(2)
    if bc1.button("Browse catalog", type="primary", icon=":material/search:", use_container_width=True):
        st.switch_page("app_pages/browse.py")
    if bc2.button("Contact us", icon=":material/mail:", use_container_width=True):
        st.switch_page("app_pages/contact.py")

# Footer
st.markdown("""
<div style="text-align:center; padding: 3rem 0 1rem; color: rgba(224,224,232,0.3); font-size: 0.85rem;">
    <p>© 2025 DJM Audio Productions LLC · Los Angeles, CA</p>
</div>
""", unsafe_allow_html=True)
