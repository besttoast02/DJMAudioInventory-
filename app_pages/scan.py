import streamlit as st
import db

st.title(":material/qr_code_scanner: Gear Check-in / Check-out")
st.markdown("Scan or type a barcode to check gear in or out.")

# ── Barcode input ────────────────────────────────────────────
barcode = st.text_input(
    "Scan or type barcode",
    placeholder="DJM-PA-0001",
    key="scan_barcode",
    help="Use a barcode scanner or type the code manually"
)

if barcode:
    item = db.get_item_by_barcode(barcode.strip())
    
    if not item:
        st.error(f"No item found with barcode `{barcode}`", icon=":material/error:")
    else:
        with st.container(border=True):
            st.markdown(f"### {item['brand']} {item['name']}")
            st.caption(f"Barcode: `{item['barcode']}` · Category: {item['category']}")
            
            status = item.get("status", "available")
            if status == "available":
                st.badge("Available", color="green")
            elif status == "in_use":
                st.badge("Deployed", color="orange")
            elif status == "damaged":
                st.badge("Damaged", color="red")
            else:
                st.badge(status.title(), color="gray")
            
            st.divider()
            
            c1, c2 = st.columns(2)
            
            if status == "available":
                if c1.button("📤 Check OUT", type="primary", use_container_width=True, key="do_checkout"):
                    db.checkout_item(item["id"])
                    st.success(f"✅ `{item['barcode']}` checked OUT — marked as deployed", icon=":material/output:")
                    st.rerun()
            
            elif status == "in_use":
                if c1.button("📥 Check IN", type="primary", use_container_width=True, key="do_checkin"):
                    db.checkin_item(item["id"])
                    st.success(f"✅ `{item['barcode']}` checked IN — returned to inventory", icon=":material/input:")
                    st.rerun()
            
            # Maintenance quick-log
            if c2.button("🔧 Log Maintenance", use_container_width=True, key="log_maint"):
                st.session_state["maint_item_id"] = item["id"]
                st.session_state["maint_item_name"] = f"{item['brand']} {item['name']}"

            # Show maintenance history
            maint = db.get_maintenance_for_item(item["id"])
            if maint:
                st.divider()
                st.caption("**Maintenance History:**")
                for m in maint[:5]:
                    st.caption(f"· {m['action']} — {m.get('notes', '')} ({m['created_at'][:10]})")

# ── Maintenance quick-form ───────────────────────────────────
if st.session_state.get("maint_item_id"):
    st.divider()
    st.subheader(f"🔧 Log Maintenance: {st.session_state.get('maint_item_name', '')}")
    with st.form("maint_form", clear_on_submit=True):
        action = st.selectbox("Action", ["Inspection", "Repair", "Cleaning", "Cable replacement", "Firmware update", "Other"])
        notes = st.text_area("Notes", placeholder="Describe the issue or work done...")
        cost = st.number_input("Cost ($)", min_value=0.0, value=0.0, step=5.0)
        
        if st.form_submit_button("Log", type="primary", icon=":material/build:"):
            db.log_maintenance(st.session_state["maint_item_id"], action, notes, cost)
            st.success("Maintenance logged!")
            del st.session_state["maint_item_id"]
            st.rerun()

# ── Recently scanned ─────────────────────────────────────────
st.divider()
st.subheader(":material/history: Recent Check-ins/Outs")
try:
    activity = db.get_recent_activity(limit=10)
    scan_events = [a for a in activity if "check" in a["action"].lower()]
    if scan_events:
        for a in scan_events:
            icon = "📥" if "in" in a["action"].lower() else "📤"
            st.caption(f"{icon} **{a['action']}** — {a.get('detail', '')} · {a['created_at'][:16]}")
    else:
        st.caption("No recent scan activity.")
except Exception:
    st.caption("Activity log not yet initialized.")
