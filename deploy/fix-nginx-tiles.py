#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Insert /cesium-sat/amap/ tile proxy into hello-roamly.conf and reload nginx."""
import re
import subprocess

CONF = "/etc/nginx/conf.d/hello-roamly.conf"

TILE_LOCATION = """    # 高德卫星瓦片代理（Cesium 飞行底图 /cesium-sat/amap/{z}/{x}/{y}）
    location ~ ^/cesium-sat/amap/(?<tz>\\d+)/(?<tx>\\d+)/(?<ty>\\d+)(?:\\.(?:jpg|jpeg|png))?$ {
        resolver 223.5.5.5 119.29.29.29 valid=300s;
        proxy_pass https://webst01.is.autonavi.com/appmaptile?style=6&x=$tx&y=$ty&z=$tz;
        proxy_set_header Referer https://www.amap.com/;
        proxy_set_header User-Agent "Mozilla/5.0 HelloRoamlySnailFlight";
        proxy_cache_valid 200 1d;
        add_header Cache-Control "public, max-age=86400";
    }
"""

with open(CONF, encoding="utf-8") as f:
    content = f.read()

if "cesium-sat/amap" in content:
    print("already present, skip")
else:
    # Insert right before the first "location /assets/" block (both servers) or
    # simply before "location / {" inside the 443 server. We insert once before
    # the first occurrence of "location /assets/ {".
    marker = "    location /assets/ {"
    if marker not in content:
        print("marker not found")
        raise SystemExit(1)
    content = content.replace(marker, TILE_LOCATION + "\n" + marker, 1)
    with open(CONF, "w", encoding="utf-8") as f:
        f.write(content)
    print("inserted")

r = subprocess.run(["nginx", "-t"], capture_output=True, text=True)
print("nginx -t:", r.returncode)
print(r.stdout + r.stderr)
if r.returncode == 0:
    subprocess.run(["nginx", "-s", "reload"], check=True)
    print("reloaded")
