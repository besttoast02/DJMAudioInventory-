import requests
import re

url = "https://pixabay.com/videos/search/equalizer/"
try:
    res = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, verify=False)
    html = res.text
    # look for .mp4 links
    links = re.findall(r'https://cdn\.pixabay\.com/video/[^"\']*?\.mp4', html)
    print("Found MP4s:")
    for link in set(links):
        print(link)
except Exception as e:
    print(e)
