#!/usr/bin/env bash
# One-shot diagnose + build + publish (paste-safe, LF only)
set -eu

APP_DIR=/opt/hello-roamly
WEB_DIR=/var/www/hello-roamly/dist

echo "========== 1. DIAGNOSE =========="
df -h / | tail -1
echo "--- nginx root ---"
ls -la "$WEB_DIR" 2>/dev/null | head -5 || echo "EMPTY: $WEB_DIR"
echo "--- build output ---"
ls -la "$APP_DIR/dist-new-build/assets" 2>/dev/null | head -5 || echo "NO BUILD YET"
echo "--- curl ---"
curl -sI http://127.0.0.1/ | head -3 || true

echo ""
echo "========== 2. FIX SCRIPT LINE ENDINGS =========="
if [ -f "$APP_DIR/deploy/server-capsule-update.sh" ]; then
  sed -i 's/\r$//' "$APP_DIR/deploy/server-capsule-update.sh"
fi

echo ""
echo "========== 3. BUILD + PUBLISH =========="
cd "$APP_DIR"

export NODE_ENV=production
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=8192}"
export VITE_APP_MODE=production
export VITE_SITE_URL="${VITE_SITE_URL:-https://helloroamly.com}"

if [ ! -d node_modules ]; then
  echo "Installing deps..."
  pnpm install --frozen-lockfile
fi

echo "Building..."
node scripts/capsule-deploy-build.mjs

if [ ! -f dist-new-build/index.html ] || [ ! -d dist-new-build/assets ]; then
  echo "BUILD FAILED"
  echo "Check log above. If OOM, run: export NODE_OPTIONS=--max-old-space-size=8192"
  exit 1
fi

echo "Publishing to $WEB_DIR ..."
sudo mkdir -p "$WEB_DIR"
sudo rm -rf "${WEB_DIR:?}/"*
sudo cp -r dist-new-build/* "$WEB_DIR/"

if command -v nginx >/dev/null 2>&1; then
  sudo nginx -t && sudo systemctl reload nginx
fi

echo ""
echo "========== 4. VERIFY =========="
INDEX_JS=$(grep -o 'index-[^"]*\.js' "$WEB_DIR/index.html" | head -1)
echo "index bundle: ${INDEX_JS:-NOT FOUND}"
curl -s http://127.0.0.1/ | grep -o 'index-[^"]*\.js' || echo "curl: no match"
ls "$WEB_DIR/assets"/CapsuleOneCanvas-*.js 2>/dev/null | head -1 || echo "no CapsuleOneCanvas js"

if [ -n "$INDEX_JS" ] && [ "$INDEX_JS" != "index-OQeRXzi0.js" ]; then
  echo "SUCCESS: new bundle deployed"
else
  echo "WARN: still old or missing bundle"
fi
