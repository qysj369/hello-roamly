import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsOutDir = path.join(root, 'dist-test-build');
const distDir = path.join(root, 'dist');
const cssFileName = 'app.css';

console.info('[deploy-build] step 1/4: compile CSS');
execSync('node scripts/build-css.mjs', { cwd: root, stdio: 'inherit' });
const compiledCss = path.join(root, 'dist-good', 'assets', cssFileName);

console.info('[deploy-build] step 2/4: JS bundle -> dist-test-build');
execSync('node scripts/minimal-build.mjs', { cwd: root, stdio: 'inherit' });
const jsOutDirResolved = path.join(root, 'dist-test-build');
const jsAssetsDir = path.join(jsOutDirResolved, 'assets');
const jsAssetCount = fs.existsSync(jsAssetsDir) ? fs.readdirSync(jsAssetsDir).length : 0;
if (jsAssetCount === 0) {
  console.error('[deploy-build] JS build produced no assets');
  process.exit(1);
}

console.info('[deploy-build] step 3/4: merge dist');
try {
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.cpSync(jsOutDirResolved, distDir, { recursive: true, force: true });
} catch (err) {
  if (err && typeof err === 'object' && 'code' in err && err.code === 'EBUSY') {
    console.warn('[deploy-build] dist locked — merging in place');
    fs.cpSync(jsOutDirResolved, distDir, { recursive: true, force: true });
  } else {
    throw err;
  }
}
fs.mkdirSync(path.join(distDir, 'assets'), { recursive: true });
fs.copyFileSync(compiledCss, path.join(distDir, 'assets', cssFileName));

for (const name of fs.readdirSync(path.join(distDir, 'assets'))) {
  if (name.endsWith('.css') && name !== cssFileName) {
    fs.unlinkSync(path.join(distDir, 'assets', name));
  }
}

console.info('[deploy-build] step 4/4: fix index.html');
const indexPath = path.join(distDir, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');
const cssVersion = String(fs.statSync(path.join(distDir, 'assets', cssFileName)).mtimeMs).slice(-8);
indexHtml = indexHtml.replace(/href="\/assets\/[^"]+\.css"/, `href="/assets/${cssFileName}?v=${cssVersion}"`);
fs.writeFileSync(indexPath, indexHtml);

execSync('pnpm run seo:generate', { cwd: root, stdio: 'inherit' });
fs.copyFileSync(path.join(root, 'public', 'robots.txt'), path.join(distDir, 'robots.txt'));
fs.copyFileSync(path.join(root, 'public', 'sitemap.xml'), path.join(distDir, 'sitemap.xml'));

const cssText = fs.readFileSync(path.join(distDir, 'assets', cssFileName), 'utf8');
console.info('[deploy-build] success', {
  jsAssetCount,
  cssLength: cssText.length,
  cssHasSrOnly: cssText.includes('sr-only'),
  indexJs: indexHtml.match(/index-[^"]+\.js/)?.[0],
  indexCss: indexHtml.match(/assets\/[^"]+\.css/)?.[0],
});
