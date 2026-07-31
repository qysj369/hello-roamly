import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const storybookDir = path.dirname(fileURLToPath(import.meta.url));

/** Storybook 专用 Vite 配置（不加载根目录 vite.config，避免 PWA/SEO 等插件） */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(storybookDir, '../src'),
    },
  },
});
