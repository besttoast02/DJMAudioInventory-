"""
Smart inventory parser — turns casual text into clean inventory entries.
Recognizes common audio/lighting gear, expands abbreviations, identifies brands.
"""

import re

# ── Known gear database ──────────────────────────────────────
# Maps nicknames/abbreviations to full professional entries
KNOWN_GEAR = {
    # Microphones
    "sm57": {"name": "SM57 Dynamic Instrument Microphone", "brand": "Shure", "category": "Microphones", "purchase_price": 100, "current_value": 65, "rate_half_day": 12, "rate_daily": 20, "rate_weekend": 32},
    "sm58": {"name": "SM58 Dynamic Vocal Microphone", "brand": "Shure", "category": "Microphones", "purchase_price": 100, "current_value": 65, "rate_half_day": 12, "rate_daily": 20, "rate_weekend": 32},
    "beta58": {"name": "Beta 58A Dynamic Supercardioid Vocal Microphone", "brand": "Shure", "category": "Microphones", "purchase_price": 160, "current_value": 100, "rate_half_day": 15, "rate_daily": 25, "rate_weekend": 40},
    "beta58a": {"name": "Beta 58A Dynamic Supercardioid Vocal Microphone", "brand": "Shure", "category": "Microphones", "purchase_price": 160, "current_value": 100, "rate_half_day": 15, "rate_daily": 25, "rate_weekend": 40},
    "beta52": {"name": "Beta 52A Supercardioid Kick Drum Microphone", "brand": "Shure", "category": "Microphones", "purchase_price": 190, "current_value": 120, "rate_half_day": 16, "rate_daily": 26, "rate_weekend": 42},
    "beta91": {"name": "Beta 91A Boundary Kick Drum Microphone", "brand": "Shure", "category": "Microphones", "purchase_price": 200, "current_value": 130, "rate_half_day": 18, "rate_daily": 28, "rate_weekend": 45},
    "ksm8": {"name": "KSM8 Dualdyne Cardioid Dynamic Vocal Microphone", "brand": "Shure", "category": "Microphones", "purchase_price": 400, "current_value": 280, "rate_half_day": 30, "rate_daily": 50, "rate_weekend": 85},
    "pga56": {"name": "PGA56 Drum/Instrument Microphone", "brand": "Shure", "category": "Microphones", "purchase_price": 100, "current_value": 62, "rate_half_day": 10, "rate_daily": 16, "rate_weekend": 26},
    "pga57": {"name": "PGA57 Dynamic Instrument Microphone", "brand": "Shure", "category": "Microphones", "purchase_price": 100, "current_value": 62, "rate_half_day": 10, "rate_daily": 16, "rate_weekend": 26},
    "pga52": {"name": "PGA52 Kick Drum Microphone", "brand": "Shure", "category": "Microphones", "purchase_price": 100, "current_value": 62, "rate_half_day": 10, "rate_daily": 16, "rate_weekend": 26},
    "pga81": {"name": "PGA81 Condenser Instrument Microphone", "brand": "Shure", "category": "Microphones", "purchase_price": 130, "current_value": 82, "rate_half_day": 12, "rate_daily": 20, "rate_weekend": 32},
    "e904": {"name": "e904 Drum Microphone", "brand": "Sennheiser", "category": "Microphones", "purchase_price": 220, "current_value": 140, "rate_half_day": 18, "rate_daily": 28, "rate_weekend": 45},
    "e906": {"name": "e906 Instrument Microphone", "brand": "Sennheiser", "category": "Microphones", "purchase_price": 190, "current_value": 120, "rate_half_day": 16, "rate_daily": 26, "rate_weekend": 42},
    "e935": {"name": "e935 Dynamic Vocal Microphone", "brand": "Sennheiser", "category": "Microphones", "purchase_price": 170, "current_value": 110, "rate_half_day": 15, "rate_daily": 24, "rate_weekend": 38},
    "e945": {"name": "e945 Dynamic Supercardioid Vocal Microphone", "brand": "Sennheiser", "category": "Microphones", "purchase_price": 200, "current_value": 130, "rate_half_day": 18, "rate_daily": 28, "rate_weekend": 45},
    "i5": {"name": "i5 Dynamic Instrument Microphone", "brand": "Audix", "category": "Microphones", "purchase_price": 100, "current_value": 65, "rate_half_day": 12, "rate_daily": 20, "rate_weekend": 32},
    "i6": {"name": "i6 Kick Drum Microphone", "brand": "Audix", "category": "Microphones", "purchase_price": 230, "current_value": 145, "rate_half_day": 18, "rate_daily": 28, "rate_weekend": 45},
    "d6": {"name": "D6 Kick Drum Microphone", "brand": "Audix", "category": "Microphones", "purchase_price": 200, "current_value": 130, "rate_half_day": 16, "rate_daily": 26, "rate_weekend": 42},

    # Mixers / Controllers
    "sq5": {"name": "SQ-5 Digital Mixing Console", "brand": "Allen & Heath", "category": "Mixers", "purchase_price": 4300, "current_value": 2800, "rate_half_day": 180, "rate_daily": 275, "rate_weekend": 450},
    "sq-5": {"name": "SQ-5 Digital Mixing Console", "brand": "Allen & Heath", "category": "Mixers", "purchase_price": 4300, "current_value": 2800, "rate_half_day": 180, "rate_daily": 275, "rate_weekend": 450},
    "sq6": {"name": "SQ-6 Digital Mixing Console", "brand": "Allen & Heath", "category": "Mixers", "purchase_price": 5500, "current_value": 3800, "rate_half_day": 220, "rate_daily": 350, "rate_weekend": 575},
    "sq7": {"name": "SQ-7 Digital Mixing Console", "brand": "Allen & Heath", "category": "Mixers", "purchase_price": 6500, "current_value": 4500, "rate_half_day": 280, "rate_daily": 425, "rate_weekend": 700},
    "xdj-xz": {"name": "XDJ-XZ All-In-One DJ System", "brand": "Pioneer DJ", "category": "Mixers", "purchase_price": 2599, "current_value": 1800, "rate_half_day": 150, "rate_daily": 250, "rate_weekend": 400},
    "ddj-rev7": {"name": "DDJ-REV7 Scratch-Style DJ Controller", "brand": "Pioneer DJ", "category": "Mixers", "purchase_price": 2000, "current_value": 1400, "rate_half_day": 120, "rate_daily": 200, "rate_weekend": 320},
    "ddj-1000": {"name": "DDJ-1000 4-Channel DJ Controller", "brand": "Pioneer DJ", "category": "Mixers", "purchase_price": 1200, "current_value": 850, "rate_half_day": 80, "rate_daily": 130, "rate_weekend": 210},
    "djm-900nxs2": {"name": "DJM-900NXS2 4-Channel DJ Mixer", "brand": "Pioneer DJ", "category": "Mixers", "purchase_price": 2200, "current_value": 1500, "rate_half_day": 130, "rate_daily": 210, "rate_weekend": 340},

    # DI boxes
    "radial di": {"name": "Radial JDI Duplex Dual Passive Direct Box", "brand": "Radial", "category": "DI / Signal", "purchase_price": 300, "current_value": 190, "rate_half_day": 20, "rate_daily": 30, "rate_weekend": 48},
    "di box": {"name": "Passive Direct Box (DI)", "brand": "Generic", "category": "DI / Signal", "purchase_price": 40, "current_value": 25, "rate_half_day": 5, "rate_daily": 8, "rate_weekend": 12},

    # PA / Speakers
    "evolve 50": {"name": "Evolve 50 Powered Column PA System", "brand": "Electro-Voice", "category": "PA Systems", "purchase_price": 2400, "current_value": 1500, "rate_half_day": 130, "rate_daily": 200, "rate_weekend": 320},

    # Lighting
    "moving head": {"name": "Moving Head Beam/Wash Light Fixture", "brand": "Generic", "category": "Lighting", "purchase_price": 350, "current_value": 220, "rate_half_day": 30, "rate_daily": 55, "rate_weekend": 100},
    "par can": {"name": "LED Par Can Wash Light", "brand": "Generic", "category": "Lighting", "purchase_price": 120, "current_value": 70, "rate_half_day": 15, "rate_daily": 25, "rate_weekend": 40},
    "fog machine": {"name": "Fog Machine", "brand": "Generic", "category": "Lighting", "purchase_price": 200, "current_value": 120, "rate_half_day": 25, "rate_daily": 40, "rate_weekend": 65},

    # Stands
    "boom stand": {"name": "Boom Microphone Stand", "brand": "Generic", "category": "Stands", "purchase_price": 30, "current_value": 18, "rate_half_day": 3, "rate_daily": 5, "rate_weekend": 8},
    "mic stand": {"name": "Straight Microphone Stand", "brand": "Generic", "category": "Stands", "purchase_price": 22, "current_value": 10, "rate_half_day": 2, "rate_daily": 4, "rate_weekend": 7},
    "speaker stand": {"name": "Tripod Speaker Stand", "brand": "Generic", "category": "Stands", "purchase_price": 45, "current_value": 25, "rate_half_day": 5, "rate_daily": 8, "rate_weekend": 12},
}

# ── Cable patterns ───────────────────────────────────────────
CABLE_TYPES = {
    "xlr": {"name_template": "{length} XLR Balanced Cable", "category": "XLR Cables", "price_per_foot": 1.2},
    "dmx": {"name_template": "{length} DMX Cable", "category": "DMX Cables", "price_per_foot": 1.0},
    "trs": {"name_template": "{length} 1/4\" TRS Cable", "category": "TRS Cables", "price_per_foot": 1.0},
    "ethernet": {"name_template": "{length} Ethernet Cable (Cat5e)", "category": "Data", "price_per_foot": 0.5},
    "powercon": {"name_template": "{length} Powercon Cable", "category": "Power", "price_per_foot": 1.5},
    "extension": {"name_template": "{length} Extension Cable", "category": "Power", "price_per_foot": 0.7},
    "power cable": {"name_template": "Standard AC Power Cable", "category": "Power", "price_per_foot": 0},
    "coax": {"name_template": "{length} Coaxial Antenna Extension Cable", "category": "Coaxial", "price_per_foot": 0.8},
}

# ── Brand aliases ────────────────────────────────────────────
BRAND_ALIASES = {
    "shure": "Shure",
    "senny": "Sennheiser",
    "sennheiser": "Sennheiser",
    "audix": "Audix",
    "a&h": "Allen & Heath",
    "allen heath": "Allen & Heath",
    "allen & heath": "Allen & Heath",
    "pioneer": "Pioneer DJ",
    "pioneer dj": "Pioneer DJ",
    "ev": "Electro-Voice",
    "electro-voice": "Electro-Voice",
    "neutrik": "Neutrik",
    "rean": "Rean (Neutrik)",
    "roland": "Roland",
    "warm audio": "Warm Audio",
    "jumperz": "Jumperz",
    "cable matters": "Cable Matters",
    "chauvet": "Chauvet",
    "furman": "Furman",
    "seetronic": "Seetronic",
    "jbl": "JBL",
    "radial": "Radial",
    "on-stage": "On-Stage",
    "on stage": "On-Stage",
    "db tech": "dB Technologies",
    "db technologies": "dB Technologies",
    "ingenia": "dB Technologies",
    "american dj": "American DJ",
    "adj": "American DJ",
}


def parse_line(text: str) -> list[dict]:
    """
    Parse a single line of casual text into one or more inventory items.
    
    Examples:
        "3x 25ft xlr neutrik" → 3 items
        "sm57" → 1 Shure SM57
        "2 boom stands" → 2 boom stands
        "got a new beta58, paid $160" → 1 Shure Beta 58A with price
    """
    text = text.strip()
    if not text:
        return []

    results = []
    line_lower = text.lower()

    # ── Extract quantity ─────────────────────────────────────
    qty = 1
    qty_match = re.match(r'^(\d+)\s*[xX×]?\s*', text)
    if qty_match:
        qty = int(qty_match.group(1))
        text = text[qty_match.end():]
        line_lower = text.lower()

    # ── Extract price ────────────────────────────────────────
    price = 0
    price_match = re.search(r'\$\s*(\d+(?:\.\d{2})?)', text)
    if price_match:
        price = float(price_match.group(1))

    # ── Extract brand ────────────────────────────────────────
    detected_brand = None
    for alias, full_brand in sorted(BRAND_ALIASES.items(), key=lambda x: -len(x[0])):
        if alias in line_lower:
            detected_brand = full_brand
            break

    # ── Extract cable length ─────────────────────────────────
    length = None
    length_match = re.search(r"(\d+)['\s]*(?:ft|foot|feet|')", line_lower)
    if length_match:
        length = f"{length_match.group(1)}'"

    # ── Try known gear first ─────────────────────────────────
    matched = None
    for key, gear in sorted(KNOWN_GEAR.items(), key=lambda x: -len(x[0])):
        if key in line_lower:
            matched = gear.copy()
            break

    if matched:
        if detected_brand:
            matched["brand"] = detected_brand
        if price > 0:
            matched["purchase_price"] = price
            matched["current_value"] = round(price * 0.65)
        item = {
            "name": matched["name"],
            "brand": matched["brand"],
            "category": matched["category"],
            "qty": qty,
            "purchase_price": matched["purchase_price"],
            "current_value": matched["current_value"],
            "rate_half_day": matched["rate_half_day"],
            "rate_daily": matched["rate_daily"],
            "rate_weekend": matched["rate_weekend"],
            "notes": "",
            "storage_case": "",
        }
        results.append(item)
        return results

    # ── Try cable patterns ───────────────────────────────────
    for cable_key, cable_info in CABLE_TYPES.items():
        if cable_key in line_lower:
            cable_length = length or "25'"
            name = cable_info["name_template"].format(length=cable_length)
            if cable_info["price_per_foot"] > 0 and length:
                feet = int(re.search(r'\d+', cable_length).group())
                est_price = round(feet * cable_info["price_per_foot"] + 5)
            else:
                est_price = 10
            if price > 0:
                est_price = price

            item = {
                "name": name,
                "brand": detected_brand or "Generic",
                "category": cable_info["category"],
                "qty": qty,
                "purchase_price": est_price,
                "current_value": round(est_price * 0.6),
                "rate_half_day": max(1, round(est_price * 0.1)),
                "rate_daily": max(2, round(est_price * 0.15)),
                "rate_weekend": max(3, round(est_price * 0.25)),
                "notes": "",
                "storage_case": "",
            }
            results.append(item)
            return results

    # ── Fallback: unknown item ───────────────────────────────
    # Clean up the text and use it as the item name
    clean_name = text.strip().rstrip(".,;")
    # Remove price references
    clean_name = re.sub(r'\$\s*\d+(?:\.\d{2})?', '', clean_name).strip()
    # Remove quantity references at the start
    clean_name = re.sub(r'^\d+\s*[xX×]?\s*', '', clean_name).strip()
    # Capitalize properly
    clean_name = clean_name.title() if clean_name else "Unknown Item"

    item = {
        "name": clean_name,
        "brand": detected_brand or "Generic",
        "category": "Hardware",
        "qty": qty,
        "purchase_price": price if price > 0 else 0,
        "current_value": round(price * 0.65) if price > 0 else 0,
        "rate_half_day": 0,
        "rate_daily": 0,
        "rate_weekend": 0,
        "notes": f"Auto-parsed — verify name/category",
        "storage_case": "",
    }
    results.append(item)
    return results


def parse_text(text: str) -> list[dict]:
    """Parse multiple lines of text into inventory items."""
    lines = text.strip().split("\n")
    all_items = []
    for line in lines:
        line = line.strip().lstrip("-•·►▸→ ")
        if line:
            items = parse_line(line)
            all_items.extend(items)
    return all_items
