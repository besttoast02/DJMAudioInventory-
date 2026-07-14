import db

def duplicate_item(name_substring):
    items = db.get_available_items()
    matches = [i for i in items if name_substring.lower() in i['name'].lower()]
    if not matches:
        print(f"No item found matching {name_substring}")
        return
        
    orig = matches[0]
    new_barcode = db.get_next_barcode(orig['category'])
    
    print(f"Duplicating {orig['name']} ({orig['barcode']}) to new barcode {new_barcode}")
    
    db.add_item(
        barcode=new_barcode,
        name=orig['name'],
        brand=orig['brand'],
        category=orig['category'],
        storage_case=orig.get('storage_case') or '',
        notes=orig.get('notes') or '',
        purchase_price=orig.get('purchase_price') or 0.0,
        current_value=orig.get('current_value') or 0.0,
        rate_half_day=orig.get('rate_half_day') or 0.0,
        rate_daily=orig.get('rate_daily') or 0.0,
        rate_weekend=orig.get('rate_weekend') or 0.0,
        rentable=orig.get('rentable', True)
    )

duplicate_item("Event 218A")
duplicate_item("JBL SRX828SP")
