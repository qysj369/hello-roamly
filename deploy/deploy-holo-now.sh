#!/usr/bin/env bash
# Holo static deploy (no Capsule assets required)
# Usage:
#   1) upload site-motion.zip to /root/site-motion.zip
#   2) bash /root/deploy-holo-now.sh
set -eu

WEB=/var/www/hello-roamly/dist
ZIP=/root/site-motion.zip
TAR=/root/site-motion.tar.gz
EXPECTED_JS="${EXPECTED_JS:-index-Bn_yLYxR.js}"
EXPECTED_CSS="${EXPECTED_CSS:-assets/style-CrGwowqZ.css}"

echo "========== Holo deploy =========="

# Old tar.gz must not shadow the new zip.
if [ -f "$TAR" ]; then
  BAK="/root/site-motion.tar.gz.bak.$(date +%Y%m%d%H%M%S)"
  echo "[0/4] move old tar aside -> $BAK"
  sudo mv "$TAR" "$BAK"
fi

if [ ! -f "$ZIP" ]; then
  echo "ERROR: /root/site-motion.zip missing"
  echo "Upload local site-motion.zip to /root/ first (WinSCP)"
  exit 1
fi

echo "[1/4] extract zip -> $WEB"
sudo mkdir -p "$WEB"
sudo find "$WEB" -mindepth 1 -delete
sudo unzip -o "$ZIP" -d "$WEB"

echo "[2/4] check index.html"
test -f "$WEB/index.html"
JS=$(grep -oE 'index-[^"]+\.js' "$WEB/index.html" | head -1 || true)
CSS=$(grep -oE 'assets/[^"]+\.css' "$WEB/index.html" | head -1 || true)
echo "index=$JS"
echo "css=$CSS"

if [ -z "$JS" ]; then
  echo "ERROR: no index-*.js in index.html"
  exit 1
fi

if [ -n "$EXPECTED_JS" ] && [ "$JS" != "$EXPECTED_JS" ]; then
  echo "ERROR: expected $EXPECTED_JS, got $JS"
  echo "You uploaded the wrong package. Re-upload the latest site-motion.zip"
  exit 1
fi

if [ -n "$EXPECTED_CSS" ] && [ "$CSS" != "$EXPECTED_CSS" ]; then
  echo "ERROR: expected $EXPECTED_CSS, got $CSS"
  echo "Old CSS still on server — upload site-motion-BJu7zOKX.zip"
  exit 1
fi

echo "[3/4] check assets"
test -f "$WEB/assets/$JS"
if [ -n "$CSS" ]; then
  test -f "$WEB/$CSS"
fi
if ls "$WEB/assets"/DrivePanoramaPage-*.js >/dev/null 2>&1; then
  echo "DRIVE_CHUNK=OK"
else
  echo "DRIVE_CHUNK=WARN (DrivePanoramaPage-*.js missing)"
fi

echo "[4/4] Nginx reload"
sudo nginx -t
sudo systemctl reload nginx || sudo systemctl restart nginx

echo "========== done =========="
curl -sS http://127.0.0.1/ | grep -oE 'index-[^"]+\.js' | head -1 || true
echo
echo "Open https://helloroamly.com and hard refresh (Ctrl+Shift+R)"
echo "OK only if you see: $EXPECTED_JS"
