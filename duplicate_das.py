import db
import uuid

items = db.get_available_items()

# Find the DAS item
das_items = [i for i in items if 'Event 218A Dual 18-inch Powered Subwoofer' in i['name']]

if das_items:
    original = das_items[0]
    print(f"Original ID: {original['id']}")
    
    # Create a new item by copying fields
    new_item = {
        'id': str(uuid.uuid4()),
        'name': original['name'],
        'brand': original['brand'],
        'category': original['category'],
        'status': original['status'],
        'purchase_price': original.get('purchase_price', 0.0),
        'current_value': original.get('current_value', 0.0),
        'rate_half_day': original.get('rate_half_day', 0.0),
        'rate_daily': original.get('rate_daily', 0.0),
        'rate_weekend': original.get('rate_weekend', 0.0),
        'notes': original.get('notes', ''),
        'rentable': original.get('rentable', True)
    }
    
    db.add_item(new_item)
    print(f"Created duplicate with ID: {new_item['id']}")
else:
    print("DAS item not found!")
