import streamlit as st

# ── Hero Section with Background Video ───────────────────────
st.markdown("""
<style>
/* Make Streamlit's header transparent so the video shows underneath */
[data-testid="stHeader"] {
    background: rgba(10, 10, 15, 0.5) !important;
    backdrop-filter: blur(10px);
}

/* Background video container fixed to the top */
#bg-video-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 70vh;
    overflow: hidden;
    z-index: 0;
    pointer-events: none;
}
#bg-video-container::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /* Gradient fades from semi-transparent to solid background color to blend with the rest of the page */
    background: linear-gradient(to bottom, rgba(14, 17, 23, 0.5) 0%, rgba(14, 17, 23, 1) 100%);
    z-index: 1;
}
#bg-video-container video {
    min-width: 100%;
    min-height: 100%;
    width: auto;
    height: auto;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    object-fit: cover;
    z-index: 0;
    filter: brightness(0.8);
}

/* Ensure content sits above the video */
[data-testid="stMainBlockContainer"] {
    position: relative;
    z-index: 2;
}

.hero-wrapper {
    text-align: center;
    padding: 6rem 1rem 3rem;
}
.hero-title {
    font-size: 3.5rem;
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 1rem;
    text-shadow: 0 4px 20px rgba(0,0,0,0.8);
}
.hero-sub {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.9);
    max-width: 600px;
    margin: 0 auto 2rem;
    line-height: 1.5;
    text-shadow: 0 2px 10px rgba(0,0,0,0.8);
}
</style>

<div id="bg-video-container">
    <video autoplay loop muted playsinline>
        <source src="https://videos.pexels.com/video-files/3163534/3163534-uhd_2560_1440_30fps.mp4" type="video/mp4">
    </video>
</div>

<div class="hero-wrapper">
    <h1 class="hero-title">Pro Audio Rental for Live Events in LA.</h1>
    <p class="hero-sub">
        Quality gear, reliable delivery, and on-site engineering to make your event sound perfect.
    </p>
</div>
""", unsafe_allow_html=True)

# Primary CTA
hc1, hc2, hc3 = st.columns([1, 1, 1])
with hc2:
    if st.button("Browse Gear", type="primary", use_container_width=True):
        st.switch_page("app_pages/browse.py")

st.markdown("<div style='height: 4rem;'></div>", unsafe_allow_html=True)

# ── How It Works ─────────────────────────────────────────────
st.divider()

st.markdown("""
<h2 style="text-align:center; margin-bottom: 2rem;">How it works</h2>
""", unsafe_allow_html=True)

hw1, hw2, hw3 = st.columns(3)
with hw1:
    with st.container(border=True):
        st.markdown("### 1. Browse gear")
        st.caption("Find the speakers, mics, lighting, or packages you need in our catalog.")
with hw2:
    with st.container(border=True):
        st.markdown("### 2. Submit request")
        st.caption("Add items to your cart, select your dates, and send us your event details.")
with hw3:
    with st.container(border=True):
        st.markdown("### 3. Get confirmation")
        st.caption("We review availability within 24 hours and send you a finalized quote.")


# ── Services ─────────────────────────────────────────────────
st.divider()

st.markdown("""
<h2 style="text-align:center; margin-bottom: 0.5rem;">Our services</h2>
<p style="text-align:center; color: rgba(224,224,232,0.5); margin-bottom: 2rem;">Everything you need for your event under one roof</p>
""", unsafe_allow_html=True)

s1, s2, s3, s4 = st.columns(4)

with s1:
    with st.container(border=True):
        st.markdown("### :material/speaker: Sound")
        st.caption("Weddings, Corporate, Parties")

with s2:
    with st.container(border=True):
        st.markdown("### :material/lightbulb: Lighting")
        st.caption("Uplighting, Moving Heads")

with s3:
    with st.container(border=True):
        st.markdown("### :material/photo_camera: Photo")
        st.caption("Event Coverage, 360 Booths")

with s4:
    with st.container(border=True):
        st.markdown("### :material/tv: Stage")
        st.caption("Trussing, Stage Setups")


# ── Trust & Past Events ──────────────────────────────────────
st.divider()

st.markdown("""
<h2 style="text-align:center; margin-bottom: 0.5rem;">Trusted locally</h2>
<p style="text-align:center; color: rgba(224,224,232,0.5); margin-bottom: 2rem;">We work with organizations across Los Angeles</p>
""", unsafe_allow_html=True)

e1, e2, e3, e4 = st.columns(4)

with e1:
    with st.container(border=True):
        st.markdown("**SW Cleanup Inc.**")
        st.caption("Alhambra, CA")

with e2:
    with st.container(border=True):
        st.markdown("**LAPD Hollenbeck**")
        st.caption("Boyle Heights, CA")

with e3:
    with st.container(border=True):
        st.markdown("**Black In Mayberry**")
        st.caption("El Segundo, CA")

with e4:
    with st.container(border=True):
        st.markdown("**St John the Baptist**")
        st.caption("Baldwin Park, CA")

# ── Footer CTA ───────────────────────────────────────────────
st.divider()

st.markdown("""
<div style="text-align:center; padding: 2rem 0;">
    <h2 style="margin-bottom: 1rem;">Ready to start?</h2>
</div>
""", unsafe_allow_html=True)

cc1, cc2, cc3 = st.columns([1, 2, 1])
with cc2:
    if st.button("Start a Rental Request", type="primary", use_container_width=True):
        st.switch_page("app_pages/browse.py")

# Footer Trust Info
st.divider()

fc1, fc2, fc3 = st.columns([2, 3, 2])
with fc2:
    st.image("assets/logo_dark.png", use_container_width=True)

st.markdown("""
<div style="text-align:center; padding: 1rem 0 3rem; color: rgba(255,255,255,0.9);">
    <p style="font-size: 2.2rem; margin-top: 0.5rem; font-weight: 700; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">(626) 506-3824</p>
    <p style="font-size: 1.4rem; color: #b182ff; font-weight: 600;">djmaudio.com</p>
    <br/>
    <span style="opacity: 0.5; font-size: 0.9rem;">Los Angeles, CA · © 2025 DJM Audio Productions LLC</span>
</div>
""", unsafe_allow_html=True)
