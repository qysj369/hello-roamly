/**
 * 根据 deploy/siteRedirects.ts 同步 public/_redirects（Netlify）。
 * Vercel 规则在 vercel.json 中需手动与 siteRedirects 保持一致。
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatNetlifyRedirects } from '../deploy/siteRedirects';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outfile = path.join(projectRoot, 'public', '_redirects');

const header = `# Netlify / 兼容平台（由 pnpm run redirects:sync 生成）
# 与 deploy/siteRedirects.ts、vercel.json 保持一致

`;

writeFileSync(outfile, header + formatNetlifyRedirects(), 'utf-8');
console.log(`[redirects] wrote ${path.relative(projectRoot, outfile)}`);
