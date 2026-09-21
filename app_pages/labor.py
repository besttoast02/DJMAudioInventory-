import streamlit as st
import db
import pandas as pd

st.title(":material/engineering: Staff & Labor")

tab_staff, tab_time, tab_pay = st.tabs(["Staff & Contractors", "Time Logs", "Contractor Payments"])

# ── Staff ────────────────────────────────────────────────────
with tab_staff:
    st.subheader("Team Roster")
    employees = db.get_employees()
    if employees:
        df_emp = pd.DataFrame(employees)
        st.dataframe(df_emp[["name", "role", "phone", "email"]], hide_index=True, use_container_width=True)
    else:
        st.info("No staff added yet.")
        
    with st.expander("Add New Team Member"):
        with st.form("add_emp_form"):
            e_name = st.text_input("Name *")
            e_role = st.selectbox("Role", ["admin", "contractor"])
            e_phone = st.text_input("Phone")
            e_email = st.text_input("Email")
            
            if st.form_submit_button("Add Member", type="primary"):
                if not e_name:
                    st.error("Name is required.")
                else:
                    db.add_employee(e_name, e_role, e_phone, e_email)
                    st.success("Added!")
                    st.rerun()

# ── Time Logs ────────────────────────────────────────────────
with tab_time:
    st.subheader("Time Logged")
    logs = db.get_all_time_logs()
    if logs:
        data = []
        for l in logs:
            data.append({
                "Date": l['logged_date'],
                "Event": l['rentals']['event_name'] if l.get('rentals') else "Unknown",
                "Employee": l['employees']['name'] if l.get('employees') else "Unknown",
                "Hours": l['hours'],
                "Task": l['task_description']
            })
        df_logs = pd.DataFrame(data)
        st.dataframe(df_logs, hide_index=True, use_container_width=True)
        
        total_hours = sum(l['hours'] for l in logs)
        st.metric("Total Hours Logged", total_hours)
    else:
        st.info("No time logged yet. Log time directly from the Rentals page.")

# ── Contractor Payments ──────────────────────────────────────
with tab_pay:
    st.subheader("Contractor Payments")
    payments = db.get_all_payments()
    if payments:
        data = []
        for p in payments:
            data.append({
                "Date": p['payment_date'],
                "Event": p['rentals']['event_name'] if p.get('rentals') else "Unknown",
                "Contractor": p['employees']['name'] if p.get('employees') else "Unknown",
                "Amount": p['amount'],
                "Notes": p['notes']
            })
        df_pay = pd.DataFrame(data)
        
        st.dataframe(
            df_pay,
            column_config={
                "Amount": st.column_config.NumberColumn("Amount", format="$%.2f")
            },
            hide_index=True,
            use_container_width=True
        )
        
        total_pay = sum(p['amount'] for p in payments)
        st.metric("Total Contractor Payments", f"${total_pay:.2f}")
    else:
        st.info("No payments logged yet. Log payments directly from the Rentals page.")
