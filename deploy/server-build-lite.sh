#!/usr/bin/env bash
# Low-memory build for small Lighthouse instances
set -eu

cd /opt/hello-roamly

export NODE_ENV=production
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=4096}"
export VITE_APP_MODE=production
export VITE_SITE_URL="${VITE_SITE_URL:-https://helloroamly.com}"

echo "=== lite build (4GB heap, single-thread rollup) ==="
pnpm run seo:generate
node --max-old-space-size=4096 ./node_modules/vite/bin/vite.js build --config vite.config.bare.ts --logLevel info

BUILD_DIR=/opt/hello-roamly/dist-new-build
WEB_DIR=/var/www/hello-roamly/dist

if [ ! -f "$BUILD_DIR/index.html" ] || [ ! -d "$BUILD_DIR/assets" ]; then
  echo "BUILD FAILED - dist incomplete"
  exit 1
fi

echo "=== publish ==="
sudo mkdir -p "$WEB_DIR"
sudo rm -rf "${WEB_DIR:?}/"*
sudo cp -r "$BUILD_DIR/"* "$WEB_DIR/"
sudo nginx -t && sudo systemctl reload nginx

grep -o 'index-[^"]*\.js' "$WEB_DIR/index.html"
echo "done"
