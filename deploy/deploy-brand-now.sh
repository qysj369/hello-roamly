#!/usr/bin/env bash
set -eu

WEB=/var/www/hello-roamly/dist
TAR=/root/site-motion.tar.gz
ZIP=/root/site-motion.zip

echo "========== 部署品牌更新 =========="

if [ -f "$TAR" ]; then
  echo "[1/4] 使用 tar.gz 解压"
  sudo mkdir -p "$WEB"
  sudo rm -rf "${WEB:?}/"*
  sudo tar -xzf "$TAR" -C "$WEB"
elif [ -f "$ZIP" ]; then
  echo "[1/4] 使用 zip 解压"
  sudo mkdir -p "$WEB"
  sudo rm -rf "${WEB:?}/"*
  sudo unzip -o "$ZIP" -d "$WEB"
else
  echo "ERROR: 请先上传 site-motion.tar.gz 或 site-motion.zip 到 /root/"
  exit 1
fi

echo "[2/4] 检查文件"
test -f "$WEB/index.html"
JS=$(grep -o 'index-[^"]*\.js' "$WEB/index.html" | head -1)
CSS=$(grep -o 'assets/[^"]*\.css' "$WEB/index.html" | head -1)
echo "index=$JS"
echo "css=$CSS"

echo "[3/4] 检查 Capsule / 品牌资源"
STYLE_CSS=$(ls "$WEB/assets"/style-*.css 2>/dev/null | head -1 || true)
if [ -z "$STYLE_CSS" ] && [ -n "$CSS" ]; then
  STYLE_CSS="$WEB/$CSS"
fi

if [ -n "$STYLE_CSS" ] && [ -f "$STYLE_CSS" ] && grep -q 'capsule-hud-chrome__title-brand' "$STYLE_CSS"; then
  echo "BRAND_CSS=OK ($STYLE_CSS)"
else
  echo "BRAND_CSS=MISSING (checked style-*.css / index.css)"
  exit 1
fi

CAP=$(ls "$WEB/assets"/CapsuleOneCanvas-*.js 2>/dev/null | head -1 || true)
if [ -n "$CAP" ] && grep -q 'EARTH_SPIN_SPEED' "$CAP"; then
  echo "CAPSULE_MOTION=OK ($CAP)"
else
  echo "CAPSULE_MOTION=MISSING"
  exit 1
fi

if [ -n "$CAP" ] && grep -q 'createMinimalistInkEarthMap\|GLAZE_PAPER\|MeshPhysicalMaterial' "$CAP"; then
  echo "GLAZE_EARTH=OK"
else
  echo "GLAZE_EARTH=WARN (bundle may be older build)"
fi

echo "[4/4] 重启 Nginx"
sudo nginx -t
sudo systemctl restart nginx

echo "========== 完成 =========="
curl -s http://127.0.0.1/ | grep -o 'index-[^"]*\.js' | head -1
curl -s http://127.0.0.1/api/ai/speech-config | head -c 120 || true
echo
echo "浏览器打开 https://helloroamly.com 按 Ctrl+Shift+R"
