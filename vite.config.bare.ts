import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/** 生产构建：本机 Three/Capsule 包在 esbuild 压缩阶段易 OOM，故关闭 minify */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
  build: {
    outDir: 'dist-new-build',
    emptyOutDir: true,
    minify: false,
    sourcemap: false,
    cssCodeSplit: false,
    reportCompressedSize: false,
    rollupOptions: {
      maxParallelFileOps: 1,
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }
          if (/node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
            return 'vendor-react';
          }
          if (/node_modules[\\/](three|@react-three|postprocessing|three-stdlib)[\\/]/.test(id)) {
            return 'vendor-three';
          }
          // 禁止 catch-all vendor 分块 — 会与 vendor-react 形成循环依赖，导致 React 白屏
          return undefined;
        },
      },
    },
  },
});
