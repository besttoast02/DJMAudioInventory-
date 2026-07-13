import streamlit as st

st.title("Contact Us")
st.markdown("Have a question about an upcoming event? Send us a message and we'll get back to you shortly.")

with st.form("contact_form", border=True):
    name = st.text_input("Name *")
    email = st.text_input("Email address *")
    phone = st.text_input("Phone number")
    
    event_type = st.selectbox("What type of event are you planning?", [
        "Wedding / Quinceañera",
        "Corporate / Nonprofit Event",
        "City / Community Event",
        "Festival / Concert",
        "Other"
    ])
    
    message = st.text_area("How can we help? *", height=150)
    
    submitted = st.form_submit_button("Send Message", type="primary", use_container_width=True)
    
    if submitted:
        if not name or not email or not message:
            st.error("Please fill out all required fields (Name, Email, Message).", icon="⚠️")
        else:
            st.success("Message sent! We'll be in touch soon.", icon="✅")
            st.balloons()

st.divider()

c1, c2 = st.columns(2)
with c1:
    st.markdown("### Location")
    st.markdown("Los Angeles, CA & Surrounding Areas")
with c2:
    st.markdown("### Contact Info")
    st.markdown("📧 rentals@djmaudio.com")
    # You can update the email address and add a phone number here later
