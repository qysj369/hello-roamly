# 把 hello-roamly-prod 的 DeepSeek Key 写入生产机（不打印明文）
# 用法（管理员 PowerShell）：
#   cd C:\Users\Administrator\Desktop\hello-roamly
#   powershell -NoProfile -ExecutionPolicy Bypass -File deploy\set-prod-deepseek-key.ps1

$ErrorActionPreference = 'Stop'

$keyPath = if ($env:HOLO_DEPLOY_SSH_KEY) {
  $env:HOLO_DEPLOY_SSH_KEY
} elseif (Test-Path "$env:USERPROFILE\.ssh\id_ed25519_holo") {
  "$env:USERPROFILE\.ssh\id_ed25519_holo"
} else {
  "$env:USERPROFILE\.ssh\id_ed25519"
}

if (-not (Test-Path -LiteralPath $keyPath)) {
  throw "找不到 SSH 私钥: $keyPath"
}

$prodKey = (Read-Host '粘贴 hello-roamly-prod 的 Key').Trim()
if ($prodKey -notmatch '^sk-') {
  throw 'Key 格式不对：应以 sk- 开头（请确认粘贴的是 prod Key）'
}

$sshTarget = 'root@49.232.221.38'
$sshArgs = @('-i', $keyPath, '-o', 'StrictHostKeyChecking=accept-new')

$tmpDir = Join-Path $env:TEMP ("hr-ds-" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tmpDir | Out-Null

try {
  $keyFile = Join-Path $tmpDir 'key.txt'
  $scriptFile = Join-Path $tmpDir 'apply.sh'

  # 纯 ASCII，避免换行/编码问题
  [System.IO.File]::WriteAllText($keyFile, $prodKey)

  $applySh = @'
#!/bin/bash
set -euo pipefail
KEY_FILE=/tmp/hr-deepseek-key.txt
ENV=/opt/hello-roamly/.env.local
if [ ! -f "$KEY_FILE" ]; then
  echo "ERROR: missing $KEY_FILE" >&2
  exit 1
fi
if [ ! -f "$ENV" ]; then
  echo "ERROR: missing $ENV" >&2
  exit 1
fi
KEY=$(tr -d '\r\n' < "$KEY_FILE")
rm -f "$KEY_FILE"
if [[ "$KEY" != sk-* ]]; then
  echo "ERROR: key format invalid" >&2
  exit 1
fi
if grep -q '^DEEPSEEK_API_KEY=' "$ENV"; then
  sed -i "s|^DEEPSEEK_API_KEY=.*|DEEPSEEK_API_KEY=${KEY}|" "$ENV"
else
  printf '\nDEEPSEEK_API_KEY=%s\n' "$KEY" >> "$ENV"
fi
sed -i 's/^VITE_DEEPSEEK_API_KEY=/# VITE_DEEPSEEK_API_KEY=/' "$ENV" || true
echo '--- env check (masked) ---'
grep -E '^(# )?DEEPSEEK_API_KEY=|^(# )?VITE_DEEPSEEK_API_KEY=' "$ENV" | sed 's/=sk-.*/=sk-***/' || true
pm2 restart hello-roamly --update-env
sleep 2
pm2 list | head -12
echo 'DONE_OK'
'@
  # LF line endings for bash on Linux
  $applySh = $applySh -replace "`r`n", "`n"
  [System.IO.File]::WriteAllText($scriptFile, $applySh)

  Write-Host "SSH key: $keyPath" -ForegroundColor Cyan
  Write-Host '[1/3] 上传临时文件...' -ForegroundColor Cyan
  & scp @sshArgs $keyFile "${sshTarget}:/tmp/hr-deepseek-key.txt"
  if ($LASTEXITCODE -ne 0) { throw "scp key 失败，exit=$LASTEXITCODE" }
  & scp @sshArgs $scriptFile "${sshTarget}:/tmp/hr-deepseek-apply.sh"
  if ($LASTEXITCODE -ne 0) { throw "scp script 失败，exit=$LASTEXITCODE" }

  Write-Host '[2/3] 写入 .env.local 并重启 API...' -ForegroundColor Cyan
  & ssh @sshArgs $sshTarget 'bash /tmp/hr-deepseek-apply.sh; rm -f /tmp/hr-deepseek-apply.sh'
  if ($LASTEXITCODE -ne 0) { throw "远程执行失败，exit=$LASTEXITCODE" }

  Write-Host '[3/3] 完成。请确认上面有 DONE_OK，且 pm2 为 online' -ForegroundColor Green
}
finally {
  Remove-Item -LiteralPath $tmpDir -Recurse -Force -ErrorAction SilentlyContinue
}
