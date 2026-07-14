import streamlit as st
import db

st.title(":material/description: Contracts & Documents")
st.markdown("Generate professional PDF contracts auto-populated from your rental data.")

# ── Contract Type Selection ──────────────────────────────────
tab_rental, tab_dj, tab_studio, tab_contractor = st.tabs([
    "📦 Equipment Rental",
    "🎧 DJ Services",
    "🎙️ Studio Use",
    "🤝 Contractor Agreement",
])

# ── Get rentals for auto-population ──────────────────────────
all_rentals = db.get_all_rentals()
rental_options = {"(Manual entry)": None}
for r in all_rentals:
    label = f"{r['event_name']} — {r['client_name']} ({r['event_date']})"
    rental_options[label] = r

# ── Equipment Rental Agreement ───────────────────────────────
with tab_rental:
    st.subheader("Equipment Rental Agreement")
    st.caption("DJM Audio Productions LLC — includes gear list, damage/loss liability, cancellation terms.")

    selected = st.selectbox("Auto-fill from booking", list(rental_options.keys()), key="rental_sel")
    rental = rental_options[selected] or {}

    with st.form("rental_contract_form"):
        rc1, rc2 = st.columns(2)
        client = rc1.text_input("Client name", value=rental.get("client_name", ""), key="rc_client")
        phone = rc2.text_input("Phone", value=rental.get("client_phone", ""), key="rc_phone")

        rc3, rc4 = st.columns(2)
        event = rc3.text_input("Event name", value=rental.get("event_name", ""), key="rc_event")
        venue = rc4.text_input("Venue", value=rental.get("venue", ""), key="rc_venue")

        rc5, rc6 = st.columns(2)
        evt_date = rc5.text_input("Event date", value=rental.get("event_date", ""), key="rc_edate")
        ret_date = rc6.text_input("Return date", value=rental.get("return_date", ""), key="rc_rdate")

        cost = st.number_input("Total cost ($)", value=float(rental.get("final_cost") or rental.get("estimated_cost") or 0), key="rc_cost")

        if st.form_submit_button("Generate Rental Agreement PDF", type="primary", icon=":material/picture_as_pdf:"):
            data = {
                "id": rental.get("id", "MANUAL"),
                "client_name": client, "client_phone": phone,
                "event_name": event, "venue": venue,
                "event_date": evt_date, "return_date": ret_date,
                "final_cost": cost, "estimated_cost": cost,
            }
            # Get items if linked to a real rental
            items = db.get_rental_items(rental["id"]) if rental.get("id") else []
            pdf_bytes = db.generate_invoice_pdf(data, items)  # Reuse invoice format with full terms
            waiver_bytes = db.generate_waiver_pdf(data)

            st.download_button("📄 Download Rental Agreement", data=waiver_bytes,
                             file_name=f"DJM_Rental_Agreement_{client[:15]}.pdf",
                             mime="application/pdf", key="dl_rental")
            st.download_button("📄 Download Invoice", data=pdf_bytes,
                             file_name=f"DJM_Invoice_{client[:15]}.pdf",
                             mime="application/pdf", key="dl_inv")

# ── DJ Services Agreement ────────────────────────────────────
with tab_dj:
    st.subheader("DJ & Production Services Agreement")
    st.caption("DJM Audio Productions LLC — covers set times, content, equipment, payment, cancellation.")

    selected_dj = st.selectbox("Auto-fill from booking", list(rental_options.keys()), key="dj_sel")
    rental_dj = rental_options[selected_dj] or {}

    with st.form("dj_contract_form"):
        dc1, dc2 = st.columns(2)
        client_dj = dc1.text_input("Client name", value=rental_dj.get("client_name", ""), key="dj_client")
        phone_dj = dc2.text_input("Phone", value=rental_dj.get("client_phone", ""), key="dj_phone")

        dc3, dc4 = st.columns(2)
        event_dj = dc3.text_input("Event name", value=rental_dj.get("event_name", ""), key="dj_event")
        venue_dj = dc4.text_input("Venue", value=rental_dj.get("venue", ""), key="dj_venue")

        dc5, dc6 = st.columns(2)
        edate_dj = dc5.text_input("Event date", value=rental_dj.get("event_date", ""), key="dj_edate")
        rdate_dj = dc6.text_input("Return date", value=rental_dj.get("return_date", ""), key="dj_rdate")

        cost_dj = st.number_input("Total fee ($)", value=float(rental_dj.get("final_cost") or rental_dj.get("estimated_cost") or 0), key="dj_cost")

        licensing = st.radio("Music licensing responsibility", ["Venue is responsible", "Company (DJM Audio) is responsible"], key="dj_lic")

        if st.form_submit_button("Generate DJ Services Agreement PDF", type="primary", icon=":material/picture_as_pdf:"):
            data = {
                "client_name": client_dj, "client_phone": phone_dj,
                "event_name": event_dj, "venue": venue_dj,
                "event_date": edate_dj, "return_date": rdate_dj,
                "final_cost": cost_dj, "estimated_cost": cost_dj,
            }
            pdf_bytes = db.generate_dj_services_pdf(data)
            st.download_button("📄 Download DJ Services Agreement", data=pdf_bytes,
                             file_name=f"DJM_DJ_Agreement_{client_dj[:15]}.pdf",
                             mime="application/pdf", key="dl_dj")

# ── Studio Use Agreement ─────────────────────────────────────
with tab_studio:
    st.subheader("Studio Use & Equipment Liability Agreement")
    st.caption("Danger Beats Music LLC — covers session time, studio rules, damage liability.")

    with st.form("studio_contract_form"):
        sc1, sc2 = st.columns(2)
        client_st = sc1.text_input("Client name", key="st_client")
        phone_st = sc2.text_input("Phone", key="st_phone")

        sc3, sc4 = st.columns(2)
        session = sc3.text_input("Session name", placeholder="Recording session, mixing session...", key="st_session")
        sdate = sc4.text_input("Session date", key="st_date")

        cost_st = st.number_input("Session fee ($)", value=0.0, key="st_cost")

        if st.form_submit_button("Generate Studio Agreement PDF", type="primary", icon=":material/picture_as_pdf:"):
            data = {
                "client_name": client_st, "client_phone": phone_st,
                "event_name": session, "event_date": sdate,
                "venue": "Danger Beats Studio", "final_cost": cost_st,
            }
            pdf_bytes = db.generate_studio_use_pdf(data)
            st.download_button("📄 Download Studio Agreement", data=pdf_bytes,
                             file_name=f"DangerBeats_Studio_{client_st[:15]}.pdf",
                             mime="application/pdf", key="dl_studio")

# ── Independent Contractor Agreement ─────────────────────────
with tab_contractor:
    st.subheader("Independent Contractor Agreement")
    st.caption("For DJs, techs, and assistants you hire per-gig. Sole proprietor — no W-2 employees.")

    with st.form("contractor_form"):
        cc1, cc2 = st.columns(2)
        contractor_name = cc1.text_input("Contractor name", key="cc_name")
        contractor_phone = cc2.text_input("Phone", key="cc_phone")

        cc3, cc4 = st.columns(2)
        gig_name = cc3.text_input("Event/gig", key="cc_gig")
        gig_date = cc4.text_input("Date", key="cc_date")

        cc5, cc6 = st.columns(2)
        rate = cc5.number_input("Rate ($)", min_value=0.0, key="cc_rate")
        rate_type = cc6.selectbox("Rate type", ["Flat rate per gig", "Hourly", "Daily"], key="cc_rtype")

        scope = st.text_area("Scope of work", placeholder="DJ second stage, run lighting board, assist with load-in/out...", key="cc_scope")

        if st.form_submit_button("Generate Contractor Agreement PDF", type="primary", icon=":material/picture_as_pdf:"):
            from fpdf import FPDF
            from datetime import datetime

            pdf = FPDF()
            pdf.add_page()
            pdf.set_auto_page_break(auto=True, margin=15)

            pdf.set_fill_color(102, 126, 234)
            pdf.rect(0, 0, 210, 35, "F")
            pdf.set_text_color(255, 255, 255)
            pdf.set_font("Helvetica", "B", 18)
            pdf.set_y(8)
            pdf.cell(0, 10, "INDEPENDENT CONTRACTOR AGREEMENT", ln=True, align="C")
            pdf.set_font("Helvetica", "", 9)
            pdf.cell(0, 6, "DJM Audio Productions LLC", ln=True, align="C")

            pdf.set_text_color(0, 0, 0)
            pdf.set_y(45)
            pdf.set_font("Helvetica", "", 10)

            text = f"""INDEPENDENT CONTRACTOR AGREEMENT

This Agreement is between DJM Audio Productions LLC ("Company") and {contractor_name} ("Contractor").

1. ENGAGEMENT
Company engages Contractor as an independent contractor for:
Event: {gig_name}
Date: {gig_date}
Scope: {scope or 'As described verbally and confirmed in writing.'}

2. COMPENSATION
Rate: ${rate:,.2f} ({rate_type})
Payment will be made within 7 days of completed work via agreed method.

3. INDEPENDENT CONTRACTOR STATUS
Contractor is an independent contractor, NOT an employee. Contractor is responsible for their own:
- Federal and state income taxes
- Self-employment taxes
- Health insurance and benefits
- Workers compensation (if applicable)
- Equipment and tools (unless otherwise specified)

Company will issue a 1099-NEC for payments of $600 or more in a calendar year.

4. EQUIPMENT
Unless specified otherwise, Contractor provides their own tools and equipment. Any Company equipment provided must be returned in the same condition.

5. SCOPE AND CONTROL
Company defines the desired result, but Contractor controls the manner and means of performing the work. Contractor sets their own schedule and methods.

6. CONFIDENTIALITY
Contractor agrees not to disclose client lists, pricing, or business strategies of Company.

7. NO EXCLUSIVITY
Contractor is free to work for other companies and clients. This agreement does not create an exclusive relationship.

8. TERMINATION
Either party may terminate this agreement with reasonable notice. Payment will be made for work already completed.

9. INDEMNIFICATION
Contractor agrees to indemnify and hold harmless Company from claims arising from Contractor's negligence or misconduct.

10. GOVERNING LAW
This Agreement is governed by the laws of the State of California.

Generated: {datetime.now().strftime('%B %d, %Y')}"""

            pdf.multi_cell(0, 5, text)

            pdf.ln(10)
            pdf.set_font("Helvetica", "B", 11)
            pdf.cell(95, 8, f"Contractor: {contractor_name}")
            pdf.cell(95, 8, f"Date: {datetime.now().strftime('%m/%d/%Y')}", ln=True)
            pdf.ln(5)
            pdf.cell(95, 8, "Contractor Signature: ____________________")
            pdf.cell(95, 8, "DJM Audio Rep: ____________________", ln=True)

            pdf_bytes = pdf.output()
            st.download_button("📄 Download Contractor Agreement", data=pdf_bytes,
                             file_name=f"DJM_Contractor_{contractor_name[:15]}.pdf",
                             mime="application/pdf", key="dl_contractor")
