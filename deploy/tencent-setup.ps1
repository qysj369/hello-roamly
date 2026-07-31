# Tencent COS deploy prerequisite check
param(
  [switch]$InstallCoscmd
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

Write-Host ''
Write-Host '=== hello-roamly Tencent deploy check ===' -ForegroundColor Cyan
Write-Host ''

if ($InstallCoscmd -or -not (Get-Command coscmd -ErrorAction SilentlyContinue)) {
  if (-not (Get-Command pip -ErrorAction SilentlyContinue)) {
    Write-Host 'pip not found. Install Python 3 first.' -ForegroundColor Red
    exit 1
  }
  Write-Host 'Installing coscmd ...' -ForegroundColor Yellow
  pip install coscmd
}

if (-not (Get-Command coscmd -ErrorAction SilentlyContinue)) {
  Write-Host 'coscmd still unavailable. Add Python Scripts to PATH and retry.' -ForegroundColor Red
  exit 1
}

. (Join-Path $root 'deploy/load-deploy-env.ps1') -Root $root

Write-Host 'Env loaded from .env.local / .env.tencent.local:' -ForegroundColor Green
Write-Host ('  VITE_SITE_URL = ' + $(if ($env:VITE_SITE_URL) { $env:VITE_SITE_URL } else { '(missing)' }))
Write-Host ('  VITE_AMAP_KEY = ' + $(if ($env:VITE_AMAP_KEY) { 'OK' } else { 'MISSING' }))
Write-Host ('  VITE_AMAP_SECURITY_CODE = ' + $(if ($env:VITE_AMAP_SECURITY_CODE) { 'OK' } else { 'MISSING' }))
Write-Host ('  VITE_MAP_PROVIDER = ' + $(if ($env:VITE_MAP_PROVIDER) { $env:VITE_MAP_PROVIDER } else { 'amap (default)' }))
Write-Host ''

$cosConfigured = $false
try {
  $null = coscmd list / 2>&1
  if ($LASTEXITCODE -eq 0) {
    $cosConfigured = $true
  }
} catch {
  $cosConfigured = $false
}

if ($cosConfigured) {
  Write-Host 'coscmd is configured. Run: pnpm run deploy:tencent' -ForegroundColor Green
} else {
  Write-Host 'coscmd is NOT configured yet.' -ForegroundColor Yellow
  Write-Host ''
  Write-Host 'Tencent Cloud steps:'
  Write-Host '  1. https://console.cloud.tencent.com/cos -> create bucket (public-read)'
  Write-Host '  2. https://console.cloud.tencent.com/cam/capi -> SecretId / SecretKey'
  Write-Host '  3. Run on this machine:'
  Write-Host ''
  Write-Host '     coscmd config -a <SecretId> -s <SecretKey> -b <BucketName-APPID> -r ap-beijing'
  Write-Host ''
  Write-Host '  4. Verify: coscmd list /'
  Write-Host '  5. Deploy:  pnpm run deploy:tencent'
  Write-Host ''
  Write-Host 'Optional: copy .env.tencent.example -> .env.tencent.local'
}

Write-Host ''
Write-Host 'After upload, in Tencent console:' -ForegroundColor Yellow
Write-Host '  - COS static site: index.html + error doc index.html'
Write-Host '  - CDN + DNS for helloroamly.com'
Write-Host '  - Amap whitelist: helloroamly.com'
Write-Host '  - Custom domain needs ICP filing in mainland China'
Write-Host ''
Write-Host 'Guide: deploy/tencent-deploy.md'
Write-Host ''
