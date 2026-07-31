/**
 * 构建后对关键路由做静态预渲染（SSG）：启动 vite preview，用无头浏览器抓取完整 HTML。
 * 需先执行 `vite build`。跳过：SKIP_PRERENDER=1
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { collectPrerenderPaths } from '../src/lib/ssg/prerenderPaths';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(projectRoot, 'dist');
const previewPort = Number(process.env.PRERENDER_PORT ?? 4173);
const previewOrigin = `http://127.0.0.1:${previewPort}`;

function routeToOutputFile(routePath: string): string {
  if (routePath === '/') {
    return path.join(distDir, 'index.html');
  }
  const segments = routePath.replace(/^\//, '').split('/').filter(Boolean);
  return path.join(distDir, ...segments, 'index.html');
}

async function waitForServer(url: string, timeoutMs = 90_000): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: 'follow' });
      if (response.ok) {
        return;
      }
    } catch {
      // preview 尚未就绪
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 400);
    });
  }
  throw new Error(`预览服务未在 ${timeoutMs}ms 内就绪: ${url}`);
}

function startPreview(): ChildProcess {
  const viteBin = path.join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js');

  return spawn(
    process.execPath,
    [viteBin, 'preview', '--port', String(previewPort), '--strictPort', '--host', '127.0.0.1'],
    {
      cwd: projectRoot,
      stdio: 'ignore',
      env: { ...process.env, NODE_ENV: 'production' },
      windowsHide: true,
    },
  );
}

async function prerenderRoute(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  routePath: string,
): Promise<void> {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  const url = `${previewOrigin}${routePath}`;

  try {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(url, { waitUntil: 'load', timeout: 90_000 });
    await page.waitForFunction(
      () => {
        const root = document.getElementById('root');
        const main = document.querySelector('main');
        return Boolean(root && root.childElementCount > 0 && main);
      },
      { timeout: 45_000 },
    );
    // 等待 usePageSeo / JSON-LD 写入 head
    await new Promise((resolve) => {
      setTimeout(resolve, 600);
    });

    const html = await page.content();
    const outfile = routeToOutputFile(routePath);
    await mkdir(path.dirname(outfile), { recursive: true });
    await writeFile(outfile, html, 'utf-8');
    console.log(`[ssg] ${routePath} → ${path.relative(projectRoot, outfile)}`);
  } catch (error) {
    throw new Error(
      `预渲染 ${routePath} 失败: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  } finally {
    await context.close();
  }
}

async function main(): Promise<void> {
  if (process.env.SKIP_PRERENDER === '1') {
    console.log('[ssg] SKIP_PRERENDER=1，跳过预渲染');
    return;
  }

  const routes = collectPrerenderPaths();
  if (routes.length === 0) {
    console.log('[ssg] 无预渲染路由');
    return;
  }

  const preview = startPreview();

  try {
    await waitForServer(previewOrigin);
    const browser = await chromium.launch({ headless: true });

    try {
      for (const routePath of routes) {
        await prerenderRoute(browser, routePath);
      }
    } finally {
      await browser.close();
    }

    console.log(`[ssg] 完成 ${routes.length} 个路由的静态 HTML`);
  } finally {
    preview.kill('SIGTERM');
  }
}

main().catch((error) => {
  console.error('[ssg] 预渲染失败:', error);
  process.exit(1);
});
