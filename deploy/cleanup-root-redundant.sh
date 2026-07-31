#!/usr/bin/env bash
# 清理 /root 下冗余部署包与一次性修复脚本（保留当前 Holo 上线所需文件）
# 用法：bash /root/cleanup-root-redundant.sh
set -eu

cd /root

echo "========== /root cleanup =========="
echo "BEFORE:"
ls -lh /root | sed -n '1,80p'
echo
df -h / | tail -1

# 保留：当前 zip、当前部署脚本、环境、以及可能仍在用的 nginx 备份
# 其余旧包 / 一次性 fix 脚本删除

echo
echo "[1] remove old site packages..."
rm -fv \
  /root/site-motion-holo.zip \
  /root/site.zip \
  /root/site-motion.tar.gz \
  /root/drive-api-patch.tar.gz \
  /root/build-log.txt \
  2>/dev/null || true

# 带哈希后缀的旧包、bak
rm -fv /root/site-motion-*.zip 2>/dev/null || true
rm -fv /root/site-motion.tar.gz.bak* 2>/dev/null || true
rm -fv /root/site-deploy-*.zip /root/site-jul*.zip /root/site-old*.zip /root/app.zip 2>/dev/null || true

echo
echo "[2] remove one-off fix / old deploy scripts..."
rm -fv \
  /root/deploy-brand-now.sh \
  /root/deploy-update.sh \
  /root/check-server.sh \
  /root/emergency-online.sh \
  /root/fix-ai.sh \
  /root/fix-api-and-nginx.sh \
  /root/fix-deploy.sh \
  /root/fix-nginx-api-only.sh \
  /root/nginx-fix.sh \
  /root/patch-drive-api.sh \
  /root/open-https.sh \
  /root/nginx-fixed.conf \
  2>/dev/null || true

echo
echo "[3] keep these (must exist):"
for f in site-motion.zip deploy-holo-now.sh server-env.local; do
  if [ -f "/root/$f" ]; then
    ls -lh "/root/$f"
  else
    echo "MISSING: /root/$f"
  fi
done

# capsule-src.zip 体积较大；若仍要服务器上改源码可保留，否则删
if [ -f /root/capsule-src.zip ]; then
  echo
  echo "NOTE: keeping /root/capsule-src.zip (source archive)."
  echo "Delete manually if unused: rm -f /root/capsule-src.zip"
fi

echo
echo "AFTER:"
ls -lh /root | sed -n '1,80p'
echo
df -h / | tail -1
echo "========== done =========="
