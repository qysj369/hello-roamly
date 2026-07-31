#!/usr/bin/env bash
# One-shot fix: start API with Vite engine + enable nginx /api/ proxy
set -eu

APP_DIR="${APP_DIR:-/opt/hello-roamly}"

echo "=== hello-roamly API fix ==="

if [ ! -d "$APP_DIR" ]; then
  echo "ERROR: $APP_DIR not found. Upload app.zip first."
  exit 1
fi

if [ ! -f "$APP_DIR/.env.local" ]; then
  echo "ERROR: $APP_DIR/.env.local missing. Upload .env.local first."
  exit 1
fi

cd "$APP_DIR"

if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  pnpm install --frozen-lockfile
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo "Installing pm2..."
  sudo npm install -g pm2
fi

echo "[1/4] Restart API with Vite engine (not preview)..."
pm2 delete hello-roamly 2>/dev/null || true

if [ -f scripts/production-api-server.ts ]; then
  pm2 start bash --name hello-roamly -- -c "cd $APP_DIR && exec ./node_modules/.bin/tsx scripts/production-api-server.ts"
else
  pm2 start bash --name hello-roamly -- -c "cd $APP_DIR && exec ./node_modules/.bin/vite --host 127.0.0.1 --port 4173"
fi

pm2 save
sleep 3

echo "[2/4] Test API on port 4173..."
curl -s http://127.0.0.1:4173/api/ai/speech-config | head -c 200
echo ""

echo "[3/4] Configure nginx /api/ proxy..."
if [ -f deploy/nginx-lighthouse.conf ]; then
  sed -i 's/\r$//' deploy/nginx-lighthouse.conf
  # Remove redirect loop: try_files fallback to index.html must not 301 to /
  sed -i '/location = \/index.html/d' deploy/nginx-lighthouse.conf
  sudo cp deploy/nginx-lighthouse.conf /etc/nginx/conf.d/hello-roamly.conf
  sudo nginx -t
  sudo systemctl reload nginx
else
  echo "WARN: deploy/nginx-lighthouse.conf missing, skip nginx update"
fi

echo "[4/4] Test via nginx..."
curl -s http://127.0.0.1/api/ai/speech-config | head -c 200
echo ""
pm2 list

echo ""
echo "Done. If you see JSON above, API is live."
