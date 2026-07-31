import { createReadStream } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { readRawBody, sendJson } from '../../lib/http';
import {
  driveVideoFilePath,
  ensureDriveVideoDirs,
  extFromMime,
  fileExists,
  newDriveVideoId,
  readDriveVideosDb,
  writeDriveVideosDb,
} from '../../db/driveVideosStore';
import type { DriveVideoMeta } from '@/types/api/driveVideos';

const MAX_BYTES = 80 * 1024 * 1024;

function headerString(req: IncomingMessage, name: string): string {
  const value = req.headers[name];
  return typeof value === 'string' ? value.trim() : '';
}

function parseUrl(req: IncomingMessage): URL {
  return new URL(req.url ?? '/', 'http://127.0.0.1');
}

function shouldAutoApprove(env: NodeJS.ProcessEnv): boolean {
  if (env.DRIVE_VIDEOS_AUTO_APPROVE === '1' || env.DRIVE_VIDEOS_AUTO_APPROVE === 'true') {
    return true;
  }
  if (env.DRIVE_VIDEOS_AUTO_APPROVE === '0' || env.DRIVE_VIDEOS_AUTO_APPROVE === 'false') {
    return false;
  }
  // 未配置管理员密钥时默认通过，方便本地/首发联调
  return !env.DRIVE_VIDEOS_ADMIN_KEY;
}

function isAdmin(req: IncomingMessage, env: NodeJS.ProcessEnv): boolean {
  const key = env.DRIVE_VIDEOS_ADMIN_KEY?.trim();
  if (!key) {
    return false;
  }
  return headerString(req, 'x-admin-key') === key;
}

function publicItem(item: DriveVideoMeta): DriveVideoMeta & { playUrl: string } {
  return {
    ...item,
    playUrl: `/api/drive-videos/file?id=${encodeURIComponent(item.id)}`,
  };
}

/** 驾驶舱城市漫游视频：列表 / 上传 / 审核 / 取文件 */
export async function handleDriveVideosApi(
  req: IncomingMessage,
  res: ServerResponse,
  rootDir: string,
): Promise<void> {
  const method = (req.method ?? 'GET').toUpperCase();
  const url = parseUrl(req);
  const pathname = url.pathname;

  await ensureDriveVideoDirs(rootDir);

  if (pathname === '/api/drive-videos/file' && method === 'GET') {
    const id = url.searchParams.get('id')?.trim() ?? '';
    if (!id) {
      sendJson(res, 400, { error: '缺少 id' });
      return;
    }
    const db = await readDriveVideosDb(rootDir);
    const item = db.items.find((row) => row.id === id);
    if (!item || item.status !== 'approved') {
      sendJson(res, 404, { error: '视频不存在或未通过审核' });
      return;
    }
    const filePath = driveVideoFilePath(rootDir, item.fileName);
    if (!(await fileExists(filePath))) {
      sendJson(res, 404, { error: '文件缺失' });
      return;
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', item.mimeType || 'video/mp4');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Accept-Ranges', 'bytes');
    createReadStream(filePath).pipe(res);
    return;
  }

  if (pathname === '/api/drive-videos/moderate' && method === 'POST') {
    if (!isAdmin(req, process.env)) {
      sendJson(res, 401, { error: '需要管理员密钥 x-admin-key' });
      return;
    }
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}') as {
      id?: string;
      action?: 'approve' | 'reject';
    };
    if (!body.id || (body.action !== 'approve' && body.action !== 'reject')) {
      sendJson(res, 400, { error: '需要 id 与 action=approve|reject' });
      return;
    }
    const db = await readDriveVideosDb(rootDir);
    const idx = db.items.findIndex((row) => row.id === body.id);
    if (idx < 0) {
      sendJson(res, 404, { error: '未找到投稿' });
      return;
    }
    const now = new Date().toISOString();
    db.items[idx] = {
      ...db.items[idx],
      status: body.action === 'approve' ? 'approved' : 'rejected',
      updatedAt: now,
    };
    await writeDriveVideosDb(rootDir, db);
    sendJson(res, 200, { item: publicItem(db.items[idx]) });
    return;
  }

  if (pathname === '/api/drive-videos' && method === 'GET') {
    const city = url.searchParams.get('city')?.trim() ?? '';
    const status = url.searchParams.get('status')?.trim() ?? 'approved';
    const admin = isAdmin(req, process.env);
    const db = await readDriveVideosDb(rootDir);
    let items = db.items;
    if (city) {
      items = items.filter((item) => item.cityLabel === city);
    }
    if (status === 'all') {
      if (!admin) {
        sendJson(res, 401, { error: '查看全部状态需要管理员密钥' });
        return;
      }
    } else {
      items = items.filter((item) => item.status === status);
    }
    items = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    sendJson(res, 200, {
      items: items.map(publicItem),
      total: items.length,
    });
    return;
  }

  if (pathname === '/api/drive-videos' && method === 'POST') {
    const cityLabel = decodeURIComponent(headerString(req, 'x-city-label') || '');
    const title = decodeURIComponent(headerString(req, 'x-title') || '') || `${cityLabel} 漫游投稿`;
    const mimeType = headerString(req, 'content-type') || headerString(req, 'x-mime') || 'video/mp4';
    const originalName = decodeURIComponent(headerString(req, 'x-filename') || 'upload.mp4');

    if (!cityLabel) {
      sendJson(res, 400, { error: '缺少 x-city-label' });
      return;
    }
    if (!mimeType.startsWith('video/')) {
      sendJson(res, 400, { error: '仅支持视频上传' });
      return;
    }

    const body = await readRawBody(req);
    if (body.length === 0) {
      sendJson(res, 400, { error: '空文件' });
      return;
    }
    if (body.length > MAX_BYTES) {
      sendJson(res, 413, { error: '视频超过 80MB 上限' });
      return;
    }

    const id = newDriveVideoId();
    const fileName = `${id}${extFromMime(mimeType, originalName)}`;
    const now = new Date().toISOString();
    const status = shouldAutoApprove(process.env) ? 'approved' : 'pending';
    const item: DriveVideoMeta = {
      id,
      cityLabel,
      title: title.slice(0, 40),
      mimeType,
      byteSize: body.length,
      fileName,
      status,
      createdAt: now,
      updatedAt: now,
    };

    await writeFile(driveVideoFilePath(rootDir, fileName), body);
    const db = await readDriveVideosDb(rootDir);
    db.items = [item, ...db.items];
    await writeDriveVideosDb(rootDir, db);

    sendJson(res, 201, {
      item: publicItem(item),
      autoApproved: status === 'approved',
    });
    return;
  }

  sendJson(res, 404, { error: 'Not Found' });
}
