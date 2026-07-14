"""
Supabase client helper for DJMAudio Inventory app.
Handles all database operations.
"""

import streamlit as st
from supabase import create_client, Client
import json

# ── Category → barcode prefix mapping ────────────────────────
CATEGORY_PREFIXES = {
    "XLR Cables": "XLR",
    "DMX Cables": "DMX",
    "TRS Cables": "TRS",
    "Power": "PWR",
    "Microphones": "MIC",
    "Wireless": "WRL",
    "Adapters": "ADP",
    "Hardware": "HRD",
    "Stands": "STD",
    "Lighting": "LGT",
    "Mixers": "MIX",
    "Data": "DAT",
    "DI / Signal": "DI",
    "Coaxial": "COX",
    "PA Systems": "PA",
}

# Categories that are add-on only (not publicly rentable)
ADDON_CATEGORIES = {
    "XLR Cables", "DMX Cables", "TRS Cables", "Power",
    "Adapters", "Hardware", "Stands", "Data",
    "DI / Signal", "Coaxial",
}


def get_prefix(category: str) -> str:
    return CATEGORY_PREFIXES.get(category, "GEN")


@st.cache_resource
def get_client() -> Client:
    url = st.secrets["SUPABASE_URL"]
    key = st.secrets["SUPABASE_KEY"]
    return create_client(url, key)


def is_connected() -> bool:
    try:
        _ = st.secrets["SUPABASE_URL"]
        _ = st.secrets["SUPABASE_KEY"]
        return True
    except (KeyError, FileNotFoundError):
        return False


# ── Items ────────────────────────────────────────────────────

def get_all_items() -> list[dict]:
    sb = get_client()
    res = sb.table("items").select("*").order("barcode").execute()
    return res.data


def get_items_by_status(status: str) -> list[dict]:
    sb = get_client()
    res = sb.table("items").select("*").eq("status", status).order("barcode").execute()
    return res.data


def get_available_items() -> list[dict]:
    return get_items_by_status("available")


def get_item_count() -> dict:
    items = get_all_items()
    counts = {"total": len(items), "available": 0, "in_use": 0, "damaged": 0, "lost": 0}
    for item in items:
        s = item.get("status", "available")
        if s in counts:
            counts[s] += 1
    # Calculate total asset value
    counts["total_purchase"] = sum(float(i.get("purchase_price") or 0) for i in items)
    counts["total_current"] = sum(float(i.get("current_value") or 0) for i in items)
    return counts


def add_item(barcode: str, name: str, brand: str, category: str, storage_case: str,
             notes: str = "", purchase_price: float = 0, current_value: float = 0,
             rate_half_day: float = 0, rate_daily: float = 0, rate_weekend: float = 0,
             rentable: bool | None = None) -> dict:
    sb = get_client()
    # Auto-determine rentable from category if not explicitly set
    if rentable is None:
        rentable = category not in ADDON_CATEGORIES
    data = {
        "barcode": barcode,
        "name": name,
        "brand": brand,
        "category": category,
        "storage_case": storage_case,
        "status": "available",
        "notes": notes,
        "purchase_price": purchase_price,
        "current_value": current_value,
        "rate_half_day": rate_half_day,
        "rate_daily": rate_daily,
        "rate_weekend": rate_weekend,
        "rentable": rentable,
    }
    res = sb.table("items").insert(data).execute()
    return res.data


def update_item(item_id: str, updates: dict) -> dict:
    sb = get_client()
    res = sb.table("items").update(updates).eq("id", item_id).execute()
    return res.data


def batch_update_items(updates: list[dict]):
    """Update multiple items. Each dict must have 'id' plus fields to change."""
    sb = get_client()
    for u in updates:
        item_id = u.pop("id")
        if u:  # only update if there are fields to change
            sb.table("items").update(u).eq("id", item_id).execute()


def update_items_status(item_ids: list[str], status: str):
    sb = get_client()
    for iid in item_ids:
        sb.table("items").update({"status": status}).eq("id", iid).execute()


def get_next_barcode(category: str) -> str:
    prefix = get_prefix(category)
    sb = get_client()
    res = sb.table("items").select("barcode").like("barcode", f"DJM-{prefix}-%").order("barcode", desc=True).limit(1).execute()
    if res.data:
        last = res.data[0]["barcode"]
        try:
            num = int(last.split("-")[-1]) + 1
        except ValueError:
            num = 1
    else:
        num = 1
    return f"DJM-{prefix}-{num:04d}"


def delete_item(item_id: str):
    sb = get_client()
    sb.table("items").delete().eq("id", item_id).execute()


def delete_items(item_ids: list[str]):
    sb = get_client()
    for iid in item_ids:
        sb.table("items").delete().eq("id", iid).execute()


# ── Double-booking prevention ────────────────────────────────

def get_booked_counts_for_dates(event_date: str, return_date: str) -> dict[str, int]:
    """
    Returns a dict of {item_name: count_booked} for items committed
    during the given date range (approved rentals whose dates overlap).
    """
    sb = get_client()
    # Get approved/pending rentals that overlap with the requested dates
    # Overlap: rental.event_date <= requested.return_date AND rental.return_date >= requested.event_date
    overlapping = (
        sb.table("rentals")
        .select("id, event_date, return_date, status")
        .in_("status", ["approved", "pending"])
        .lte("event_date", return_date)
        .gte("return_date", event_date)
        .execute()
    )

    if not overlapping.data:
        return {}

    # Get all item IDs linked to those rentals
    booked_counts: dict[str, int] = {}
    for rental in overlapping.data:
        ri = get_rental_items(rental["id"])
        for entry in ri:
            item = entry.get("items", {})
            if item:
                name = item.get("name", "")
                booked_counts[name] = booked_counts.get(name, 0) + 1

    return booked_counts


# ── Rentals ──────────────────────────────────────────────────

def get_all_rentals() -> list[dict]:
    sb = get_client()
    res = sb.table("rentals").select("*").order("created_at", desc=True).execute()
    return res.data


def get_rentals_by_status(status: str) -> list[dict]:
    sb = get_client()
    res = sb.table("rentals").select("*").eq("status", status).order("event_date").execute()
    return res.data


def create_rental(event_name: str, client_name: str, client_phone: str,
                  event_date: str, return_date: str, venue: str, notes: str,
                  estimated_cost: float = 0) -> dict:
    sb = get_client()
    data = {
        "event_name": event_name,
        "client_name": client_name,
        "client_phone": client_phone,
        "event_date": event_date,
        "return_date": return_date,
        "venue": venue,
        "status": "pending",
        "notes": notes,
        "estimated_cost": estimated_cost,
    }
    res = sb.table("rentals").insert(data).execute()
    return res.data[0] if res.data else {}



def update_rental_status(rental_id: str, status: str):
    sb = get_client()
    sb.table("rentals").update({"status": status}).eq("id", rental_id).execute()


# ── Rental Items (junction) ──────────────────────────────────

def link_items_to_rental(rental_id: str, item_ids: list[str]):
    sb = get_client()
    rows = [{"rental_id": rental_id, "item_id": iid} for iid in item_ids]
    sb.table("rental_items").insert(rows).execute()


def get_rental_items(rental_id: str) -> list[dict]:
    sb = get_client()
    res = sb.table("rental_items").select("item_id, items(*)").eq("rental_id", rental_id).execute()
    return res.data


def unlink_rental_items(rental_id: str):
    sb = get_client()
    sb.table("rental_items").delete().eq("rental_id", rental_id).execute()


# ── Approve / Return workflows ───────────────────────────────

def approve_rental(rental_id: str, item_ids: list[str]):
    link_items_to_rental(rental_id, item_ids)
    update_items_status(item_ids, "in_use")
    update_rental_status(rental_id, "approved")


def return_rental(rental_id: str):
    ri = get_rental_items(rental_id)
    item_ids = [r["item_id"] for r in ri]
    update_items_status(item_ids, "available")
    update_rental_status(rental_id, "returned")


def cancel_rental(rental_id: str):
    ri = get_rental_items(rental_id)
    if ri:
        item_ids = [r["item_id"] for r in ri]
        update_items_status(item_ids, "available")
        unlink_rental_items(rental_id)
    update_rental_status(rental_id, "cancelled")


# ── Seeding ──────────────────────────────────────────────────

def seed_from_json(json_path: str) -> int:
    with open(json_path, "r") as f:
        data = json.load(f)

    count = 0
    counters: dict[str, int] = {}

    for case in data["cases"]:
        case_name = case["name"]
        for item in case["items"]:
            cat = item["category"]
            prefix = get_prefix(cat)
            qty = item.get("qty", 1)

            # Skip items with 0 quantity (e.g. missing power cable)
            if qty <= 0:
                continue

            for _ in range(qty):
                if prefix not in counters:
                    counters[prefix] = 0
                counters[prefix] += 1
                barcode = f"DJM-{prefix}-{counters[prefix]:04d}"

                add_item(
                    barcode=barcode,
                    name=item["name"],
                    brand=item.get("brand", "Generic"),
                    category=cat,
                    storage_case=case_name,
                    notes=item.get("notes", ""),
                    purchase_price=item.get("purchase_price", 0),
                    current_value=item.get("current_value", 0),
                    rate_half_day=item.get("rate_half_day", 0),
                    rate_daily=item.get("rate_daily", 0),
                    rate_weekend=item.get("rate_weekend", 0),
                )
                count += 1

    return count


# ── Phase 2: Estimates, Employees, and Labor Tracking ────────

def set_final_cost(rental_id: str, final_cost: float):
    sb = get_client()
    sb.table("rentals").update({"final_cost": final_cost}).eq("id", rental_id).execute()


# Employees
def get_employees() -> list:
    sb = get_client()
    res = sb.table("employees").select("*").order("name").execute()
    return res.data

def add_employee(name: str, role: str, phone: str = "", email: str = ""):
    sb = get_client()
    sb.table("employees").insert({"name": name, "role": role, "phone": phone, "email": email}).execute()


# Rental Assignments
def assign_employee(rental_id: str, employee_id: str, role_for_event: str):
    sb = get_client()
    sb.table("rental_assignments").insert({
        "rental_id": rental_id,
        "employee_id": employee_id,
        "role_for_event": role_for_event
    }).execute()

def get_assignments_for_rental(rental_id: str) -> list:
    sb = get_client()
    res = sb.table("rental_assignments").select("*, employees(*)").eq("rental_id", rental_id).execute()
    return res.data


# Time Logs
def log_time(rental_id: str, employee_id: str, hours: float, task: str, logged_date: str):
    sb = get_client()
    sb.table("time_logs").insert({
        "rental_id": rental_id,
        "employee_id": employee_id,
        "hours": hours,
        "task_description": task,
        "logged_date": logged_date
    }).execute()

def get_time_logs_for_rental(rental_id: str) -> list:
    sb = get_client()
    res = sb.table("time_logs").select("*, employees(*)").eq("rental_id", rental_id).execute()
    return res.data

def get_all_time_logs() -> list:
    sb = get_client()
    res = sb.table("time_logs").select("*, employees(*), rentals(event_name)").order("logged_date", desc=True).execute()
    return res.data


# Contractor Payments
def log_payment(rental_id: str, employee_id: str, amount: float, payment_date: str, notes: str):
    sb = get_client()
    sb.table("contractor_payments").insert({
        "rental_id": rental_id,
        "employee_id": employee_id,
        "amount": amount,
        "payment_date": payment_date,
        "notes": notes
    }).execute()

def get_payments_for_rental(rental_id: str) -> list:
    sb = get_client()
    res = sb.table("contractor_payments").select("*, employees(*)").eq("rental_id", rental_id).execute()
    return res.data

def get_all_payments() -> list:
    sb = get_client()
    res = sb.table("contractor_payments").select("*, employees(*), rentals(event_name)").order("payment_date", desc=True).execute()
    return res.data


# ── Discount Codes ───────────────────────────────────────────

def create_discount_code(code: str, percent_off: int, max_uses: int = 0, expires_at: str = None):
    sb = get_client()
    row = {
        "code": code.strip().upper(),
        "percent_off": percent_off,
        "max_uses": max_uses,
        "times_used": 0,
        "active": True,
    }
    if expires_at:
        row["expires_at"] = expires_at
    sb.table("discount_codes").insert(row).execute()


def get_all_discount_codes() -> list:
    sb = get_client()
    res = sb.table("discount_codes").select("*").order("created_at", desc=True).execute()
    return res.data


def validate_discount_code(code: str) -> dict | None:
    """Returns the discount row if valid, else None."""
    sb = get_client()
    res = sb.table("discount_codes").select("*").eq("code", code.strip().upper()).eq("active", True).execute()
    if not res.data:
        return None
    row = res.data[0]
    # Check max uses (0 = unlimited)
    if row["max_uses"] > 0 and row["times_used"] >= row["max_uses"]:
        return None
    # Check expiry
    if row.get("expires_at"):
        from datetime import datetime, timezone
        try:
            exp = datetime.fromisoformat(row["expires_at"].replace("Z", "+00:00"))
            if datetime.now(timezone.utc) > exp:
                return None
        except Exception:
            pass
    return row


def use_discount_code(code_id: str):
    """Increment times_used by 1."""
    sb = get_client()
    row = sb.table("discount_codes").select("times_used").eq("id", code_id).execute().data[0]
    sb.table("discount_codes").update({"times_used": row["times_used"] + 1}).eq("id", code_id).execute()


def toggle_discount_code(code_id: str, active: bool):
    sb = get_client()
    sb.table("discount_codes").update({"active": active}).eq("id", code_id).execute()


def delete_discount_code(code_id: str):
    sb = get_client()
    sb.table("discount_codes").delete().eq("id", code_id).execute()


# ── Todos ────────────────────────────────────────────────────

def create_todo(title: str, due_date: str = None, rental_id: str = None):
    sb = get_client()
    row = {"title": title, "done": False}
    if due_date:
        row["due_date"] = due_date
    if rental_id:
        row["rental_id"] = rental_id
    sb.table("todos").insert(row).execute()


def get_todos(show_done: bool = False) -> list:
    sb = get_client()
    q = sb.table("todos").select("*, rentals(event_name)").order("created_at", desc=True)
    if not show_done:
        q = q.eq("done", False)
    return q.execute().data


def toggle_todo(todo_id: str, done: bool):
    sb = get_client()
    sb.table("todos").update({"done": done}).eq("id", todo_id).execute()


def delete_todo(todo_id: str):
    sb = get_client()
    sb.table("todos").delete().eq("id", todo_id).execute()


# ── Activity Log ─────────────────────────────────────────────

def log_activity(action: str, detail: str = None, rental_id: str = None):
    sb = get_client()
    row = {"action": action}
    if detail:
        row["detail"] = detail
    if rental_id:
        row["rental_id"] = rental_id
    try:
        sb.table("activity_log").insert(row).execute()
    except Exception:
        pass  # Don't break the app if logging fails


def get_recent_activity(limit: int = 15) -> list:
    sb = get_client()
    res = sb.table("activity_log").select("*").order("created_at", desc=True).limit(limit).execute()
    return res.data


# ── Email Notifications ──────────────────────────────────────

def send_email_notification(subject: str, body: str):
    """Send an email notification using Gmail SMTP."""
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart

    try:
        smtp_user = st.secrets.get("SMTP_USER")
        smtp_pass = st.secrets.get("SMTP_APP_PASSWORD")
        notify_to = st.secrets.get("NOTIFY_EMAIL")

        if not all([smtp_user, smtp_pass, notify_to]):
            return  # Silently skip if not configured

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"DJM Audio Alerts <{smtp_user}>"
        msg["To"] = notify_to

        # Plain text
        msg.attach(MIMEText(body, "plain"))

        # HTML version
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px 12px 0 0;">
                <h2 style="color: white; margin: 0;">🎵 DJM Audio</h2>
            </div>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 12px 12px; border: 1px solid #e9ecef;">
                <h3>{subject}</h3>
                <div style="white-space: pre-wrap; line-height: 1.6;">{body}</div>
                <hr style="border: none; border-top: 1px solid #dee2e6; margin: 16px 0;">
                <p style="color: #6c757d; font-size: 12px;">Sent from DJM Audio Inventory System</p>
            </div>
        </div>
        """
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, notify_to, msg.as_string())

    except Exception as e:
        # Log but don't crash
        print(f"Email notification failed: {e}")


def send_sms_notification(message: str):
    """Send SMS via Twilio if configured."""
    try:
        account_sid = st.secrets.get("TWILIO_SID")
        auth_token = st.secrets.get("TWILIO_TOKEN")
        from_number = st.secrets.get("TWILIO_FROM")
        to_number = st.secrets.get("NOTIFY_PHONE")

        if not all([account_sid, auth_token, from_number, to_number]):
            return  # Silently skip if not configured

        from twilio.rest import Client as TwilioClient
        client = TwilioClient(account_sid, auth_token)
        client.messages.create(body=message, from_=from_number, to=to_number)
    except ImportError:
        pass  # twilio not installed
    except Exception as e:
        print(f"SMS notification failed: {e}")


def notify(subject: str, body: str):
    """Send both email and SMS notifications."""
    send_email_notification(subject, body)
    # SMS gets a shortened version
    sms_text = f"DJM Audio: {subject}"
    send_sms_notification(sms_text)


# ── Maintenance Log ──────────────────────────────────────────

def log_maintenance(item_id: str, action: str, notes: str = "", cost: float = 0):
    sb = get_client()
    sb.table("maintenance_log").insert({
        "item_id": item_id,
        "action": action,
        "notes": notes,
        "cost": cost,
    }).execute()


def get_maintenance_for_item(item_id: str) -> list:
    sb = get_client()
    res = sb.table("maintenance_log").select("*").eq("item_id", item_id).order("created_at", desc=True).execute()
    return res.data


def get_all_maintenance() -> list:
    sb = get_client()
    res = sb.table("maintenance_log").select("*, items(name, barcode, brand)").order("created_at", desc=True).limit(50).execute()
    return res.data


# ── Feedback ─────────────────────────────────────────────────

def submit_feedback(rental_id: str, rating: int, comment: str = ""):
    sb = get_client()
    sb.table("feedback").insert({
        "rental_id": rental_id,
        "rating": rating,
        "comment": comment,
    }).execute()


def get_feedback_for_rental(rental_id: str) -> list:
    sb = get_client()
    res = sb.table("feedback").select("*").eq("rental_id", rental_id).execute()
    return res.data


def get_all_feedback() -> list:
    sb = get_client()
    res = sb.table("feedback").select("*, rentals(event_name, client_name)").order("created_at", desc=True).execute()
    return res.data


# ── Waivers ──────────────────────────────────────────────────

def save_waiver(rental_id: str, client_name: str, signature_data: str, waiver_text: str):
    sb = get_client()
    sb.table("waivers").insert({
        "rental_id": rental_id,
        "client_name": client_name,
        "signature_data": signature_data,
        "waiver_text": waiver_text,
    }).execute()


def get_waiver_for_rental(rental_id: str) -> dict | None:
    sb = get_client()
    res = sb.table("waivers").select("*").eq("rental_id", rental_id).execute()
    return res.data[0] if res.data else None


# ── Check-in / Check-out Scanning ────────────────────────────

def checkin_item(item_id: str, rental_id: str = None):
    """Mark item as returned/available."""
    sb = get_client()
    sb.table("items").update({"status": "available"}).eq("id", item_id).execute()
    log_activity("Gear checked in", f"Item returned to inventory", rental_id)


def checkout_item(item_id: str, rental_id: str = None):
    """Mark item as deployed/in_use."""
    sb = get_client()
    sb.table("items").update({"status": "in_use"}).eq("id", item_id).execute()
    log_activity("Gear checked out", f"Item deployed for event", rental_id)


def get_item_by_barcode(barcode: str) -> dict | None:
    sb = get_client()
    res = sb.table("items").select("*").eq("barcode", barcode).execute()
    return res.data[0] if res.data else None


# ── Invoice / PDF Generation ─────────────────────────────────

def generate_invoice_pdf(rental: dict, items: list) -> bytes:
    """Generate a professional PDF invoice and return as bytes."""
    from fpdf import FPDF
    from datetime import datetime

    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    # Header
    pdf.set_fill_color(102, 126, 234)
    pdf.rect(0, 0, 210, 40, "F")
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 24)
    pdf.set_y(10)
    pdf.cell(0, 10, "DJM AUDIO", ln=True, align="L")
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 6, "Professional Audio & Lighting Rentals | Los Angeles, CA", ln=True)

    # Invoice info
    pdf.set_text_color(0, 0, 0)
    pdf.set_y(50)
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, "INVOICE", ln=True)

    pdf.set_font("Helvetica", "", 10)
    pdf.cell(95, 6, f"Date: {datetime.now().strftime('%B %d, %Y')}")
    pdf.cell(95, 6, f"Invoice #: INV-{rental.get('id', 'N/A')[:8].upper()}", ln=True)

    pdf.ln(5)
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(0, 6, "Bill To:", ln=True)
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 5, f"{rental.get('client_name', 'N/A')}", ln=True)
    pdf.cell(0, 5, f"Phone: {rental.get('client_phone', 'N/A')}", ln=True)

    pdf.ln(5)
    pdf.cell(95, 5, f"Event: {rental.get('event_name', 'N/A')}")
    pdf.cell(95, 5, f"Venue: {rental.get('venue', 'TBD')}", ln=True)
    pdf.cell(95, 5, f"Event Date: {rental.get('event_date', 'N/A')}")
    pdf.cell(95, 5, f"Return Date: {rental.get('return_date', 'N/A')}", ln=True)

    # Items table
    pdf.ln(10)
    pdf.set_fill_color(240, 240, 240)
    pdf.set_font("Helvetica", "B", 10)
    pdf.cell(90, 8, "Item", border=1, fill=True)
    pdf.cell(30, 8, "Qty", border=1, fill=True, align="C")
    pdf.cell(35, 8, "Rate", border=1, fill=True, align="C")
    pdf.cell(35, 8, "Subtotal", border=1, fill=True, align="C")
    pdf.ln()

    pdf.set_font("Helvetica", "", 10)
    total = 0
    for item in items:
        i = item.get("items", {})
        if not i:
            continue
        rate = float(i.get("rate_daily") or 0)
        total += rate
        pdf.cell(90, 7, f"{i.get('brand', '')} {i.get('name', '')}"[:45], border=1)
        pdf.cell(30, 7, "1", border=1, align="C")
        pdf.cell(35, 7, f"${rate:.2f}", border=1, align="C")
        pdf.cell(35, 7, f"${rate:.2f}", border=1, align="C")
        pdf.ln()

    # Total
    final_cost = float(rental.get("final_cost") or rental.get("estimated_cost") or total)
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(155, 8, "TOTAL", border=1, align="R")
    pdf.cell(35, 8, f"${final_cost:.2f}", border=1, align="C")
    pdf.ln()

    # Footer
    pdf.ln(15)
    pdf.set_font("Helvetica", "I", 9)
    pdf.multi_cell(0, 5,
        "Thank you for choosing DJM Audio! Payment is due upon delivery. "
        "All equipment must be returned in the same condition. "
        "Late returns will be charged at the daily rate. "
        "Contact: djmaudiopro@gmail.com"
    )

    return pdf.output()


def generate_waiver_pdf(rental: dict, signature_data: str = "") -> bytes:
    """Generate a liability waiver PDF."""
    from fpdf import FPDF
    from datetime import datetime

    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    # Header
    pdf.set_fill_color(102, 126, 234)
    pdf.rect(0, 0, 210, 35, "F")
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 20)
    pdf.set_y(8)
    pdf.cell(0, 10, "DJM AUDIO — LIABILITY WAIVER", ln=True, align="C")
    pdf.set_font("Helvetica", "", 9)
    pdf.cell(0, 6, "Equipment Rental Agreement & Liability Release", ln=True, align="C")

    pdf.set_text_color(0, 0, 0)
    pdf.set_y(45)
    pdf.set_font("Helvetica", "", 10)

    client = rental.get("client_name", "________________")
    event = rental.get("event_name", "________________")
    evt_date = rental.get("event_date", "____")
    ret_date = rental.get("return_date", "____")

    waiver_text = f"""EQUIPMENT RENTAL AGREEMENT

This Equipment Rental Agreement ("Agreement") is entered into between DJM Audio ("Company") and {client} ("Renter") on {datetime.now().strftime('%B %d, %Y')}.

EVENT DETAILS:
Event: {event}
Event Date: {evt_date}
Return Date: {ret_date}
Venue: {rental.get('venue', 'TBD')}

TERMS AND CONDITIONS:

1. RENTAL PERIOD: Equipment must be returned by the Return Date specified above. Late returns will be charged at the applicable daily rate.

2. CARE OF EQUIPMENT: Renter agrees to exercise reasonable care in the use, handling, and storage of all rented equipment. Equipment must be returned in the same condition as received.

3. DAMAGE & LOSS: Renter is fully responsible for any damage, loss, or theft of equipment from the time of pickup/delivery until return. Renter agrees to pay the full replacement cost for any lost or irreparably damaged equipment.

4. LIABILITY RELEASE: Renter assumes all risk associated with the use of rented equipment. DJM Audio shall not be liable for any injury, damage, or loss arising from the use of rented equipment.

5. INDEMNIFICATION: Renter agrees to indemnify and hold harmless DJM Audio from any claims, damages, or expenses arising from Renter's use of the equipment.

6. CANCELLATION: Cancellations made less than 48 hours before the event date may be subject to a cancellation fee of up to 50% of the rental cost.

7. PAYMENT: Full payment is due upon delivery/pickup of equipment unless otherwise agreed in writing.

By signing below, Renter acknowledges that they have read, understood, and agree to all terms and conditions outlined in this Agreement."""

    pdf.multi_cell(0, 5, waiver_text)

    pdf.ln(10)
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(95, 8, f"Renter: {client}")
    pdf.cell(95, 8, f"Date: {datetime.now().strftime('%m/%d/%Y')}", ln=True)
    pdf.ln(5)
    pdf.cell(95, 8, "Signature: ________________________")
    pdf.cell(95, 8, "DJM Audio Rep: ________________________", ln=True)

    return pdf.output()


def send_feedback_request_email(rental: dict):
    """Send post-event feedback request to client."""
    client_name = rental.get("client_name", "Valued Customer")
    event_name = rental.get("event_name", "your event")

    # We don't have client email, so notify admin to follow up
    body = (
        f"Rental '{event_name}' for {client_name} is complete.\n\n"
        f"Consider following up with {client_name} at {rental.get('client_phone', 'N/A')} "
        f"to collect feedback and ask for a review.\n\n"
        f"Feedback link: Share your app's feedback page with them."
    )
    send_email_notification(f"📝 Follow up: {event_name}", body)
