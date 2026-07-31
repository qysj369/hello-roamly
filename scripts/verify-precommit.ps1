# 验证 Husky pre-commit + lint-staged（PowerShell）
# 用法：pnpm run verify:precommit

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$tempFile = Join-Path $root 'src\_verify_precommit_temp.ts'
if (-not (Test-Path $tempFile)) {
  Write-Error "缺少 $tempFile，请先保留仓库中的验证用临时文件。"
}

Write-Host '==> 1/4 检查依赖' -ForegroundColor Cyan
if (-not (Test-Path 'node_modules\husky')) {
  Write-Host '    正在 pnpm install ...'
  pnpm install
}
if (-not (Test-Path '.husky\pre-commit')) {
  Write-Error '缺少 .husky/pre-commit，请确认 Husky 已配置。'
}

Write-Host '==> 2/4 模拟暂存验证文件' -ForegroundColor Cyan
git add --intent-to-add $tempFile 2>$null
git add $tempFile

Write-Host '==> 3/4 运行 lint-staged（仅暂存区）' -ForegroundColor Cyan
pnpm exec lint-staged
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host '    检查 Prettier/ESLint 是否已改写文件...'
$raw = Get-Content $tempFile -Raw
if ($raw -match "const\s{2,}unusedVar") {
  Write-Warning '    格式可能未被 Prettier 修复，请检查 lint-staged 配置。'
} else {
  Write-Host '    OK: 临时文件已被格式化。' -ForegroundColor Green
}

Write-Host '==> 4/4 运行 typecheck' -ForegroundColor Cyan
pnpm run typecheck
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ''
Write-Host '==> 可选：完整提交流程验证' -ForegroundColor Cyan
Write-Host '    git add src/_verify_precommit_temp.ts'
Write-Host '    git commit -m "chore: verify pre-commit hooks"'
Write-Host '    （成功后执行: git reset HEAD~1 并删除临时文件）'
Write-Host ''
Write-Host '验证通过。' -ForegroundColor Green
