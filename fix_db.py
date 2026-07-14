import db

def fix():
    client = db.get_client()
    res = client.table("items").select("*").ilike("name", "%i6%").execute()
    for item in res.data:
        new_name = item["name"].replace("i6", "D6")
        client.table("items").update({"name": new_name}).eq("id", item["id"]).execute()
        print(f"Updated {item['name']} to {new_name}")

if __name__ == "__main__":
    fix()
