import db
import requests
import re
from rembg import remove
from PIL import Image
from io import BytesIO

items = db.get_available_items()

# Find the DAS item
das_items = [i for i in items if 'das' in i['brand'].lower() or 'das' in i['name'].lower()]
for i in das_items:
    print("Found DAS:", i['id'], i['brand'], i['name'])
    
    # Update it
    new_name = "Event 218A Dual 18-inch Powered Subwoofer"
    new_brand = "DAS"
    db.update_item(i['id'], {'name': new_name, 'brand': new_brand})
    
# Let's scrape idjnow for the image
url = "https://www.idjnow.com/das-event-218a-dual-18-inch-powered-subwoofer.html"
headers = {"User-Agent": "Mozilla/5.0"}
res = requests.get(url, headers=headers, timeout=10)

img_match = re.search(r'<meta property="og:image" content="([^"]+)"', res.text)
if img_match:
    img_url = img_match.group(1)
    print("Found Image:", img_url)
    img_res = requests.get(img_url, headers=headers, timeout=10)
    input_img = Image.open(BytesIO(img_res.content))
    output_img = remove(input_img)
    
    safe_name = new_name.replace(" ", "_").replace("/", "_")
    output_img.save(f"assets/inventory_images/{safe_name}.png")
    print("Saved image")
else:
    print("No image found in og tags")
