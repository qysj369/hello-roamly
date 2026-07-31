# 上传 hello-roamly 到腾讯云轻量服务器
# 用法：右键 -> 使用 PowerShell 运行

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$zip = Join-Path $root 'site.zip'
$appZip = Join-Path $root 'app.zip'
$dist = Join-Path $root 'dist'
$winscp = "${env:ProgramFiles(x86)}\WinSCP\WinSCP.exe"

if (-not (Test-Path $zip)) {
  if (-not (Test-Path (Join-Path $dist 'index.html'))) {
    Write-Host '缺少 dist/index.html，请先执行: pnpm run build' -ForegroundColor Red
    exit 1
  }
  Write-Host '正在打包 site.zip ...' -ForegroundColor Cyan
  Compress-Archive -Path (Join-Path $dist '*') -DestinationPath $zip -Force
}

if (-not (Test-Path $winscp)) {
  Write-Host '未找到 WinSCP，请先安装: https://winscp.net/eng/download.php' -ForegroundColor Red
  exit 1
}

Write-Host ''
Write-Host '=== 蜗牛旅行 上传助手 ===' -ForegroundColor Cyan
Write-Host ''
Write-Host '服务器: 49.232.221.38' -ForegroundColor White
Write-Host '用户名: root' -ForegroundColor White
Write-Host '上传文件:' -ForegroundColor White
Write-Host "  site.zip -> /root（仅前端）"
Write-Host "  app.zip  -> /opt/hello-roamly（完整版含 API）"
Write-Host "  .env.local -> /opt/hello-roamly/.env.local"
Write-Host ''
Write-Host 'WinSCP 登录后:' -ForegroundColor Yellow
Write-Host '  左边 -> site.zip'
Write-Host '  右边 -> /root'
Write-Host '  拖到右边上传'
Write-Host ''
Write-Host '服务器步骤 (OrcaTerm):' -ForegroundColor Yellow
Write-Host "  1. bash deploy/lighthouse-install.sh"
Write-Host "  2. WinSCP 上传 app.zip 和 .env.local 到 /opt/hello-roamly"
Write-Host "  3. cd /opt/hello-roamly; unzip -o app.zip; bash deploy/lighthouse-start.sh"
Write-Host "  4. unzip -o site.zip -d /var/www/hello-roamly/dist"
Write-Host "  5. sudo cp deploy/nginx-lighthouse.conf /etc/nginx/conf.d/hello-roamly.conf"
Write-Host "  6. sudo nginx -t; sudo systemctl reload nginx"
Write-Host ''
Write-Host '完整打包请运行: pnpm run deploy:lighthouse' -ForegroundColor Cyan
Write-Host ''

Start-Process $winscp -ArgumentList 'sftp://root@49.232.221.38/'
