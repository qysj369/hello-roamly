# Week1: start dev -> run acceptance -> stop
# Usage: powershell -ExecutionPolicy Bypass -File scripts/week1-dev-acceptance.ps1
# Non-interactive: add -NoWait

param([switch]$NoWait)

$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$BaseUrl = 'http://127.0.0.1:5173'
$LogFile = Join-Path $env:TEMP 'hello-roamly-dev.log'

Write-Host ""
Write-Host "=== HelloRoamly Week1 Acceptance ===" -ForegroundColor Cyan
Set-Location $ProjectRoot

foreach ($port in @(5173, 5174)) {
  Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
    ForEach-Object {
      if ($_.OwningProcess) {
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
      }
    }
}

  Write-Host "[1/6] Starting dev server..." -ForegroundColor Yellow
$devJob = Start-Job -ScriptBlock {
  param($root, $log)
  Set-Location $root
  pnpm run dev -- --host 127.0.0.1 --port 5173 *> $log
} -ArgumentList $ProjectRoot, $LogFile

try {
  Write-Host "[2/6] Waiting for $BaseUrl ..." -ForegroundColor Yellow
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
    Write-Host "Dev server timeout. Log tail:" -ForegroundColor Red
    if (Test-Path $LogFile) { Get-Content $LogFile -Tail 20 }
    exit 1
  }
  Write-Host "  OK dev server ready" -ForegroundColor Green

  Write-Host "[3/6] Running unit tests..." -ForegroundColor Yellow
  pnpm exec vitest run `
    src/lib/plan/mapPlanCompleteness.test.ts `
    src/lib/map/resolvePlanOrigin.test.ts `
    src/lib/map/planQueryBuilder.test.ts `
    src/lib/plan/destinationDriftGuard.test.ts `
    src/lib/plan/originDriftGuard.test.ts `
    src/lib/map/knownOriginFallbacks.test.ts `
    src/lib/map/parseTrailSearchQuery.test.ts
  if ($LASTEXITCODE -ne 0) {
    Write-Host "  FAIL unit tests (exit $LASTEXITCODE)" -ForegroundColor Red
    exit $LASTEXITCODE
  }
  Write-Host "  OK unit tests passed" -ForegroundColor Green

  Write-Host "[4/6] Running week1 API smoke..." -ForegroundColor Yellow
  node scripts/acceptance-week1-smoke.mjs
  if ($LASTEXITCODE -ne 0) {
    Write-Host "  FAIL week1 API smoke" -ForegroundColor Red
    exit $LASTEXITCODE
  }
  Write-Host "  OK week1 API smoke passed" -ForegroundColor Green

  Write-Host "[5/6] Running week2 API smoke..." -ForegroundColor Yellow
  node scripts/acceptance-week2-smoke.mjs
  if ($LASTEXITCODE -ne 0) {
    Write-Host "  FAIL week2 API smoke" -ForegroundColor Red
    exit $LASTEXITCODE
  }
  Write-Host "  OK week2 API smoke passed" -ForegroundColor Green

  Write-Host "[6/7] Running week3 API smoke..." -ForegroundColor Yellow
  node scripts/acceptance-week3-smoke.mjs
  if ($LASTEXITCODE -ne 0) {
    Write-Host "  FAIL week3 API smoke" -ForegroundColor Red
    exit $LASTEXITCODE
  }
  Write-Host "  OK week3 API smoke passed" -ForegroundColor Green

  Write-Host "[7/8] Running week4 API smoke..." -ForegroundColor Yellow
  node scripts/acceptance-week4-smoke.mjs
  if ($LASTEXITCODE -ne 0) {
    Write-Host "  FAIL week4 API smoke" -ForegroundColor Red
    exit $LASTEXITCODE
  }
  Write-Host "  OK week4 API smoke passed" -ForegroundColor Green

  Write-Host "[8/9] Running week5 API smoke..." -ForegroundColor Yellow
  node scripts/acceptance-week5-smoke.mjs
  if ($LASTEXITCODE -ne 0) {
    Write-Host "  FAIL week5 API smoke" -ForegroundColor Red
    exit $LASTEXITCODE
  }
  Write-Host "  OK week5 API smoke passed" -ForegroundColor Green

  Write-Host "[9/9] Running week6 API smoke..." -ForegroundColor Yellow
  node scripts/acceptance-week6-smoke.mjs
  if ($LASTEXITCODE -ne 0) {
    Write-Host "  FAIL week6 API smoke" -ForegroundColor Red
    exit $LASTEXITCODE
  }
  Write-Host "  OK week6 API smoke passed" -ForegroundColor Green

  Write-Host ""
  Write-Host "All automated checks passed (week1-week6)." -ForegroundColor Green
  Write-Host "Open in browser for UI check:" -ForegroundColor Cyan
  Write-Host "  Home: $BaseUrl/" -ForegroundColor White
  Write-Host "  AI:   $BaseUrl/ai" -ForegroundColor White

  if (-not $NoWait) {
    Write-Host ""
    Write-Host "Press Enter to stop dev server..." -ForegroundColor Gray
    Read-Host | Out-Null
  }
} finally {
  Write-Host "Stopping dev server..." -ForegroundColor Yellow
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
}
