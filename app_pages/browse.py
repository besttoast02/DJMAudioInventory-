import streamlit as st
import db

st.title(":material/search: Browse available gear")
st.markdown("See what's available for your event. Ready to rent? Head to **Request rental** in the sidebar.")

items = db.get_available_items()

if not items:
    st.info("No gear available right now. Check back soon!", icon=":material/info:")
    st.stop()

# ── Map internal categories to public display categories ─────
def get_display_category(item: dict) -> str:
    cat = item.get("category", "")
    name = item.get("name", "").lower()

    # Truss segments (not clamps — those are add-ons)
    if "truss" in name and "clamp" not in name:
        return "Truss"

    mapping = {
        "PA Systems": "Speakers",
        "Microphones": "Microphones",
        "Wireless": "Microphones",
        "Mixers": "Mixers",
        "Lighting": "Lighting / DMX",
    }
    return mapping.get(cat, "Add-ons")


DISPLAY_ORDER = ["Speakers", "Microphones", "Mixers", "Lighting / DMX", "Truss", "Add-ons"]

# Tag every item with its display category
for i in items:
    i["_display_cat"] = get_display_category(i)

# ── Filters ──────────────────────────────────────────────────
# Only show categories that have items
active_cats = sorted(set(i["_display_cat"] for i in items), key=lambda c: DISPLAY_ORDER.index(c) if c in DISPLAY_ORDER else 99)
filt_cat = st.pills("Filter", ["All"] + active_cats, default="All", key="browse_cat")

filtered = items
if filt_cat and filt_cat != "All":
    filtered = [i for i in filtered if i["_display_cat"] == filt_cat]

# ── Group by item type ───────────────────────────────────────
grouped = {}
for i in filtered:
    key = f"{i['brand']}|{i['name']}"
    if key not in grouped:
        grouped[key] = {
            "name": i["name"],
            "brand": i["brand"],
            "category": i["_display_cat"],
            "qty": 0,
            "rate_half_day": float(i.get("rate_half_day") or 0),
            "rate_daily": float(i.get("rate_daily") or 0),
            "rate_weekend": float(i.get("rate_weekend") or 0),
            "rentable": i.get("rentable", True),
        }
    grouped[key]["qty"] += 1

# ── Separate hero items vs add-ons ───────────────────────────
hero_items = {k: v for k, v in grouped.items() if v["category"] != "Add-ons"}
addon_items = {k: v for k, v in grouped.items() if v["category"] == "Add-ons"}

# Only show count for hero items
hero_count = sum(v["qty"] for v in hero_items.values())
st.caption(f"{hero_count} rentable items available ({len(hero_items)} types)")

# ── Display hero items by category ───────────────────────────
by_cat = {}
for key, info in hero_items.items():
    cat = info["category"]
    if cat not in by_cat:
        by_cat[cat] = []
    by_cat[cat].append(info)

for cat in [c for c in DISPLAY_ORDER if c in by_cat]:
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

# ── Add-ons section (collapsed) ──────────────────────────────
if addon_items and (filt_cat in ("All", "Add-ons")):
    st.divider()
    with st.expander(f":material/extension: **Add-ons** — cables, stands & accessories ({sum(v['qty'] for v in addon_items.values())} items)"):
        st.caption("These items can be included with your rental. Just mention what you need in your request!")

        addon_by_internal = {}
        for key, info in addon_items.items():
            # Use original internal category for sub-grouping
            parts = key.split("|")
            brand = parts[0]
            name = parts[1] if len(parts) > 1 else ""
            # Find the original item to get internal category
            for orig in items:
                if orig["brand"] == brand and orig["name"] == name:
                    icat = orig["category"]
                    break
            else:
                icat = "Other"
            if icat not in addon_by_internal:
                addon_by_internal[icat] = []
            addon_by_internal[icat].append(info)

        for cat in sorted(addon_by_internal.keys()):
            st.markdown(f"**{cat}**")
            for info in sorted(addon_by_internal[cat], key=lambda x: x["name"]):
                st.caption(f"› {info['brand']} {info['name']} — {info['qty']} avail")
