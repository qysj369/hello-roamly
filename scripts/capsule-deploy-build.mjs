import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(root, 'dist-new-build');

console.info('[capsule-deploy-build] step 1/3: seo');
execSync('pnpm run seo:generate', { cwd: root, stdio: 'inherit' });

console.info('[capsule-deploy-build] step 2/3: vite bare build');
execSync('npx vite build --config vite.config.bare.ts', {
  cwd: root,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: process.env.NODE_OPTIONS ?? '--max-old-space-size=8192',
  },
});

const assetsDir = path.join(distDir, 'assets');
const assetCount = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir).length : 0;
if (assetCount === 0) {
  console.error('[capsule-deploy-build] no assets produced');
  process.exit(1);
}

console.info('[capsule-deploy-build] step 3/3: copy seo/static extras');
for (const name of ['robots.txt', 'sitemap.xml']) {
  const src = path.join(root, 'public', name);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(distDir, name));
  }
}

const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
const indexJs = indexHtml.match(/index-[^"]+\.js/)?.[0] ?? 'unknown';
const hasCapsule = fs
  .readdirSync(assetsDir)
  .some((name) => name.startsWith('CapsuleOneCanvas'));

console.info('[capsule-deploy-build] success', {
  assetCount,
  indexJs,
  hasCapsule,
  distBytes: fs.readdirSync(distDir, { recursive: true }).reduce((sum, rel) => {
    const full = path.join(distDir, rel);
    return fs.statSync(full).isFile() ? sum + fs.statSync(full).size : sum;
  }, 0),
});
