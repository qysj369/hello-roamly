# 验证 Husky + lint-staged

## 提交流程（钩子触发顺序）

```text
git commit
  └─ .husky/pre-commit
       └─ pnpm run precommit
            ├─ 1. lint-staged（仅 Git 暂存区）
            │     ├─ *.ts / *.tsx → eslint --fix → prettier --write
            │     └─ *.css / *.json / *.md → prettier --write
            └─ 2. pnpm run typecheck（全项目 tsc -b）
```

## 一键验证（推荐）

```bash
cd hello-roamly
pnpm install
pnpm run verify:precommit
```

脚本会：`git add` 临时文件 → `lint-staged` → `typecheck`，并对比格式化前后。

## 手动验证（模拟 pre-commit）

### 1. 安装钩子

```bash
pnpm install
# prepare 会执行 husky，设置 core.hooksPath=.husky/_
git config core.hooksPath
# 期望输出: .husky/_ 或 .husky
```

### 2. 暂存故意劣化的临时文件

文件：`src/_verify_precommit_temp.ts`（含多余空格，用于观察 Prettier 修复）

```bash
git add src/_verify_precommit_temp.ts
```

### 3. 仅跑 lint-staged（应对暂存区）

```bash
pnpm exec lint-staged
```

**期望：**

- ESLint 对暂存的 `.ts` 执行 `--fix`
- Prettier 改写该文件（`const   unusedVar` → `const unusedVar`）
- 未暂存的其它文件不会被修改

### 4. TypeScript 全量检查

```bash
pnpm run typecheck
```

### 5. 完整提交流程（触发 Husky）

```bash
git add src/_verify_precommit_temp.ts
git commit -m "chore: verify pre-commit hooks"
```

**期望：** 自动执行 `pnpm run precommit`（= lint-staged + typecheck），通过后完成提交。

**清理（验证后）：**

```powershell
# PowerShell
git reset --soft HEAD~1
git restore --staged src/_verify_precommit_temp.ts
Remove-Item src\_verify_precommit_temp.ts
```

```bash
# Git Bash / macOS / Linux
git reset --soft HEAD~1
git restore --staged src/_verify_precommit_temp.ts
rm src/_verify_precommit_temp.ts
```

## 配置参考

| 文件 | 作用 |
|------|------|
| `.husky/pre-commit` | 调用 `pnpm run precommit` |
| `lint-staged.config.mjs` | 暂存区 ESLint + Prettier 规则 |
| `package.json` → `scripts.precommit` | `lint-staged && pnpm run typecheck` |

### `package.json`（节选）

```json
{
  "scripts": {
    "prepare": "husky",
    "precommit": "lint-staged && pnpm run typecheck",
    "verify:precommit": "node scripts/verify-precommit.mjs",
    "typecheck": "tsc -b --pretty",
    "lint": "eslint . --ext .ts,.tsx --max-warnings 0"
  },
  "devDependencies": {
    "husky": "^9.1.7",
    "lint-staged": "^15.4.3"
  }
}
```

### `.husky/pre-commit`

```sh
pnpm run precommit
```

### `lint-staged.config.mjs`（当前配置）

```js
export default {
  '*.{ts,tsx}': [
    'eslint --fix --max-warnings 0',
    'prettier --write',
  ],
  '*.{css,json,md}': ['prettier --write'],
};
```

### 临时验证文件 `src/_verify_precommit_temp.ts`

提交前（故意劣化，用于观察自动修复）：

```ts
const   unusedVar   =   'lint-staged-test'

export function verifyPrecommitTemp( ): string {
  return unusedVar
}
```

`lint-staged` 成功后应变为：

```ts
const unusedVar = 'lint-staged-test';

export function verifyPrecommitTemp(): string {
  return unusedVar;
}
```

### 跳过钩子（仅紧急情况）

```bash
git commit --no-verify -m "message"
```

## 故障排查

| 现象 | 处理 |
|------|------|
| 提交未触发检查 | 执行 `pnpm install` 重新注册 husky |
| `lint-staged: command not found` | `pnpm install`，使用 `pnpm exec lint-staged` |
| Windows 下 hook 不执行 | 确认已安装 Git for Windows（含 `sh`） |
| typecheck 很慢 | 正常；全项目 `tsc -b` 无法在暂存区做增量类型检查 |
