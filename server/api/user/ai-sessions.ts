import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  createUserAiSession,
  deleteUserAiSession,
  getUserAiSessionById,
  isValidCreateUserAiSessionRequest,
  isValidUpdateUserAiSessionRequest,
  listUserAiSessions,
  updateUserAiSession,
} from '../../controllers/userAiSessionsController';
import { readJsonBody, sendJson } from '../../lib/http';

function parseListQuery(url: string | undefined): {
  savedOnly: boolean;
  publicOnly: boolean;
  userId?: string;
} {
  const query = url?.split('?')[1] ?? '';
  const params = new URLSearchParams(query);
  const saved = params.get('saved');
  const isPublic = params.get('public');
  const userId = params.get('userId')?.trim();
  return {
    savedOnly: saved === '1' || saved === 'true',
    publicOnly: isPublic === '1' || isPublic === 'true',
    userId: userId || undefined,
  };
}

function parseSessionIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/api\/user\/ai-sessions\/([^/]+)$/);
  if (!match?.[1]) {
    return null;
  }
  return decodeURIComponent(match[1]);
}

/** GET/POST /api/user/ai-sessions · GET/PATCH/DELETE /api/user/ai-sessions/:id */
export async function handleUserAiSessionsApi(
  req: IncomingMessage,
  res: ServerResponse,
  rootDir: string,
): Promise<void> {
  const pathname = req.url?.split('?')[0] ?? '';
  const method = req.method ?? 'GET';
  const sessionId = parseSessionIdFromPath(pathname);

  if (sessionId) {
    if (method === 'GET') {
      try {
        const item = await getUserAiSessionById(req, rootDir, sessionId);
        if (!item) {
          sendJson(res, 404, { error: '会话不存在或无权查看', code: 'not_found' });
          return;
        }
        sendJson(res, 200, { item });
      } catch (error) {
        const message = error instanceof Error ? error.message : '读取失败';
        sendJson(res, 500, { error: message, code: 'read_failed' });
      }
      return;
    }

    if (method === 'PATCH') {
      try {
        const body = await readJsonBody<unknown>(req);
        if (!isValidUpdateUserAiSessionRequest(body)) {
          sendJson(res, 400, { error: '请求参数无效', code: 'invalid_params' });
          return;
        }

        const result = await updateUserAiSession(req, rootDir, sessionId, body);
        if (result === 'forbidden') {
          sendJson(res, 403, { error: '无权修改此会话', code: 'forbidden' });
          return;
        }
        if (!result) {
          sendJson(res, 404, { error: '会话不存在', code: 'not_found' });
          return;
        }
        sendJson(res, 200, { item: result });
      } catch (error) {
        const message = error instanceof Error ? error.message : '更新失败';
        sendJson(res, 500, { error: message, code: 'update_failed' });
      }
      return;
    }

    if (method === 'DELETE') {
      try {
        const result = await deleteUserAiSession(req, rootDir, sessionId);
        if (result === 'forbidden') {
          sendJson(res, 403, { error: '无权删除此会话', code: 'forbidden' });
          return;
        }
        if (!result) {
          sendJson(res, 404, { error: '会话不存在', code: 'not_found' });
          return;
        }
        sendJson(res, 200, { ok: true });
      } catch (error) {
        const message = error instanceof Error ? error.message : '删除失败';
        sendJson(res, 500, { error: message, code: 'delete_failed' });
      }
      return;
    }

    sendJson(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  if (pathname !== '/api/user/ai-sessions') {
    sendJson(res, 404, { error: 'Not Found' });
    return;
  }

  if (method === 'GET') {
    try {
      const { savedOnly, publicOnly, userId } = parseListQuery(req.url);
      const items = await listUserAiSessions(req, rootDir, { savedOnly, publicOnly, userId });
      sendJson(res, 200, { items, total: items.length });
    } catch (error) {
      const message = error instanceof Error ? error.message : '读取失败';
      sendJson(res, 500, { error: message, code: 'read_failed' });
    }
    return;
  }

  if (method === 'POST') {
    try {
      const body = await readJsonBody<unknown>(req);
      if (!isValidCreateUserAiSessionRequest(body)) {
        sendJson(res, 400, { error: '请求参数无效', code: 'invalid_params' });
        return;
      }

      const item = await createUserAiSession(req, rootDir, body);
      sendJson(res, 201, { item });
    } catch (error) {
      const message = error instanceof Error ? error.message : '创建失败';
      sendJson(res, 500, { error: message, code: 'save_failed' });
    }
    return;
  }

  sendJson(res, 405, { error: 'Method Not Allowed' });
}
