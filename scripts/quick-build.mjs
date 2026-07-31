import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { build } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.resolve(root, 'dist-new');

console.info('[quick-build] start', { root, outDir, pid: process.pid });

try {
  await build({
    configFile: false,
    root,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(root, './src'),
      },
    },
    build: {
      outDir: 'dist-new',
      emptyOutDir: true,
      minify: false,
      sourcemap: false,
      cssCodeSplit: false,
    },
    logLevel: 'info',
  });

  const assetsDir = path.join(outDir, 'assets');
  const assetCount = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir).length : 0;
  console.info('[quick-build] success', { assetCount });
  if (assetCount === 0) {
    process.exit(1);
  }
} catch (error) {
  console.error('[quick-build] failed', error);
  process.exit(1);
}
