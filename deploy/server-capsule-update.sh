#!/usr/bin/env bash
# Build and publish Capsule frontend on Tencent Lighthouse
# Usage: bash deploy/server-capsule-update.sh
set -eu

APP_DIR="${APP_DIR:-/opt/hello-roamly}"
WEB_DIR="${WEB_DIR:-/var/www/hello-roamly/dist}"
SRC_ZIP="${SRC_ZIP:-/root/capsule-src.zip}"

echo "=== Capsule frontend deploy ==="

if [ -f "$SRC_ZIP" ]; then
  echo "[1/4] Unpack source -> $APP_DIR"
  sudo mkdir -p "$APP_DIR"
  sudo unzip -o "$SRC_ZIP" -d "$APP_DIR"
else
  echo "[1/4] Skip unzip ($SRC_ZIP not found), using existing $APP_DIR"
fi

cd "$APP_DIR"

if [ -f deploy/server-capsule-update.sh ]; then
  sed -i 's/\r$//' deploy/server-capsule-update.sh 2>/dev/null || true
fi

if [ ! -f package.json ]; then
  echo "package.json missing in $APP_DIR"
  exit 1
fi

export NODE_ENV=production
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=8192}"
export VITE_APP_MODE=production
export VITE_SITE_URL="${VITE_SITE_URL:-https://helloroamly.com}"

echo "[2/4] Install deps (skip if node_modules exists)"
if [ ! -d node_modules ]; then
  pnpm install --frozen-lockfile
fi

echo "[3/4] Build capsule bundle"
node scripts/capsule-deploy-build.mjs

BUILD_DIR="$APP_DIR/dist-new-build"
if [ ! -f "$BUILD_DIR/index.html" ] || [ ! -d "$BUILD_DIR/assets" ]; then
  echo "Build failed: $BUILD_DIR incomplete"
  exit 1
fi

echo "[4/4] Publish static files -> $WEB_DIR"
sudo mkdir -p "$WEB_DIR"
sudo rm -rf "${WEB_DIR:?}/"*
sudo cp -r "$BUILD_DIR/"* "$WEB_DIR/"

INDEX_JS=$(grep -o 'index-[^"]*\.js' "$WEB_DIR/index.html" | head -1)
CAPSULE_JS=$(ls "$WEB_DIR/assets"/CapsuleOneCanvas-*.js 2>/dev/null | head -1 | xargs basename 2>/dev/null || true)

echo ""
echo "Published bundle:"
echo "  index:   ${INDEX_JS:-unknown}"
echo "  capsule: ${CAPSULE_JS:-unknown}"

if command -v nginx >/dev/null 2>&1; then
  sudo nginx -t
  sudo systemctl reload nginx
fi

echo ""
echo "Verify on server:"
echo "  curl -s http://127.0.0.1/ | grep -o 'index-[^\"]*\\.js'"
if [ -n "$CAPSULE_JS" ] && grep -q 'EARTH_SPIN_SPEED\|earthMotion' "$WEB_DIR/assets/$CAPSULE_JS" 2>/dev/null; then
  echo "  motion code: OK"
else
  echo "  motion code: check CapsuleOneCanvas bundle manually"
fi
