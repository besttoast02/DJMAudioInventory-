import streamlit as st

# ── Hero Section ─────────────────────────────────────────────
st.markdown("""
<style>
.hero-wrapper {
    text-align: center;
    padding: 3rem 1rem 1rem;
}
.hero-title {
    font-size: 3.2rem;
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 1rem;
}
.hero-sub {
    font-size: 1.2rem;
    color: rgba(224,224,232,0.8);
    max-width: 600px;
    margin: 0 auto 2rem;
    line-height: 1.5;
}
.hero-image-container {
    border-radius: 12px;
    overflow: hidden;
    margin-top: 2rem;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    border: 1px solid rgba(197,78,233,0.1);
}
.hero-image-container img {
    width: 100%;
    height: auto;
    object-fit: cover;
    max-height: 450px;
}
</style>

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

# Hero Image
st.markdown("""
<div class="hero-image-container">
    <img src="https://images.unsplash.com/photo-1516280440502-869d80d26987?auto=format&fit=crop&w=1200&q=80" alt="Live Event Rig" />
</div>
""", unsafe_allow_html=True)

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
st.markdown("""
<div style="text-align:center; padding: 3rem 0 1rem; color: rgba(224,224,232,0.5); font-size: 0.85rem;">
    <strong>DJM Audio Productions LLC</strong><br/>
    Los Angeles, CA · (555) 123-4567<br/><br/>
    <span style="opacity: 0.6;">© 2025 DJM Audio Productions LLC</span>
</div>
""", unsafe_allow_html=True)
