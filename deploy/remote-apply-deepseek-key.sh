#!/bin/bash
set -euo pipefail
KEY_FILE=/tmp/hr-deepseek-key.txt
ENV=/opt/hello-roamly/.env.local
if [ ! -f "$KEY_FILE" ]; then
  echo "ERROR: missing $KEY_FILE" >&2
  exit 1
fi
if [ ! -f "$ENV" ]; then
  echo "ERROR: missing $ENV" >&2
  exit 1
fi
KEY=$(tr -d '\r\n' < "$KEY_FILE")
rm -f "$KEY_FILE"
case "$KEY" in
  sk-*) ;;
  *)
    echo "ERROR: key format invalid" >&2
    exit 1
    ;;
esac
if grep -q '^DEEPSEEK_API_KEY=' "$ENV"; then
  sed -i "s|^DEEPSEEK_API_KEY=.*|DEEPSEEK_API_KEY=${KEY}|" "$ENV"
else
  printf '\nDEEPSEEK_API_KEY=%s\n' "$KEY" >> "$ENV"
fi
sed -i 's/^VITE_DEEPSEEK_API_KEY=/# VITE_DEEPSEEK_API_KEY=/' "$ENV" || true
echo '--- env check (masked) ---'
grep -E '^(# )?DEEPSEEK_API_KEY=|^(# )?VITE_DEEPSEEK_API_KEY=' "$ENV" | sed 's/=sk-.*/=sk-***/' || true
pm2 restart hello-roamly --update-env
sleep 2
pm2 list | head -12
echo 'DONE_OK'
