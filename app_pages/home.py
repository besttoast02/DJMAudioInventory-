import streamlit as st

# ── Hero Section ─────────────────────────────────────────────
st.markdown("""
<style>
[data-testid="stHeader"] {
    background: rgba(10, 10, 15, 0.5) !important;
    backdrop-filter: blur(10px);
}

/* ── NAV GRID CARDS ── */
.nav-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin: 0 0 2.5rem;
}
@media (max-width: 900px) {
    .nav-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 500px) {
    .nav-grid { grid-template-columns: 1fr 1fr; gap: 0.6rem; }
    .hero-title { font-size: 2rem !important; }
    .hero-sub   { font-size: 1rem !important; }
}

.nav-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1.4rem 1rem;
    border-radius: 16px;
    border: 1px solid rgba(197,78,233,0.2);
    background: rgba(18,18,26,0.82);
    cursor: pointer;
    transition: all 0.22s ease;
    text-decoration: none;
    color: inherit;
}
.nav-card:hover {
    border-color: rgba(217,70,239,0.5);
    background: rgba(197,78,233,0.08);
    transform: translateY(-3px);
    box-shadow: 0 8px 28px rgba(217,70,239,0.18), 0 2px 8px rgba(0,0,0,0.4);
}
.nav-card-icon {
    font-size: 2rem;
    line-height: 1;
}
.nav-card-label {
    font-weight: 600;
    font-size: 0.95rem;
    color: #e0e0e8;
    text-align: center;
}
.nav-card-desc {
    font-size: 0.78rem;
    color: rgba(224,224,232,0.5);
    text-align: center;
    line-height: 1.4;
}

/* ── HERO ── */
.hero-wrapper {
    text-align: center;
    padding: 3rem 2rem 2rem;
    background: rgba(10,10,15,0.75);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-radius: 24px;
    border: 1px solid rgba(255,255,255,0.08);
    max-width: 860px;
    margin: 2rem auto 2.5rem;
    box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 40px rgba(217,70,239,0.15);
}
.hero-title {
    font-size: 3.2rem;
    font-weight: 800;
    line-height: 1.15;
    margin-bottom: 1rem;
    color: #ffffff;
    text-shadow: 0 4px 15px rgba(0,0,0,1);
}
.hero-sub {
    font-size: 1.2rem;
    color: rgba(255,255,255,0.9);
    max-width: 620px;
    margin: 0 auto 0.5rem;
    line-height: 1.6;
    text-shadow: 0 2px 10px rgba(0,0,0,1);
}

/* ── BG EQ BARS ── */
#bg-eq-home {
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 70vh;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    gap: clamp(2px, 0.5vw, 6px);
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
    padding-bottom: 5vh;
}
#bg-eq-home::after {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: linear-gradient(to bottom, rgba(14,17,23,0.4) 0%, rgba(14,17,23,1) 100%);
    z-index: 1;
}
.heq {
    width: clamp(10px, 2vw, 28px);
    background: linear-gradient(to top, rgba(217,70,239,0.5), rgba(59,130,246,0.9));
    border-radius: 4px 4px 0 0;
    animation: heq-bounce 1s infinite alternate cubic-bezier(0.4,0,0.2,1);
    animation-delay: var(--d);
    height: var(--h);
    will-change: height;
    z-index: 0;
}
@keyframes heq-bounce {
    0%   { height: 10%; }
    100% { height: var(--h); }
}
[data-testid="stMainBlockContainer"] {
    position: relative;
    z-index: 2;
}

/* Mobile: remove blur, slow anim */
@media (max-width: 768px) {
    .hero-wrapper { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
    .heq { animation-duration: 3s !important; }
}
@media (max-width: 480px) {
    #bg-eq-home { display: none !important; }
}
</style>

<div id="bg-eq-home">
    <div class="heq" style="--d:1.49s;--h:35%"></div>
    <div class="heq" style="--d:0.31s;--h:84%"></div>
    <div class="heq" style="--d:0.79s;--h:43%"></div>
    <div class="heq" style="--d:0.40s;--h:45%"></div>
    <div class="heq" style="--d:0.95s;--h:77%"></div>
    <div class="heq" style="--d:1.37s;--h:38%"></div>
    <div class="heq" style="--d:1.18s;--h:84%"></div>
    <div class="heq" style="--d:0.79s;--h:58%"></div>
    <div class="heq" style="--d:1.36s;--h:81%"></div>
    <div class="heq" style="--d:0.38s;--h:34%"></div>
    <div class="heq" style="--d:0.95s;--h:66%"></div>
    <div class="heq" style="--d:0.53s;--h:78%"></div>
    <div class="heq" style="--d:1.23s;--h:55%"></div>
    <div class="heq" style="--d:1.25s;--h:69%"></div>
    <div class="heq" style="--d:0.17s;--h:35%"></div>
    <div class="heq" style="--d:1.10s;--h:63%"></div>
    <div class="heq" style="--d:1.45s;--h:84%"></div>
    <div class="heq" style="--d:1.38s;--h:48%"></div>
    <div class="heq" style="--d:1.17s;--h:77%"></div>
    <div class="heq" style="--d:0.15s;--h:49%"></div>
</div>

<div class="hero-wrapper">
    <h1 class="hero-title">Pro Audio & Lighting Rental<br>for Live Events in LA.</h1>
    <p class="hero-sub">
        Quality gear, reliable delivery, and on-site engineering — wherever your event takes you.
    </p>
</div>
""", unsafe_allow_html=True)

# ── Primary CTA ─────────────────────────────────────────────
hc1, hc2, hc3 = st.columns([1, 1, 1])
with hc2:
    if st.button("Browse Gear →", type="primary", use_container_width=True, key="hero_browse_btn"):
        st.switch_page("app_pages/browse.py")

st.markdown("<div style='height:2rem'></div>", unsafe_allow_html=True)
st.divider()

# ── Navigation Grid ─────────────────────────────────────────
st.markdown("""
<h2 style="text-align:center; margin-bottom:0.4rem;">Everything we offer</h2>
<p style="text-align:center; color:rgba(224,224,232,0.5); margin-bottom:1.8rem;">
    Tap any section to explore
</p>

<style>
  .glass-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 1rem;
  }
  @media (max-width: 900px) {
    .glass-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 500px) {
    .glass-grid { grid-template-columns: 1fr; }
  }
  .glass-card {
    background: linear-gradient(135deg,
      rgba(255,255,255,0.10) 0%,
      rgba(255,255,255,0.04) 100%);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.18);
    border-radius: 18px;
    padding: 1.5rem 1.4rem 1.3rem;
    cursor: pointer;
    transition: transform 0.22s ease, box-shadow 0.22s ease,
                background 0.22s ease, border-color 0.22s ease;
    box-shadow: 0 4px 28px rgba(0,0,0,0.28),
                inset 0 1px 0 rgba(255,255,255,0.18);
    text-decoration: none;
    display: block;
    position: relative;
    overflow: hidden;
  }
  .glass-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 40%;
    background: linear-gradient(180deg,
      rgba(255,255,255,0.09) 0%,
      rgba(255,255,255,0) 100%);
    border-radius: 18px 18px 0 0;
    pointer-events: none;
  }
  .glass-card:hover {
    transform: translateY(-5px) scale(1.02);
    background: linear-gradient(135deg,
      rgba(160,100,255,0.22) 0%,
      rgba(255,255,255,0.08) 100%);
    border-color: rgba(160,100,255,0.55);
    box-shadow: 0 12px 40px rgba(130,60,255,0.30),
                0 0 0 1px rgba(160,100,255,0.3),
                inset 0 1px 0 rgba(255,255,255,0.22);
  }
  .glass-card:active {
    transform: translateY(-2px) scale(1.005);
  }
  .glass-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    display: block;
  }
  .glass-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: rgba(255,255,255,0.95);
    margin: 0 0 0.45rem;
    letter-spacing: -0.01em;
  }
  .glass-desc {
    font-size: 0.82rem;
    color: rgba(200,200,220,0.70);
    line-height: 1.5;
    margin: 0;
  }
  .glass-arrow {
    display: inline-block;
    margin-top: 1.1rem;
    font-size: 0.82rem;
    font-weight: 600;
    color: rgba(180,140,255,0.90);
    letter-spacing: 0.02em;
  }
</style>

<div class="glass-grid">
  <a class="glass-card" href="?page=dj_services">
    <span class="glass-icon">🎧</span>
    <p class="glass-title">DJ Services</p>
    <p class="glass-desc">Full DJ packages, MC services, and sound production for any event.</p>
    <span class="glass-arrow">Explore →</span>
  </a>
  <a class="glass-card" href="?page=live_audio">
    <span class="glass-icon">🎙️</span>
    <p class="glass-title">Live Audio</p>
    <p class="glass-desc">PA systems, microphones, mixers, and stage sound for live performances.</p>
    <span class="glass-arrow">Explore →</span>
  </a>
  <a class="glass-card" href="?page=packages">
    <span class="glass-icon">🎉</span>
    <p class="glass-title">Packages</p>
    <p class="glass-desc">Curated bundles for weddings, parties, corporate, and festivals.</p>
    <span class="glass-arrow">Explore →</span>
  </a>
  <a class="glass-card" href="?page=extras">
    <span class="glass-icon">✨</span>
    <p class="glass-title">Extras</p>
    <p class="glass-desc">Add-ons: lighting, uplighting, fog, truss, and specialty effects.</p>
    <span class="glass-arrow">Explore →</span>
  </a>
  <a class="glass-card" href="?page=rentals">
    <span class="glass-icon">🔍</span>
    <p class="glass-title">Rentals</p>
    <p class="glass-desc">Browse individual gear by category — speakers, mics, lighting, and more.</p>
    <span class="glass-arrow">Explore →</span>
  </a>
  <a class="glass-card" href="?page=checkout">
    <span class="glass-icon">🛒</span>
    <p class="glass-title">Checkout</p>
    <p class="glass-desc">Review your cart and submit a rental request with your event details.</p>
    <span class="glass-arrow">Explore →</span>
  </a>
  <a class="glass-card" href="?page=ai">
    <span class="glass-icon">🤖</span>
    <p class="glass-title">AI Assistant</p>
    <p class="glass-desc">Chat with our AI to get gear recommendations for your event type and budget.</p>
    <span class="glass-arrow">Explore →</span>
  </a>
  <a class="glass-card" href="?page=contact">
    <span class="glass-icon">✉️</span>
    <p class="glass-title">Contact</p>
    <p class="glass-desc">Reach out directly with questions, custom requests, or last-minute needs.</p>
    <span class="glass-arrow">Explore →</span>
  </a>
</div>
""", unsafe_allow_html=True)

# Hidden Streamlit buttons — triggered by query param from glass cards
_qp = st.query_params.get("page", "")
if _qp == "dj_services":    st.switch_page("app_pages/dj_services.py")
elif _qp == "live_audio":   st.switch_page("app_pages/live_audio.py")
elif _qp == "packages":     st.switch_page("app_pages/packages.py")
elif _qp == "extras":       st.switch_page("app_pages/extra_services.py")
elif _qp == "rentals":      st.switch_page("app_pages/browse.py")
elif _qp == "checkout":     st.switch_page("app_pages/request.py")
elif _qp == "ai":           st.switch_page("app_pages/ai_assistant.py")
elif _qp == "contact":      st.switch_page("app_pages/contact.py")

st.divider()

# ── How It Works ─────────────────────────────────────────────
st.markdown("""
<h2 style="text-align:center; margin-bottom:2rem;">How it works</h2>
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

# ── Trust & Past Events ──────────────────────────────────────
st.divider()

st.markdown("""
<h2 style="text-align:center; margin-bottom:0.5rem;">Trusted locally</h2>
<p style="text-align:center; color:rgba(224,224,232,0.5); margin-bottom:2rem;">
    We work with organizations across Los Angeles
</p>
""", unsafe_allow_html=True)

e1, e2, e3, e4 = st.columns(4)
with e1:
    with st.container(border=True):
        st.markdown("**St. Louis of France Festival**")
        st.caption("La Puente, CA")
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
<div style="text-align:center; padding:2rem 0 1rem;">
    <h2 style="margin-bottom:1rem;">Ready to start?</h2>
</div>
""", unsafe_allow_html=True)

cc1, cc2, cc3 = st.columns([1, 2, 1])
with cc2:
    if st.button("Start a Rental Request", type="primary", use_container_width=True, key="footer_cta_btn"):
        st.switch_page("app_pages/browse.py")

st.divider()

fc1, fc2, fc3 = st.columns([2, 3, 2])
with fc2:
    st.image("assets/logo.png", width="content")

st.markdown("""
<div style="text-align:center; padding:1rem 0 3rem; color:rgba(255,255,255,0.9);">
    <p style="font-size:2.2rem; margin-top:0.5rem; font-weight:700; text-shadow:0 2px 10px rgba(0,0,0,0.5);">(626) 506-3824</p>
    <p style="font-size:1.4rem; color:#b182ff; font-weight:600;">djmaudio.com</p>
    <br/>
    <span style="opacity:0.5; font-size:0.9rem;">Los Angeles, CA · © 2026 DJM Audio Productions LLC</span>
</div>
""", unsafe_allow_html=True)
