#!/usr/bin/env bash
# Start hello-roamly API (Vite dev engine on 4173; preview mode cannot load API handlers)
set -eu

APP_DIR="${APP_DIR:-/opt/hello-roamly}"
cd "$APP_DIR"

if [ ! -f .env.local ]; then
  echo "Missing $APP_DIR/.env.local"
  exit 1
fi

export NODE_ENV=production

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm not found. Run lighthouse-install.sh first."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Installing dependencies (5-15 min)..."
  pnpm install --frozen-lockfile
fi

if ! command -v pm2 >/dev/null 2>&1; then
  sudo npm install -g pm2
fi

pm2 delete hello-roamly 2>/dev/null || true
pm2 start bash --name hello-roamly -- -c "cd /opt/hello-roamly && exec ./node_modules/.bin/tsx scripts/production-api-server.ts"
pm2 save

echo "API started: http://127.0.0.1:4173"
echo "Test: curl -s http://127.0.0.1/api/ai/speech-config"
