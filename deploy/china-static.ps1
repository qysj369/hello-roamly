# Deploy static dist to Aliyun OSS (example)
# Install ossutil first: https://help.aliyun.com/document_detail/120075.html
#
# Usage:
#   $env:VITE_SITE_URL = "https://your-domain.com"
#   $env:VITE_AMAP_KEY = "your-amap-key"
#   $env:VITE_AMAP_SECURITY_CODE = "your-security-code"
#   $env:VITE_MAP_PROVIDER = "amap"
#   .\deploy\china-static.ps1 -Bucket "your-bucket" -Endpoint "oss-cn-beijing.aliyuncs.com"

param(
  [Parameter(Mandatory = $true)]
  [string]$Bucket,
  [Parameter(Mandatory = $true)]
  [string]$Endpoint,
  [string]$Prefix = ''
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

if (-not (Get-Command ossutil -ErrorAction SilentlyContinue)) {
  Write-Error 'ossutil not found. Install Aliyun ossutil and run ossutil config first.'
}

if (-not $env:VITE_SITE_URL) {
  Write-Warning 'VITE_SITE_URL not set; sitemap will use default hello-roamly.app'
}

Write-Host ''
Write-Host '[1/3] Building production bundle...' -ForegroundColor Cyan
pnpm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$dist = Join-Path $root 'dist'
if (-not (Test-Path $dist)) {
  Write-Error 'dist folder missing after build'
}

$target = 'oss://' + $Bucket
if ($Prefix) {
  $target = $target + '/' + $Prefix
}

Write-Host ('[2/3] Uploading to ' + $target + ' ...') -ForegroundColor Cyan
ossutil sync $dist $target --update --force --endpoint $Endpoint
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host '[3/3] Upload complete' -ForegroundColor Green
Write-Host ''
Write-Host 'Aliyun console next steps:'
Write-Host '  1. OSS bucket -> static website: index.html, 404 -> index.html (SPA)'
Write-Host '  2. Bind CDN domain + HTTPS certificate'
Write-Host '  3. Amap console: whitelist your CDN domain'
Write-Host '  4. Run: pnpm run check:online'
Write-Host '  5. Mainland custom domain usually needs ICP filing (beian)'
Write-Host ''
