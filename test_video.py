import requests

urls = [
    "https://videos.pexels.com/video-files/3163534/3163534-uhd_2560_1440_30fps.mp4",
    "https://cdn.pixabay.com/video/2016/11/21/6462-192667355_large.mp4",
    "https://cdn.pixabay.com/video/2020/05/25/40141-424756597_large.mp4",
    "https://cdn.pixabay.com/video/2019/11/12/29040-372990644_large.mp4"
]

for url in urls:
    try:
        r = requests.head(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=5)
        print(url, r.status_code)
    except Exception as e:
        print(url, str(e))
