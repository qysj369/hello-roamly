import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  buildCompanionSketchMessages,
  isCompanionSketchCityId,
  sanitizeCompanionSketchText,
} from '@/lib/capsule/earthCompanionSketch';
import { getEarthFlyDestination } from '@/lib/capsule/earthFlyTo';
import { findSnailFlightCityByLabel, getSnailFlightCity } from '@/lib/snail-flight/cities';
import { createServerDeepSeekCompleter, type ServerEnv } from '../../lib/deepseekServer';
import { readJsonBody, sendJson } from '../../lib/http';

type CompanionSketchRequest = {
  cityId?: string;
  cityLabel?: string;
};

function resolveCompanionSketchCity(
  body: CompanionSketchRequest,
): { label: string; blurb: string } | null {
  const cityId = typeof body.cityId === 'string' ? body.cityId.trim() : '';
  const cityLabel = typeof body.cityLabel === 'string' ? body.cityLabel.trim() : '';
  if (cityId && isCompanionSketchCityId(cityId)) {
    const city = getEarthFlyDestination(cityId);
    return city ? { label: city.label, blurb: city.blurb } : null;
  }
  const domestic =
    (cityId ? getSnailFlightCity(cityId) : undefined) ??
    findSnailFlightCityByLabel(cityLabel || cityId);
  if (domestic) {
    return { label: domestic.label, blurb: domestic.blurb };
  }
  return null;
}

/** POST /api/ai/companion-sketch — 地球落地点 / 蜗牛号国内目的地 2-3 天结伴灵感（纯文本，不走穷游装配） */
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
    const city = resolveCompanionSketchCity(body);
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
