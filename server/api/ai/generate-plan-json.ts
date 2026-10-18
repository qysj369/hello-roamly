import type { IncomingMessage, ServerResponse } from 'node:http';
import { parseSearchStructuredPlan } from '@/lib/home/searchStructuredPlanParse';
import {
  SEARCH_STRUCTURED_PLAN_SYSTEM_PROMPT,
  buildSearchPlanIncrementSystemPrompt,
  buildSearchPlanIncrementUserPrompt,
  buildSearchStructuredPlanUserPrompt,
} from '@/lib/home/searchStructuredPlanPrompt';
import type {
  SearchPlanIncrementFocus,
  SearchPlanIncrementRequest,
  SearchPlanRequest,
} from '@/types/domain/searchStructuredPlan';
import { createServerDeepSeekCompleter, type ServerEnv } from '../../lib/deepseekServer';
import { readJsonBody, sendJson } from '../../lib/http';

const INCREMENT_FOCUS = new Set<SearchPlanIncrementFocus>(['spots', 'foods', 'traffic']);

function isValidIncrementRequest(body: unknown): body is SearchPlanIncrementRequest {
  if (!body || typeof body !== 'object') return false;
  const record = body as Record<string, unknown>;
  if (typeof record.increment !== 'string' || !INCREMENT_FOCUS.has(record.increment as SearchPlanIncrementFocus)) {
    return false;
  }
  const days = Number((record.plan as { baseInfo?: { days?: number } } | undefined)?.baseInfo?.days);
  return Boolean(parseSearchStructuredPlan(JSON.stringify(record.plan ?? null), days));
}

function isValidRequest(body: unknown): body is SearchPlanRequest {
  if (!body || typeof body !== 'object') return false;
  const record = body as Record<string, unknown>;
  return (
    typeof record.startCity === 'string' &&
    typeof record.targetCity === 'string' &&
    record.targetCity.trim().length > 0 &&
    typeof record.days === 'number' &&
    Number.isFinite(record.days) &&
    record.days >= 1 &&
    record.days <= 14 &&
    typeof record.peopleType === 'string' &&
    record.peopleType.trim().length > 0 &&
    (record.budget === null || typeof record.budget === 'number') &&
    (record.theme === null || typeof record.theme === 'string')
  );
}

/** POST /api/ai/generate-plan-json — 首页搜索结构化 JSON，服务端不重试 */
export async function handleGeneratePlanJsonApi(
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
    const incrementBody = isValidIncrementRequest(body) ? body : null;
    if (!incrementBody && !isValidRequest(body)) {
      sendJson(res, 400, { error: '请求参数无效', code: 'invalid_params' });
      return;
    }

    const completer = createServerDeepSeekCompleter(env);
    if (!completer) {
      sendJson(res, 503, { error: 'DeepSeek 未配置', code: 'deepseek_unconfigured' });
      return;
    }

    const content = incrementBody
      ? await completer({
          messages: [
            { role: 'system', content: buildSearchPlanIncrementSystemPrompt(incrementBody.increment) },
            { role: 'user', content: buildSearchPlanIncrementUserPrompt(incrementBody.increment, incrementBody.plan) },
          ],
          temperature: 0.25,
          maxTokens: 4000,
          jsonMode: true,
        })
      : await completer({
          messages: [
            { role: 'system', content: SEARCH_STRUCTURED_PLAN_SYSTEM_PROMPT },
            { role: 'user', content: buildSearchStructuredPlanUserPrompt(body as SearchPlanRequest) },
          ],
          temperature: 0.3,
          maxTokens: 4000,
          jsonMode: true,
        });

    sendJson(res, 200, { content });
  } catch (error) {
    const message = error instanceof Error ? error.message : '生成行程失败';
    sendJson(res, 500, { error: message, code: 'generate_failed' });
  }
}
