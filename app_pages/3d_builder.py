import streamlit as st
import streamlit.components.v1 as components

st.title("🧊 Build Your 3D Setup")
st.markdown("Use our interactive 3D builder to design your perfect audio and lighting setup.")

st.markdown("""
<style>
iframe {
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    width: 100%;
    min-height: 1600px;
    border: 1px solid rgba(197,78,233,0.3);
}
</style>
""", unsafe_allow_html=True)

# Try embedding it directly via iframe
components.html(
    '''
    <iframe src="https://djmaudio-builder.onrender.com" width="100%" height="1600px" frameborder="0"></iframe>
    ''',
    height=1600,
    scrolling=False
)

st.markdown("---")
st.markdown("Having trouble? [Click here to open the 3D Builder in a new tab](https://djmaudio-builder.onrender.com)")
