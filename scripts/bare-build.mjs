import { build } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);

console.info('[bare-build] start');

try {
  await build({
    configFile: path.join(root, 'vite.config.bare.ts'),
    logLevel: 'info',
  });
  console.info('[bare-build] success');
} catch (error) {
  console.error('[bare-build] failed', error);
  process.exit(1);
}
