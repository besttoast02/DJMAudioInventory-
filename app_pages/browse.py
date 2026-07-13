import streamlit as st
import db

st.title(":material/search: Browse available gear")
st.markdown("See what's available for your event. Ready to rent? Head to **Request rental** in the sidebar.")

items = db.get_available_items()

if not items:
    st.info("No gear available right now. Check back soon!", icon=":material/info:")
    st.stop()

# ── Filters ──────────────────────────────────────────────────
categories = sorted(set(i["category"] for i in items))
filt_cat = st.pills("Filter", ["All"] + categories, default="All", key="browse_cat")

filtered = items
if filt_cat and filt_cat != "All":
    filtered = [i for i in filtered if i["category"] == filt_cat]

# ── Group by item type and show counts + rates ───────────────
grouped = {}
for i in filtered:
    key = f"{i['brand']}|{i['name']}"
    if key not in grouped:
        grouped[key] = {
            "name": i["name"],
            "brand": i["brand"],
            "category": i["category"],
            "qty": 0,
            "rate_half_day": float(i.get("rate_half_day") or 0),
            "rate_daily": float(i.get("rate_daily") or 0),
            "rate_weekend": float(i.get("rate_weekend") or 0),
        }
    grouped[key]["qty"] += 1

st.caption(f"{len(filtered)} individual items available ({len(grouped)} types)")

# Group by category for display
by_cat = {}
for key, info in grouped.items():
    cat = info["category"]
    if cat not in by_cat:
        by_cat[cat] = []
    by_cat[cat].append(info)

for cat in sorted(by_cat.keys()):
    st.subheader(cat)
    cols = st.columns(3)
    for idx, info in enumerate(sorted(by_cat[cat], key=lambda x: x["name"])):
        with cols[idx % 3]:
            with st.container(border=True):
                st.markdown(f"**{info['brand']}** {info['name']}")
                st.badge(f"{info['qty']} available", color="green")
                if info["rate_daily"] > 0:
                    st.caption(
                        f"½ day ${info['rate_half_day']:.0f} · "
                        f"daily ${info['rate_daily']:.0f} · "
                        f"weekend ${info['rate_weekend']:.0f}"
                    )
