import { build } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);

process.on('beforeExit', (code) => {
  console.info(`[debug-build] beforeExit code=${code} pid=${process.pid}`);
});
process.on('exit', (code) => {
  console.info(`[debug-build] exit code=${code} pid=${process.pid}`);
});

console.info(`[debug-build] launching vite build pid=${process.pid}`);

const result = await build({
  configFile: path.join(root, 'vite.config.ts'),
  logLevel: 'info',
  envDir: root,
  mode: 'production',
});

console.info('[debug-build] build resolved', Array.isArray(result) ? result.length : result);
