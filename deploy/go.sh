#!/usr/bin/env bash
set -eu
cd /opt/hello-roamly
export NODE_OPTIONS=--max-old-space-size=4096
export VITE_APP_MODE=production
export VITE_SITE_URL=https://helloroamly.com
pnpm install --frozen-lockfile
pnpm add highlight.js 2>/dev/null || true
node --max-old-space-size=4096 ./node_modules/vite/bin/vite.js build --config vite.config.bare.ts
sudo rm -rf /var/www/hello-roamly/dist/*
sudo cp -r dist-new-build/* /var/www/hello-roamly/dist/
sudo nginx -t && sudo systemctl reload nginx
grep -o 'index-[^"]*\.js' /var/www/hello-roamly/dist/index.html
