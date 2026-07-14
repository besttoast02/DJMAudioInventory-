import streamlit.components.v1 as components
import os

# Declare the component here via standard import to avoid Streamlit's st.Page exec() module bug
# The path must be absolute or relative to this file
_voice_component = components.declare_component(
    "voice_component",
    path=os.path.join(os.path.dirname(__file__), "assets", "voice_component")
)
