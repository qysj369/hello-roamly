# 构建并打包完整线上版本（静态站 + API 源码，供服务器 vite preview 运行）
# 用法：powershell -ExecutionPolicy Bypass -File deploy/lighthouse-full.ps1

param(
  [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

. (Join-Path $root 'deploy/load-deploy-env.ps1') -Root $root

$env:VITE_APP_MODE = 'production'
$env:VITE_SITE_URL = 'http://helloroamly.com'

Write-Host '=== hello-roamly production package ===' -ForegroundColor Cyan
Write-Host "Build mode: $($env:VITE_APP_MODE)"
Write-Host "Site URL: $($env:VITE_SITE_URL)"

if (-not $SkipBuild) {
  Write-Host ''
  Write-Host '[1/4] 构建生产包...' -ForegroundColor Cyan
  pnpm run build:deploy
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

$dist = Join-Path $root 'dist'
if (-not (Test-Path (Join-Path $dist 'index.html'))) {
  Write-Error 'dist/index.html missing - run pnpm run build first'
}

Write-Host '[2/4] 顶栏稳定性测试...' -ForegroundColor Cyan
pnpm test -- homeMapTrailWall.stability headerNav.stability pageHeader.search.stability useMapPlanningAssistant.stability mapPlanStreamPipeline.stability userTravelSearchPipeline.test
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

pnpm run test:smoke-header:local
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host '[3/4] 打包 app.zip (含 API 源码)...' -ForegroundColor Cyan

$stage = Join-Path $env:TEMP "hello-roamly-app-$(Get-Date -Format 'yyyyMMddHHmmss')"
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Path $stage | Out-Null

$copyItems = @(
  'dist',
  'server',
  'src',
  'public',
  'deploy',
  'scripts',
  'package.json',
  'pnpm-lock.yaml',
  'vite.config.ts',
  'vite-plugin-api.ts',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
  'index.html'
)

foreach ($item in $copyItems) {
  $srcPath = Join-Path $root $item
  if (Test-Path $srcPath) {
    Copy-Item $srcPath (Join-Path $stage $item) -Recurse -Force
  }
}

$appZip = Join-Path $root 'app.zip'
if (Test-Path $appZip) { Remove-Item $appZip -Force }
Compress-Archive -Path (Join-Path $stage '*') -DestinationPath $appZip -Force
Remove-Item $stage -Recurse -Force

# 同步静态站到 site.zip（只更新前端，不重装 API 时用）
$siteZip = Join-Path $root 'site.zip'
Compress-Archive -Path (Join-Path $dist '*') -DestinationPath $siteZip -Force

Write-Host '[4/4] Done' -ForegroundColor Green
Get-Item $appZip, $siteZip | Format-Table Name, @{N='MB';E={[math]::Round($_.Length/1MB,2)}}, LastWriteTime

Write-Host ''
Write-Host 'Output files:' -ForegroundColor Yellow
Write-Host '  app.zip  -> /opt/hello-roamly (full app + API)'
Write-Host '  site.zip -> /var/www/hello-roamly/dist (static only)'
Write-Host ''
Write-Host 'Server steps in OrcaTerm - see deploy/lighthouse-install.sh' -ForegroundColor Yellow
Write-Host ''
