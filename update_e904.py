import db

items = db.get_available_items()
e904_items = [i for i in items if i['name'] == 'e904 Drum Microphone']
for i in e904_items:
    db.update_item(i['id'], {'name': 'evolution e904 Dynamic Instrument Microphone'})
    print(f"Updated {i['id']}")
