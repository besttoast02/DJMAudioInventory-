import streamlit as st
import db
import pandas as pd
from datetime import datetime, date, timedelta

st.title(":material/analytics: Revenue Analytics")

# ── Load data ────────────────────────────────────────────────
all_rentals = db.get_all_rentals()

if not all_rentals:
    st.info("No rental data yet. Analytics will populate as you get bookings.", icon=":material/info:")
    st.stop()

df = pd.DataFrame(all_rentals)
df["event_date"] = pd.to_datetime(df["event_date"], errors="coerce")
df["estimated_cost"] = pd.to_numeric(df.get("estimated_cost", 0), errors="coerce").fillna(0)
df["final_cost"] = pd.to_numeric(df.get("final_cost", 0), errors="coerce").fillna(0)
df["revenue"] = df["final_cost"].where(df["final_cost"] > 0, df["estimated_cost"])

# ── KPIs ─────────────────────────────────────────────────────
now = datetime.now()
this_month = df[df["event_date"].dt.month == now.month]
last_month = df[df["event_date"].dt.month == (now.month - 1 if now.month > 1 else 12)]

m1, m2, m3, m4 = st.columns(4)
m1.metric("Total Rentals", len(df))
m2.metric("This Month", len(this_month))
total_rev = df["revenue"].sum()
m3.metric("Total Revenue", f"${total_rev:,.0f}")
this_month_rev = this_month["revenue"].sum()
last_month_rev = last_month["revenue"].sum()
delta = this_month_rev - last_month_rev if last_month_rev > 0 else None
m4.metric("This Month Rev", f"${this_month_rev:,.0f}", 
          delta=f"${delta:+,.0f}" if delta else None)

# ── Monthly Revenue Chart ────────────────────────────────────
st.divider()
st.subheader(":material/bar_chart: Monthly Revenue")

monthly = df.groupby(df["event_date"].dt.to_period("M"))["revenue"].sum()
monthly.index = monthly.index.astype(str)
if len(monthly) > 0:
    st.bar_chart(monthly, use_container_width=True)
else:
    st.caption("Not enough data for chart yet.")

# ── Status Breakdown ─────────────────────────────────────────
st.divider()
st.subheader(":material/pie_chart: Rental Status Breakdown")

status_counts = df["status"].value_counts()
sc1, sc2 = st.columns([1, 2])
with sc1:
    for status, count in status_counts.items():
        color = {"pending": "orange", "approved": "blue", "completed": "green", "returned": "green", "cancelled": "red"}.get(status, "gray")
        st.badge(f"{status.title()}: {count}", color=color)
with sc2:
    st.bar_chart(status_counts, use_container_width=True)

# ── Top Items ────────────────────────────────────────────────
st.divider()
st.subheader(":material/star: Most Requested Gear")

# Parse gear from notes
gear_counter = {}
for _, row in df.iterrows():
    notes = str(row.get("notes", ""))
    if "REQUESTED GEAR" in notes:
        lines = notes.split("REQUESTED GEAR")[1].split("===")[0].strip().split("\n")
        for line in lines:
            line = line.strip("• ·-").strip()
            if line and "×" in line:
                parts = line.split("×", 1)
                try:
                    qty = int(parts[0].strip())
                    name = parts[1].strip()
                    gear_counter[name] = gear_counter.get(name, 0) + qty
                except (ValueError, IndexError):
                    pass

if gear_counter:
    top_gear = sorted(gear_counter.items(), key=lambda x: x[1], reverse=True)[:10]
    for name, count in top_gear:
        st.markdown(f"**{count}×** {name}")
else:
    st.caption("Gear tracking data will appear after rental requests come in.")

# ── Average Order Value ──────────────────────────────────────
st.divider()
st.subheader(":material/payments: Financial Summary")

paid_rentals = df[df["revenue"] > 0]
fc1, fc2, fc3 = st.columns(3)
fc1.metric("Avg. Order Value", f"${paid_rentals['revenue'].mean():,.0f}" if len(paid_rentals) > 0 else "$0")
fc2.metric("Highest Rental", f"${paid_rentals['revenue'].max():,.0f}" if len(paid_rentals) > 0 else "$0")
fc3.metric("Completed Rentals", len(df[df["status"].isin(["completed", "returned"])]))

# ── Client Leaderboard ───────────────────────────────────────
st.divider()
st.subheader(":material/group: Top Clients")

client_rev = df.groupby("client_name")["revenue"].agg(["sum", "count"]).sort_values("sum", ascending=False)
client_rev.columns = ["Total Spent", "Bookings"]
if len(client_rev) > 0:
    st.dataframe(
        client_rev.head(10).style.format({"Total Spent": "${:,.0f}"}),
        use_container_width=True
    )

# ── Export ───────────────────────────────────────────────────
st.divider()
csv = df[["event_name", "client_name", "client_phone", "event_date", "venue", "status", "estimated_cost", "final_cost"]].to_csv(index=False)
st.download_button(
    "📥 Export all rental data (CSV)",
    data=csv,
    file_name=f"djm_audio_rentals_{date.today()}.csv",
    mime="text/csv",
    use_container_width=True
)
