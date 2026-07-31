# Start dev server, wait until ready, then open browser
param(
  [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot),
  [string]$BaseUrl = 'http://127.0.0.1:5173'
)

$ErrorActionPreference = 'Stop'
$LogFile = Join-Path $env:TEMP 'hello-roamly-dev-ui.log'

Write-Host ""
Write-Host "=== HelloRoamly Dev Server ===" -ForegroundColor Cyan
Set-Location $ProjectRoot

foreach ($port in @(5173, 5174)) {
  Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
    ForEach-Object {
      if ($_.OwningProcess) {
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
      }
    }
}

Write-Host "Starting dev server..." -ForegroundColor Yellow
$devJob = Start-Job -ScriptBlock {
  param($root, $log)
  Set-Location $root
  pnpm run dev -- --host 127.0.0.1 --port 5173 *> $log
} -ArgumentList $ProjectRoot, $LogFile

$ready = $false
for ($i = 0; $i -lt 60; $i++) {
  try {
    $resp = Invoke-WebRequest -Uri $BaseUrl -UseBasicParsing -TimeoutSec 2
    if ($resp.StatusCode -eq 200) {
      $ready = $true
      break
    }
  } catch {
    Start-Sleep -Seconds 1
  }
}

if (-not $ready) {
  Write-Host "Dev server failed to start. Log tail:" -ForegroundColor Red
  if (Test-Path $LogFile) { Get-Content $LogFile -Tail 25 }
  Stop-Job $devJob -ErrorAction SilentlyContinue
  Remove-Job $devJob -Force -ErrorAction SilentlyContinue
  Read-Host "Press Enter to exit"
  exit 1
}

Write-Host "OK: $BaseUrl is ready" -ForegroundColor Green

$chrome = "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe"
$edge = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
if (Test-Path $chrome) {
  Start-Process $chrome "$BaseUrl/"
  Start-Sleep -Milliseconds 800
  Start-Process $chrome "$BaseUrl/ai"
} elseif (Test-Path $edge) {
  Start-Process $edge "$BaseUrl/"
  Start-Sleep -Milliseconds 800
  Start-Process $edge "$BaseUrl/ai"
} else {
  Start-Process "$BaseUrl/"
}

Write-Host ""
Write-Host "Browser opened. Dev server is running in background." -ForegroundColor Cyan
Write-Host "Home: $BaseUrl/" -ForegroundColor White
Write-Host "AI:   $BaseUrl/ai" -ForegroundColor White
Write-Host ""
Write-Host "Press Enter to stop dev server and exit..." -ForegroundColor Gray
Read-Host | Out-Null

Stop-Job $devJob -ErrorAction SilentlyContinue
Remove-Job $devJob -Force -ErrorAction SilentlyContinue
foreach ($port in @(5173, 5174)) {
  Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
    ForEach-Object {
      if ($_.OwningProcess) {
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
      }
    }
}
