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
      if (id.endsWith('.css') || id.includes('.css?')) return `\0css:${id}`;
      return null;
    },
    load(id) {
      if (id.startsWith('\0css:')) return 'export default ""';
      return null;
    },
  };
}

console.info('[build-inline] start');
await build({
  configFile: false,
  root,
  plugins: [ignoreCssImports(), react()],
  resolve: { alias: { '@': path.resolve(root, './src') } },
  build: {
    outDir: 'dist-js-tmp',
    emptyOutDir: true,
    minify: false,
    sourcemap: false,
    cssCodeSplit: false,
    reportCompressedSize: false,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
  logLevel: 'info',
});
const n = fs.readdirSync(path.join(outDir, 'assets')).length;
console.info('[build-inline] assets', n);
