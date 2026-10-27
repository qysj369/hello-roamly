"""Add the working satellite-tile proxy to the HTTPS server block."""
from pathlib import Path

CONF = Path("/etc/nginx/conf.d/hello-roamly.conf")
BLOCK = """
    # 高德卫星瓦片代理（Cesium 飞行底图 /cesium-sat/amap/{z}/{x}/{y}）
    location ~ ^/cesium-sat/amap/(?<tz>\\d+)/(?<tx>\\d+)/(?<ty>\\d+)(?:\\.(?:jpg|jpeg|png))?$ {
        resolver 223.5.5.5 119.29.29.29 valid=300s;
        proxy_pass https://webst01.is.autonavi.com/appmaptile?style=6&x=$tx&y=$ty&z=$tz;
        proxy_set_header Referer https://www.amap.com/;
        proxy_set_header User-Agent "Mozilla/5.0 HelloRoamlySnailFlight";
        proxy_cache_valid 200 1d;
        add_header Cache-Control "public, max-age=86400";
    }

"""
NEEDLE = "    location / {\n        try_files $uri $uri/ /index.html;\n    }"


def main() -> None:
    text = CONF.read_text(encoding="utf-8")
    marker = "listen 443"
    if marker not in text:
        raise SystemExit("NO_HTTPS_SERVER")
    https = text.split(marker, 1)[1]
    if "cesium-sat" in https:
        print("https-already")
        return
    idx = text.rfind(NEEDLE)
    if idx < 0:
        raise SystemExit("NEEDLE_MISSING")
    CONF.write_text(text[:idx] + BLOCK + text[idx:], encoding="utf-8")
    print("patched-https")


if __name__ == "__main__":
    main()
