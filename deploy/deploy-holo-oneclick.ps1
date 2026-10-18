# One-click Holo deploy: build -> scp upload -> remote deploy-holo-now.sh
# Usage:
#   pnpm deploy:holo
#   powershell -ExecutionPolicy Bypass -File deploy/deploy-holo-oneclick.ps1
#   powershell -ExecutionPolicy Bypass -File deploy/deploy-holo-oneclick.ps1 -SkipBuild
#
# Optional env (or .env.tencent.local):
#   HOLO_DEPLOY_HOST=49.232.221.38
#   HOLO_DEPLOY_USER=root
#   HOLO_DEPLOY_SSH_KEY=C:\Users\Administrator\.ssh\id_ed25519_holo

param(
  [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

. (Join-Path $root 'deploy\load-deploy-env.ps1') -Root $root

$hostName = if ($env:HOLO_DEPLOY_HOST) { $env:HOLO_DEPLOY_HOST } else { '49.232.221.38' }
$user = if ($env:HOLO_DEPLOY_USER) { $env:HOLO_DEPLOY_USER } else { 'root' }
$remote = "${user}@${hostName}"
$keyPath = $env:HOLO_DEPLOY_SSH_KEY

function Get-SshArgs {
  $list = @(
    '-o', 'BatchMode=yes',
    '-o', 'ConnectTimeout=20',
    '-o', 'StrictHostKeyChecking=accept-new'
  )
  if ($keyPath) {
    if (-not (Test-Path $keyPath)) {
      Write-Error "HOLO_DEPLOY_SSH_KEY not found: $keyPath"
    }
    $list += @('-i', $keyPath)
  }
  return $list
}

Write-Host ''
Write-Host '========== Holo one-click deploy ==========' -ForegroundColor Cyan
Write-Host ("target = " + $remote) -ForegroundColor White

$push = Join-Path $root 'deploy\push-holo-tencent.ps1'
if ($SkipBuild) {
  Write-Host '[1/4] Skip build, reuse existing zip...' -ForegroundColor Yellow
  & $push -SkipBuild -NoLaunch
} else {
  Write-Host '[1/4] Build + package...' -ForegroundColor Cyan
  & $push -NoLaunch
}
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$zip = Join-Path $root 'site-motion.zip'
$deploySh = Join-Path $root 'deploy\deploy-holo-now.sh'
if (-not (Test-Path $zip)) { Write-Error 'site-motion.zip missing' }
if (-not (Test-Path $deploySh)) { Write-Error 'deploy/deploy-holo-now.sh missing' }

$desktopZip = Join-Path ([Environment]::GetFolderPath('Desktop')) 'NEW-HOME.zip'
Copy-Item -Force $zip $desktopZip

$sshArgs = Get-SshArgs

Write-Host '[2/4] Testing SSH...' -ForegroundColor Cyan
& ssh @sshArgs $remote 'echo SSH_OK'
if ($LASTEXITCODE -ne 0) {
  Write-Host ''
  Write-Host 'SSH login failed. Run once:' -ForegroundColor Red
  Write-Host '  pnpm deploy:holo:ssh-setup' -ForegroundColor Yellow
  Write-Host 'Add the public key to server authorized_keys, then retry pnpm deploy:holo' -ForegroundColor Yellow
  Write-Host ''
  Write-Host 'Fallback: WinSCP upload Desktop NEW-HOME.zip + deploy/deploy-holo-now.sh' -ForegroundColor DarkYellow
  exit 1
}

Write-Host '[3/4] Uploading NEW-HOME.zip + deploy-holo-now.sh ...' -ForegroundColor Cyan
& scp @sshArgs $desktopZip "${remote}:/root/NEW-HOME.zip"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& scp @sshArgs $deploySh "${remote}:/root/deploy-holo-now.sh"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host '[4/4] Remote deploy...' -ForegroundColor Cyan
& ssh @sshArgs $remote 'sed -i "s/\r$//" /root/deploy-holo-now.sh; bash /root/deploy-holo-now.sh'
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ''
Write-Host 'DONE. Verify: https://helloroamly.com  (Ctrl+Shift+R)' -ForegroundColor Green
Write-Host ''
