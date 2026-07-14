import streamlit as st
import db
import pandas as pd
from datetime import date, timedelta

st.title(":material/verified: Compliance Calendar")
st.markdown("Track deadlines for LLC filings, city licenses, tax filings, and insurance renewals.")

# ── KPI Bar ──────────────────────────────────────────────────
try:
    deadlines = db.get_deadlines(show_completed=False)
except Exception:
    deadlines = []
    st.info("Run the SQL to create the compliance_deadlines table first.")

overdue = [d for d in deadlines if d.get("due_date") and d["due_date"] < str(date.today())]
due_soon = [d for d in deadlines if d.get("due_date") and str(date.today()) <= d["due_date"] <= str(date.today() + timedelta(days=30))]

m1, m2, m3 = st.columns(3)
m1.metric("Overdue", len(overdue))
m2.metric("Due in 30 days", len(due_soon))
m3.metric("Total pending", len(deadlines))

if overdue:
    st.error(f"🚨 **{len(overdue)} overdue item{'s' if len(overdue) > 1 else ''}!** Handle these immediately.")

# ── Timeline ─────────────────────────────────────────────────
st.divider()

category_icons = {
    "license": "🏛️",
    "tax": "💰",
    "insurance": "🛡️",
    "filing": "📄",
    "training": "📚",
    "other": "📌",
}

entity_colors = {
    "DJM Audio": "blue",
    "Danger Beats": "violet",
    "Both": "green",
}

for d in deadlines:
    due = d.get("due_date", "")
    days_away = (date.fromisoformat(due) - date.today()).days if due else 999

    if days_away < 0:
        urgency_color = "red"
        urgency_tag = f"🔴 {abs(days_away)} days OVERDUE"
    elif days_away == 0:
        urgency_color = "orange"
        urgency_tag = "🟡 DUE TODAY"
    elif days_away <= 14:
        urgency_color = "orange"
        urgency_tag = f"🟠 {days_away} days left"
    elif days_away <= 30:
        urgency_color = "yellow"
        urgency_tag = f"🟡 {days_away} days"
    else:
        urgency_color = "green"
        urgency_tag = f"🟢 {days_away} days"

    cat_icon = category_icons.get(d.get("category", ""), "📌")
    entity = d.get("entity", "")
    ent_color = entity_colors.get(entity, "gray")

    with st.container(border=True):
        c1, c2, c3 = st.columns([4, 2, 1])
        c1.markdown(f"{cat_icon} **{d['title']}**")
        c1.caption(
            f"Due: **{due}** · "
            f"{'🔄 Recurs every ' + str(d.get('recurrence_months', '')) + ' months' if d.get('recurrence_months') else 'One-time'}"
        )
        if d.get("notes"):
            c1.caption(d["notes"])

        c2.badge(entity, color=ent_color)
        c2.badge(urgency_tag, color=urgency_color)

        if c3.button("✅", key=f"done_{d['id']}", help="Mark complete"):
            db.complete_deadline(d["id"])
            db.log_activity("Compliance completed", d["title"])
            st.rerun()

if not deadlines:
    st.info("No pending deadlines. Add your first one below!", icon=":material/check_circle:")

# ── Completed (toggle) ───────────────────────────────────────
show_done = st.toggle("Show completed", value=False, key="show_done_compliance")
if show_done:
    completed = db.get_deadlines(show_completed=True)
    completed = [d for d in completed if d.get("completed_at")]
    if completed:
        for d in completed[:10]:
            st.caption(f"✅ ~~{d['title']}~~ — completed {d['completed_at'][:10]}")
    else:
        st.caption("None completed yet.")

# ── Add deadline ─────────────────────────────────────────────
st.divider()
st.subheader("➕ Add Deadline")

with st.form("add_deadline", clear_on_submit=True):
    fc1, fc2 = st.columns(2)
    title = fc1.text_input("Title *", placeholder="LLC Statement of Information, City license renewal...")
    entity = fc2.selectbox("Entity", ["DJM Audio", "Danger Beats", "Both"])

    fc3, fc4, fc5 = st.columns(3)
    category = fc3.selectbox("Category", ["license", "tax", "insurance", "filing", "other"])
    due_date = fc4.date_input("Due date", value=date.today() + timedelta(days=30))
    recurrence = fc5.selectbox("Recurrence", [
        ("None (one-time)", None),
        ("Monthly", 1),
        ("Quarterly", 3),
        ("Semi-annual", 6),
        ("Annual", 12),
        ("Biennial (2 years)", 24),
    ], format_func=lambda x: x[0])

    notes = st.text_input("Notes (optional)", placeholder="File online at sos.ca.gov, costs $20...")

    if st.form_submit_button("Add Deadline", type="primary", icon=":material/add:"):
        if title:
            db.create_deadline(entity, title, category, str(due_date), recurrence[1], notes)
            st.success(f"Added: {title}")
            st.rerun()

# ── Quick-seed common deadlines ──────────────────────────────
st.divider()
if st.button("🌱 Seed standard deadlines for DJM Audio + Danger Beats", use_container_width=True):
    seeds = [
        ("DJM Audio", "LLC Statement of Information", "filing", str(date.today() + timedelta(days=60)), 24,
         "File at bizfile.sos.ca.gov — $20 fee"),
        ("Danger Beats", "LLC Statement of Information", "filing", str(date.today() + timedelta(days=60)), 24,
         "File at bizfile.sos.ca.gov — $20 fee"),
        ("DJM Audio", "Alhambra Business License Renewal", "license", str(date(date.today().year + 1, 1, 31)), 12,
         "Renew at alhambraca.gov/171/Business-License"),
        ("DJM Audio", "CDTFA Sales Tax Filing", "tax", str(date(date.today().year, 9, 30)), 3,
         "Quarterly filing at cdtfa.ca.gov"),
        ("Both", "General Liability Insurance Renewal", "insurance", str(date(date.today().year + 1, 1, 1)), 12,
         "Review coverage limits, add inland marine for equipment"),
        ("DJM Audio", "Equipment Insurance (Inland Marine) Renewal", "insurance", str(date(date.today().year + 1, 1, 1)), 12,
         "Covers gear in transit and at events"),
    ]
    for s in seeds:
        db.create_deadline(*s)
    db.log_activity("Compliance seeded", "Standard deadlines for both LLCs")
    st.success(f"Seeded {len(seeds)} deadlines!")
    st.rerun()
