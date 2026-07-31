# Package Capsule source for server-side build and deploy
# Usage: powershell -ExecutionPolicy Bypass -File deploy/push-capsule-update.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

$env:VITE_APP_MODE = 'production'
$env:VITE_SITE_URL = 'https://helloroamly.com'
$env:VITE_MAP_DEV_DEMO = '0'
$env:VITE_HOME_LAYOUT = 'launch'

Write-Host '=== Capsule production package ===' -ForegroundColor Cyan
Write-Host ('Site: ' + $env:VITE_SITE_URL)

$stage = Join-Path $env:TEMP ('capsule-src-' + (Get-Date -Format 'yyyyMMddHHmmss'))
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Path $stage | Out-Null

$include = @(
  'src',
  'public',
  'scripts/capsule-deploy-build.mjs',
  'scripts/generate-seo-files.ts',
  'deploy/server-capsule-update.sh',
  'package.json',
  'pnpm-lock.yaml',
  'index.html',
  'vite.config.bare.ts',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json'
)

foreach ($item in $include) {
  $srcPath = Join-Path $root $item
  if (Test-Path $srcPath) {
    $dest = Join-Path $stage $item
    $destParent = Split-Path $dest -Parent
    if (-not (Test-Path $destParent)) {
      New-Item -ItemType Directory -Path $destParent -Force | Out-Null
    }
    Copy-Item $srcPath $dest -Recurse -Force
  }
}

$zip = Join-Path $root 'capsule-src.zip'
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path (Join-Path $stage '*') -DestinationPath $zip -Force
Remove-Item $stage -Recurse -Force

Get-Item $zip | Format-Table Name, @{ N = 'MB'; E = { [math]::Round($_.Length / 1MB, 2) } }, LastWriteTime

Write-Host ''
Write-Host 'Next steps (Tencent OrcaTerm):' -ForegroundColor Yellow
Write-Host '  1. WinSCP upload capsule-src.zip to /root/capsule-src.zip'
Write-Host '  2. On server run:'
Write-Host '     sudo mkdir -p /opt/hello-roamly'
Write-Host '     sudo unzip -o /root/capsule-src.zip -d /opt/hello-roamly'
Write-Host '     cd /opt/hello-roamly'
Write-Host '     bash deploy/server-capsule-update.sh'
Write-Host '  3. Open https://helloroamly.com to verify'
Write-Host ''

$winscp = "${env:ProgramFiles(x86)}\WinSCP\WinSCP.exe"
if (Test-Path $winscp) {
  Start-Process $winscp -ArgumentList 'sftp://root@49.232.221.38/'
  Write-Host 'WinSCP opened.' -ForegroundColor Green
}

Start-Process 'https://console.cloud.tencent.com/lighthouse/instance'
Write-Host 'Tencent console opened.' -ForegroundColor Green
