import streamlit as st
import db
import io

st.title(":material/qr_code_2: Barcode generator")

items = db.get_all_items()

if not items:
    st.info("No items yet. Seed your inventory first.", icon=":material/info:")
    st.stop()

st.markdown("Generate printable barcodes for your gear. Each item has a unique barcode you can print on label paper.")

# ── Filters ──────────────────────────────────────────────────
fc1, fc2 = st.columns(2)
categories = sorted(set(i["category"] for i in items))
cases = sorted(set(i["storage_case"] for i in items if i["storage_case"]))

filt_cat = fc1.selectbox("Filter by category", ["All"] + categories, key="bc_cat")
filt_case = fc2.selectbox("Filter by case", ["All"] + cases, key="bc_case")

filtered = items
if filt_cat != "All":
    filtered = [i for i in filtered if i["category"] == filt_cat]
if filt_case != "All":
    filtered = [i for i in filtered if i["storage_case"] == filt_case]

st.caption(f"{len(filtered)} items")

# ── Generate barcodes ────────────────────────────────────────
try:
    import barcode
    from barcode.writer import ImageWriter
    from PIL import Image

    # Display in grid
    cols_per_row = 4
    for idx in range(0, len(filtered), cols_per_row):
        cols = st.columns(cols_per_row)
        for j, col in enumerate(cols):
            if idx + j < len(filtered):
                item = filtered[idx + j]
                with col:
                    # Generate barcode image
                    code128 = barcode.get_barcode_class("code128")
                    buf = io.BytesIO()
                    bc = code128(item["barcode"], writer=ImageWriter())
                    bc.write(buf, options={
                        "module_width": 0.3,
                        "module_height": 8,
                        "font_size": 8,
                        "text_distance": 3,
                        "quiet_zone": 2,
                    })
                    buf.seek(0)
                    st.image(buf, width=None)
                    st.caption(f"{item['brand']} {item['name']}")

except ImportError:
    st.warning("Install `python-barcode` and `Pillow` for barcode generation.", icon=":material/warning:")
    # Fallback: just show text barcodes
    for item in filtered:
        with st.container(border=True):
            st.code(item["barcode"], language=None)
            st.caption(f"{item['brand']} {item['name']} — {item['storage_case']}")
