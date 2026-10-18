#!/usr/bin/env bash
# 清理 /root 过期部署包与临时脚本（保留当前上线所需）
# 用法：bash /root/cleanup-root-junk.sh
set -euo pipefail
cd /root

STAMP=$(date +%Y%m%d%H%M%S)
TRASH="/root/_trash_${STAMP}"
mkdir -p "$TRASH"

echo "========== cleanup /root -> $TRASH =========="

# 必须保留
keep_exact=(
  "server-env.local"
  "deploy-holo-now.sh"
  "cleanup-root-junk.sh"
  "site-motion.zip"
  "请只传这个-新首页.zip"
)

is_keep() {
  local name="$1"
  local k
  for k in "${keep_exact[@]}"; do
    [[ "$name" == "$k" ]] && return 0
  done
  # 保留本轮垃圾桶与历史垃圾桶目录
  [[ "$name" == _trash_* ]] && return 0
  return 1
}

move_one() {
  local f="$1"
  [[ -e "$f" ]] || return 0
  local base
  base=$(basename "$f")
  if is_keep "$base"; then
    echo "KEEP  $base"
    return 0
  fi
  echo "TRASH $base"
  mv -- "$f" "$TRASH/"
}

# 旧压缩包 / 误导命名包
for f in \
  site.zip \
  site-restore.zip \
  site-motion.tar.gz \
  site-motion.tar.gz.bak* \
  site-motion-*.zip \
  site-motion-holo.zip \
  site-motion-paper-roam*.zip \
  capsule-src.zip \
  drive-api-patch.tar.gz \
  最新上线包-*.zip \
  请传这个-*.zip \
  UPLOAD-THIS-HOLO-HOME.zip
do
  for m in $f; do
    [[ -e "$m" ]] || continue
    move_one "$m"
  done
done

# 一次性脚本 / 旧配置
for f in \
  build-log.txt \
  nginx-fixed.conf \
  check-server.sh \
  deploy-brand-now.sh \
  deploy-update.sh \
  emergency-online.sh \
  fix-ai.sh \
  fix-api-and-nginx.sh \
  fix-deploy.sh \
  fix-nginx-api-only.sh \
  nginx-fix.sh \
  open-https.sh \
  patch-drive-api.sh \
  upload-only.sh \
  cleanup-root-redundant.sh
do
  move_one "$f"
done

# 旧目录
[[ -d _old_packages ]] && move_one "_old_packages"

echo
echo "========== kept in /root =========="
ls -lah /root | sed -n '1,50p'
echo
echo "Moved into: $TRASH"
echo "Confirm https://helloroamly.com OK, then permanently delete trash:"
echo "  rm -rf $TRASH"
