import streamlit as st
import db
from datetime import date, timedelta

st.title(":material/send: Request a rental")
st.markdown("Fill out the form below and we'll get back to you with availability and a quote.")

with st.form("public_rental_request", border=True):
    st.subheader("Your info")
    rc1, rc2 = st.columns(2)
    client_name = rc1.text_input("Your name", placeholder="John Doe")
    client_phone = rc2.text_input("Phone number", placeholder="(555) 123-4567")

    st.space("small")
    st.subheader("Event details")
    rc3, rc4 = st.columns(2)
    event_name = rc3.text_input("Event name", placeholder="Wedding reception, birthday party, corporate event…")
    venue = rc4.text_input("Venue / location", placeholder="Hotel ballroom, community center, outdoor venue…")
    rc5, rc6 = st.columns(2)
    event_date = rc5.date_input("Event date", value=date.today() + timedelta(days=7))
    return_date = rc6.date_input("Return date", value=date.today() + timedelta(days=9))

    st.space("small")
    st.subheader("What do you need?")
    notes = st.text_area(
        "Describe the gear you need",
        placeholder="Example: PA system for 200 people, 2 wireless mics, DJ setup, 4 moving head lights…",
        height=120,
    )

    st.space("small")
    submitted = st.form_submit_button("Submit request", icon=":material/send:", type="primary")

    if submitted:
        if not client_name or not event_name:
            st.error("Please fill in your name and event name.", icon=":material/error:")
        else:
            db.create_rental(
                event_name=event_name,
                client_name=client_name,
                client_phone=client_phone,
                event_date=str(event_date),
                return_date=str(return_date),
                venue=venue,
                notes=notes,
            )
            st.success(
                "Request submitted! We'll review it and get back to you soon.",
                icon=":material/check_circle:"
            )
            st.balloons()
