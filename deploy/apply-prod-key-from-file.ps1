# 从桌面文件读取 prod Key 并写入生产机（不打印明文）
# 前置：桌面创建 hello-roamly-prod-key.txt，内容只有一行 sk-...
# 用法：
#   powershell -NoProfile -ExecutionPolicy Bypass -File deploy\apply-prod-key-from-file.ps1

$ErrorActionPreference = 'Stop'

$keyPath = if ($env:HOLO_DEPLOY_SSH_KEY) {
  $env:HOLO_DEPLOY_SSH_KEY
} elseif (Test-Path "$env:USERPROFILE\.ssh\id_ed25519_holo") {
  "$env:USERPROFILE\.ssh\id_ed25519_holo"
} else {
  "$env:USERPROFILE\.ssh\id_ed25519"
}

$desktopKey = Join-Path $env:USERPROFILE 'Desktop\hello-roamly-prod-key.txt'
if (-not (Test-Path -LiteralPath $desktopKey)) {
  throw "找不到文件: $desktopKey`n请先在桌面新建 hello-roamly-prod-key.txt，只写一行 prod Key。"
}

$prodKey = ([System.IO.File]::ReadAllText($desktopKey)).Trim()
if ($prodKey -notmatch '^sk-') {
  throw '文件内容格式不对：应以 sk- 开头'
}

$sshTarget = 'root@49.232.221.38'
$sshArgs = @('-i', $keyPath, '-o', 'StrictHostKeyChecking=accept-new')
$tmpDir = Join-Path $env:TEMP ("hr-ds-" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tmpDir | Out-Null

try {
  $keyFile = Join-Path $tmpDir 'key.txt'
  $scriptFile = Join-Path $tmpDir 'apply.sh'
  [System.IO.File]::WriteAllText($keyFile, $prodKey)

  $applySh = @'
#!/bin/bash
set -euo pipefail
KEY_FILE=/tmp/hr-deepseek-key.txt
ENV=/opt/hello-roamly/.env.local
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
  $applySh = $applySh -replace "`r`n", "`n"
  [System.IO.File]::WriteAllText($scriptFile, $applySh)

  Write-Host '[1/3] 上传...' -ForegroundColor Cyan
  & scp @sshArgs $keyFile "${sshTarget}:/tmp/hr-deepseek-key.txt"
  if ($LASTEXITCODE -ne 0) { throw "scp key 失败 exit=$LASTEXITCODE" }
  & scp @sshArgs $scriptFile "${sshTarget}:/tmp/hr-deepseek-apply.sh"
  if ($LASTEXITCODE -ne 0) { throw "scp script 失败 exit=$LASTEXITCODE" }

  Write-Host '[2/3] 写入并重启...' -ForegroundColor Cyan
  & ssh @sshArgs $sshTarget 'bash /tmp/hr-deepseek-apply.sh; rm -f /tmp/hr-deepseek-apply.sh'
  if ($LASTEXITCODE -ne 0) { throw "远程执行失败 exit=$LASTEXITCODE" }

  Write-Host '[3/3] 删除桌面临时密钥文件...' -ForegroundColor Cyan
  Remove-Item -LiteralPath $desktopKey -Force
  Write-Host '完成：生产 Key 已写入，桌面临时文件已删除。' -ForegroundColor Green
}
finally {
  Remove-Item -LiteralPath $tmpDir -Recurse -Force -ErrorAction SilentlyContinue
}
