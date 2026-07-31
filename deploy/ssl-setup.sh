#!/usr/bin/env bash
# helloroamly.com HTTPS 一键配置（腾讯云轻量 / OpenCloudOS）
# 用法：sudo bash deploy/ssl-setup.sh
set -euo pipefail

DOMAIN="helloroamly.com"
SSL_DIR="/etc/nginx/ssl/${DOMAIN}"
NGINX_CONF="/etc/nginx/conf.d/hello-roamly.conf"
DEPLOY_ROOT="/var/www/hello-roamly"

echo "==> 检查域名解析…"
if ! getent hosts "${DOMAIN}" >/dev/null; then
  echo "警告：${DOMAIN} 未解析到本机，certbot 可能失败"
fi

echo "==> 安装 certbot（如未安装）…"
if ! command -v certbot >/dev/null 2>&1; then
  if command -v dnf >/dev/null 2>&1; then
    dnf install -y certbot python3-certbot-nginx 2>/dev/null || yum install -y certbot python3-certbot-nginx
  elif command -v apt-get >/dev/null 2>&1; then
    apt-get update && apt-get install -y certbot python3-certbot-nginx
  else
    echo "请手动安装 certbot 后重试"
    exit 1
  fi
fi

find_deploy_file() {
  local name="$1"
  for candidate in \
    "${DEPLOY_ROOT}/dist/deploy/${name}" \
    "${DEPLOY_ROOT}/deploy/${name}" \
    "/root/deploy/${name}"; do
    if [ -f "${candidate}" ]; then
      echo "${candidate}"
      return 0
    fi
  done
  return 1
}

echo "==> 临时使用 HTTP 配置（certbot 需要 80 端口验证）…"
HTTP_CONF="$(find_deploy_file nginx-lighthouse.conf || true)"
if [ -n "${HTTP_CONF}" ]; then
  cp "${HTTP_CONF}" "${NGINX_CONF}"
else
  echo "警告：找不到 nginx-lighthouse.conf，沿用当前 nginx 配置"
fi
nginx -t && systemctl reload nginx

echo "==> 申请 Let's Encrypt 证书…"
certbot certonly --nginx \
  -d "${DOMAIN}" \
  -d "www.${DOMAIN}" \
  --non-interactive \
  --agree-tos \
  --register-unsafely-without-email \
  --keep-until-expiring

echo "==> 复制证书到 nginx 目录…"
mkdir -p "${SSL_DIR}"
cp "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" "${SSL_DIR}/fullchain.pem"
cp "/etc/letsencrypt/live/${DOMAIN}/privkey.pem" "${SSL_DIR}/privkey.pem"
chmod 600 "${SSL_DIR}/privkey.pem"

echo "==> 启用 HTTPS nginx 配置…"
SSL_CONF="$(find_deploy_file nginx-lighthouse-ssl.conf || true)"
if [ -n "${SSL_CONF}" ]; then
  cp "${SSL_CONF}" "${NGINX_CONF}"
else
  echo "找不到 nginx-lighthouse-ssl.conf，请上传后重试"
  exit 1
fi

nginx -t && systemctl reload nginx

echo "==> 配置自动续期…"
(crontab -l 2>/dev/null | grep -v certbot; echo "0 3 * * * certbot renew --quiet --deploy-hook 'cp /etc/letsencrypt/live/${DOMAIN}/fullchain.pem ${SSL_DIR}/ && cp /etc/letsencrypt/live/${DOMAIN}/privkey.pem ${SSL_DIR}/ && systemctl reload nginx'") | crontab -

echo ""
echo "✅ HTTPS 配置完成"
echo "   访问：https://${DOMAIN}"
echo "   验证：curl -sI https://${DOMAIN} | head -3"
echo ""
echo "下一步：重新打包前端时设置 VITE_SITE_URL=https://${DOMAIN}"
