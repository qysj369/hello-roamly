/**
 * 启动 vite preview 并跑顶栏冒烟，结束后自动关闭预览进程。
 * 用法: node scripts/run-smoke-header-with-preview.mjs [port]
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const previewPort = Number(process.argv[2] ?? process.env.SMOKE_PREVIEW_PORT ?? 4173);
const previewOrigin = `http://127.0.0.1:${previewPort}`;

async function waitForServer(url, timeoutMs = 90_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: 'follow' });
      if (response.ok) return;
    } catch {
      // preview 尚未就绪
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  throw new Error(`预览服务未在 ${timeoutMs}ms 内就绪: ${url}`);
}

function startPreview() {
  const viteBin = path.join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js');
  return spawn(
    process.execPath,
    [viteBin, 'preview', '--port', String(previewPort), '--strictPort', '--host', '127.0.0.1'],
    { cwd: projectRoot, stdio: 'inherit', env: { ...process.env, BROWSER: 'none' } },
  );
}

async function runSmoke() {
  const smokeScript = path.join(projectRoot, 'scripts', 'smoke-header-routes.mjs');
  const child = spawn(process.execPath, [smokeScript, previewOrigin], {
    cwd: projectRoot,
    stdio: 'inherit',
  });
  const code = await new Promise((resolve) => child.on('close', resolve));
  if (code !== 0) process.exit(code ?? 1);
}

async function main() {
  const preview = startPreview();
  const stopPreview = () => {
    if (!preview.killed) preview.kill('SIGTERM');
  };
  process.on('SIGINT', () => {
    stopPreview();
    process.exit(130);
  });
  process.on('SIGTERM', () => {
    stopPreview();
    process.exit(143);
  });

  try {
    await waitForServer(previewOrigin);
    await runSmoke();
  } finally {
    stopPreview();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
