# 蜗牛旅行 · 线上部署备忘（Holo 首页）

服务器：`root@49.232.221.38`  
站点根目录：`/var/www/hello-roamly/dist`  
正式域名：https://helloroamly.com

## 一键上线（推荐）

首次（只做一次）：

```powershell
pnpm deploy:holo:ssh-setup
```

按提示把公钥写进服务器 `~/.ssh/authorized_keys`（或腾讯云绑定密钥），然后：

```powershell
pnpm deploy:holo
```

成功后强制刷新 https://helloroamly.com。

## 本地出包（无 SSH 时）

```powershell
cd C:\Users\Administrator\Desktop\hello-roamly
pnpm run build:deploy:holo
powershell -ExecutionPolicy Bypass -File deploy/push-holo-tencent.ps1 -SkipBuild
```

产物：

- 项目内：`site-motion.zip`
- 桌面副本（推荐认这个）：`UPLOAD-THIS-HOLO-HOME.zip` / `请只传这个-新首页.zip`

上传前在本地确认哈希（PowerShell）：

```powershell
Add-Type -AssemblyName System.IO.Compression.FileSystem
$z=[IO.Compression.ZipFile]::OpenRead("$pwd\site-motion.zip")
$e=$z.Entries | Where-Object FullName -match 'index\.html$' | Select-Object -First 1
$sr=New-Object IO.StreamReader($e.Open()); $html=$sr.ReadToEnd(); $sr.Close(); $z.Dispose()
[regex]::Matches($html,'index-[^"]+\.js|assets/[^"]+\.css') | ForEach-Object Value
```

记下本次的 `index-XXXX.js`，上线后必须一致。

## 上传（WinSCP）

1. 只传**这一次**打好的 zip（约 15MB，今天时间戳）
2. 覆盖到 `/root/site-motion.zip`
3. 同步上传最新 `deploy/deploy-holo-now.sh`（可选但推荐）

**不要传**：`请传这个-*`、`site-motion-随机后缀.zip`、`site-motion.tar.gz`、旧桌面误导包。

## 服务器发布

优先：

```bash
bash /root/deploy-holo-now.sh
```

脚本会：备份当前站到 `dist-legacy` + `/root/site-legacy-backup-*.zip` → 解压新包 → 校验哈希 → reload Nginx。

手动等效：

```bash
# 1) 先校验包内哈希（不对就停）
unzip -p /root/site-motion.zip index.html | grep -oE 'index-[^"]+\.js|assets/[^"]+\.css'

# 2) 解压上线
sudo find /var/www/hello-roamly/dist -mindepth 1 -delete
sudo unzip -o /root/site-motion.zip -d /var/www/hello-roamly/dist
grep -oE 'index-[^"]+\.js' /var/www/hello-roamly/dist/index.html | head -1
sudo nginx -t && sudo systemctl reload nginx
```

## 验收

1. 打开 https://helloroamly.com ，强制刷新（Ctrl+Shift+R）
2. 应看到浅米白 Holo：蜗牛拖地球 +「把旅行慢下来」+ 三 pill + 卡片流
3. PC / 手机均宜一屏显示，无需为首页内容下滚

## 回滚旧站

```bash
sudo find /var/www/hello-roamly/dist -mindepth 1 -delete
sudo cp -a /var/www/hello-roamly/dist-legacy/. /var/www/hello-roamly/dist/
sudo nginx -t && sudo systemctl reload nginx
```

若无 `dist-legacy`，用 `/root/site-legacy-backup-*.zip` 解压到 `dist`。

## /root 应保留

- `server-env.local`（勿删）
- `deploy-holo-now.sh`
- `site-motion.zip`（当前正确包）
- `请只传这个-新首页.zip`（可选备份）

其余旧 zip / `fix-*.sh` 见 `cleanup-root-junk.sh`。

## 安全提醒

- 浏览器包内不要带 `VITE_DEEPSEEK_API_KEY`；仅服务端 `DEEPSEEK_API_KEY`
- 若密钥曾进过前端，立即轮换

## DeepSeek Key 分离 + 限流

1. 在 [DeepSeek 控制台](https://platform.deepseek.com/api_keys) 创建两把 Key：`hello-roamly-prod`、`hello-roamly-dev`
2. 生产：`/opt/hello-roamly/.env.local` 只写 prod 的 `DEEPSEEK_API_KEY`（可无 `VITE_DEEPSEEK_API_KEY`）
3. 本地：`.env.local` 只写 dev 的 `DEEPSEEK_API_KEY`；不要复用 prod Key
4. 吊销曾混用的旧 Key（如 `hello-roamly-local`）
5. 服务端默认限流：攻略类 `/api/ai/generate-plan*` 等约 **3 次/分钟/IP**；对话类约 **15 次/分钟/IP**（可用 `AI_RATE_LIMIT_*` 调整）
6. 改服务端代码后需同步到 `/opt/hello-roamly` 并 `pm2 restart hello-roamly`（仅 `pnpm deploy:holo` 不会更新 API 进程）
