import { createReadStream, existsSync, statSync, promises as fs } from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

const MIME: Record<string, string> = {
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml',
  '.ktx2': 'image/ktx2',
  '.basis': 'application/octet-stream',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function isInside(root: string, candidate: string): boolean {
  const rel = path.relative(root, candidate);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

/** Dev 中间件 + 构建拷贝 Cesium 静态 Workers/Assets */
export function cesiumStaticPlugin(rootDir: string): Plugin {
  const cesiumBuild = path.resolve(rootDir, 'node_modules/cesium/Build/Cesium');
  const urlPrefix = '/cesium';

  return {
    name: 'cesium-static',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        if (!url.startsWith(`${urlPrefix}/`)) {
          next();
          return;
        }
        const relative = decodeURIComponent(url.slice(urlPrefix.length + 1));
        const filePath = path.resolve(cesiumBuild, relative);
        if (
          !isInside(cesiumBuild, filePath) ||
          !existsSync(filePath) ||
          !statSync(filePath).isFile()
        ) {
          res.statusCode = 404;
          res.end('cesium asset missing');
          return;
        }
        res.setHeader(
          'Content-Type',
          MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
        );
        res.setHeader('Cache-Control', 'public, max-age=86400');
        createReadStream(filePath).pipe(res);
      });
    },
    async writeBundle(options) {
      if (!existsSync(cesiumBuild)) {
        this.warn('cesium package missing; skip static copy');
        return;
      }
      const outDir = options.dir ?? path.resolve(rootDir, 'dist');
      await fs.cp(cesiumBuild, path.join(outDir, 'cesium'), { recursive: true });
    },
  };
}
