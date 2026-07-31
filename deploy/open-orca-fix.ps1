# Open WinSCP and show OrcaTerm fix steps
$winscp = "${env:ProgramFiles(x86)}\WinSCP\WinSCP.exe"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

Write-Host ''
Write-Host '=== Fix online API ===' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Option 1 (fastest): OrcaTerm paste one command' -ForegroundColor Yellow
Write-Host ''
Write-Host "bash $root/deploy/fix-api-now.sh"
Write-Host ''
Write-Host 'Option 2: if /opt/hello-roamly missing, upload first via WinSCP:' -ForegroundColor Yellow
Write-Host "  app.zip      -> /opt/hello-roamly/"
Write-Host "  .env.local   -> /opt/hello-roamly/.env.local"
Write-Host "  site.zip     -> /root/"
Write-Host ''
Write-Host 'Then in OrcaTerm:' -ForegroundColor Yellow
Write-Host '  cd /opt/hello-roamly && unzip -o app.zip && bash deploy/fix-api-now.sh'
Write-Host ''

if (Test-Path $winscp) {
  Start-Process $winscp -ArgumentList 'sftp://root@49.232.221.38/'
  Write-Host 'WinSCP opened.' -ForegroundColor Green
} else {
  Write-Host 'WinSCP not found.' -ForegroundColor Red
}

Start-Process 'https://console.cloud.tencent.com/lighthouse/instance'
Write-Host 'Tencent console opened for OrcaTerm login.' -ForegroundColor Green
