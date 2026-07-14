import requests
import json
import re

headers = {"User-Agent": "Mozilla/5.0"}
url = 'https://duckduckgo.com/'
params = {'q': 'audio spectrum equalizer filetype:mp4'}
res = requests.post(url, data=params, headers=headers)
search_obj = re.search(r'vqd=([\'"]?)([\d-]+)\1', res.text)

if search_obj:
    url_vid = 'https://duckduckgo.com/v.js'
    params_vid = {
        'l': 'us-en', 'o': 'json', 'q': 'audio spectrum equalizer filetype:mp4',
        'vqd': search_obj.group(2), 'f': ',,,', 'p': '1'
    }
    res_vid = requests.get(url_vid, params=params_vid, headers=headers)
    data = json.loads(res_vid.text)
    for r in data.get('results', [])[:5]:
        print(r['content'])
