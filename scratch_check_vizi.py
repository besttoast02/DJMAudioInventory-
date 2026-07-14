import db
import json

items = db.get_all_items()
vizi = [i for i in items if "vizi" in i.get("name", "").lower() or "beam" in i.get("name", "").lower() or "rx" in i.get("name", "").lower() or "head" in i.get("name", "").lower()]

if vizi:
    print(json.dumps([{"name": v["name"], "brand": v["brand"], "qty": 1} for v in vizi], indent=2))
else:
    print("No Vizi Beams or moving heads found in DB")
