import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  createUserPlan,
  deleteUserPlan,
  getUserPlanById,
  isValidPatchUserPlanRequest,
  isValidSaveUserPlanRequest,
  listUserPlans,
  updateUserPlan,
} from '../../controllers/userPlansController';
import { readJsonBody, sendJson } from '../../lib/http';

function parseListQuery(url: string | undefined): { publicOnly: boolean; userId?: string } {
  const query = url?.split('?')[1] ?? '';
  const params = new URLSearchParams(query);
  const value = params.get('public');
  const userId = params.get('userId')?.trim();
  return {
    publicOnly: value === '1' || value === 'true',
    userId: userId || undefined,
  };
}

function parsePlanIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/api\/user\/plans\/([^/]+)$/);
  if (!match?.[1]) {
    return null;
  }
  return decodeURIComponent(match[1]);
}

/** 兼容层：/api/user/plans 映射到 user_ai_sessions（仅 is_saved=true） */
export async function handleUserPlansApi(
  req: IncomingMessage,
  res: ServerResponse,
  rootDir: string,
): Promise<void> {
  const pathname = req.url?.split('?')[0] ?? '';
  const method = req.method ?? 'GET';
  const planId = parsePlanIdFromPath(pathname);

  if (planId) {
    if (method === 'GET') {
      try {
        const item = await getUserPlanById(req, rootDir, planId);
        if (!item) {
          sendJson(res, 404, { error: '方案不存在或无权查看', code: 'not_found' });
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
        if (!isValidPatchUserPlanRequest(body)) {
          sendJson(res, 400, { error: '请求参数无效', code: 'invalid_params' });
          return;
        }

        const result = await updateUserPlan(req, rootDir, planId, body);
        if (result === 'forbidden') {
          sendJson(res, 403, { error: '无权修改此方案', code: 'forbidden' });
          return;
        }
        if (!result) {
          sendJson(res, 404, { error: '方案不存在', code: 'not_found' });
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
        const result = await deleteUserPlan(req, rootDir, planId);
        if (result === 'forbidden') {
          sendJson(res, 403, { error: '无权删除此方案', code: 'forbidden' });
          return;
        }
        if (!result) {
          sendJson(res, 404, { error: '方案不存在', code: 'not_found' });
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

  if (pathname !== '/api/user/plans') {
    sendJson(res, 404, { error: 'Not Found' });
    return;
  }

  if (method === 'GET') {
    try {
      const { publicOnly, userId } = parseListQuery(req.url);
      const items = await listUserPlans(req, rootDir, { publicOnly, userId });
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
      if (!isValidSaveUserPlanRequest(body)) {
        sendJson(res, 400, { error: '请求参数无效', code: 'invalid_params' });
        return;
      }

      const item = await createUserPlan(req, rootDir, body);
      sendJson(res, 201, { item });
    } catch (error) {
      const message = error instanceof Error ? error.message : '保存失败';
      sendJson(res, 500, { error: message, code: 'save_failed' });
    }
    return;
  }

  sendJson(res, 405, { error: 'Method Not Allowed' });
}
