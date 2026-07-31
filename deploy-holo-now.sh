#!/usr/bin/env bash
# Holo static deploy (no Capsule assets required)
# Usage: upload site-motion.zip to /root/, then:
#   bash /root/deploy-holo-now.sh
set -eu

WEB=/var/www/hello-roamly/dist
ZIP=/root/site-motion.zip
TAR=/root/site-motion.tar.gz
EXPECTED_JS="${EXPECTED_JS:-index-CN9jBy0Q.js}"

echo "========== Holo deploy =========="

# Prefer zip (current local packaging). Old tar.gz would otherwise shadow new zip.
if [ -f "$ZIP" ]; then
  echo "[1/4] extract zip -> $WEB"
  sudo mkdir -p "$WEB"
  sudo find "$WEB" -mindepth 1 -delete
  sudo unzip -o "$ZIP" -d "$WEB"
elif [ -f "$TAR" ]; then
  echo "[1/4] extract tar.gz -> $WEB"
  sudo mkdir -p "$WEB"
  sudo find "$WEB" -mindepth 1 -delete
  sudo tar -xzf "$TAR" -C "$WEB"
else
  echo "ERROR: upload site-motion.zip or site-motion.tar.gz to /root/ first"
  exit 1
fi

echo "[2/4] check index.html"
test -f "$WEB/index.html"
JS=$(grep -oE 'index-[^"]+\.js' "$WEB/index.html" | head -1 || true)
CSS=$(grep -oE 'assets/[^"]+\.css' "$WEB/index.html" | head -1 || true)
echo "index=$JS"
echo "css=$CSS"

if [ -n "$EXPECTED_JS" ] && [ "$JS" != "$EXPECTED_JS" ]; then
  echo "WARN: expected $EXPECTED_JS, got $JS (continue)"
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
