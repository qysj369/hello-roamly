import react from '@vitejs/plugin-react';
import { build } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'dist-test-build');

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

console.info('[minimal-build] start', { root, pid: process.pid });

try {
  await build({
    configFile: false,
    root,
    plugins: [ignoreCssImports(), react()],
    resolve: {
      alias: { '@': path.resolve(root, './src') },
    },
    build: {
      outDir: 'dist-test-build',
      emptyOutDir: true,
      minify: false,
      sourcemap: false,
      cssCodeSplit: false,
      reportCompressedSize: false,
      rollupOptions: {
        maxParallelFileOps: 2,
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              if (id.includes('/mapTrailWall/') || id.includes('/src/pages/home/')) {
                return 'page-home-map';
              }
              if (id.includes('/src/pages/')) {
                const match = id.match(/\/src\/pages\/([^/]+)/);
                if (match?.[1]) {
                  return `page-${match[1]}`;
                }
              }
              return undefined;
            }
            if (id.includes('mapbox-gl') || id.includes('react-map-gl') || id.includes('maplibre')) {
              return 'vendor-mapbox';
            }
            if (id.includes('tsparticles') || id.includes('@tsparticles')) {
              return 'vendor-particles';
            }
            if (id.includes('@amap/amap-jsapi-loader')) {
              return 'vendor-amap';
            }
            // three / react-three / framer-motion 等与 React 同包，避免 chunk 循环依赖白屏
            return 'vendor-react';
          },
        },
      },
    },
    logLevel: 'info',
  });

  const assetCount = fs.existsSync(path.join(outDir, 'assets'))
    ? fs.readdirSync(path.join(outDir, 'assets')).length
    : 0;
  console.info('[minimal-build] success', { assetCount });
  if (assetCount === 0) {
    process.exit(1);
  }
} catch (error) {
  console.error('[minimal-build] failed', error);
  process.exit(1);
}
