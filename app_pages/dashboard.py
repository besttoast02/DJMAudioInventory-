import streamlit as st
import db
import pandas as pd
import package_config as pkg
from datetime import date, timedelta

st.title(":material/dashboard: Dashboard")

# ── Stats ────────────────────────────────────────────────────
counts = db.get_item_count()
pending = db.get_rentals_by_status("pending")
approved = db.get_rentals_by_status("approved")

c1, c2, c3, c4 = st.columns(4)
c1.metric("Total gear", counts["total"], help="Individual tracked items")
c2.metric("Available", counts["available"])
c3.metric("In use", counts["in_use"])
c4.metric("Pending requests", len(pending), help="Click to review below")

# Clickable shortcut buttons under the metrics
mc1, mc2, mc3, mc4 = st.columns(4)
if mc3.button("→ In use", key="goto_active", use_container_width=True):
    st.session_state["rentals_tab"] = "active"
    st.switch_page("app_pages/rentals.py")
if mc4.button("→ Review requests", key="goto_pending", type="primary", use_container_width=True):
    st.session_state["rentals_tab"] = "pending"
    st.switch_page("app_pages/rentals.py")

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
            col_info, col_btn = st.columns([4, 1])
            col_info.markdown(f"**{r['event_name']}**")
            col_info.caption(f"{r['client_name']} · :material/calendar_today: {r['event_date']} · :material/location_on: {r.get('venue', 'TBD')}")
            if col_btn.button("Review →", key=f"dash_review_{r['id']}", type="primary", use_container_width=True):
                st.session_state["rentals_tab"] = "pending"
                st.switch_page("app_pages/rentals.py")

# ── Active rentals ───────────────────────────────────────────
if approved:
    st.space("medium")
    st.subheader(f":material/event_available: Active rentals ({len(approved)})")
    for r in approved:
        with st.container(border=True):
            ri = db.get_rental_items(r["id"])
            col_info, col_btn = st.columns([4, 1])
            col_info.markdown(f"**{r['event_name']}**")
            col_info.caption(f"{r['client_name']} · :material/calendar_today: {r['event_date']} · :material/location_on: {r.get('venue', 'TBD')} · {len(ri)} items")
            if col_btn.button("Manage →", key=f"dash_active_{r['id']}", use_container_width=True):
                st.session_state["rentals_tab"] = "active"
                st.switch_page("app_pages/rentals.py")

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

    df = pd.DataFrame([
        {"Category": cat, "Available": v["available"], "In use": v["in_use"],
         "Damaged": v["damaged"], "Lost": v["lost"]}
        for cat, v in sorted(cat_data.items())
    ])
    st.dataframe(df, width="stretch", hide_index=True)

# ══════════════════════════════════════════════════════════════
# ADMIN-ONLY: Internal Profit & Depreciation Analysis
# ══════════════════════════════════════════════════════════════
st.divider()
st.subheader(":material/account_balance: Internal — Profit & Depreciation Analysis")
st.caption("⚠️ Admin only — never shown to clients.")

# ── Staff Overview ───────────────────────────────────────────
with st.expander(":material/person: Staff & Hourly Rates", expanded=False):
    for emp_id, staff in pkg.STAFF_RATES.items():
        st.markdown(f"### {staff['name']} ({staff['role'].title()})")
        rate_cols = st.columns(len(staff["rates"]))
        for idx, (role, rate) in enumerate(staff["rates"].items()):
            role_label = role.replace("_", " ").title()
            rate_cols[idx].metric(role_label, f"${rate:.0f}/hr")

# ── Equipment Depreciation Table ─────────────────────────────
with st.expander(":material/trending_down: Equipment Depreciation (per use)", expanded=True):
    # Only physical items with purchase prices
    physical_items = [i for i in items if i["category"] != "Services" and float(i.get("purchase_price", 0) or 0) > 0]

    if physical_items:
        dep_data = []
        for item in physical_items:
            purchase = float(item.get("purchase_price", 0) or 0)
            current = float(item.get("current_value", 0) or 0)
            dep_per_use = pkg.get_depreciation_per_use(item)
            useful_life = pkg.CATEGORY_USEFUL_LIFE.get(item["category"], 200)
            already_depreciated = purchase - current if current > 0 else 0
            estimated_uses_so_far = int(already_depreciated / dep_per_use) if dep_per_use > 0 else 0
            remaining_life = useful_life - estimated_uses_so_far

            dep_data.append({
                "Name": item["name"],
                "Category": item["category"],
                "Purchase": purchase,
                "Current Value": current,
                "$/Use": dep_per_use,
                "Life (uses)": useful_life,
                "Est. Uses": estimated_uses_so_far,
                "Remaining": max(0, remaining_life),
            })

        dep_df = pd.DataFrame(dep_data).sort_values("$/Use", ascending=False)

        # Summary metrics
        dm1, dm2, dm3 = st.columns(3)
        total_purchase = dep_df["Purchase"].sum()
        total_current = dep_df["Current Value"].sum()
        avg_dep_per_use = dep_df["$/Use"].mean()
        dm1.metric("Total Purchase Value", f"${total_purchase:,.0f}")
        dm2.metric("Current Fleet Value", f"${total_current:,.0f}")
        dm3.metric("Avg. Depreciation/Use", f"${avg_dep_per_use:.2f}")

        st.dataframe(
            dep_df.style.format({
                "Purchase": "${:,.0f}",
                "Current Value": "${:,.0f}",
                "$/Use": "${:.2f}",
            }),
            use_container_width=True, hide_index=True, height=400,
        )

        # Category summary
        st.markdown("##### Depreciation by Category (avg $/use)")
        cat_dep = dep_df.groupby("Category").agg(
            Items=("Name", "count"),
            Avg_Dep=("$/Use", "mean"),
            Total_Value=("Purchase", "sum"),
        ).sort_values("Avg_Dep", ascending=False)
        cat_dep.columns = ["Items", "Avg $/Use", "Total Purchase Value"]
        st.dataframe(
            cat_dep.style.format({"Avg $/Use": "${:.2f}", "Total Purchase Value": "${:,.0f}"}),
            use_container_width=True,
        )
    else:
        st.info("No items with purchase prices found. Add purchase prices to track depreciation.")

# ── Profit Calculator ────────────────────────────────────────
with st.expander(":material/calculate: Profit Calculator (per event)", expanded=False):
    st.markdown("Estimate profit for a hypothetical event by selecting services and hours.")

    calc_cols = st.columns(2)
    with calc_cols[0]:
        calc_revenue = st.number_input("Client price (revenue)", min_value=0, value=1500, step=100)
        calc_hours = st.number_input("Hours worked", min_value=1.0, max_value=20.0, value=5.0, step=0.5)

    with calc_cols[1]:
        calc_dj = st.checkbox("DJ services", value=True)
        calc_foh = st.checkbox("FOH Engineer")
        calc_mon = st.checkbox("Monitor Engineer")

    # Build service list
    calc_services = []
    if calc_dj:
        calc_services.append({"barcode": pkg.PKG_DJ_PARTY})
    if calc_foh:
        calc_services.append({"barcode": pkg.SVC_FOH})
    if calc_mon:
        calc_services.append({"barcode": pkg.SVC_MONITOR})

    # Estimate gear depreciation (use average for 15 items as typical event load)
    avg_dep = avg_dep_per_use if physical_items else 5.0
    est_items_used = st.slider("Estimated # of gear items used", 5, 100, 30)
    est_depreciation = avg_dep * est_items_used

    result = pkg.calculate_rental_profit(
        rental_items=[{"category": "PA Systems", "purchase_price": 2000}] * est_items_used,
        service_items=calc_services,
        revenue=calc_revenue,
        labor_hours=calc_hours,
    )

    st.divider()
    pc1, pc2, pc3, pc4 = st.columns(4)
    pc1.metric("Revenue", f"${result['revenue']:,.0f}")
    pc2.metric("Labor Cost", f"${result['labor_cost']:,.0f}")
    pc3.metric("Gear Wear", f"${result['depreciation_cost']:,.0f}")
    profit_color = "normal" if result["profit"] >= 0 else "inverse"
    pc4.metric("Net Profit", f"${result['profit']:,.0f}",
               delta=f"{result['margin_pct']:.0f}% margin")

    if result["labor_breakdown"]:
        st.markdown("**Labor breakdown:**")
        for lb in result["labor_breakdown"]:
            st.caption(f"• {lb['role'].replace('_', ' ').title()}: {lb['hours']}hrs × ${lb['hourly_rate']}/hr = **${lb['total_cost']:,.0f}**")

