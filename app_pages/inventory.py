import streamlit as st
import db
import pandas as pd

st.title(":material/inventory_2: Inventory")

items = db.get_all_items()

if not items:
    st.info("No items yet. Go to the Dashboard to seed your inventory.", icon=":material/info:")
    st.stop()

# ── View mode toggle ─────────────────────────────────────────
view = st.pills("View", ["Table", "Edit mode", "Add new", "Bulk update", "Data Sheets"], default="Table")

# ── Filters (shared) ─────────────────────────────────────────
categories = sorted(set(i["category"] for i in items))
cases = sorted(set(i["storage_case"] for i in items if i.get("storage_case")))
statuses = ["All", "available", "in_use", "damaged", "lost"]

fc1, fc2, fc3, fc4 = st.columns(4)
filt_status = fc1.selectbox("Status", statuses, index=0)
filt_cat = fc2.selectbox("Category", ["All"] + categories, index=0)
filt_case = fc3.selectbox("Storage case", ["All"] + cases, index=0)
search = fc4.text_input("Search", placeholder="Name, brand, barcode…")

# ── Apply filters ────────────────────────────────────────────
filtered = items
if filt_status != "All":
    filtered = [i for i in filtered if i["status"] == filt_status]
if filt_cat != "All":
    filtered = [i for i in filtered if i["category"] == filt_cat]
if filt_case != "All":
    filtered = [i for i in filtered if i.get("storage_case") == filt_case]
if search:
    q = search.lower()
    filtered = [i for i in filtered if
                q in i["name"].lower() or
                q in i["brand"].lower() or
                q in i["barcode"].lower() or
                q in (i.get("notes") or "").lower()]

st.caption(f"Showing {len(filtered)} of {len(items)} items")

# ── TABLE VIEW (read-only) ───────────────────────────────────
if view == "Table":
    if filtered:
        df = pd.DataFrame([{
            "Barcode": i["barcode"],
            "Name": i["name"],
            "Brand": i["brand"],
            "Category": i["category"],
            "Case": i.get("storage_case") or "—",
            "Status": i["status"],
            "Purchased": f"${float(i.get('purchase_price') or 0):,.0f}",
            "Value": f"${float(i.get('current_value') or 0):,.0f}",
            "½ Day": f"${float(i.get('rate_half_day') or 0):,.0f}",
            "Daily": f"${float(i.get('rate_daily') or 0):,.0f}",
            "Weekend": f"${float(i.get('rate_weekend') or 0):,.0f}",
            "Notes": i.get("notes") or "",
        } for i in filtered])

        st.dataframe(df, width="stretch", hide_index=True)

        # Summary row
        total_purchase = sum(float(i.get("purchase_price") or 0) for i in filtered)
        total_value = sum(float(i.get("current_value") or 0) for i in filtered)
        sc1, sc2, sc3 = st.columns(3)
        sc1.metric("Items shown", len(filtered))
        sc2.metric("Total purchased", f"${total_purchase:,.0f}")
        sc3.metric("Current value", f"${total_value:,.0f}")

# ── EDIT MODE (inline spreadsheet editor) ────────────────────
elif view == "Edit mode":
    st.markdown("Click any cell to edit. Hit **Save changes** when done.")

    df = pd.DataFrame([{
        "id": i["id"],
        "barcode": i["barcode"],
        "name": i["name"],
        "brand": i["brand"],
        "category": i["category"],
        "storage_case": i.get("storage_case") or "",
        "status": i["status"],
        "purchase_price": float(i.get("purchase_price") or 0),
        "current_value": float(i.get("current_value") or 0),
        "rate_half_day": float(i.get("rate_half_day") or 0),
        "rate_daily": float(i.get("rate_daily") or 0),
        "rate_weekend": float(i.get("rate_weekend") or 0),
        "notes": i.get("notes") or "",
    } for i in filtered])

    edited = st.data_editor(
        df,
        width="stretch",
        hide_index=True,
        num_rows="fixed",
        disabled=["id", "barcode"],
        column_config={
            "id": st.column_config.TextColumn("ID", width="small"),
            "barcode": st.column_config.TextColumn("Barcode", width="medium"),
            "status": st.column_config.SelectboxColumn(
                "Status", options=["available", "in_use", "damaged", "lost"], width="small"
            ),
            "category": st.column_config.SelectboxColumn(
                "Category", options=sorted(db.CATEGORY_PREFIXES.keys()), width="medium"
            ),
            "purchase_price": st.column_config.NumberColumn("Purchased $", format="$%.2f", min_value=0),
            "current_value": st.column_config.NumberColumn("Value $", format="$%.2f", min_value=0),
            "rate_half_day": st.column_config.NumberColumn("½ Day $", format="$%.2f", min_value=0),
            "rate_daily": st.column_config.NumberColumn("Daily $", format="$%.2f", min_value=0),
            "rate_weekend": st.column_config.NumberColumn("Weekend $", format="$%.2f", min_value=0),
        },
        key="inventory_editor",
    )

    if st.button("Save changes", icon=":material/save:", type="primary"):
        changes = 0
        for idx, row in edited.iterrows():
            orig = df.iloc[idx]
            updates = {}
            for col in ["name", "brand", "category", "storage_case", "status",
                        "purchase_price", "current_value", "rate_half_day",
                        "rate_daily", "rate_weekend", "notes"]:
                if row[col] != orig[col]:
                    updates[col] = row[col]
            if updates:
                db.update_item(row["id"], updates)
                changes += 1
        if changes:
            st.success(f"Saved {changes} item(s)!", icon=":material/check_circle:")
            st.rerun()
        else:
            st.info("No changes detected.")

    # Delete items
    st.space("medium")
    with st.expander(":material/delete: Delete items"):
        del_barcodes = st.text_input("Barcodes to delete (comma-separated)",
                                      placeholder="DJM-XLR-0001, DJM-MIC-0003")
        if st.button("Delete", icon=":material/delete:", type="secondary"):
            barcodes = [b.strip() for b in del_barcodes.split(",") if b.strip()]
            ids_to_delete = [i["id"] for i in items if i["barcode"] in barcodes]
            if ids_to_delete:
                db.delete_items(ids_to_delete)
                st.success(f"Deleted {len(ids_to_delete)} item(s).", icon=":material/check_circle:")
                st.rerun()
            else:
                st.warning("No matching barcodes found.")

# ── ADD NEW ──────────────────────────────────────────────────
elif view == "Add new":
    st.markdown("Add new gear to your inventory. Each unit gets its own barcode.")

    with st.form("add_item", border=True):
        ac1, ac2 = st.columns(2)
        new_name = ac1.text_input("Item name", placeholder="25' XLR cable")
        new_brand = ac2.text_input("Brand", placeholder="Neutrik")
        ac3, ac4 = st.columns(2)
        new_cat = ac3.selectbox("Category", sorted(db.CATEGORY_PREFIXES.keys()))
        new_case = ac4.text_input("Storage case", placeholder="Blue Makita Bag 1")

        st.markdown("**Pricing**")
        pc1, pc2, pc3, pc4, pc5 = st.columns(5)
        new_purchase = pc1.number_input("Purchase $", min_value=0.0, step=1.0, format="%.2f")
        new_value = pc2.number_input("Current value $", min_value=0.0, step=1.0, format="%.2f")
        new_half = pc3.number_input("½ Day rate $", min_value=0.0, step=1.0, format="%.2f")
        new_daily = pc4.number_input("Daily rate $", min_value=0.0, step=1.0, format="%.2f")
        new_weekend = pc5.number_input("Weekend rate $", min_value=0.0, step=1.0, format="%.2f")

        ac5, ac6 = st.columns(2)
        new_qty = ac5.number_input("Quantity to add", min_value=1, max_value=50, value=1,
                                    help="Creates this many individual items with unique barcodes")
        new_notes = ac6.text_input("Notes (optional)")

        if st.form_submit_button("Add items", icon=":material/add:", type="primary"):
            if not new_name:
                st.error("Name is required")
            else:
                added = []
                for _ in range(new_qty):
                    bc = db.get_next_barcode(new_cat)
                    db.add_item(bc, new_name, new_brand or "Generic", new_cat, new_case,
                                new_notes, new_purchase, new_value, new_half, new_daily, new_weekend)
                    added.append(bc)
                st.success(f"Added {new_qty} item(s): {', '.join(added)}", icon=":material/check_circle:")
                st.rerun()

# ── BULK UPDATE ──────────────────────────────────────────────
elif view == "Bulk update":
    st.markdown("Update status or pricing for multiple items at once.")

    with st.form("bulk_status", border=True):
        st.markdown("**Change status**")
        barcode_input = st.text_area("Barcodes (one per line or comma-separated)",
                                      placeholder="DJM-XLR-0001\nDJM-MIC-0003\nDJM-LGT-0001",
                                      height=100)
        new_status = st.selectbox("New status", ["available", "in_use", "damaged", "lost"])
        if st.form_submit_button("Update status", icon=":material/sync:", type="primary"):
            raw = barcode_input.replace(",", "\n")
            barcodes = [b.strip() for b in raw.split("\n") if b.strip()]
            if not barcodes:
                st.error("Enter at least one barcode")
            else:
                updated = 0
                for bc in barcodes:
                    matching = [i for i in items if i["barcode"] == bc]
                    if matching:
                        db.update_item(matching[0]["id"], {"status": new_status})
                        updated += 1
                if updated:
                    st.success(f"Updated {updated} item(s) to '{new_status}'", icon=":material/check_circle:")
                    st.rerun()
                else:
                    st.warning("No matching barcodes found")

    st.space("medium")

    with st.form("bulk_price", border=True):
        st.markdown("**Bulk pricing update** — set rates for all items matching a name + brand")
        bp1, bp2 = st.columns(2)
        match_name = bp1.text_input("Item name contains", placeholder="XLR cable")
        match_brand = bp2.text_input("Brand contains (optional)")
        bpc1, bpc2, bpc3, bpc4, bpc5 = st.columns(5)
        bp_purchase = bpc1.number_input("Purchase $", min_value=0.0, step=1.0, format="%.2f", key="bp_p")
        bp_value = bpc2.number_input("Value $", min_value=0.0, step=1.0, format="%.2f", key="bp_v")
        bp_half = bpc3.number_input("½ Day $", min_value=0.0, step=1.0, format="%.2f", key="bp_h")
        bp_daily = bpc4.number_input("Daily $", min_value=0.0, step=1.0, format="%.2f", key="bp_d")
        bp_weekend = bpc5.number_input("Weekend $", min_value=0.0, step=1.0, format="%.2f", key="bp_w")

        if st.form_submit_button("Apply pricing", icon=":material/attach_money:"):
            if not match_name:
                st.error("Enter an item name to match")
            else:
                q = match_name.lower()
                matched = [i for i in items if q in i["name"].lower()]
                if match_brand:
                    qb = match_brand.lower()
                    matched = [i for i in matched if qb in i["brand"].lower()]
                if matched:
                    updates = {}
                    if bp_purchase > 0: updates["purchase_price"] = bp_purchase
                    if bp_value > 0: updates["current_value"] = bp_value
                    if bp_half > 0: updates["rate_half_day"] = bp_half
                    if bp_daily > 0: updates["rate_daily"] = bp_daily
                    if bp_weekend > 0: updates["rate_weekend"] = bp_weekend
                    if updates:
                        for i in matched:
                            db.update_item(i["id"], updates)
                        st.success(f"Updated pricing for {len(matched)} items!", icon=":material/check_circle:")
                        st.rerun()
                    else:
                        st.warning("Enter at least one price > $0")
                else:
                    st.warning("No matching items found")

# ── DATA SHEETS ──────────────────────────────────────────────
elif view == "Data Sheets":
    st.markdown("Edit Data Sheets & Coverage specs for your speakers (Markdown supported).")
    pa_systems = [i for i in items if i["category"] in ["PA Systems", "Lighting", "Mixers", "Microphones"]]
    if not pa_systems:
        st.info("No supported items found.")
    else:
        # Group by name to edit the spec once per model, not per barcode
        grouped = {}
        for i in pa_systems:
            key = i["name"]
            if key not in grouped:
                grouped[key] = i
        
        for name, info in grouped.items():
            with st.expander(f"**{info['brand']}** {name}"):
                with st.form(f"form_specs_{info['id']}"):
                    new_specs = st.text_area("Data Sheet (Markdown)", value=info.get("specs_markdown") or "", height=300)
                    if st.form_submit_button("Save Specs", icon=":material/save:", type="primary"):
                        # update all items with this name
                        to_update = [x["id"] for x in items if x["name"] == name]
                        for uid in to_update:
                            db.update_item(uid, {"specs_markdown": new_specs})
                        st.success(f"Specs saved for all {len(to_update)} unit(s)!", icon=":material/check_circle:")
                        st.rerun()
