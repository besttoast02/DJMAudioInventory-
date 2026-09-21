import streamlit as st
import db
import pandas as pd
import string
import random
from datetime import date, timedelta

st.title(":material/sell: Discount Codes")

tab_manage, tab_create = st.tabs(["Manage Codes", "Generate New"])

# ── Manage existing codes ────────────────────────────────────
with tab_manage:
    codes = db.get_all_discount_codes()
    if codes:
        for c in codes:
            with st.container(border=True):
                c1, c2, c3 = st.columns([3, 2, 2])
                c1.markdown(f"### `{c['code']}`")
                c2.metric(f"{c['percent_off']}% off", f"{c['times_used']}/{c['max_uses'] or '∞'} uses")
                
                status = "🟢 Active" if c["active"] else "🔴 Inactive"
                exp = c.get("expires_at") or "Never"
                c3.caption(f"{status}\nExpires: {exp}")
                
                bc1, bc2 = st.columns(2)
                if c["active"]:
                    if bc1.button("Deactivate", key=f"deact_{c['id']}", use_container_width=True):
                        db.toggle_discount_code(c["id"], False)
                        st.rerun()
                else:
                    if bc1.button("Activate", key=f"act_{c['id']}", type="primary", use_container_width=True):
                        db.toggle_discount_code(c["id"], True)
                        st.rerun()
                
                if bc2.button("Delete", key=f"del_{c['id']}", use_container_width=True):
                    db.delete_discount_code(c["id"])
                    st.success("Deleted!")
                    st.rerun()
    else:
        st.info("No discount codes yet. Create one in the 'Generate New' tab!")

# ── Generate new codes ───────────────────────────────────────
with tab_create:
    st.subheader("Create a Discount Code")
    
    with st.form("create_code_form"):
        mode = st.radio("Code type", ["Custom code", "Auto-generate random code"], horizontal=True)
        
        custom_code = st.text_input("Custom code (if selected above)", placeholder="DJMFAMILY15")
        
        pc1, pc2 = st.columns(2)
        percent = pc1.number_input("Discount %", min_value=1, max_value=100, value=15)
        max_uses = pc2.number_input("Max uses (0 = unlimited)", min_value=0, value=0)
        
        has_expiry = st.checkbox("Set expiration date")
        exp_date = None
        if has_expiry:
            exp_date = st.date_input("Expires on", value=date.today() + timedelta(days=30))
        
        if st.form_submit_button("Create Code", icon=":material/add:", type="primary"):
            if mode == "Custom code":
                code = custom_code.strip().upper()
                if not code:
                    st.error("Enter a code!")
                    st.stop()
            else:
                code = "DJM" + "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
            
            try:
                db.create_discount_code(
                    code=code,
                    percent_off=percent,
                    max_uses=max_uses,
                    expires_at=str(exp_date) if exp_date else None
                )
                st.success(f"Created code **{code}** for {percent}% off!")
                st.rerun()
            except Exception as e:
                st.error(f"Error: {e}")
    
    st.divider()
    st.subheader("Quick Generate")
    st.caption("One-click buttons to create common codes.")
    q1, q2 = st.columns(2)
    if q1.button("Create 15% code", icon=":material/bolt:", use_container_width=True):
        code = "DJM15-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
        db.create_discount_code(code=code, percent_off=15)
        st.success(f"Created **{code}**")
        st.rerun()
    if q2.button("Create 25% code", icon=":material/bolt:", use_container_width=True):
        code = "DJM25-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
        db.create_discount_code(code=code, percent_off=25)
        st.success(f"Created **{code}**")
        st.rerun()
