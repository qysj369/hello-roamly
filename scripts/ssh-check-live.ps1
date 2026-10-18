$ErrorActionPreference = 'Continue'
ssh -o BatchMode=yes -o ConnectTimeout=10 root@49.232.221.38 @'
set -e
echo "== dist index =="
grep -oE 'index-[^"]+\.js' /var/www/hello-roamly/dist/index.html | head -1
echo "== root zip =="
ls -lh /root/site-motion.zip 2>/dev/null || echo 'no /root/site-motion.zip'
echo "== zip index =="
unzip -p /root/site-motion.zip index.html 2>/dev/null | grep -oE 'index-[^"]+\.js|assets/[^"]+\.css' | head -5 || echo 'zip read fail'
'@
