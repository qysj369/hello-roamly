import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const visualizer = (() => {
  try {
    return require('rollup-plugin-visualizer').visualizer;
  } catch {
    return null;
  }
})();
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { apiPlugin } from './vite-plugin-api';
import { buildCdnPreconnectTags } from './src/lib/cdn/preconnect';
import { normalizeViteBase } from './src/lib/cdn/urls';
import { readViteEnv } from './src/lib/cdn/viteEnv';

const pwaManifest = JSON.parse(
  readFileSync(new URL('./public/manifest.json', import.meta.url), 'utf-8'),
) as Record<string, unknown>;

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const analyzeBundle = process.env.ANALYZE === 'true';

function debugBuildPlugin(): Plugin {
  const stamp = () => new Date().toISOString();
  return {
    name: 'hello-roamly-debug-build',
    buildStart() {
      console.info(`[debug-build ${stamp()} pid=${process.pid}] buildStart`);
    },
    renderStart() {
      console.info(`[debug-build ${stamp()} pid=${process.pid}] renderStart`);
    },
    generateBundle() {
      console.info(`[debug-build ${stamp()} pid=${process.pid}] generateBundle`);
    },
    writeBundle() {
      console.info(`[debug-build ${stamp()} pid=${process.pid}] writeBundle`);
    },
    closeBundle() {
      console.info(`[debug-build ${stamp()} pid=${process.pid}] closeBundle`);
    },
    buildEnd(error) {
      console.info(`[debug-build ${stamp()} pid=${process.pid}] buildEnd`, error ?? 'ok');
    },
  };
}

function seoStaticFilesPlugin(): Plugin {
  const runSeoGenerate = () => {
    execSync('pnpm run seo:generate', { cwd: rootDir, stdio: 'inherit' });
  };

  return {
    name: 'hello-roamly-seo-static',
    buildStart() {
      if (process.env.VITE_SKIP_SEO_BUILD_HOOK === '1') return;
      runSeoGenerate();
    },
    configureServer() {
      runSeoGenerate();
    },
  };
}

function cdnPreconnectPlugin(env: Record<string, string>): Plugin {
  const assetBase = readViteEnv(env, 'VITE_CDN_BASE');
  const imageCdn = readViteEnv(env, 'VITE_IMAGE_CDN');
  const market = readViteEnv(env, 'VITE_MARKET')?.toUpperCase();
  const includeAmap = Boolean(readViteEnv(env, 'VITE_AMAP_KEY')) || market !== 'GLOBAL';

  const tags = buildCdnPreconnectTags({
    assetCdnBase: assetBase,
    imageCdnTemplate: imageCdn,
    includeAmap,
  });

  return {
    name: 'hello-roamly-cdn-preconnect',
    transformIndexHtml(html) {
      if (!tags) {
        return html;
      }
      return html.replace('</head>', `${tags}</head>`);
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, '');
  const assetCdnBase = readViteEnv(env, 'VITE_CDN_BASE');

  return {
  base: normalizeViteBase(assetCdnBase),
  plugins: [
    process.env.VITE_DEBUG_BUILD === '1' ? debugBuildPlugin() : null,
    process.env.VITE_SKIP_API_PLUGIN === '1' ? null : apiPlugin(),
    process.env.VITE_SKIP_CDN_PLUGIN === '1' ? null : cdnPreconnectPlugin(env),
    process.env.VITE_SKIP_SEO_PLUGIN === '1' ? null : seoStaticFilesPlugin(),
    react(),
    process.env.VITE_SKIP_TAILWIND === '1' ? null : tailwindcss(),
    process.env.VITE_SKIP_PWA === '1' ? null : VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'script-defer',
        includeAssets: ['favicon.svg', 'icons.svg', 'robots.txt', 'sitemap.xml'],
        manifest: pwaManifest,
        manifestFilename: 'manifest.json',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'unsplash-images',
                expiration: {
                  maxEntries: 64,
                  maxAgeSeconds: 60 * 60 * 24 * 7,
                },
              },
            },
            {
              urlPattern: /^https:\/\/picsum\.photos\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'picsum-images',
                expiration: {
                  maxEntries: 48,
                  maxAgeSeconds: 60 * 60 * 24 * 3,
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    analyzeBundle &&
      visualizer?.({
        filename: 'dist/bundle-stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap',
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
    dedupe: ['react', 'react-dom', 'three'],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      '@react-three/postprocessing',
    ],
    exclude: ['@xenova/transformers'],
  },
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    allowedHosts: ['helloroamly.com', 'www.helloroamly.com', '49.232.221.38', 'localhost', '127.0.0.1'],
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: false,
    allowedHosts: ['helloroamly.com', 'www.helloroamly.com', '49.232.221.38', 'localhost', '127.0.0.1'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (process.env.VITE_SIMPLE_CHUNKS === '1') {
            if (!id.includes('node_modules')) return undefined;
            return 'vendor';
          }
          if (!id.includes('node_modules')) {
            return undefined;
          }
          // React 生态必须在同一 chunk，避免 createContext 运行时为 undefined
          if (
            /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler|use-sync-external-store)([\\/]|$)/.test(
              id,
            )
          ) {
            return 'vendor-react';
          }
          if (id.includes('@amap/amap-jsapi-loader')) {
            return 'vendor-amap';
          }
          if (id.includes('mapbox-gl') || id.includes('react-map-gl') || id.includes('maplibre')) {
            return 'vendor-mapbox';
          }
          if (id.includes('tsparticles') || id.includes('@tsparticles')) {
            return 'vendor-particles';
          }
          if (id.includes('framer-motion')) {
            return 'vendor-motion';
          }
          if (id.includes('@tanstack/react-query')) {
            return 'vendor-query';
          }
          if (id.includes('three') || id.includes('@react-three')) {
            return 'vendor-three';
          }
          return 'vendor';
        },
      },
    },
  },
};
});
