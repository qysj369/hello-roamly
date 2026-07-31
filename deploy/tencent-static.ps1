# Deploy hello-roamly dist to Tencent Cloud COS
# Tool: coscmd (recommended) https://cloud.tencent.com/document/product/436/10976
#
# One-time setup:
#   pip install coscmd
#   coscmd config -a <SecretId> -s <SecretKey> -b <BucketName-APPID> -r ap-beijing
#
# Usage:
#   $env:VITE_SITE_URL = "https://你的域名.com"
#   $env:VITE_AMAP_KEY = "..."
#   $env:VITE_AMAP_SECURITY_CODE = "..."
#   $env:VITE_MAP_PROVIDER = "amap"
#   .\deploy\tencent-static.ps1

param(
  [string]$CosPath = '/',
  [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

. (Join-Path $root 'deploy/load-deploy-env.ps1') -Root $root

if (-not (Get-Command coscmd -ErrorAction SilentlyContinue)) {
  Write-Host ''
  Write-Host 'coscmd not found. Install it first:' -ForegroundColor Yellow
  Write-Host '  pip install coscmd'
  Write-Host '  coscmd config -a <SecretId> -s <SecretKey> -b <BucketName-APPID> -r ap-beijing'
  Write-Host ''
  Write-Host 'Get SecretId/SecretKey: Tencent Cloud Console -> Access Management -> API Keys'
  Write-Host 'Bucket format example: hello-roamly-1250000000 (name-appid)'
  Write-Host ''
  exit 1
}

if (-not $env:VITE_SITE_URL) {
  Write-Warning 'VITE_SITE_URL not set. Using default https://helloroamly.com for SEO/sitemap.'
  $env:VITE_SITE_URL = 'https://helloroamly.com'
}

Write-Host ('Build target: ' + $env:VITE_SITE_URL) -ForegroundColor DarkGray

if (-not $SkipBuild) {
  Write-Host ''
  Write-Host '[1/3] Building production bundle...' -ForegroundColor Cyan
  pnpm run build
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

$dist = Join-Path $root 'dist'
if (-not (Test-Path $dist)) {
  Write-Error 'dist folder missing. Run pnpm run build first.'
}

$target = $CosPath.TrimEnd('/')
if (-not $target) { $target = '/' }

Write-Host ('[2/3] Uploading dist -> COS ' + $target + ' ...') -ForegroundColor Cyan
coscmd upload -r $dist $target --skipmd5
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host '[3/3] Upload complete' -ForegroundColor Green
Write-Host ''
Write-Host 'Tencent Cloud console next steps:'
Write-Host '  1. COS -> bucket -> Basic -> Static website'
Write-Host '     Index: index.html   Error doc: index.html (SPA fallback)'
Write-Host '  2. Test default website URL (*.cos-website.*.myqcloud.com)'
Write-Host '  3. CDN -> add domain -> origin = this COS bucket'
Write-Host '  4. DNSPod -> CNAME your domain to CDN'
Write-Host '  5. SSL -> free certificate -> bind to CDN'
Write-Host '  6. ICP filing (beian) required for custom domain in mainland China'
Write-Host '  7. Amap console -> whitelist your production domain'
Write-Host '  8. Run: pnpm run check:online'
Write-Host ''
Write-Host 'Full guide: deploy/tencent-deploy.md'
Write-Host ''
