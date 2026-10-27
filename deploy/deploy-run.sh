#!/usr/bin/env bash
set -eu
cd /var/www/hello-roamly
MD5_S=$(md5sum /root/holo-deploy.tar.gz | awk '{print $1}')
echo "MD5_SERVER=$MD5_S"
mkdir -p dist-new
find dist-new -mindepth 1 -delete
tar xzf /root/holo-deploy.tar.gz -C dist-new --strip-components=1
rm -rf dist-legacy
cp -a dist dist-legacy
rm -rf dist-old
mv dist dist-old
mv dist-new dist
JS=$(grep -oE 'index-[^"]+\.js' dist/index.html | head -1)
echo "NEW_JS=$JS"
nginx -t
systemctl reload nginx
sleep 1
curl -sS http://127.0.0.1/ | grep -oE 'index-[^"]+\.js' | head -1
echo "DEPLOY_DONE"
