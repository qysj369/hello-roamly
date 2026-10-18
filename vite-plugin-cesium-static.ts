import { createReadStream, existsSync, statSync, promises as fs } from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Connect, Plugin } from 'vite';

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

function parseAmapTilePath(urlPath: string): { z: number; x: number; y: number } | null {
  const match = /^\/cesium-sat\/amap\/(\d+)\/(\d+)\/(\d+)(?:\.(?:jpg|jpeg|png))?$/.exec(urlPath);
  if (!match) return null;
  const z = Number(match[1]);
  const x = Number(match[2]);
  const y = Number(match[3]);
  const span = 2 ** z;
  if (
    !Number.isInteger(z) ||
    !Number.isInteger(x) ||
    !Number.isInteger(y) ||
    z < 0 ||
    z > 18 ||
    x < 0 ||
    y < 0 ||
    x >= span ||
    y >= span
  ) {
    return null;
  }
  return { z, x, y };
}

function proxyAmapSatelliteTile(req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) {
  const urlPath = req.url?.split('?')[0] ?? '';
  const tile = parseAmapTilePath(urlPath);
  if (!tile) {
    next();
    return;
  }
  const hostIndex = (tile.x % 4) + 1;
  const upstream = `https://webst0${hostIndex}.is.autonavi.com/appmaptile?style=6&x=${tile.x}&y=${tile.y}&z=${tile.z}`;
  https
    .get(
      upstream,
      {
        headers: {
          Referer: 'https://www.amap.com/',
          'User-Agent': 'Mozilla/5.0 HelloRoamlySnailFlight',
        },
      },
      (tileRes) => {
        const status = tileRes.statusCode ?? 502;
        if (status >= 400) {
          res.statusCode = status;
          res.end('sat tile missing');
          tileRes.resume();
          return;
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', tileRes.headers['content-type'] || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        tileRes.pipe(res);
      },
    )
    .on('error', () => {
      res.statusCode = 502;
      res.end('sat tile proxy failed');
    });
}

function attachCesiumDevMiddleware(server: { middlewares: Connect.Server }, cesiumBuild: string) {
  server.middlewares.use(proxyAmapSatelliteTile);
  server.middlewares.use((req, res, next) => {
    const url = req.url?.split('?')[0] ?? '';
    if (!url.startsWith('/cesium/')) {
      next();
      return;
    }
    const relative = decodeURIComponent(url.slice('/cesium/'.length));
    const filePath = path.resolve(cesiumBuild, relative);
    if (!isInside(cesiumBuild, filePath) || !existsSync(filePath) || !statSync(filePath).isFile()) {
      res.statusCode = 404;
      res.end('cesium asset missing');
      return;
    }
    res.setHeader('Content-Type', MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    createReadStream(filePath).pipe(res);
  });
}

/** Dev 中间件 + 构建拷贝 Cesium 静态 Workers/Assets */
export function cesiumStaticPlugin(rootDir: string): Plugin {
  const cesiumBuild = path.resolve(rootDir, 'node_modules/cesium/Build/Cesium');

  return {
    name: 'cesium-static',
    configureServer(server) {
      attachCesiumDevMiddleware(server, cesiumBuild);
    },
    configurePreviewServer(server) {
      attachCesiumDevMiddleware(server, cesiumBuild);
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
