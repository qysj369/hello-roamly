param(
  [string]$BaseUrl = 'http://127.0.0.1:5173',
  [int]$MaxSeconds = 60
)

for ($i = 0; $i -lt $MaxSeconds; $i++) {
  try {
    $resp = Invoke-WebRequest -Uri $BaseUrl -UseBasicParsing -TimeoutSec 2
    if ($resp.StatusCode -eq 200) {
      Write-Host "OK: $BaseUrl ready ($($i + 1)s)" -ForegroundColor Green
      exit 0
    }
  } catch {
    Write-Host "  waiting... $($i + 1)s" -ForegroundColor DarkGray
    Start-Sleep -Seconds 1
  }
}

Write-Host "FAIL: $BaseUrl not ready after ${MaxSeconds}s" -ForegroundColor Red
exit 1
