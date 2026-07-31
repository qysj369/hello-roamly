import react from '@vitejs/plugin-react';
import { build } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'dist-js-tmp');

function ignoreCssImports() {
  return {
    name: 'ignore-css-imports',
    enforce: 'pre',
    resolveId(id) {
      if (id.endsWith('.css') || id.includes('.css?')) {
        return `\0css:${id}`;
      }
      return null;
    },
    load(id) {
      if (id.startsWith('\0css:')) {
        return 'export default ""';
      }
      return null;
    },
  };
}

console.info('[build-js] start', { outDir, pid: process.pid });

try {
  console.info('[build-js] invoking vite.build...');
  await build({
    configFile: false,
    root,
    plugins: [ignoreCssImports(), react()],
    resolve: {
      alias: { '@': path.resolve(root, './src') },
    },
    build: {
      outDir: 'dist-js-tmp',
      emptyOutDir: true,
      minify: false,
      sourcemap: false,
      cssCodeSplit: false,
      reportCompressedSize: false,
    },
    logLevel: 'info',
  });
  console.info('[build-js] vite.build returned');

  const assetCount = fs.existsSync(path.join(outDir, 'assets'))
    ? fs.readdirSync(path.join(outDir, 'assets')).length
    : 0;
  console.info('[build-js] success', { assetCount });
  if (assetCount === 0) {
    process.exit(1);
  }
} catch (error) {
  console.error('[build-js] failed', error);
  process.exit(1);
}
