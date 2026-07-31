#!/usr/bin/env bash
# Tencent Lighthouse: Node 20 + pnpm + pm2 (run once)
set -eu

echo "=== hello-roamly server setup ==="

if ! command -v node >/dev/null 2>&1; then
  echo "Installing Node.js 20..."
  curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
  sudo dnf install -y nodejs
fi

echo "Node: $(node -v)"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "Installing pnpm..."
  corepack enable
  corepack prepare pnpm@9.15.0 --activate
fi

echo "pnpm: $(pnpm -v)"

if ! command -v pm2 >/dev/null 2>&1; then
  sudo npm install -g pm2
fi

sudo mkdir -p /opt/hello-roamly /var/www/hello-roamly/dist
sudo dnf install -y unzip

echo "Setup done. Next: bash deploy/lighthouse-start.sh"
