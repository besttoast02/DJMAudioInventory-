import streamlit as st
import os
import json
import shutil
from pathlib import Path
import package_config as pkg

st.title(":material/settings: Admin: Setup Examples")
st.markdown("Manage the setup gallery examples shown on the website and used by the AI.")

# Ensure directory exists
SETUPS_DIR = "static/setups"
os.makedirs(SETUPS_DIR, exist_ok=True)

tab1, tab2 = st.tabs(["View Existing Setups", "Add New Setup"])

with tab1:
    import db
    setups = db.get_setups()
    
    if not setups:
        st.info("No setups found. Create one in the next tab!")
    else:
        for setup in setups:
            with st.container(border=True):
                cols = st.columns([1, 3, 1])
                if setup.get("main_image"):
                    cols[0].image(setup["main_image"], use_container_width=True)
                else:
                    cols[0].markdown("*(No image)*")
                    
                cols[1].markdown(f"### {setup.get('title', 'Untitled')}")
                cols[1].markdown(f"**Base Package:** {setup.get('base_package', 'None')} | **Total Value:** ${setup.get('total_price', 0)}")
                cols[1].caption(setup.get("description", ""))
                
                if cols[2].button("Delete Setup", key=f"del_{setup['id']}", type="primary"):
                    shutil.rmtree(os.path.join(SETUPS_DIR, setup['id']))
                    db.get_setups.clear()
                    st.rerun()

with tab2:
    with st.form("new_setup_form", clear_on_submit=True):
        st.subheader("Create a New Setup Example")
        
        col1, col2 = st.columns(2)
        setup_id = col1.text_input("Setup ID (e.g., premium_wedding_01)", help="No spaces or special chars. This will be the folder name.")
        title = col2.text_input("Display Title (e.g., Premium Wedding at The Grand)")
        
        base_pkg = col1.selectbox("Associated Base Package", options=["None"] + list(pkg.PACKAGES.keys()))
        total_price = col2.number_input("Total Setup Value ($)", min_value=0, value=1500)
        
        desc = st.text_area("Description (Markdown supported)")
        
        st.markdown("**Equipment List (Optional)**")
        eq1 = st.text_input("Item 1 (e.g., DJ — Wedding Package (5hr))")
        eq2 = st.text_input("Item 2 (e.g., Dancing on the Clouds)")
        eq3 = st.text_input("Item 3 (e.g., Spark Machine (pair))")
        eq4 = st.text_input("Item 4")
        
        image_file = st.file_uploader("Upload Main Photo", type=["jpg", "jpeg", "png", "webp"])
        
        submit = st.form_submit_button("Save Setup", type="primary", use_container_width=True)
        
        if submit:
            if not setup_id or not title:
                st.error("Setup ID and Title are required.")
            elif not setup_id.replace("_", "").isalnum():
                st.error("Setup ID can only contain letters, numbers, and underscores.")
            elif os.path.exists(os.path.join(SETUPS_DIR, setup_id)):
                st.error(f"Setup ID '{setup_id}' already exists!")
            else:
                try:
                    # Create directory
                    new_dir = os.path.join(SETUPS_DIR, setup_id)
                    os.makedirs(new_dir, exist_ok=True)
                    
                    # Save image if provided
                    if image_file is not None:
                        ext = os.path.splitext(image_file.name)[1].lower()
                        if ext == ".jpeg": ext = ".jpg"
                        img_path = os.path.join(new_dir, f"main{ext}")
                        with open(img_path, "wb") as f:
                            f.write(image_file.getbuffer())
                            
                    # Construct and save meta.json
                    equip_list = [e.strip() for e in [eq1, eq2, eq3, eq4] if e.strip()]
                    
                    meta = {
                        "title": title,
                        "base_package": base_pkg if base_pkg != "None" else None,
                        "description": desc,
                        "total_price": float(total_price),
                        "equipment_list": equip_list
                    }
                    
                    with open(os.path.join(new_dir, "meta.json"), "w") as f:
                        json.dump(meta, f, indent=2)
                        
                    db.get_setups.clear() # Clear cache
                    st.success(f"Setup '{title}' created successfully!")
                    
                except Exception as e:
                    st.error(f"Failed to save setup: {e}")
