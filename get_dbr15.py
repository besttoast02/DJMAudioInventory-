import requests
import re
from rembg import remove
from PIL import Image
from io import BytesIO

url = "https://usa.yamaha.com/products/proaudio/speakers/dbr/index.html"
headers = {"User-Agent": "Mozilla/5.0"}
res = requests.get(url, headers=headers, timeout=10)

img_match = re.search(r'<meta property="og:image" content="([^"]+)"', res.text)
if img_match:
    img_url = img_match.group(1)
    if img_url.startswith('//'):
        img_url = 'https:' + img_url
    print("Found Image:", img_url)
    
    img_res = requests.get(img_url, headers=headers, timeout=10)
    input_img = Image.open(BytesIO(img_res.content))
    output_img = remove(input_img)
    
    safe_name = "DBR15_Powered_Speaker___Monitor"
    output_img.save(f"assets/inventory_images/{safe_name}.png")
    print("Saved successfully.")
else:
    print("Image not found on Yamaha.")
