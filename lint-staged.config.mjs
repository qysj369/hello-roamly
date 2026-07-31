/**
 * Git暂存区检查:仅对 staged 文件执行 ESLint / Prettier。
 * TypeScript 在项目引用模式下需全量检查,故在 precommit 脚本中处理。
 *
 * @see package.json scripts.precommit
 * @type {import('lint-staged').Configuration}
 */
export default {
  '*.{ts,tsx}': [
    'eslint --fix --max-warnings 0', // 1. 用ESLint自动修复问题
    'prettier --write',              // 2. 用Prettier标准化格式
  ],
  '*.{css,json,md}': [
    'prettier --write', // 对样式、数据、文档文件只做格式化
  ],
};