#!/bin/bash
set -euo pipefail
cd /opt/hello-roamly
node <<'NODE'
const WebSocket = require('ws');
const ws = new WebSocket('wss://helloroamly.com/api/ai/speech-stream');
const t = setTimeout(() => {
  console.log('TIMEOUT');
  process.exit(2);
}, 12000);
ws.on('open', () => {
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
NODE
