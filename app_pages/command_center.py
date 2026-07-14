import streamlit as st
import db
import pandas as pd
from datetime import datetime, date, timedelta

st.title(":material/command_line: Command Center")

# ── KPI Metrics ──────────────────────────────────────────────
counts = db.get_item_count()
pending = db.get_rentals_by_status("pending")
approved = db.get_rentals_by_status("approved")
completed = db.get_rentals_by_status("completed")
all_rentals = pending + approved + completed

# Revenue calculations
revenue_approved = sum(float(r.get("final_cost") or r.get("estimated_cost") or 0) for r in approved)
revenue_completed = sum(float(r.get("final_cost") or r.get("estimated_cost") or 0) for r in completed)
revenue_pipeline = sum(float(r.get("estimated_cost") or 0) for r in pending)

m1, m2, m3, m4 = st.columns(4)
m1.metric("Pending", len(pending), help="Awaiting your approval")
m2.metric("Active", len(approved), help="Approved and gear deployed")
m3.metric("Revenue (active)", f"${revenue_approved:,.0f}")
m4.metric("Pipeline", f"${revenue_pipeline:,.0f}", help="Pending request value")

# ── Notification Bar ─────────────────────────────────────────
if pending:
    st.warning(
        f"🔔 **{len(pending)} new request{'s' if len(pending) > 1 else ''}** waiting for approval!",
        icon=":material/notifications:"
    )
    if st.button("Review now →", type="primary", key="go_review"):
        st.switch_page("app_pages/rentals.py")

# ── Kanban Pipeline ──────────────────────────────────────────
st.divider()
st.subheader(":material/view_kanban: Pipeline")

tab_new, tab_approved, tab_complete = st.tabs([
    f"📥 New ({len(pending)})",
    f"✅ Active ({len(approved)})",
    f"📦 Completed ({len(completed)})",
])

def render_kanban_card(r, show_approve=False, show_complete=False):
    """Render a rental as a compact kanban card."""
    with st.container(border=True):
        st.markdown(f"**{r['event_name']}**")
        st.caption(
            f":material/person: {r['client_name']} · "
            f":material/phone: {r.get('client_phone', 'N/A')}"
        )
        st.caption(
            f":material/calendar_today: {r['event_date']} · "
            f":material/location_on: {r.get('venue', 'TBD')}"
        )
        cost = float(r.get("final_cost") or r.get("estimated_cost") or 0)
        if cost > 0:
            st.caption(f":material/payments: **${cost:,.0f}**")

        bc1, bc2 = st.columns(2)
        if show_approve:
            if bc1.button("Review", key=f"kanban_review_{r['id']}", use_container_width=True, type="primary"):
                st.switch_page("app_pages/rentals.py")
        if show_complete:
            if bc1.button("Mark complete", key=f"kanban_done_{r['id']}", use_container_width=True):
                sb = db.get_client()
                sb.table("rentals").update({"status": "completed"}).eq("id", r["id"]).execute()
                # Return items
                ri = db.get_rental_items(r["id"])
                for entry in ri:
                    item = entry.get("items", {})
                    if item:
                        sb.table("items").update({"status": "available"}).eq("id", item["id"]).execute()
                db.log_activity("Rental completed", f"{r['event_name']} — {r['client_name']}", r["id"])
                st.rerun()

with tab_new:
    if not pending:
        st.info("All clear! No pending requests.", icon=":material/check_circle:")
    for r in pending:
        render_kanban_card(r, show_approve=True)

with tab_approved:
    if not approved:
        st.info("No active rentals right now.", icon=":material/info:")
    for r in approved:
        render_kanban_card(r, show_complete=True)

with tab_complete:
    if not completed:
        st.info("No completed rentals yet.", icon=":material/info:")
    for r in completed[:10]:  # Last 10
        render_kanban_card(r)

# ── Upcoming Events Timeline ─────────────────────────────────
st.divider()
st.subheader(":material/calendar_month: Next 14 Days")

upcoming = [r for r in approved if r.get("event_date")]
upcoming_sorted = sorted(upcoming, key=lambda r: r["event_date"])

if upcoming_sorted:
    for r in upcoming_sorted:
        try:
            evt_date = pd.to_datetime(r["event_date"]).date()
        except Exception:
            continue
        
        if evt_date > date.today() + timedelta(days=14):
            continue
            
        days_away = (evt_date - date.today()).days
        if days_away < 0:
            tag = "🔴 Ongoing"
            color = "red"
        elif days_away == 0:
            tag = "🟡 TODAY"
            color = "orange"
        elif days_away <= 3:
            tag = f"🟠 In {days_away} day{'s' if days_away > 1 else ''}"
            color = "orange"
        else:
            tag = f"🟢 In {days_away} days"
            color = "green"

        with st.container(border=True):
            c1, c2 = st.columns([1, 4])
            c1.markdown(f"**{evt_date.strftime('%b %d')}**")
            c1.badge(tag, color=color)
            c2.markdown(f"**{r['event_name']}**")
            c2.caption(
                f":material/person: {r['client_name']} · "
                f":material/location_on: {r.get('venue', 'TBD')} · "
                f"${float(r.get('final_cost') or 0):,.0f}"
            )
else:
    st.info("No upcoming events in the next 14 days.", icon=":material/event_busy:")

# ── Todo List ────────────────────────────────────────────────
st.divider()
st.subheader(":material/checklist: To-Do List")

show_done = st.toggle("Show completed", value=False, key="show_done_todos")

try:
    todos = db.get_todos(show_done=show_done)
except Exception:
    todos = []
    st.caption("*Run the SQL to create the todos table first.*")

for t in todos:
    c1, c2, c3 = st.columns([1, 6, 1])
    is_done = t.get("done", False)
    if c1.button("✅" if is_done else "⬜", key=f"todo_toggle_{t['id']}"):
        db.toggle_todo(t["id"], not is_done)
        st.rerun()
    
    label = f"~~{t['title']}~~" if is_done else f"**{t['title']}**"
    rental_link = ""
    if t.get("rentals") and t["rentals"].get("event_name"):
        rental_link = f" · 🔗 {t['rentals']['event_name']}"
    due = ""
    if t.get("due_date"):
        due = f" · 📅 {t['due_date']}"
    c2.markdown(f"{label}{rental_link}{due}")
    
    if c3.button("🗑️", key=f"todo_del_{t['id']}"):
        db.delete_todo(t["id"])
        st.rerun()

# Add new todo
with st.expander("➕ Add task"):
    with st.form("add_todo_form", clear_on_submit=True):
        todo_title = st.text_input("Task", placeholder="Follow up with client, order cables...")
        tc1, tc2 = st.columns(2)
        todo_due = tc1.date_input("Due date (optional)", value=None)
        
        # Optional rental link
        rental_options = {"None": None}
        for r in all_rentals:
            rental_options[f"{r['event_name']} — {r['client_name']}"] = r["id"]
        todo_rental = tc2.selectbox("Link to rental (optional)", list(rental_options.keys()))
        
        if st.form_submit_button("Add", type="primary", icon=":material/add:"):
            if todo_title:
                db.create_todo(
                    title=todo_title,
                    due_date=str(todo_due) if todo_due else None,
                    rental_id=rental_options[todo_rental]
                )
                st.rerun()

# ── Activity Log ─────────────────────────────────────────────
st.divider()
st.subheader(":material/history: Recent Activity")

try:
    activity = db.get_recent_activity(limit=10)
    if activity:
        for a in activity:
            ts = pd.to_datetime(a["created_at"]).strftime("%b %d, %I:%M %p")
            icon = "📋" if "request" in a["action"].lower() else "✅" if "approved" in a["action"].lower() else "❌" if "reject" in a["action"].lower() else "📦" if "complete" in a["action"].lower() else "📌"
            st.caption(f"{icon} **{a['action']}** — {a.get('detail', '')} · *{ts}*")
    else:
        st.caption("No activity yet. Events will appear here as requests come in.")
except Exception:
    st.caption("*Run the SQL to create the activity_log table first.*")

# ── Quick Nav ────────────────────────────────────────────────
st.divider()
st.subheader(":material/bolt: Quick Actions")
qa1, qa2, qa3, qa4 = st.columns(4)
if qa1.button("Inventory", icon=":material/inventory_2:", use_container_width=True):
    st.switch_page("app_pages/inventory.py")
if qa2.button("Rentals", icon=":material/event:", use_container_width=True):
    st.switch_page("app_pages/rentals.py")
if qa3.button("Discounts", icon=":material/sell:", use_container_width=True):
    st.switch_page("app_pages/discounts.py")
if qa4.button("Staff", icon=":material/engineering:", use_container_width=True):
    st.switch_page("app_pages/labor.py")
