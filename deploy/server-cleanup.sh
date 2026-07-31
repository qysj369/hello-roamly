#!/usr/bin/env bash
# 清理 /root 下冗余部署包，释放磁盘空间
# 用法：bash deploy/server-cleanup.sh
set -eu

echo "=== Disk before ==="
df -h / /var /opt 2>/dev/null || df -h

echo ""
echo "=== Large files in /root ==="
du -sh /root/* 2>/dev/null | sort -hr | head -20

echo ""
echo "=== Removing duplicate deploy zips in /root ==="
KEEP=(
  "/root/capsule-src.zip"
  "/root/site.zip"
)

should_keep() {
  local f="$1"
  for k in "${KEEP[@]}"; do
    if [ "$f" = "$k" ]; then
      return 0
    fi
  done
  return 1
}

removed=0
for pattern in \
  "/root/site-deploy-jul7-vfx"*.zip \
  "/root/site-deploy-jul8"*.zip \
  "/root/site-jul8"*.zip \
  "/root/site-jul9"*.zip \
  "/root/app.zip" \
  "/root/site-old"*.zip; do
  for f in $pattern; do
    [ -e "$f" ] || continue
    if should_keep "$f"; then
      continue
    fi
    echo "  rm $f"
    rm -f "$f"
    removed=$((removed + 1))
  done
done

echo "Removed $removed archive(s)"

echo ""
echo "=== Clean build caches (optional) ==="
rm -rf /opt/hello-roamly/dist-new-build /opt/hello-roamly/dist-test-build 2>/dev/null || true
rm -rf /root/.npm/_cacache 2>/dev/null || true

echo ""
echo "=== Disk after ==="
df -h / /var /opt 2>/dev/null || df -h

echo ""
echo "Done. You can now upload capsule-src.zip and run:"
echo "  bash /opt/hello-roamly/deploy/server-capsule-update.sh"
