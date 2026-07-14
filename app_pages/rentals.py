import streamlit as st
import db
from datetime import datetime

st.title(":material/event: Rentals")

# ── Deep-link: jump to correct tab if coming from dashboard ──
# Other pages set st.session_state["rentals_tab"] = "pending" | "active" | "history"
_default_tab = st.session_state.pop("rentals_tab", "pending")
_tab_index = {"pending": 0, "active": 1, "history": 2, "new": 3}.get(_default_tab, 0)

# ── Tabs ─────────────────────────────────────────────────────
tabs = st.tabs([
    ":material/pending: Pending",
    ":material/event_available: Active",
    ":material/history: History",
    ":material/add: New request",
])
tab_pending, tab_active, tab_history, tab_new = tabs

# ── Pending tab ──────────────────────────────────────────────
with tab_pending:
    pending = db.get_rentals_by_status("pending")
    if not pending:
        st.info("No pending requests.", icon=":material/check_circle:")

    for r in pending:
        with st.container(border=True):
            c1, c2 = st.columns([3, 1])
            with c1:
                st.markdown(f"### {r['event_name']}")
                st.markdown(
                    f":material/person: **{r['client_name']}** · "
                    f":material/phone: {r.get('client_phone', 'N/A')}  \n"
                    f":material/calendar_today: {r['event_date']} → {r.get('return_date', 'TBD')}  \n"
                    f":material/location_on: {r.get('venue', 'TBD')}  \n"
                    f":material/payments: Est. Cost: **${r.get('estimated_cost') or 0:.2f}**"
                )
                if r.get("notes"):
                    st.caption(f"Notes: {r['notes']}")

            with c2:
                st.space("small")

                # ── Approve — inline expander (no popover so widgets work) ──
                with st.expander("✅ Approve", expanded=st.session_state.get(f"expand_approve_{r['id']}", False)):
                    st.markdown("**Select gear to assign:**")
                    available = db.get_available_items()
                    if not available:
                        st.warning("No available items")
                    else:
                        cats = sorted(set(i["category"] for i in available))
                        selected_ids = []
                        for cat in cats:
                            cat_items = [i for i in available if i["category"] == cat]
                            with st.expander(f"{cat} ({len(cat_items)} available)"):
                                for item in cat_items:
                                    if st.checkbox(
                                        f"{item['barcode']} — {item['brand']} {item['name']}",
                                        key=f"approve_{r['id']}_{item['id']}"
                                    ):
                                        selected_ids.append(item["id"])

                        st.divider()
                        final_cost = st.number_input(
                            "Final Approved Cost ($)",
                            value=float(r.get("estimated_cost") or 0.0),
                            key=f"cost_{r['id']}"
                        )
                        if st.button("Confirm approval", key=f"confirm_{r['id']}",
                                     type="primary", icon=":material/gavel:"):
                            if not selected_ids:
                                st.error("Select at least one item")
                            else:
                                db.approve_rental(r["id"], selected_ids)
                                db.set_final_cost(r["id"], final_cost)
                                db.log_activity("Rental approved", f"{r['event_name']} — {r['client_name']} — ${final_cost:.0f}", r["id"])
                                db.notify(
                                    f"✅ Approved: {r['event_name']}",
                                    f"Rental approved for {r['client_name']}\n\nEvent: {r['event_name']}\nDate: {r['event_date']}\nVenue: {r.get('venue', 'TBD')}\nFinal cost: ${final_cost:.0f}\nItems assigned: {len(selected_ids)}"
                                )
                                st.success(f"Approved! {len(selected_ids)} items assigned.", icon=":material/check_circle:")
                                st.rerun()

                if st.button("Reject", key=f"reject_{r['id']}",
                             icon=":material/close:", use_container_width=True):
                    db.cancel_rental(r["id"])
                    db.log_activity("Rental rejected", f"{r['event_name']} — {r['client_name']}", r["id"])
                    st.rerun()

# ── Active tab ───────────────────────────────────────────────
with tab_active:
    active = db.get_rentals_by_status("approved")
    if not active:
        st.info("No active rentals.", icon=":material/check_circle:")
    for r in active:
        with st.container(border=True):
            c1, c2 = st.columns([3, 1])
            with c1:
                st.markdown(f"### {r['event_name']}")
                st.markdown(
                    f":material/person: **{r['client_name']}**  \n"
                    f":material/calendar_today: {r['event_date']} → {r.get('return_date', 'TBD')}  \n"
                    f":material/location_on: {r.get('venue', 'TBD')}  \n"
                    f":material/payments: Final Cost: **${r.get('final_cost') or 0:.2f}**"
                )
                ri = db.get_rental_items(r["id"])
                if ri:
                    st.caption(f"**{len(ri)} items assigned:**")
                    for entry in ri:
                        item = entry.get("items", {})
                        if item:
                            st.caption(f"  · `{item['barcode']}` {item['brand']} {item['name']}")

                with st.expander("Staffing & Labor", icon=":material/engineering:"):
                    employees = db.get_employees()
                    if not employees:
                        st.info("No staff added yet. Add them in the Labor tab.")
                    else:
                        emp_options = {e["id"]: f"{e['name']} ({e['role']})" for e in employees}
                        with st.form(f"assign_form_{r['id']}"):
                            fa1, fa2, fa3 = st.columns(3)
                            emp_sel = fa1.selectbox("Contractor", options=list(emp_options.keys()),
                                                    format_func=lambda x: emp_options[x], key=f"emp_{r['id']}")
                            role_val = fa2.text_input("Role", key=f"role_{r['id']}")
                            hours = fa3.number_input("Hours", min_value=0.25, step=0.25, key=f"hours_{r['id']}")
                            if st.form_submit_button("Assign & log", type="primary"):
                                db.assign_employee(r["id"], emp_sel, role_val)
                                if hours > 0:
                                    db.log_time(r["id"], emp_sel, hours, role_val, str(datetime.now().date()))
                                st.rerun()

                        assignments = db.get_assignments_for_rental(r["id"])
                        if assignments:
                            st.caption("Assigned: " + ", ".join(
                                [f"{a['employees']['name']} ({a['role_for_event']})" for a in assignments]
                            ))

            with c2:
                st.space("small")
                ri_for_pdf = db.get_rental_items(r["id"])
                try:
                    invoice_bytes = db.generate_invoice_pdf(r, ri_for_pdf)
                    st.download_button(
                        "📄 Invoice", data=invoice_bytes,
                        file_name=f"DJM_Invoice_{r['event_name'][:20]}.pdf",
                        mime="application/pdf", key=f"inv_{r['id']}",
                        use_container_width=True
                    )
                except Exception:
                    pass
                try:
                    waiver_bytes = db.generate_waiver_pdf(r)
                    st.download_button(
                        "📋 Waiver", data=waiver_bytes,
                        file_name=f"DJM_Waiver_{r['event_name'][:20]}.pdf",
                        mime="application/pdf", key=f"waiver_{r['id']}",
                        use_container_width=True
                    )
                except Exception:
                    pass
                if st.button("Mark returned", key=f"return_{r['id']}",
                             icon=":material/assignment_return:", type="primary",
                             use_container_width=True):
                    db.return_rental(r["id"])
                    db.log_activity("Rental returned", f"{r['event_name']} — {r['client_name']}", r["id"])
                    db.send_feedback_request_email(r)
                    st.success("Marked as returned!", icon=":material/check_circle:")
                    st.rerun()

# ── History tab ──────────────────────────────────────────────
with tab_history:
    all_rentals = db.get_all_rentals()
    past = [r for r in all_rentals if r["status"] in ("returned", "cancelled")]
    if not past:
        st.info("No past rentals yet.", icon=":material/info:")
    for r in past:
        status_icon = ":material/check_circle:" if r["status"] == "returned" else ":material/cancel:"
        with st.container(border=True):
            cols = st.columns([3, 2, 2, 1])
            cols[0].markdown(f"**{r['event_name']}**  \n{r['client_name']}")
            cols[1].markdown(f":material/calendar_today: {r['event_date']}")
            cols[2].markdown(f":material/location_on: {r.get('venue', 'TBD')}")
            cols[3].badge(r["status"], icon=status_icon,
                          color="green" if r["status"] == "returned" else "gray")

# ── New request tab (admin version) ──────────────────────────
with tab_new:
    st.markdown("Create a rental request on behalf of a client.")
    with st.form("new_rental", border=True):
        rc1, rc2 = st.columns(2)
        event_name = rc1.text_input("Event name", placeholder="Corporate Awards Gala")
        client_name = rc2.text_input("Client name", placeholder="John Doe")
        rc3, rc4 = st.columns(2)
        client_phone = rc3.text_input("Client phone", placeholder="(555) 123-4567")
        venue = rc4.text_input("Venue", placeholder="Downtown Convention Center")
        rc5, rc6 = st.columns(2)
        event_date = rc5.date_input("Event date")
        return_date = rc6.date_input("Return date")
        notes = st.text_area("Notes / gear requests",
                             placeholder="Needs 2 wireless mics, PA system, 4 moving heads…",
                             height=100)
        if st.form_submit_button("Create request", icon=":material/send:", type="primary"):
            if not event_name or not client_name:
                st.error("Event name and client name are required")
            else:
                db.create_rental(
                    event_name=event_name, client_name=client_name,
                    client_phone=client_phone, event_date=str(event_date),
                    return_date=str(return_date), venue=venue, notes=notes,
                )
                st.success("Request created!", icon=":material/check_circle:")
                st.rerun()

# ── Jump to correct tab via JS ────────────────────────────────
# Streamlit doesn't support programmatic tab switching, so we show a
# prominent banner when arriving from a deep-link so the right section is obvious
if _default_tab == "pending" and _tab_index == 0:
    pass  # Already on first tab — default behaviour is correct
