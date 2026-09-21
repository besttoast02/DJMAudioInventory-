import streamlit as st
import db
import json
import os
import pandas as pd
from collections import defaultdict

st.title(":material/build: Maintenance & Equipment Manuals")

# ── Load maintenance data ────────────────────────────────────
MAINT_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "maintenance_data.json")
MANUALS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets", "manuals")

try:
    with open(MAINT_FILE, "r") as f:
        maint_data = json.load(f)
except FileNotFoundError:
    maint_data = {}
    st.error("maintenance_data.json not found. Run the maintenance data builder first.")

# ── Map inventory items to maintenance keys ──────────────────
def get_maint_key(item: dict) -> str:
    """Map an inventory item to its maintenance_data key."""
    name = item.get("name", "").lower()
    brand = item.get("brand", "").lower()

    key_map = {
        "sm57": "shure_sm57",
        "beta 58a": "shure_beta58a",
        "pga52": "shure_pga52",
        "pga56": "shure_pga56",
        "pga57": "shure_pga57",
        "pga81": "shure_pga81",
        "i5 dynamic": "audix_i5",
        "d6 kick": "audix_d6",
        "e904": "sennheiser_e904",
        "e906": "sennheiser_e906",
        "sq-5": "allen_heath_sq5",
        "xdj-xz": "pioneer_xdj_xz",
        "ig3t": "dbtechnologies_ingenia_ig3t",
        "srx828sp": "jbl_srx828sp",
        "event 218a": "das_event_218a",
        "dbr15": "yamaha_dbr15",
        "evolve 50": "electro_voice_evolve50",
        "blx24": "shure_blx24_beta58a",
        "qlxd24": "shure_qlxd24_ksm8",
        "vizi beam": "adj_vizi_beam_rxone",
        "dotz flood": "adj_dotz_flood",
        "element hex": "adj_element_hex",
        "wifly exr": "adj_wifly_exr_battery",
        "airstream": "adj_airstream_dmx_bridge",
        "inno pocket": "adj_inno_pocket_z4",
        "fog fury": "chauvet_fog_fury_jett_pro",
        "beam moving head": "joyfirst_beam_moving_head",
        "jdi duplex": "radial_jdi_duplex",
    }

    for pattern, key in key_map.items():
        if pattern in name.lower():
            return key
    return None


# ── Tabs ─────────────────────────────────────────────────────
tab_schedule, tab_items, tab_log, tab_add = st.tabs([
    "📋 Maintenance Schedule", "🔍 Per-Item Info & Manuals", "📜 History", "➕ Log New"
])

# ═══════════════════════════════════════════════════════════════
# TAB 1: Maintenance Schedule (overview by frequency)
# ═══════════════════════════════════════════════════════════════
with tab_schedule:
    st.subheader(":material/schedule: Maintenance Schedule Overview")
    st.caption("Grouped by maintenance frequency — based on manufacturer manuals.")

    # Collect all tasks by frequency
    freq_labels = {
        "after_each_use": "🔁 After Each Use / Event",
        "monthly": "📅 Monthly",
        "quarterly": "📆 Quarterly",
        "replace_when": "⚠️ Replacement Triggers",
    }

    for freq_key, freq_label in freq_labels.items():
        with st.expander(freq_label, expanded=(freq_key == "after_each_use")):
            # Group by category
            by_cat = defaultdict(list)
            for maint_key, data in maint_data.items():
                tasks = data.get("maintenance", {}).get(freq_key, [])
                if tasks:
                    cat = data.get("category", "Other")
                    by_cat[cat].append({
                        "model": f"{data['brand']} {data['model']}",
                        "tasks": tasks,
                    })

            if not by_cat:
                st.caption("No tasks in this category.")
                continue

            for cat in sorted(by_cat.keys()):
                st.markdown(f"**{cat}**")
                for entry in by_cat[cat]:
                    st.markdown(f"*{entry['model']}*")
                    for task in entry["tasks"]:
                        st.checkbox(
                            task,
                            key=f"sched_{freq_key}_{entry['model']}_{task[:30]}",
                            value=False,
                        )
                st.markdown("---")


# ═══════════════════════════════════════════════════════════════
# TAB 2: Per-Item Info & Manuals
# ═══════════════════════════════════════════════════════════════
with tab_items:
    st.subheader(":material/info: Equipment Info & Manuals")

    items = db.get_all_items()
    physical_items = [i for i in items if i["category"] not in ("Services",)]

    # Group by name (deduplicate)
    seen_models = {}
    for item in physical_items:
        key = item["name"]
        if key not in seen_models:
            seen_models[key] = item

    # Category filter
    categories = sorted(set(i["category"] for i in seen_models.values()))
    cat_filter = st.selectbox("Filter by category", ["All"] + categories, key="maint_cat_filter")

    filtered = [
        i for i in seen_models.values()
        if cat_filter == "All" or i["category"] == cat_filter
    ]

    for item in sorted(filtered, key=lambda x: (x["category"], x["name"])):
        maint_key = get_maint_key(item)
        data = maint_data.get(maint_key, {}) if maint_key else {}

        with st.expander(f"**{item['brand']}** {item['name']}  ({item['category']})", expanded=False):
            # Manual links
            if data.get("manual_ref"):
                st.link_button(
                    "📄 View Manufacturer Manual / Product Page",
                    data["manual_ref"],
                    use_container_width=True,
                )

            # Check for downloaded reference file
            if maint_key:
                ref_file = os.path.join(MANUALS_DIR, f"{maint_key}_reference.txt")
                pdf_file = os.path.join(MANUALS_DIR, f"{maint_key}.pdf")

                if os.path.exists(pdf_file):
                    with open(pdf_file, "rb") as f:
                        st.download_button(
                            "⬇️ Download PDF Manual",
                            data=f.read(),
                            file_name=f"{maint_key}.pdf",
                            mime="application/pdf",
                            use_container_width=True,
                        )

            # Maintenance plan
            maint = data.get("maintenance", {})
            if maint:
                st.divider()
                st.markdown("##### 🔧 Maintenance Plan")

                for freq, label in [
                    ("after_each_use", "After Each Use"),
                    ("monthly", "Monthly"),
                    ("quarterly", "Quarterly"),
                    ("replace_when", "⚠️ Replace When"),
                ]:
                    tasks = maint.get(freq, [])
                    if tasks:
                        st.markdown(f"**{label}:**")
                        for task in tasks:
                            if freq == "replace_when":
                                st.warning(f"• {task}")
                            else:
                                st.markdown(f"- {task}")
            else:
                st.info(
                    "No specific maintenance plan available for this item. "
                    "Follow general equipment care guidelines.",
                    icon=":material/info:"
                )


# ═══════════════════════════════════════════════════════════════
# TAB 3: History
# ═══════════════════════════════════════════════════════════════
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
        st.info("No maintenance records yet. Use the 'Log New' tab to start tracking.")


# ═══════════════════════════════════════════════════════════════
# TAB 4: Add new maintenance log
# ═══════════════════════════════════════════════════════════════
with tab_add:
    items = db.get_all_items()
    if not items:
        st.info("No items in inventory.")
        st.stop()

    item_options = {f"{i['barcode']} — {i['brand']} {i['name']}": i["id"] for i in items}

    with st.form("maint_add_form", clear_on_submit=True):
        selected = st.selectbox("Select item", list(item_options.keys()))
        action = st.selectbox("Action", [
            "Inspection", "Cleaning", "Repair", "Cable replacement",
            "Firmware update", "Driver/Lamp replacement", "Reconing",
            "Battery replacement", "Damage assessment", "Full service", "Other"
        ])
        notes = st.text_area("Notes", placeholder="Describe the work done or issue found...")
        cost = st.number_input("Cost ($)", min_value=0.0, value=0.0, step=5.0)

        if st.form_submit_button("Log Maintenance", type="primary", icon=":material/build:"):
            db.log_maintenance(item_options[selected], action, notes, cost)
            db.log_activity("Maintenance logged", f"{action} on {selected.split(' — ')[1]}")
            st.success("Logged!")
            st.rerun()
