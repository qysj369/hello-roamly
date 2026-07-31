#!/usr/bin/env bash
# 同步驾驶舱云端投稿 API 到生产 Node（/opt/hello-roamly）
# 用法：
#   1) 上传 drive-api-patch.tar.gz 到 /root/
#   2) bash /root/patch-drive-api.sh
set -eu

APP_DIR="${APP_DIR:-/opt/hello-roamly}"
PATCH_TGZ="${PATCH_TGZ:-/root/drive-api-patch.tar.gz}"
WEB_NGINX_CONF="${WEB_NGINX_CONF:-/etc/nginx/conf.d/hello-roamly.conf}"

echo "========== 补丁：drive-videos API =========="

if [ ! -d "$APP_DIR" ]; then
  echo "ERROR: $APP_DIR 不存在"
  exit 1
fi

if [ ! -f "$PATCH_TGZ" ]; then
  echo "ERROR: 缺少 $PATCH_TGZ"
  exit 1
fi

echo "[1/5] 解压补丁到 $APP_DIR"
sudo tar -xzf "$PATCH_TGZ" -C "$APP_DIR"

echo "[2/5] 数据目录"
sudo mkdir -p "$APP_DIR/server/.data/drive-videos"
sudo chmod -R u+rwX "$APP_DIR/server/.data" || true

echo "[3/5] nginx 上传体积（80m）"
if [ -f "$WEB_NGINX_CONF" ]; then
  if grep -q 'client_max_body_size' "$WEB_NGINX_CONF"; then
    echo "nginx client_max_body_size 已存在，跳过"
  else
    sudo cp "$WEB_NGINX_CONF" "${WEB_NGINX_CONF}.bak.$(date +%Y%m%d%H%M%S)"
    sudo sed -i 's|location /api/ {|location /api/ {\n        client_max_body_size 80m;|g' "$WEB_NGINX_CONF"
    echo "nginx body size patched"
  fi
  sudo nginx -t
  sudo systemctl reload nginx || sudo systemctl restart nginx
else
  echo "WARN: $WEB_NGINX_CONF 不存在，跳过 nginx"
fi

echo "[4/5] 重启 API (pm2)"
cd "$APP_DIR"
if command -v pm2 >/dev/null 2>&1; then
  pm2 delete hello-roamly 2>/dev/null || true
  if [ -f scripts/production-api-server.ts ]; then
    pm2 start bash --name hello-roamly -- -c "cd $APP_DIR && exec ./node_modules/.bin/tsx scripts/production-api-server.ts"
  else
    pm2 start bash --name hello-roamly -- -c "cd $APP_DIR && exec ./node_modules/.bin/vite --host 127.0.0.1 --port 4173"
  fi
  pm2 save
  sleep 4
  pm2 list | head -20
else
  echo "ERROR: pm2 未安装"
  exit 1
fi

echo "[5/5] 自检"
echo -n "speech: "
curl -sS -o /tmp/speech.json -w "%{http_code}" http://127.0.0.1:4173/api/ai/speech-config || true
echo
echo -n "drive-videos(local): "
curl -sS -o /tmp/dv.json -w "%{http_code}" "http://127.0.0.1:4173/api/drive-videos?city=%E6%9D%AD%E5%B7%9E" || true
echo
echo -n "drive-videos(nginx): "
curl -sS -o /tmp/dv2.json -w "%{http_code}" -H "Host: helloroamly.com" "http://127.0.0.1/api/drive-videos?city=%E6%9D%AD%E5%B7%9E" || true
echo
head -c 200 /tmp/dv.json 2>/dev/null || true
echo
head -c 200 /tmp/dv2.json 2>/dev/null || true
echo
echo "========== 完成 =========="
echo "期望 drive-videos 返回 200 且 JSON 含 items"
echo "浏览器 Ctrl+Shift+R 后点「投稿本城视频」试传"
