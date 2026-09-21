import streamlit as st
import db

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
            inquiry_body = f"Client: {name}\nEmail: {email}\nPhone: {phone or 'N/A'}\nEvent Type: {event_type}\n\nMessage:\n{message}"
            try:
                db.notify(f"📩 New Website Inquiry: {name}", inquiry_body)
                db.create_rental(
                    event_name=f"Inquiry: {event_type} - {name}",
                    client_name=name,
                    client_phone=phone or "N/A",
                    event_date="TBD",
                    return_date="TBD",
                    venue="TBD",
                    notes=inquiry_body,
                    estimated_cost=0
                )
            except Exception as e:
                print(f"Failed to record contact inquiry: {e}")

            st.success("Message sent! We'll review your details and get back to you shortly.", icon="✅")
            st.balloons()

st.divider()

c1, c2 = st.columns(2)
with c1:
    st.markdown("### Location")
    st.markdown("📍 Los Angeles, CA & Surrounding Areas")
with c2:
    st.markdown("### Contact Info")
    st.markdown("📞 **Phone:** [+1 (626) 506-3824](tel:+16265063824)")
    st.markdown("📧 **Email:** [rentals@djmaudio.com](mailto:rentals@djmaudio.com)")

