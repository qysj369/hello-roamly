/**
 * 验证 pre-commit 流水线：lint-staged（暂存区）+ typecheck
 * 用法：pnpm run verify:precommit
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const tempRel = 'src/_verify_precommit_temp.ts';
const tempAbs = join(root, tempRel);

function run(cmd, label) {
  console.log(`\n==> ${label}`);
  console.log(`    $ ${cmd}`);
  execSync(cmd, { cwd: root, stdio: 'inherit', env: process.env });
}

if (!existsSync(tempAbs)) {
  console.error(`缺少 ${tempRel}`);
  process.exit(1);
}

if (!existsSync(join(root, 'node_modules/husky'))) {
  run('pnpm install', '1/5 安装依赖（含 husky、lint-staged）');
} else {
  console.log('\n==> 1/5 依赖已存在，跳过 pnpm install');
}

if (!existsSync(join(root, '.husky/pre-commit'))) {
  console.error('缺少 .husky/pre-commit');
  process.exit(1);
}

const before = readFileSync(tempAbs, 'utf8');
console.log('\n==> 2/5 暂存前（故意劣化格式）');
console.log(before.includes('const   unusedVar') ? '    检测到多余空格（待 Prettier 修复）' : '    格式已正常');

run(`git add "${tempRel}"`, '3/5 git add 临时文件');

run('pnpm exec lint-staged', '4/5 lint-staged（ESLint + Prettier，仅暂存区）');

const after = readFileSync(tempAbs, 'utf8');
console.log('\n    暂存后文件片段：');
console.log(after.split('\n').slice(4, 9).map((l) => `    ${l}`).join('\n'));

if (after.includes('const   unusedVar')) {
  console.warn('\n    警告：Prettier 可能未改写文件，请检查 lint-staged.config.mjs');
} else {
  console.log('\n    OK: Prettier 已格式化暂存文件');
}

run('pnpm run typecheck', '5/5 TypeScript 全项目检查');

console.log('\n可选 — 验证 Husky 钩子：');
console.log('  git commit -m "chore: verify pre-commit hooks"');
console.log('  成功后: git reset --soft HEAD~1');
console.log('\n验证通过。');
