import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  buildCompanionSketchMessages,
  isCompanionSketchCityId,
  sanitizeCompanionSketchText,
} from '@/lib/capsule/earthCompanionSketch';
import { getEarthFlyDestination } from '@/lib/capsule/earthFlyTo';
import { createServerDeepSeekCompleter, type ServerEnv } from '../../lib/deepseekServer';
import { readJsonBody, sendJson } from '../../lib/http';

type CompanionSketchRequest = {
  cityId?: string;
};

/** POST /api/ai/companion-sketch — 地球落地点 2-3 天结伴灵感（纯文本，不走穷游装配） */
export async function handleCompanionSketchApi(
  req: IncomingMessage,
  res: ServerResponse,
  env: ServerEnv,
): Promise<void> {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  try {
    const body = await readJsonBody<CompanionSketchRequest>(req);
    const cityId = typeof body.cityId === 'string' ? body.cityId.trim() : '';
    if (!isCompanionSketchCityId(cityId)) {
      sendJson(res, 400, { error: '目的地无效', code: 'invalid_params' });
      return;
    }

    const city = getEarthFlyDestination(cityId);
    if (!city) {
      sendJson(res, 400, { error: '目的地无效', code: 'invalid_params' });
      return;
    }

    const completer = createServerDeepSeekCompleter(env);
    if (!completer) {
      sendJson(res, 503, { error: '暂时写不了行程，请稍后再试', code: 'deepseek_unconfigured' });
      return;
    }

    const messages = buildCompanionSketchMessages(city.label, city.blurb);
    const raw = await completer({
      messages: [
        { role: 'system', content: messages.system },
        { role: 'user', content: messages.user },
      ],
      temperature: 0.55,
      maxTokens: 700,
      jsonMode: false,
    });
    const text = sanitizeCompanionSketchText(raw);
    if (!text) {
      sendJson(res, 500, { error: '行程是空的', code: 'empty_sketch' });
      return;
    }

    sendJson(res, 200, { text });
  } catch (error) {
    const message = error instanceof Error ? error.message : '生成行程失败';
    sendJson(res, 500, { error: message, code: 'generate_failed' });
  }
}
