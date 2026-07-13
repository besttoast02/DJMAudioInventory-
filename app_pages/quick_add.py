import streamlit as st
import db
from parser import parse_text, KNOWN_GEAR, CABLE_TYPES

st.title(":material/auto_fix_high: Quick add")
st.markdown("Type items how you'd normally describe them. The system auto-fills names, brands, categories & pricing.")

# ── Examples ─────────────────────────────────────────────────
with st.expander("Examples of what you can type"):
    st.code("""3x 25ft xlr neutrik
2 sm57
boom stand
5 6ft dmx cables
beta58a
1 moving head, $350
10ft ethernet
radial di
fog machine chauvet
pioneer xdj-xz""", language=None)

# ── Input ────────────────────────────────────────────────────
raw = st.text_area(
    "Type your items (one per line)",
    height=200,
    placeholder="3x 25ft xlr neutrik\n2 sm57\nboom stand\nbeta58a wireless",
)

storage = st.text_input("Storage case (applied to all)", placeholder="Blue Makita Bag 1")

if st.button("Parse items", icon=":material/auto_fix_high:", type="primary") and raw:
    items = parse_text(raw)

    if not items:
        st.warning("Couldn't parse anything. Try one item per line.")
        st.stop()

    st.session_state["parsed_items"] = items
    st.session_state["parsed_storage"] = storage

# ── Show parsed results ──────────────────────────────────────
if "parsed_items" in st.session_state and st.session_state["parsed_items"]:
    items = st.session_state["parsed_items"]
    storage_case = st.session_state.get("parsed_storage", "")

    st.success(f"Parsed **{len(items)}** item(s) — review below, edit if needed, then save.", icon=":material/check_circle:")

    import pandas as pd

    df = pd.DataFrame([{
        "qty": i["qty"],
        "name": i["name"],
        "brand": i["brand"],
        "category": i["category"],
        "purchase_price": i["purchase_price"],
        "current_value": i["current_value"],
        "rate_half_day": i["rate_half_day"],
        "rate_daily": i["rate_daily"],
        "rate_weekend": i["rate_weekend"],
        "notes": i["notes"],
    } for i in items])

    edited = st.data_editor(
        df,
        use_container_width=True,
        hide_index=True,
        column_config={
            "qty": st.column_config.NumberColumn("Qty", min_value=1, max_value=100, width="small"),
            "category": st.column_config.SelectboxColumn("Category", options=sorted(db.CATEGORY_PREFIXES.keys()), width="medium"),
            "purchase_price": st.column_config.NumberColumn("Purchased $", format="$%.0f", min_value=0),
            "current_value": st.column_config.NumberColumn("Value $", format="$%.0f", min_value=0),
            "rate_half_day": st.column_config.NumberColumn("½ Day $", format="$%.0f", min_value=0),
            "rate_daily": st.column_config.NumberColumn("Daily $", format="$%.0f", min_value=0),
            "rate_weekend": st.column_config.NumberColumn("Wknd $", format="$%.0f", min_value=0),
        },
        key="quick_add_editor",
    )

    c1, c2 = st.columns([1, 3])
    if c1.button("Add all to inventory", icon=":material/add_circle:", type="primary"):
        total_added = 0
        barcodes = []
        for _, row in edited.iterrows():
            for _ in range(int(row["qty"])):
                bc = db.get_next_barcode(row["category"])
                db.add_item(
                    barcode=bc,
                    name=row["name"],
                    brand=row["brand"],
                    category=row["category"],
                    storage_case=storage_case,
                    notes=row["notes"],
                    purchase_price=float(row["purchase_price"]),
                    current_value=float(row["current_value"]),
                    rate_half_day=float(row["rate_half_day"]),
                    rate_daily=float(row["rate_daily"]),
                    rate_weekend=float(row["rate_weekend"]),
                )
                barcodes.append(bc)
                total_added += 1

        st.session_state["parsed_items"] = []
        st.success(f"Added **{total_added}** items to inventory!", icon=":material/check_circle:")
        with st.expander("Barcodes created"):
            st.code("\n".join(barcodes))
        st.rerun()

    if c2.button("Clear", icon=":material/delete:"):
        st.session_state["parsed_items"] = []
        st.rerun()
