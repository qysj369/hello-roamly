import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const host = process.env.API_HOST ?? '127.0.0.1';
const port = Number(process.env.API_PORT ?? 4173);

const server = await createServer({
  configFile: path.join(rootDir, 'vite.config.ts'),
  root: rootDir,
  mode: 'production',
  appType: 'spa',
  server: {
    host,
    port,
    strictPort: true,
    // nginx 反代会带上公网 Host，必须放行，否则未匹配路由会 403
    allowedHosts: ['helloroamly.com', 'www.helloroamly.com', '49.232.221.38', 'localhost', '127.0.0.1'],
  },
  logLevel: 'info',
});

await server.listen();
server.printUrls();
console.log('[hello-roamly] production API server ready');
