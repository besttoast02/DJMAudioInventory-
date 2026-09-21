from fpdf import FPDF
from datetime import datetime

class DJMEstimatePDF(FPDF):
    def header(self):
        # Background
        self.set_fill_color(24, 24, 30)
        self.rect(0, 0, 210, 297, "F")
        
        self.set_y(15)
        self.set_text_color(255, 255, 255)
        self.set_font("Helvetica", "B", 26)
        self.cell(100, 10, "ESTIMATE", new_x="RIGHT", new_y="TOP", align="L")
        
        self.set_font("Helvetica", "", 9)
        self.set_text_color(160, 160, 170)
        self.set_xy(100, 15)
        self.cell(100, 5, "701 S. Raymond Avenue, Alhambra, CA 91803", new_x="LMARGIN", new_y="NEXT", align="R")
        self.set_x(100)
        self.cell(100, 5, "rentals@djmaudio.com", new_x="LMARGIN", new_y="NEXT", align="R")
        self.set_x(100)
        self.cell(100, 5, "+1 (626) 506-3824  |  djmaudio.com", new_x="LMARGIN", new_y="NEXT", align="R")
        
        self.set_xy(10, 25)
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(240, 240, 250)
        self.cell(100, 8, "DJM Audio Productions LLC", new_x="LMARGIN", new_y="NEXT", align="L")
        
        self.set_draw_color(50, 50, 65)
        self.line(10, 40, 200, 40)
        self.set_y(45)

def generate_ai_estimate_pdf(
    client_name: str, 
    event_name: str,
    event_date: str,
    venue_name: str,
    venue_address: str,
    audio_items: list[dict],
    lighting_items: list[dict],
    video_items: list[dict],
    notes: str,
    discount_name: str = "",
    discount_amount: float = 0.0
) -> bytes:
    pdf = DJMEstimatePDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    
    # ── BILL TO / EVENT LOCATION ──
    pdf.set_y(45)
    pdf.set_font("Helvetica", "B", 8)
    pdf.set_text_color(140, 140, 150)
    pdf.cell(70, 5, "BILL TO", new_x="RIGHT", new_y="TOP")
    pdf.cell(70, 5, "EVENT LOCATION", new_x="RIGHT", new_y="TOP")
    pdf.cell(50, 5, "ESTIMATE DETAILS", new_x="LMARGIN", new_y="NEXT")
    
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(255, 255, 255)
    
    # Row 1 (Client Name & Venue)
    pdf.cell(70, 5, client_name[:35], new_x="RIGHT", new_y="TOP")
    pdf.cell(70, 5, venue_name[:35], new_x="RIGHT", new_y="TOP")
    
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(140, 140, 150)
    pdf.cell(20, 5, "Estimate no.", new_x="RIGHT", new_y="TOP")
    pdf.set_text_color(255, 255, 255)
    est_num = f"EST-{datetime.now().strftime('%y%m%d')}-{abs(hash(client_name + event_name)) % 9000 + 1000}"
    pdf.cell(30, 5, est_num, new_x="LMARGIN", new_y="NEXT", align="R")
    
    # Row 2 (Event Name & Address)
    pdf.set_text_color(220, 220, 230)
    pdf.cell(70, 5, event_name[:35], new_x="RIGHT", new_y="TOP")
    pdf.cell(70, 5, venue_address[:35], new_x="RIGHT", new_y="TOP")
    
    pdf.set_text_color(140, 140, 150)
    pdf.cell(20, 5, "Estimate date", new_x="RIGHT", new_y="TOP")
    pdf.set_text_color(255, 255, 255)
    pdf.cell(30, 5, datetime.now().strftime("%m/%d/%Y"), new_x="LMARGIN", new_y="NEXT", align="R")
    
    # Row 3
    pdf.set_text_color(220, 220, 230)
    pdf.cell(70, 5, "", new_x="RIGHT", new_y="TOP")
    pdf.cell(70, 5, "", new_x="RIGHT", new_y="TOP")
    
    pdf.set_text_color(140, 140, 150)
    pdf.cell(20, 5, "Event date", new_x="RIGHT", new_y="TOP")
    pdf.set_text_color(255, 255, 255)
    pdf.cell(30, 5, event_date, new_x="LMARGIN", new_y="NEXT", align="R")
    
    pdf.ln(10)
    
    # ── Table Header ──
    pdf.set_font("Helvetica", "B", 8)
    pdf.set_text_color(140, 140, 150)
    pdf.cell(10, 6, "#", new_x="RIGHT", new_y="TOP")
    pdf.cell(45, 6, "ITEM / SERVICE", new_x="RIGHT", new_y="TOP")
    pdf.cell(115, 6, "DESCRIPTION", new_x="RIGHT", new_y="TOP")
    pdf.cell(20, 6, "QTY", new_x="LMARGIN", new_y="NEXT", align="R")
    pdf.set_draw_color(50, 50, 65)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(2)
    
    item_counter = 1
    total_due = 0.0
    
    def render_section(title, items):
        nonlocal item_counter, total_due
        if not items:
            return
            
        pdf.set_fill_color(30, 30, 38)
        pdf.set_font("Helvetica", "B", 10)
        pdf.set_text_color(255, 255, 255)
        
        section_total = sum(float(i.get('price', 0)) * int(i.get('qty', 1)) for i in items)
        total_due += section_total
        
        pdf.cell(160, 8, title, fill=True, new_x="RIGHT", new_y="TOP")
        pdf.cell(30, 8, f"${section_total:,.2f}", fill=True, new_x="LMARGIN", new_y="NEXT", align="R")
        
        pdf.set_font("Helvetica", "", 9)
        pdf.set_fill_color(24, 24, 30)
        
        for item in items:
            pdf.set_text_color(140, 140, 150)
            pdf.cell(10, 7, str(item_counter), new_x="RIGHT", new_y="TOP")
            pdf.set_text_color(255, 255, 255)
            pdf.cell(40, 7, item.get('name', '')[:25], new_x="RIGHT", new_y="TOP")
            pdf.set_text_color(180, 180, 190)
            pdf.cell(120, 7, item.get('desc', '')[:70], new_x="RIGHT", new_y="TOP")
            pdf.set_text_color(140, 140, 150)
            
            qty_val = item.get('qty', 1)
            qty_str = "incl." if qty_val == 0 else str(qty_val)
            pdf.cell(20, 7, qty_str, new_x="LMARGIN", new_y="NEXT", align="R")
            item_counter += 1
            
        pdf.ln(3)

    render_section("AUDIO", audio_items)
    render_section("LIGHTING", lighting_items)
    render_section("VIDEO", video_items)
    
    # ── Totals ──
    pdf.ln(5)
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(180, 180, 190)
    pdf.cell(150, 6, "Subtotal", new_x="RIGHT", new_y="TOP", align="R")
    pdf.set_text_color(255, 255, 255)
    pdf.cell(40, 6, f"${total_due:,.2f}", new_x="LMARGIN", new_y="NEXT", align="R")
    
    if discount_amount > 0:
        pdf.set_text_color(180, 180, 190)
        pdf.cell(150, 6, discount_name or "Discount", new_x="RIGHT", new_y="TOP", align="R")
        pdf.set_text_color(255, 255, 255)
        pdf.cell(40, 6, f"-${discount_amount:,.2f}", new_x="LMARGIN", new_y="NEXT", align="R")
        total_due -= discount_amount
        
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(150, 8, "Total Due", new_x="RIGHT", new_y="TOP", align="R")
    pdf.cell(40, 8, f"${total_due:,.2f}", new_x="LMARGIN", new_y="NEXT", align="R")
    
    # ── Notes ──
    if notes:
        pdf.ln(10)
        pdf.set_fill_color(30, 30, 38)
        pdf.set_font("Helvetica", "B", 10)
        pdf.set_text_color(255, 255, 255)
        pdf.cell(190, 8, "NOTES", fill=True, new_x="LMARGIN", new_y="NEXT")
        
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(180, 180, 190)
        pdf.multi_cell(190, 5, notes)
        
    return bytes(pdf.output())
