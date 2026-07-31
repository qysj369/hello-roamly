# 仅构建静态站并打包 site.zip（跳过后端/API 测试，适合 Capsule 前端热更新）
# 用法：powershell -ExecutionPolicy Bypass -File deploy/lighthouse-static-only.ps1

param(
  [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

. (Join-Path $root 'deploy/load-deploy-env.ps1') -Root $root

$env:VITE_APP_MODE = 'production'
$env:VITE_SITE_URL = 'http://helloroamly.com'

Write-Host '=== Capsule One static deploy package ===' -ForegroundColor Cyan
Write-Host "Site URL: $($env:VITE_SITE_URL)"

if (-not $SkipBuild) {
  Write-Host ''
  Write-Host '[1/2] Building production bundle (bare config)...' -ForegroundColor Cyan
  node scripts/capsule-deploy-build.mjs
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

$dist = Join-Path $root 'dist'
if (-not (Test-Path (Join-Path $dist 'index.html'))) {
  Write-Error 'dist/index.html missing'
}

Write-Host '[2/2] Creating site.zip...' -ForegroundColor Cyan
$siteZip = Join-Path $root 'site.zip'
if (Test-Path $siteZip) { Remove-Item $siteZip -Force }
Compress-Archive -Path (Join-Path $dist '*') -DestinationPath $siteZip -Force

Write-Host ''
Write-Host 'Done.' -ForegroundColor Green
Get-Item $siteZip | Format-Table Name, @{N='MB';E={[math]::Round($_.Length/1MB,2)}}, LastWriteTime

$indexHtml = Get-Content (Join-Path $dist 'index.html') -Raw
$bundle = [regex]::Match($indexHtml, 'index-[^"]+\.js').Value
Write-Host ''
Write-Host "Bundle: $bundle" -ForegroundColor DarkGray
Write-Host ''
Write-Host 'Upload to server (OrcaTerm / WinSCP):' -ForegroundColor Yellow
Write-Host '  1. Upload site.zip -> /root/site.zip'
Write-Host '  2. Run: sudo unzip -o /root/site.zip -d /var/www/hello-roamly/dist'
Write-Host '  3. Verify: curl -I http://127.0.0.1/'
Write-Host ''
