import streamlit as st
import db
import pandas as pd

st.title(":material/build: Maintenance Log")

tab_log, tab_add = st.tabs(["History", "Log New"])

# ── History ──────────────────────────────────────────────────
with tab_log:
    try:
        logs = db.get_all_maintenance()
    except Exception:
        logs = []
        st.info("Run the SQL to create the maintenance_log table first.")
    
    if logs:
        for m in logs:
            item = m.get("items", {})
            with st.container(border=True):
                c1, c2 = st.columns([3, 1])
                c1.markdown(f"**{item.get('brand', '')} {item.get('name', '')}**")
                c1.caption(f"`{item.get('barcode', '')}` · {m['action']}")
                if m.get("notes"):
                    c1.caption(m["notes"])
                c2.caption(m["created_at"][:10])
                if m.get("cost") and float(m["cost"]) > 0:
                    c2.badge(f"${float(m['cost']):.0f}", color="red")
        
        # Summary stats
        st.divider()
        total_cost = sum(float(m.get("cost") or 0) for m in logs)
        st.metric("Total maintenance cost", f"${total_cost:,.0f}")
    else:
        st.info("No maintenance records yet. Use the scan page or log one below.")

# ── Add new ──────────────────────────────────────────────────
with tab_add:
    items = db.get_all_items()
    if not items:
        st.info("No items in inventory.")
        st.stop()
    
    item_options = {f"{i['barcode']} — {i['brand']} {i['name']}": i["id"] for i in items}
    
    with st.form("maint_add_form", clear_on_submit=True):
        selected = st.selectbox("Select item", list(item_options.keys()))
        action = st.selectbox("Action", ["Inspection", "Repair", "Cleaning", "Cable replacement", "Firmware update", "Damage assessment", "Other"])
        notes = st.text_area("Notes", placeholder="Describe the work done or issue found...")
        cost = st.number_input("Cost ($)", min_value=0.0, value=0.0, step=5.0)
        
        if st.form_submit_button("Log Maintenance", type="primary", icon=":material/build:"):
            db.log_maintenance(item_options[selected], action, notes, cost)
            db.log_activity("Maintenance logged", f"{action} on {selected.split(' — ')[1]}")
            st.success("Logged!")
            st.rerun()
