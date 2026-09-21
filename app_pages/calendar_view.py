import streamlit as st
import db
import pandas as pd
from datetime import datetime

st.title(":material/calendar_month: Event Calendar")

active_rentals = db.get_rentals_by_status("approved")

if not active_rentals:
    st.info("No upcoming active events. Check your pending requests.", icon=":material/info:")
    st.stop()

# Convert to dataframe for timeline
data = []
for r in active_rentals:
    data.append({
        "Event": r['event_name'],
        "Client": r['client_name'],
        "Start": pd.to_datetime(r['event_date']),
        "End": pd.to_datetime(r.get('return_date', r['event_date'])),
        "Venue": r.get('venue', 'TBD'),
        "Status": "Upcoming" if pd.to_datetime(r['event_date']).date() >= datetime.today().date() else "Ongoing/Past"
    })

df = pd.DataFrame(data)
df = df.sort_values(by="Start")

st.markdown("### Upcoming Schedule")

for _, row in df.iterrows():
    color = "blue" if row["Status"] == "Upcoming" else "gray"
    with st.container(border=True):
        c1, c2 = st.columns([1, 4])
        with c1:
            st.markdown(f"**{row['Start'].strftime('%b %d')}**")
            if row['Start'] != row['End']:
                st.caption(f"to {row['End'].strftime('%b %d')}")
        with c2:
            st.markdown(f"#### {row['Event']}")
            st.markdown(f":material/person: {row['Client']} | :material/location_on: {row['Venue']}")

st.divider()
st.markdown("### Grid View")
st.dataframe(
    df,
    column_config={
        "Start": st.column_config.DateColumn("Start Date", format="MMM DD, YYYY"),
        "End": st.column_config.DateColumn("Return Date", format="MMM DD, YYYY")
    },
    hide_index=True,
    use_container_width=True
)
