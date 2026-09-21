import db

speakers = [
    {
        "barcode": "SPK-IG3T-01",
        "name": "Ingenia IG3T Powered Column",
        "brand": "dBTechnologies",
        "category": "PA Systems",
        "storage_case": "N/A",
        "status": "available",
        "purchase_price": 1700,
        "current_value": 1400,
        "rate_half_day": 85,
        "rate_daily": 120,
        "rate_weekend": 200,
        "notes": "Left/Right pairs can be linked via IR for array stacking",
        "specs_markdown": """### Official Specifications
- **Type**: 2-Way Active Speaker
- **Acoustic Data**: 2x 10" Neodymium Woofers, 1x 1.4" Compression Driver
- **Amplifier**: 900W RMS / 1800W Peak (Digipro G3 Class-D)
- **Max SPL**: 132 dB
- **Dispersion**: 110° x 90° (Asymmetrical)
- **DSP**: 56-bit with OLED display

---

### Coverage Estimation
*Crowd estimations vary by venue acoustics and music type.*

- **1x IG3T (Speech/Bg Music)**: 100 people 
- **2x IG3T (L/R Pair) + 1x Double 18" Sub**: ~400 people (Outdoors/Medium event)
- **4x IG3T (Stacked L/R) + 4x Double 18" Subs**: ~850+ people (Large festival/Concert)
"""
    },
    {
        "barcode": "SUB-JBL828-01",
        "name": "SRX828SP Dual 18\" Subwoofer",
        "brand": "JBL",
        "category": "PA Systems",
        "storage_case": "N/A",
        "status": "available",
        "purchase_price": 2300,
        "current_value": 1800,
        "rate_half_day": 120,
        "rate_daily": 180,
        "rate_weekend": 300,
        "notes": "Requires heavy lifting, very loud",
        "specs_markdown": """### Official Specifications
- **Type**: Dual 18" Self-Powered Subwoofer
- **Amplifier**: 2000W Peak Crown Amplification
- **Max SPL**: 141 dB
- **Frequency Range (-10dB)**: 29 Hz - 150 Hz
- **Drivers**: 2x 2279F 18" woofers with Differential Drive

---

### Coverage Estimation
*Low-frequency coverage adds physical impact to the mix.*

- **1x JBL 828 Sub**: Provides chest-thumping bass for up to 400 people outdoors (paired with 2x Tops).
- **2x JBL 828 Subs**: Club-level bass for 600-800 people.
- **4x JBL 828 Subs**: Touring-level bass for 850-1200+ people.
"""
    },
    {
        "barcode": "SUB-DAS218-01",
        "name": "Vantec-218A Dual 18\" Subwoofer",
        "brand": "DAS Audio",
        "category": "PA Systems",
        "storage_case": "N/A",
        "status": "available",
        "purchase_price": 2500,
        "current_value": 2000,
        "rate_half_day": 130,
        "rate_daily": 190,
        "rate_weekend": 320,
        "notes": "Powerful bass extension",
        "specs_markdown": """### Official Specifications
- **Type**: Active Dual 18" Bass Reflex Subwoofer
- **Amplifier**: 4000W Peak Class-D
- **Max SPL**: 140 dB
- **Frequency Range (-10dB)**: 35 Hz - 125 Hz
- **Drivers**: 2x 18LX woofers

---

### Coverage Estimation
- **1x DAS Sub**: Easily supports a 400 person outdoor crowd.
- **2x DAS Subs**: Pairs well with 4x medium-format tops for ~800 people.
- **4x DAS Subs**: Heavy festival bass for ~1000+ people outdoors.
"""
    }
]

# Insert missing speakers
sb = db.get_client()

for spk in speakers:
    # check if exists
    exists = sb.table("items").select("id").eq("barcode", spk["barcode"]).execute()
    if not exists.data:
        # insert
        try:
            sb.table("items").insert(spk).execute()
            print(f"Inserted: {spk['name']}")
        except Exception as e:
            # Table might not have specs_markdown yet
            print(f"Error inserting {spk['name']}: {e}")
            pass
