import streamlit as st
import db
import os
from parser import parse_text, KNOWN_GEAR, CABLE_TYPES

st.title(":material/auto_fix_high: Quick add")

# ── Tabs ─────────────────────────────────────────────────────
url_tab, text_tab = st.tabs([":material/link: Add from URL", ":material/text_fields: Text parser"])

# ══════════════════════════════════════════════════════════════
# TAB 1 — Add from URL
# ══════════════════════════════════════════════════════════════
with url_tab:
    st.markdown("Paste a product link and we'll scrape the image, remove the background, and estimate rental pricing automatically.")

    with st.form("url_scrape_form"):
        url_input = st.text_input(
            "Product URL",
            placeholder="https://www.sweetwater.com/store/detail/SM57--shure-sm57",
        )
        col_qty, col_cat = st.columns(2)
        qty = col_qty.number_input("Quantity to add", min_value=1, max_value=100, value=1)
        category = col_cat.selectbox("Category", sorted(db.CATEGORY_PREFIXES.keys()))

        STORAGE_CASES = [
            "",
            "Blue Makita Bag 1",
            "Makita Bag 2",
            "Black Box Yellow Cap A",
            "Black Box Yellow Cap B",
            "Black Box Yellow Cap C",
            "Light Case",
            "LightJoy Rolling Case A",
            "LightJoy Rolling Case B",
            "Microphone Case A",
            "Microphone Case B",
            "Microphone Bag Gator A",
            "Microphone Bag Gator B",
        ]
        storage = st.selectbox("Storage case", STORAGE_CASES, index=0, key="url_storage")
        scrape_btn = st.form_submit_button("Scrape & Preview", icon=":material/auto_fix_high:", type="primary")

    if scrape_btn and url_input:
        import scraper

        with st.spinner("Scraping product page..."):
            try:
                product = scraper.scrape_product(url_input)
            except Exception as e:
                st.error(f"Failed to scrape URL: {e}")
                st.stop()

        scraped_name = product["name"]
        scraped_brand = product["brand"]
        image_url = product["image_url"]

        # Download and process the image
        original_img = None
        cleaned_img = None
        if image_url:
            with st.spinner("Downloading image..."):
                original_img = scraper.download_image(image_url)
            if original_img:
                with st.spinner("Removing background..."):
                    cleaned_img = scraper.remove_background(original_img)
        
        # Estimate pricing via AI
        with st.spinner("Estimating rental pricing with AI..."):
            pricing = scraper.estimate_pricing(scraped_name, scraped_brand, category)

        # Save to session state for the preview
        st.session_state["url_preview"] = {
            "name": scraped_name,
            "brand": scraped_brand,
            "category": category,
            "qty": qty,
            "storage": storage,
            "original_img": original_img,
            "cleaned_img": cleaned_img,
            "pricing": pricing,
            "source_url": url_input,
        }

    # ── Preview Card ─────────────────────────────────────────
    if "url_preview" in st.session_state and st.session_state["url_preview"]:
        preview = st.session_state["url_preview"]

        st.divider()
        st.subheader(":material/preview: Review before adding")

        # Image preview: before / after
        if preview.get("cleaned_img"):
            img_col1, img_col2 = st.columns(2)
            if preview.get("original_img"):
                img_col1.markdown("**Original**")
                img_col1.image(preview["original_img"], use_container_width=True)
            img_col2.markdown("**Background removed**")
            img_col2.image(preview["cleaned_img"], use_container_width=True)
        elif preview.get("original_img"):
            st.image(preview["original_img"], use_container_width=True, caption="Original (no background removal)")
        else:
            st.info("No product image found on that page.", icon=":material/image_not_supported:")

        # Editable fields
        st.markdown("---")
        e_col1, e_col2, e_col3 = st.columns(3)
        edit_name = e_col1.text_input("Item name", value=preview["name"], key="url_edit_name")
        edit_brand = e_col2.text_input("Brand", value=preview["brand"], key="url_edit_brand")
        edit_category = e_col3.selectbox(
            "Category",
            sorted(db.CATEGORY_PREFIXES.keys()),
            index=sorted(db.CATEGORY_PREFIXES.keys()).index(preview["category"]) 
                  if preview["category"] in db.CATEGORY_PREFIXES else 0,
            key="url_edit_category",
        )

        q_col, s_col = st.columns(2)
        edit_qty = q_col.number_input("Quantity", min_value=1, max_value=100, value=preview["qty"], key="url_edit_qty")
        edit_notes = s_col.text_input("Notes", value="", key="url_edit_notes")

        # Pricing (editable)
        st.markdown("##### :material/attach_money: Pricing (AI estimated — adjust as needed)")
        p = preview["pricing"]
        p_col1, p_col2, p_col3, p_col4, p_col5 = st.columns(5)
        edit_purchase = p_col1.number_input("Purchase $", value=float(p["purchase_price"]), min_value=0.0, step=10.0, key="url_p1")
        edit_value = p_col2.number_input("Value $", value=float(p["current_value"]), min_value=0.0, step=10.0, key="url_p2")
        edit_half = p_col3.number_input("½ Day $", value=float(p["rate_half_day"]), min_value=0.0, step=5.0, key="url_p3")
        edit_daily = p_col4.number_input("Daily $", value=float(p["rate_daily"]), min_value=0.0, step=5.0, key="url_p4")
        edit_weekend = p_col5.number_input("Wknd $", value=float(p["rate_weekend"]), min_value=0.0, step=5.0, key="url_p5")

        # Submit
        add_col, clear_col = st.columns([1, 3])
        if add_col.button("Add to inventory", icon=":material/add_circle:", type="primary", key="url_add_btn"):
            # Save image
            if preview.get("cleaned_img"):
                import scraper
                scraper.save_inventory_image(preview["cleaned_img"], edit_name)
            elif preview.get("original_img"):
                import scraper
                scraper.save_inventory_image(preview["original_img"], edit_name)

            # Add items to DB
            barcodes = []
            for _ in range(edit_qty):
                bc = db.get_next_barcode(edit_category)
                db.add_item(
                    barcode=bc,
                    name=edit_name,
                    brand=edit_brand,
                    category=edit_category,
                    storage_case=preview.get("storage", ""),
                    notes=edit_notes,
                    purchase_price=edit_purchase,
                    current_value=edit_value,
                    rate_half_day=edit_half,
                    rate_daily=edit_daily,
                    rate_weekend=edit_weekend,
                )
                barcodes.append(bc)

            st.session_state["url_preview"] = None
            st.success(f"Added **{edit_qty}** × {edit_name} to inventory!", icon=":material/check_circle:")
            with st.expander("Barcodes created"):
                st.code("\n".join(barcodes))
            st.rerun()

        if clear_col.button("Clear", icon=":material/delete:", key="url_clear_btn"):
            st.session_state["url_preview"] = None
            st.rerun()


# ══════════════════════════════════════════════════════════════
# TAB 2 — Text Parser (existing functionality, preserved)
# ══════════════════════════════════════════════════════════════
with text_tab:
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

    STORAGE_CASES_TEXT = [
        "",
        "Blue Makita Bag 1",
        "Makita Bag 2",
        "Black Box Yellow Cap A",
        "Black Box Yellow Cap B",
        "Black Box Yellow Cap C",
        "Light Case",
        "LightJoy Rolling Case A",
        "LightJoy Rolling Case B",
        "Microphone Case A",
        "Microphone Case B",
        "Microphone Bag Gator A",
        "Microphone Bag Gator B",
    ]

    storage_text = st.selectbox("Storage case (applied to all)", STORAGE_CASES_TEXT, index=0, key="text_storage")

    if st.button("Parse items", icon=":material/auto_fix_high:", type="primary", key="text_parse_btn") and raw:
        items = parse_text(raw)

        if not items:
            st.warning("Couldn't parse anything. Try one item per line.")
            st.stop()

        st.session_state["parsed_items"] = items
        st.session_state["parsed_storage"] = storage_text

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
            width="stretch",
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
        if c1.button("Add all to inventory", icon=":material/add_circle:", type="primary", key="text_add_btn"):
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

        if c2.button("Clear", icon=":material/delete:", key="text_clear_btn"):
            st.session_state["parsed_items"] = []
            st.rerun()
