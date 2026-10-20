# 打包并打开腾讯云轻量上传（Holo 首页）
# 用法：powershell -ExecutionPolicy Bypass -File deploy/push-holo-tencent.ps1

param(
  [switch]$SkipBuild,
  [switch]$NoLaunch
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

$env:VITE_APP_MODE = 'production'
$env:VITE_SITE_URL = 'https://helloroamly.com'
$env:VITE_MAP_DEV_DEMO = '0'
$env:VITE_HOME_LAYOUT = ''
$env:VITE_HOME_LEGACY = ''

if (-not $SkipBuild) {
  Write-Host '[1/3] Building holo production bundle...' -ForegroundColor Cyan
  pnpm run build:deploy:holo
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

$dist = Join-Path $root 'dist-new-build'
if (-not (Test-Path (Join-Path $dist 'index.html'))) {
  Write-Error 'dist-new-build/index.html missing'
}

$indexHtml = Get-Content (Join-Path $dist 'index.html') -Raw
$jsMatch = [regex]::Match($indexHtml, 'index-[A-Za-z0-9_-]+\.js')
$cssMatch = [regex]::Match($indexHtml, 'assets/[A-Za-z0-9_./-]+\.css')
$jsName = if ($jsMatch.Success) { $jsMatch.Value } else { 'unknown' }
$cssName = if ($cssMatch.Success) { $cssMatch.Value } else { '' }

$zip = Join-Path $root 'site-motion.zip'
if (Test-Path $zip) { Remove-Item $zip -Force }
Write-Host '[2/3] Packaging site-motion.zip ...' -ForegroundColor Cyan
Compress-Archive -Path (Join-Path $dist '*') -DestinationPath $zip -Force

# Sync expected hashes into server deploy script
$deploySh = Join-Path $root 'deploy\deploy-holo-now.sh'
if (Test-Path $deploySh) {
  $lines = Get-Content $deploySh
  $lines = $lines | ForEach-Object {
    if ($_ -match '^EXPECTED_JS=') {
      'EXPECTED_JS="${EXPECTED_JS:-' + $jsName + '}"'
    } elseif ($_ -match '^EXPECTED_CSS=' -and $cssName) {
      'EXPECTED_CSS="${EXPECTED_CSS:-' + $cssName + '}"'
    } else {
      $_
    }
  }
  # LF only — CRLF breaks `bash` on the Linux server (`$'\r': command not found`)
  $utf8NoBom = New-Object System.Text.UTF8Encoding $false
  [IO.File]::WriteAllText($deploySh, (($lines -join "`n") + "`n"), $utf8NoBom)
}

Get-Item $zip | Format-Table Name, @{ N = 'MB'; E = { [math]::Round($_.Length / 1MB, 2) } }, LastWriteTime
Write-Host ('index js = ' + $jsName) -ForegroundColor Green
if ($cssName) { Write-Host ('css     = ' + $cssName) -ForegroundColor Green }

Write-Host ''
Write-Host '[3/3] Upload + server deploy' -ForegroundColor Cyan
Write-Host '服务器: 49.232.221.38 (root)' -ForegroundColor White
Write-Host '本地文件: site-motion.zip + deploy/deploy-holo-now.sh' -ForegroundColor White
Write-Host ''
Write-Host 'WinSCP:' -ForegroundColor Yellow
Write-Host '  1. 把 site-motion.zip 拖到 /root/site-motion.zip（覆盖）'
Write-Host '  2. 把 deploy/deploy-holo-now.sh 拖到 /root/deploy-holo-now.sh（覆盖）'
Write-Host ''
Write-Host 'OrcaTerm / SSH:' -ForegroundColor Yellow
Write-Host '  bash /root/deploy-holo-now.sh'
Write-Host '  # 脚本会先备份旧站到 dist-legacy + /root/site-legacy-backup-*.zip，再上线新首页'
Write-Host ''
Write-Host "Verify: https://helloroamly.com  (hard refresh Ctrl+Shift+R)" -ForegroundColor Green
Write-Host '应看到浅米白 Holo 蜗牛首页；旧地球站已保留可回滚' -ForegroundColor Green
Write-Host ''

if (-not $NoLaunch) {
  $winscp = "${env:ProgramFiles(x86)}\WinSCP\WinSCP.exe"
  if (Test-Path $winscp) {
    Start-Process $winscp -ArgumentList 'sftp://root@49.232.221.38/'
    Write-Host 'WinSCP opened.' -ForegroundColor Green
  } else {
    Write-Host 'WinSCP not found. Install: https://winscp.net/' -ForegroundColor Yellow
  }

  Start-Process 'https://console.cloud.tencent.com/lighthouse/instance'
  Start-Process explorer.exe $root
}
