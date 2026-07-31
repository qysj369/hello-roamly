import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  analyzePlanWithTools,
  isValidPlanToolsRequest,
} from '../../controllers/planToolsController';
import type { ServerEnv } from '../../lib/deepseekServer';
import { readJsonBody, sendJson } from '../../lib/http';

/** POST /api/ai/plan-tools — 预算/POI/天气工具层分析 */
export async function handlePlanToolsApi(
  req: IncomingMessage,
  res: ServerResponse,
  env: ServerEnv,
): Promise<void> {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  try {
    const body = await readJsonBody<unknown>(req);
    if (!isValidPlanToolsRequest(body)) {
      sendJson(res, 400, { error: '请求参数无效', code: 'invalid_params' });
      return;
    }

    const report = await analyzePlanWithTools(body, env);
    sendJson(res, 200, { report });
  } catch (error) {
    const message = error instanceof Error ? error.message : '工具分析失败';
    sendJson(res, 500, { error: message, code: 'tools_failed' });
  }
}
