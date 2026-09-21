import streamlit as st
import streamlit.components.v1 as components

st.markdown("""
<style>
/* 1. Prevent outer page / document overflow strictly on desktop when 3D Builder is active */
@media (min-width: 769px) {
    html:has(.builder-header-bar),
    body:has(.builder-header-bar),
    [data-testid="stAppViewContainer"]:has(.builder-header-bar),
    section.main:has(.builder-header-bar),
    [data-testid="stMain"]:has(.builder-header-bar) {
        overflow: hidden !important;
        height: 100vh !important;
        max-height: 100vh !important;
    }

    [data-testid="stMainBlockContainer"]:has(.builder-header-bar),
    .main .block-container:has(.builder-header-bar) {
        padding-top: 0.25rem !important;
        padding-bottom: 0.25rem !important;
        padding-left: 0.75rem !important;
        padding-right: 0.75rem !important;
        max-width: 100% !important;
        height: calc(100vh - 3.2rem) !important;
        max-height: calc(100vh - 3.2rem) !important;
        display: flex !important;
        flex-direction: column !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
    }

    [data-testid="stMainBlockContainer"]:has(.builder-header-bar) [data-testid="stCustomComponentV1"],
    [data-testid="stMainBlockContainer"]:has(.builder-header-bar) div:has([data-testid="stCustomComponentV1"]) {
        flex: 1 1 auto !important;
        height: calc(100vh - 6.2rem) !important;
        min-height: 0 !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
    }
}

/* 2. Sleek header bar */
.builder-header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2px 4px 6px 4px;
    flex: 0 0 auto;
    flex-wrap: wrap;
    gap: 8px;
}

.builder-header-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: #f1f5f9;
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
}

.builder-header-gradient {
    background: linear-gradient(135deg, #c084fc, #60a5fa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.builder-header-sub {
    font-size: 0.82rem;
    color: #94a3b8;
    margin-left: 6px;
    font-weight: 400;
}

.builder-fullscreen-btn {
    font-size: 0.82rem;
    font-weight: 600;
    color: #c084fc !important;
    text-decoration: none !important;
    padding: 6px 14px;
    border: 1px solid rgba(192, 132, 252, 0.4);
    border-radius: 8px;
    background: rgba(192, 132, 252, 0.1);
    transition: all 0.2s ease;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.builder-fullscreen-btn:hover {
    background: rgba(192, 132, 252, 0.25);
    border-color: #c084fc;
    box-shadow: 0 0 12px rgba(192, 132, 252, 0.35);
}

.builder-mobile-hint {
    display: none;
    font-size: 0.75rem;
    color: #a855f7;
    background: rgba(168, 85, 247, 0.08);
    border: 1px solid rgba(168, 85, 247, 0.2);
    border-radius: 6px;
    padding: 4px 8px;
    width: 100%;
    margin-bottom: 4px;
}

[data-testid="stMainBlockContainer"]:has(.builder-header-bar) iframe {
    height: 100% !important;
    min-height: 100% !important;
    width: 100% !important;
    border: 1px solid rgba(197, 78, 233, 0.35) !important;
    border-radius: 10px !important;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35) !important;
}

/* 3. Mobile responsiveness */
@media (max-width: 768px) {
    .builder-header-sub {
        display: none !important;
    }
    .builder-mobile-hint {
        display: block !important;
    }
    [data-testid="stMainBlockContainer"]:has(.builder-header-bar) {
        padding-left: 0.25rem !important;
        padding-right: 0.25rem !important;
        height: auto !important;
        max-height: none !important;
    }
    [data-testid="stMainBlockContainer"]:has(.builder-header-bar) [data-testid="stCustomComponentV1"],
    [data-testid="stMainBlockContainer"]:has(.builder-header-bar) div:has([data-testid="stCustomComponentV1"]) {
        height: 82vh !important;
        min-height: 600px !important;
        overflow: auto !important;
        -webkit-overflow-scrolling: touch !important;
    }
}
</style>

<div class="builder-header-bar">
    <div class="builder-header-title">
        <span>🧊 <span class="builder-header-gradient">3D Setup Builder</span></span>
        <span class="builder-header-sub">— Interactive audio, lighting & stage designer</span>
    </div>
    <a class="builder-fullscreen-btn" href="https://djmaudio-builder.onrender.com" target="_blank" rel="noopener noreferrer">
        ↗ Open Fullscreen (Best on Mobile)
    </a>
    <div class="builder-mobile-hint">
        💡 <strong>Mobile tip:</strong> Touch & drag to rotate 3D stage • Scroll inside window for equipment controls & instant quote
    </div>
</div>
""", unsafe_allow_html=True)

# Embed with scrolling enabled so full content is accessible
components.iframe(
    "https://djmaudio-builder.onrender.com",
    height=850,
    scrolling=True
)
