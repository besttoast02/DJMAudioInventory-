import streamlit as st
import db
import os
import re
from parser import parse_text, KNOWN_GEAR, CABLE_TYPES

st.title(":material/auto_fix_high: Quick add")
st.markdown("Paste a **product URL** with quantity, or type items as text — the system figures out the rest.")

# ── Storage cases (shared) ───────────────────────────────────
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

# ── Examples ─────────────────────────────────────────────────
with st.expander("Examples of what you can type"):
    st.code("""https://www.sweetwater.com/store/detail/SM57  4 count
https://www.adj.com/products/inno-pocket-spot  ADJ inno pocket  4 count
3x 25ft xlr neutrik
2 sm57
boom stand
beta58a
1 moving head, $350""", language=None)

# ── Input ────────────────────────────────────────────────────
raw = st.text_area(
    "Paste a URL with quantity, or type items (one per line)",
    height=150,
    placeholder="https://www.sweetwater.com/store/detail/SM57  4 count\n3x 25ft xlr neutrik\n2 sm57",
)

col_s, col_c = st.columns(2)
storage = col_s.selectbox("Storage case (applied to all)", STORAGE_CASES, index=0)
default_category = col_c.selectbox("Default category (for URL items)", sorted(db.CATEGORY_PREFIXES.keys()), index=sorted(db.CATEGORY_PREFIXES.keys()).index("Lighting"))


# ── Helper: detect URLs in input ─────────────────────────────
URL_PATTERN = re.compile(r'https?://[^\s]+')

def parse_url_line(line: str) -> dict | None:
    """
    Parse a line like:
      'https://www.adj.com/products/inno-pocket-spot  ADJ inno pocket mobile heads  4 count'
    Returns {url, qty, description} or None if no URL found.
    """
    match = URL_PATTERN.search(line)
    if not match:
        return None
    
    url = match.group(0)
    rest = line[:match.start()] + line[match.end():]
    rest = rest.strip()
    
    # Extract quantity: look for patterns like "4 count", "4x", "x4", "qty 4", just "4"
    qty = 1
    qty_patterns = [
        r'(\d+)\s*(?:count|units?|pcs?|pieces?|each)',  # "4 count", "4 units"
        r'(\d+)\s*x\b',                                  # "4x"
        r'\bx\s*(\d+)',                                   # "x4"
        r'\bqty\s*:?\s*(\d+)',                            # "qty 4", "qty: 4"
    ]
    for pat in qty_patterns:
        m = re.search(pat, rest, re.IGNORECASE)
        if m:
            qty = int(m.group(1))
            rest = rest[:m.start()] + rest[m.end():]
            break
    
    # Whatever's left is the description/override name
    description = re.sub(r'\s+', ' ', rest).strip()
    
    return {"url": url, "qty": qty, "description": description}


# ── Main action ──────────────────────────────────────────────
if st.button("Process", icon=":material/auto_fix_high:", type="primary") and raw:
    lines = [l.strip() for l in raw.strip().splitlines() if l.strip()]
    
    url_lines = []
    text_lines = []
    
    for line in lines:
        parsed = parse_url_line(line)
        if parsed:
            url_lines.append(parsed)
        else:
            text_lines.append(line)
    
    # ── Process URL lines via scraper ────────────────────────
    if url_lines:
        import scraper
        
        url_previews = []
        total_urls = len(url_lines)
        
        # 4 steps per URL: scrape, download image, remove bg, estimate pricing
        total_steps = total_urls * 4
        current_step = 0
        
        progress_bar = st.progress(0, text="Starting...")
        
        for i, ul in enumerate(url_lines):
            short_url = ul["url"][:60] + ("..." if len(ul["url"]) > 60 else "")
            
            with st.status(f"Processing item {i+1}/{total_urls}: {short_url}", expanded=True) as status:
                # Step 1: Scrape
                st.write(f":material/language: Scraping product page...")
                current_step += 1
                progress_bar.progress(current_step / total_steps, text=f"Scraping page {i+1}/{total_urls}...")
                try:
                    product = scraper.scrape_product(ul["url"])
                    st.write(f"✅ Found: **{product['name']}**" + (f" by **{product['brand']}**" if product['brand'] else ""))
                except Exception as e:
                    st.write(f"❌ Failed: {e}")
                    current_step += 3  # skip remaining steps
                    progress_bar.progress(current_step / total_steps, text=f"Skipped item {i+1}")
                    status.update(label=f"❌ Failed: {short_url}", state="error")
                    continue
                
                # Use description as override name if provided
                item_name = ul["description"] if ul["description"] else product["name"]
                brand = product["brand"]
                
                # Step 2: Download image
                original_img = None
                cleaned_img = None
                if product["image_url"]:
                    st.write(f":material/download: Downloading product image...")
                    current_step += 1
                    progress_bar.progress(current_step / total_steps, text=f"Downloading image {i+1}/{total_urls}...")
                    original_img = scraper.download_image(product["image_url"])
                    if original_img:
                        st.write(f"✅ Image downloaded ({original_img.size[0]}×{original_img.size[1]})")
                    else:
                        st.write("⚠️ Could not download image")
                    
                    # Step 3: Remove background
                    if original_img:
                        st.write(f":material/auto_fix: Removing background...")
                        current_step += 1
                        progress_bar.progress(current_step / total_steps, text=f"Removing background {i+1}/{total_urls}...")
                        cleaned_img = scraper.remove_background(original_img)
                        st.write("✅ Background removed")
                    else:
                        current_step += 1
                        progress_bar.progress(current_step / total_steps)
                else:
                    current_step += 2
                    progress_bar.progress(current_step / total_steps)
                    st.write("⚠️ No product image found on page")
                
                # Step 4: AI pricing
                st.write(f":material/attach_money: Estimating rental pricing with AI...")
                current_step += 1
                progress_bar.progress(current_step / total_steps, text=f"Estimating pricing {i+1}/{total_urls}...")
                pricing = scraper.estimate_pricing(item_name, brand, default_category)
                if pricing["purchase_price"] > 0:
                    st.write(f"✅ Estimated: **${pricing['purchase_price']:.0f}** retail → **${pricing['rate_daily']:.0f}/day** rental")
                else:
                    st.write("⚠️ Could not estimate pricing — please set manually")
                
                url_previews.append({
                    "name": item_name,
                    "brand": brand,
                    "category": default_category,
                    "qty": ul["qty"],
                    "original_img": original_img,
                    "cleaned_img": cleaned_img,
                    "pricing": pricing,
                    "source_url": ul["url"],
                })
                
                status.update(label=f"✅ {item_name} ({ul['qty']}x)", state="complete")
        
        progress_bar.progress(1.0, text="Done!")
        
        if url_previews:
            st.session_state["url_previews"] = url_previews
    
    # ── Process text lines via parser ────────────────────────
    if text_lines:
        items = parse_text("\n".join(text_lines))
        if items:
            st.session_state["parsed_items"] = items
            st.session_state["parsed_storage"] = storage
        else:
            st.warning("Couldn't parse the text lines. Try one item per line.")


# ══════════════════════════════════════════════════════════════
# URL PREVIEWS
# ══════════════════════════════════════════════════════════════
if "url_previews" in st.session_state and st.session_state["url_previews"]:
    previews = st.session_state["url_previews"]
    
    st.divider()
    st.subheader(f":material/preview: Review {len(previews)} scraped item(s)")
    
    for idx, preview in enumerate(previews):
        with st.container(border=True):
            # Image + Info side by side
            img_col, info_col = st.columns([1, 2])
            
            with img_col:
                if preview.get("cleaned_img"):
                    st.image(preview["cleaned_img"], width="stretch", caption="Background removed")
                elif preview.get("original_img"):
                    st.image(preview["original_img"], width="stretch", caption="Original")
                else:
                    st.info("No image found", icon=":material/image_not_supported:")
            
            with info_col:
                c1, c2 = st.columns(2)
                preview["name"] = c1.text_input("Name", value=preview["name"], key=f"url_name_{idx}")
                preview["brand"] = c2.text_input("Brand", value=preview["brand"], key=f"url_brand_{idx}")
                
                c3, c4, c5 = st.columns(3)
                preview["qty"] = c3.number_input("Qty", min_value=1, max_value=100, value=preview["qty"], key=f"url_qty_{idx}")
                preview["category"] = c4.selectbox(
                    "Category",
                    sorted(db.CATEGORY_PREFIXES.keys()),
                    index=sorted(db.CATEGORY_PREFIXES.keys()).index(preview["category"])
                          if preview["category"] in db.CATEGORY_PREFIXES else 0,
                    key=f"url_cat_{idx}",
                )
                preview["notes"] = c5.text_input("Notes", value="", key=f"url_notes_{idx}")

            # Pricing row
            p = preview["pricing"]
            st.markdown("**Pricing** *(AI estimated — adjust as needed)*")
            p1, p2, p3, p4, p5 = st.columns(5)
            p["purchase_price"] = p1.number_input("Purchase $", value=float(p["purchase_price"]), min_value=0.0, step=10.0, key=f"url_pp_{idx}")
            p["current_value"] = p2.number_input("Value $", value=float(p["current_value"]), min_value=0.0, step=10.0, key=f"url_cv_{idx}")
            p["rate_half_day"] = p3.number_input("½ Day $", value=float(p["rate_half_day"]), min_value=0.0, step=5.0, key=f"url_hd_{idx}")
            p["rate_daily"] = p4.number_input("Daily $", value=float(p["rate_daily"]), min_value=0.0, step=5.0, key=f"url_dy_{idx}")
            p["rate_weekend"] = p5.number_input("Wknd $", value=float(p["rate_weekend"]), min_value=0.0, step=5.0, key=f"url_wk_{idx}")

    # Submit all URL items
    add_col, clear_col = st.columns([1, 3])
    if add_col.button("Add all to inventory", icon=":material/add_circle:", type="primary", key="url_add_all"):
        total_added = 0
        all_barcodes = []
        
        for preview in previews:
            # Save image
            if preview.get("cleaned_img"):
                import scraper
                scraper.save_inventory_image(preview["cleaned_img"], preview["name"])
            elif preview.get("original_img"):
                import scraper
                scraper.save_inventory_image(preview["original_img"], preview["name"])
            
            p = preview["pricing"]
            for _ in range(preview["qty"]):
                bc = db.get_next_barcode(preview["category"])
                db.add_item(
                    barcode=bc,
                    name=preview["name"],
                    brand=preview["brand"],
                    category=preview["category"],
                    storage_case=storage,
                    notes=preview.get("notes", ""),
                    purchase_price=p["purchase_price"],
                    current_value=p["current_value"],
                    rate_half_day=p["rate_half_day"],
                    rate_daily=p["rate_daily"],
                    rate_weekend=p["rate_weekend"],
                )
                all_barcodes.append(bc)
                total_added += 1
        
        st.session_state["url_previews"] = []
        st.success(f"Added **{total_added}** items to inventory!", icon=":material/check_circle:")
        with st.expander("Barcodes created"):
            st.code("\n".join(all_barcodes))
        st.rerun()

    if clear_col.button("Clear", icon=":material/delete:", key="url_clear_all"):
        st.session_state["url_previews"] = []
        st.rerun()


# ══════════════════════════════════════════════════════════════
# TEXT PARSER RESULTS
# ══════════════════════════════════════════════════════════════
if "parsed_items" in st.session_state and st.session_state["parsed_items"]:
    items = st.session_state["parsed_items"]
    storage_case = st.session_state.get("parsed_storage", "")

    st.divider()
    st.subheader(":material/text_fields: Parsed text items")
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
