#!/bin/bash
set -euo pipefail
CONF=/etc/nginx/conf.d/hello-roamly.conf
cp -a "$CONF" "/etc/nginx/conf.d/hello-roamly.conf.bak.$(date +%Y%m%d%H%M%S)"

python3 - <<'PY'
from pathlib import Path
p = Path('/etc/nginx/conf.d/hello-roamly.conf')
text = p.read_text(encoding='utf-8')
needle = """        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
"""
upgrade = """        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
"""
if 'proxy_set_header Upgrade $http_upgrade;' in text:
    print('Upgrade already present')
else:
    count = text.count(needle)
    if count < 1:
        raise SystemExit('needle not found')
    text = text.replace(needle, upgrade)
    p.write_text(text, encoding='utf-8')
    print(f'patched locations={count}')
PY

# remove accidental CR-named conf if any
find /etc/nginx/conf.d -maxdepth 1 -name $'helloroamly.conf*' -print -delete || true

nginx -t
systemctl reload nginx
echo 'nginx reloaded'

cd /opt/hello-roamly
node <<'NODE'
const WebSocket = require('ws');
const ws = new WebSocket('wss://helloroamly.com/api/ai/speech-stream');
const t = setTimeout(() => {
  console.log('TIMEOUT');
  process.exit(2);
}, 15000);
ws.on('open', () => {
  console.log('OPEN');
  ws.send(JSON.stringify({ type: 'start' }));
});
ws.on('message', (d) => {
  console.log('MSG', d.toString());
  clearTimeout(t);
  ws.close();
  process.exit(0);
});
ws.on('error', (e) => {
  console.log('ERR', e.message);
  clearTimeout(t);
  process.exit(1);
});
ws.on('close', (code, reason) => {
  console.log('CLOSE', code, reason && reason.toString());
});
NODE
