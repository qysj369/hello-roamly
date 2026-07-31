# Online connectivity check for hello-roamly production URLs
param(
  [string[]]$Urls = @(
    'https://helloroamly.com/',
    'https://hello-roamly.vercel.app/'
  )
)

$ErrorActionPreference = 'Continue'

Write-Host ''
Write-Host '=== hello-roamly online check ===' -ForegroundColor Cyan
Write-Host ('Time: ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
Write-Host 'Timeout or DNS failure means users on this network cannot open the site.'
Write-Host ''

foreach ($url in $Urls) {
  Write-Host ('Testing: ' + $url)
  try {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 15 -MaximumRedirection 5
    $sw.Stop()
    $line = '  OK status=' + $resp.StatusCode + ' ms=' + $sw.ElapsedMilliseconds + ' bytes=' + $resp.Content.Length
    Write-Host $line -ForegroundColor Green
  }
  catch {
    $msg = $_.Exception.Message
    if ($msg -match 'timeout|timed out') {
      Write-Host '  FAIL: timeout (common for Vercel from mainland China)' -ForegroundColor Red
    }
    elseif ($msg -match 'resolve|name|名称|解析') {
      Write-Host '  FAIL: DNS not configured or domain missing' -ForegroundColor Red
    }
    else {
      Write-Host ('  FAIL: ' + $msg) -ForegroundColor Red
    }
  }
  Write-Host ''
}

Write-Host 'Next steps:' -ForegroundColor Yellow
Write-Host '  1. China users: deploy dist to Aliyun OSS or Tencent COS + CDN'
Write-Host '  2. Local QA: pnpm run preview:lan then open http://YOUR_LAN_IP:4173'
Write-Host '  3. Overseas users: Vercel is OK; do not rely on vercel.app for China'
Write-Host ''
