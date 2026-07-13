import streamlit as st
import db
from datetime import date, timedelta

st.title(":material/send: Request a rental")
st.markdown("Fill out the form below and we'll get back to you with availability and a quote.")

# ── Fetch available add-ons for the checklist ────────────────
all_items = db.get_available_items()
addons = [i for i in all_items if not i.get("rentable", True)]

# Group add-ons by category
addon_grouped = {}
for i in addons:
    key = f"{i['category']}|{i['name']}"
    if key not in addon_grouped:
        addon_grouped[key] = {"name": i["name"], "category": i["category"], "qty": 0}
    addon_grouped[key]["qty"] += 1

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

    # ── Optional add-ons ─────────────────────────────────────
    if addon_grouped:
        st.space("small")
        st.subheader(":material/extension: Optional add-ons")
        st.caption("Select any cables, stands, or accessories you'd like included.")

        addon_by_cat = {}
        for key, info in addon_grouped.items():
            cat = info["category"]
            if cat not in addon_by_cat:
                addon_by_cat[cat] = []
            addon_by_cat[cat].append(info)

        selected_addons = []
        for cat in sorted(addon_by_cat.keys()):
            items_in_cat = sorted(addon_by_cat[cat], key=lambda x: x["name"])
            options = [f"{info['name']} ({info['qty']} avail)" for info in items_in_cat]
            chosen = st.multiselect(cat, options, key=f"addon_{cat}")
            selected_addons.extend(chosen)

    st.space("small")
    submitted = st.form_submit_button("Submit request", icon=":material/send:", type="primary")

    if submitted:
        if not client_name or not event_name:
            st.error("Please fill in your name and event name.", icon=":material/error:")
        else:
            # Append selected add-ons to notes
            full_notes = notes
            if selected_addons:
                addon_text = "\n\nRequested add-ons:\n" + "\n".join(f"• {a}" for a in selected_addons)
                full_notes = notes + addon_text

            db.create_rental(
                event_name=event_name,
                client_name=client_name,
                client_phone=client_phone,
                event_date=str(event_date),
                return_date=str(return_date),
                venue=venue,
                notes=full_notes,
            )
            st.success(
                "Request submitted! We'll review it and get back to you soon.",
                icon=":material/check_circle:"
            )
            st.balloons()
