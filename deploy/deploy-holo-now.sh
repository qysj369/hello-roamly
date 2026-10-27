#!/usr/bin/env bash
# Holo static deploy: backup old site, then overwrite with NEW-HOME.zip
# Usage:
#   1) upload Desktop NEW-HOME.zip to /root/NEW-HOME.zip
#   2) bash /root/deploy-holo-now.sh
set -eu

WEB=/var/www/hello-roamly/dist
LEGACY_DIR=/var/www/hello-roamly/dist-legacy
# Prefer NEW-HOME.zip (avoids stale site-motion.zip overwrite issues)
if [ -f /root/NEW-HOME.zip ]; then
  ZIP=/root/NEW-HOME.zip
elif [ -f /root/site-motion.zip ]; then
  ZIP=/root/site-motion.zip
else
  ZIP=/root/NEW-HOME.zip
fi
TAR=/root/site-motion.tar.gz
STAMP=$(date +%Y%m%d%H%M%S)
LEGACY_ZIP="/root/site-legacy-backup-${STAMP}.zip"
EXPECTED_JS="${EXPECTED_JS:-index-DwjAi9n0.js}"
EXPECTED_CSS="${EXPECTED_CSS:-assets/style-CpmjBzEv.css}"

echo "========== Holo deploy (keep legacy) =========="
echo "ZIP=$ZIP"

# Old tar.gz must not shadow the new zip.
if [ -f "$TAR" ]; then
  BAK="/root/site-motion.tar.gz.bak.${STAMP}"
  echo "[0/5] move old tar aside -> $BAK"
  sudo mv "$TAR" "$BAK"
fi

if [ ! -f "$ZIP" ]; then
  echo "ERROR: zip missing (need /root/NEW-HOME.zip or /root/site-motion.zip)"
  echo "Upload Desktop NEW-HOME.zip to /root/ first (WinSCP)"
  exit 1
fi

# Keep legacy: zip + dist-legacy for one-click rollback
# Also prune old /root/site-legacy-backup-*.zip (keep 3 newest) to avoid disk full
if ls /root/site-legacy-backup-*.zip >/dev/null 2>&1; then
  ls -1t /root/site-legacy-backup-*.zip | tail -n +4 | while read -r old; do
    sudo rm -f "$old" || true
  done
fi

if [ -f "$WEB/index.html" ]; then
  echo "[1/5] backup live site -> $LEGACY_ZIP and $LEGACY_DIR"
  sudo rm -rf "$LEGACY_DIR"
  sudo mkdir -p "$LEGACY_DIR"
  # Avoid reflink clone failures ("No space left") on some VPS filesystems
  sudo cp -a --reflink=never "$WEB"/. "$LEGACY_DIR"/ 2>/dev/null || sudo rsync -a --delete "$WEB"/ "$LEGACY_DIR"/
  if command -v zip >/dev/null 2>&1; then
    sudo rm -f "$LEGACY_ZIP"
    (cd "$LEGACY_DIR" && sudo zip -qr "$LEGACY_ZIP" .)
    echo "LEGACY_ZIP=$LEGACY_ZIP"
  else
    echo "WARN: zip not found; kept directory backup only: $LEGACY_DIR"
  fi
  OLD_JS=$(grep -oE 'index-[^"]+\.js' "$LEGACY_DIR/index.html" | head -1 || true)
  echo "LEGACY_JS=${OLD_JS:-unknown}"
else
  echo "[1/5] no live index.html - skip legacy backup"
fi

echo "[2/5] extract zip -> $WEB"
sudo mkdir -p "$WEB"
sudo find "$WEB" -mindepth 1 -delete
# Windows Compress-Archive uses backslash paths; unzip exits 1 (warning) even on success
set +e
sudo unzip -o "$ZIP" -d "$WEB"
UNZIP_RC=$?
set -e
if [ "$UNZIP_RC" -ne 0 ] && [ "$UNZIP_RC" -ne 1 ]; then
  echo "ERROR: unzip failed (rc=$UNZIP_RC)"
  exit 1
fi

echo "[3/5] check index.html"
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
  echo "You uploaded the wrong package. Re-upload Desktop NEW-HOME.zip"
  exit 1
fi

if [ -n "$EXPECTED_CSS" ] && [ "$CSS" != "$EXPECTED_CSS" ]; then
  echo "ERROR: expected $EXPECTED_CSS, got $CSS"
  echo "Wrong/old CSS in package - rebuild and re-upload NEW-HOME.zip"
  exit 1
fi

echo "[4/5] check assets"
test -f "$WEB/assets/$JS"
if [ -n "$CSS" ]; then
  test -f "$WEB/$CSS"
fi
if ls "$WEB/assets"/DrivePanoramaPage-*.js >/dev/null 2>&1; then
  echo "DRIVE_CHUNK=OK"
else
  echo "DRIVE_CHUNK=WARN (DrivePanoramaPage-*.js missing)"
fi

echo "[5/5] Nginx reload"
sudo nginx -t
sudo systemctl reload nginx || sudo systemctl restart nginx

echo "========== done =========="
curl -sS http://127.0.0.1/ | grep -oE 'index-[^"]+\.js' | head -1 || true
echo
echo "Open https://helloroamly.com and hard refresh (Ctrl+Shift+R)"
echo "OK only if you see Holo snail home + $EXPECTED_JS"
echo
echo "Rollback to old site:"
echo "  sudo find $WEB -mindepth 1 -delete"
echo "  sudo cp -a $LEGACY_DIR/. $WEB/"
echo "  sudo nginx -t && sudo systemctl reload nginx"
