import streamlit as st
import db
from datetime import date, timedelta

st.title(":material/dashboard: Dashboard")

# ── Stats ────────────────────────────────────────────────────
counts = db.get_item_count()
pending = db.get_rentals_by_status("pending")
approved = db.get_rentals_by_status("approved")

c1, c2 = st.columns(2)
c1.metric("Total gear", counts["total"], help="Individual tracked items")
c2.metric("Available", counts["available"])
c3, c4 = st.columns(2)
c3.metric("In use", counts["in_use"])
c4.metric("Pending requests", len(pending))

# ── Seed button (first run) ─────────────────────────────────
if counts["total"] == 0:
    st.space("medium")
    st.warning("Your inventory is empty.", icon=":material/inventory_2:")
    st.markdown("Click below to load your full gear inventory from the data file.")
    if st.button("Seed inventory from JSON", icon=":material/upload:", type="primary"):
        with st.spinner("Creating individual items with barcodes…"):
            n = db.seed_from_json("inventory_data.json")
        st.success(f"Created **{n}** items with unique barcodes!", icon=":material/check_circle:")
        st.rerun()

# ── Quick actions ────────────────────────────────────────────
st.space("medium")
st.subheader(":material/bolt: Quick actions")
qa1, qa2, qa3 = st.columns(3)
if qa1.button("Edit Inventory", icon=":material/edit:", use_container_width=True):
    st.switch_page("app_pages/inventory.py")
if qa2.button("View Rentals", icon=":material/event:", use_container_width=True):
    st.switch_page("app_pages/rentals.py")
if qa3.button("View Calendar", icon=":material/calendar_month:", use_container_width=True):
    st.switch_page("app_pages/calendar_view.py")

# ── Pending requests ─────────────────────────────────────────
if pending:
    st.space("medium")
    st.subheader(f":material/pending: Pending requests ({len(pending)})")
    for r in pending:
        with st.container(border=True):
            st.markdown(f"**{r['event_name']}**")
            st.caption(f"{r['client_name']} · :material/calendar_today: {r['event_date']} · :material/location_on: {r.get('venue', 'TBD')}")
            st.page_link("app_pages/rentals.py", label="Review →", icon=":material/arrow_forward:")

# ── Active rentals ───────────────────────────────────────────
if approved:
    st.space("medium")
    st.subheader(f":material/event_available: Active rentals ({len(approved)})")
    for r in approved:
        with st.container(border=True):
            ri = db.get_rental_items(r["id"])
            st.markdown(f"**{r['event_name']}**")
            st.caption(f"{r['client_name']} · :material/calendar_today: {r['event_date']} · :material/location_on: {r.get('venue', 'TBD')} · {len(ri)} items")

# ── Quick status breakdown by category ───────────────────────
st.space("medium")
st.subheader(":material/pie_chart: Inventory by category")
items = db.get_all_items()
if items:
    cat_data = {}
    for item in items:
        cat = item["category"]
        if cat not in cat_data:
            cat_data[cat] = {"available": 0, "in_use": 0, "damaged": 0, "lost": 0}
        s = item["status"]
        if s in cat_data[cat]:
            cat_data[cat][s] += 1

    import pandas as pd
    df = pd.DataFrame([
        {"Category": cat, "Available": v["available"], "In use": v["in_use"],
         "Damaged": v["damaged"], "Lost": v["lost"]}
        for cat, v in sorted(cat_data.items())
    ])
    st.dataframe(df, width="stretch", hide_index=True)
