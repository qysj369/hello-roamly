import type { GenerateMapPlanRequest } from '@/types/api/mapGeneratePlan';
import { isCoordinateLikeLocationName } from '@/lib/map/resolveAmapPlaceName';
import { runMapPlanGeneration } from '@/services/ai/runMapPlanGeneration';
import { createServerDeepSeekCompleter, type ServerEnv } from '../lib/deepseekServer';
import { serverReverseGeocode } from '../lib/reverseGeocodeServer';

export function isValidMapPlanRequest(body: unknown): body is GenerateMapPlanRequest {
  if (!body || typeof body !== 'object') {
    return false;
  }
  const record = body as Record<string, unknown>;
  return (
    typeof record.lng === 'number' &&
    Number.isFinite(record.lng) &&
    typeof record.lat === 'number' &&
    Number.isFinite(record.lat) &&
    typeof record.query === 'string' &&
    record.query.trim().length > 0
  );
}

/**
 * 地图 AI 规划控制器：逆地理 → 拼接提示词 → DeepSeek → 原样返回 Markdown 文本
 *
 * DeepSeek 调用示例：
 * ```js
 * const response = await fetch('https://api.deepseek.com/chat/completions', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
 *   },
 *   body: JSON.stringify({
 *     model: 'deepseek-chat',
 *     messages: [
 *       { role: 'system', content: systemPrompt },
 *       { role: 'user', content: `地点：${locationName}。需求：${query}。` },
 *     ],
 *     temperature: 0.55,
 *     max_tokens: 2200,
 *   }),
 * });
 * const data = await response.json();
 * const text = data.choices[0].message.content; // 原样返回给前端
 * ```
 */
export async function generateMapPlan(body: GenerateMapPlanRequest, env: ServerEnv) {
  const clientLocation = body.locationName?.trim();
  const serverLocation = await serverReverseGeocode(body.lng, body.lat, env);
  let locationName = '所选地点';
  if (clientLocation && !isCoordinateLikeLocationName(clientLocation)) {
    locationName = clientLocation;
  } else if (serverLocation) {
    locationName = serverLocation;
  }

  const completer = createServerDeepSeekCompleter(env);
  return runMapPlanGeneration(
    {
      lng: body.lng,
      lat: body.lat,
      query: body.query,
      locationName,
      originName: body.originName?.trim() || null,
    },
    completer,
  );
}
