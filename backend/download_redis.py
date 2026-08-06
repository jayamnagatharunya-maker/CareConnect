import urllib.request
import os

url = "https://github.com/microsoftarchive/redis/releases/download/win-3.2.100/Redis-x64-3.2.100.zip"
dest = os.path.join(os.path.dirname(__file__), "redis-windows.zip")
print('Downloading', url)
try:
    urllib.request.urlretrieve(url, dest)
    print('Downloaded to', dest)
    print('Size:', os.path.getsize(dest))
except Exception as exc:
    print('Download failed:', exc)
