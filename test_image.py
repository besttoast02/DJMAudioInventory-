import requests

url = 'https://media.sweetwater.com/api/i/q-82__f-webp__ha-db2630ce4f6277b0__hmac-485a060410efd85c898b3c67cba465d66cbcc445/images/items/750/DBR15-large.jpg'
res = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
if res.status_code == 200:
    from rembg import remove
    from PIL import Image
    from io import BytesIO
    input_img = Image.open(BytesIO(res.content))
    output_img = remove(input_img)
    
    safe_name = "DBR15_Powered_Speaker___Monitor"
    output_img.save(f"assets/inventory_images/{safe_name}.png")
    print("Saved successfully.")
else:
    print("Failed.", res.status_code)
