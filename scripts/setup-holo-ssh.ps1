# Generate / show SSH public key for one-click Holo deploy
# Usage: pnpm deploy:holo:ssh-setup

$ErrorActionPreference = 'Stop'
$sshDir = Join-Path $env:USERPROFILE '.ssh'
$keyPath = Join-Path $sshDir 'id_ed25519_holo'
$pubPath = "$keyPath.pub"
$hostName = '49.232.221.38'
$user = 'root'
$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

if (-not (Test-Path $sshDir)) {
  New-Item -ItemType Directory -Path $sshDir | Out-Null
}

if (-not (Test-Path $keyPath)) {
  Write-Host 'Generating ed25519 key: id_ed25519_holo ...' -ForegroundColor Cyan
  & ssh-keygen -t ed25519 -f $keyPath -N '""' -C "holo-deploy@$env:COMPUTERNAME"
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} else {
  Write-Host "Key already exists: $keyPath" -ForegroundColor Green
}

$pub = (Get-Content $pubPath -Raw).Trim()

Write-Host ''
Write-Host '========== One-time SSH setup ==========' -ForegroundColor Cyan
Write-Host '1) Copy this FULL public key line:' -ForegroundColor Yellow
Write-Host $pub -ForegroundColor White
Write-Host ''
Write-Host '2) Add it to the server (pick one):' -ForegroundColor Yellow
Write-Host '   A. Tencent Lighthouse console -> instance -> bind SSH public key' -ForegroundColor White
Write-Host '   B. Login via WinSCP/OrcaTerm, then run:' -ForegroundColor White
Write-Host '      mkdir -p ~/.ssh' -ForegroundColor DarkGray
Write-Host '      chmod 700 ~/.ssh' -ForegroundColor DarkGray
Write-Host '      echo YOUR_PUBLIC_KEY >> ~/.ssh/authorized_keys' -ForegroundColor DarkGray
Write-Host '      chmod 600 ~/.ssh/authorized_keys' -ForegroundColor DarkGray
Write-Host ''
Write-Host '3) Ensure .env.tencent.local contains:' -ForegroundColor Yellow
Write-Host "   HOLO_DEPLOY_HOST=$hostName" -ForegroundColor White
Write-Host "   HOLO_DEPLOY_USER=$user" -ForegroundColor White
Write-Host ("   HOLO_DEPLOY_SSH_KEY=" + $keyPath) -ForegroundColor White
Write-Host ''
Write-Host '4) Test:' -ForegroundColor Yellow
Write-Host ("   ssh -i `"$keyPath`" -o BatchMode=yes ${user}@${hostName} echo SSH_OK") -ForegroundColor White
Write-Host ''
Write-Host '5) Deploy:' -ForegroundColor Yellow
Write-Host '   pnpm deploy:holo' -ForegroundColor Green
Write-Host ''

$snippet = @"
HOLO_DEPLOY_HOST=$hostName
HOLO_DEPLOY_USER=$user
HOLO_DEPLOY_SSH_KEY=$keyPath
"@

$envFile = Join-Path $repoRoot '.env.tencent.local'
if (-not (Test-Path $envFile)) {
  Set-Content -Path $envFile -Value $snippet -Encoding UTF8
  Write-Host "Wrote $envFile" -ForegroundColor Green
} elseif (-not (Select-String -Path $envFile -Pattern 'HOLO_DEPLOY_SSH_KEY' -Quiet)) {
  Add-Content -Path $envFile -Value "`n$snippet" -Encoding UTF8
  Write-Host "Appended HOLO_DEPLOY_* to $envFile" -ForegroundColor Green
} else {
  Write-Host '.env.tencent.local already has HOLO_DEPLOY_* - left unchanged' -ForegroundColor DarkYellow
}

try {
  Set-Clipboard -Value $pub
  Write-Host 'Public key copied to clipboard.' -ForegroundColor Green
} catch {
  Write-Host 'Clipboard copy skipped - copy the key above manually.' -ForegroundColor DarkYellow
}
