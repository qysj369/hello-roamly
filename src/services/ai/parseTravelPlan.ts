import { DeepSeekApiError } from '@/services/ai/deepseek/errors';
import { parseTravelPlanPracticalInfo } from '@/services/ai/parseTravelPlanPracticalInfo';
import type {
  MapCoordinates,
  TravelPlan,
  TravelPlanActivity,
  TravelPlanDay,
} from '@/types/domain/travelPlan';

export type ParsedTravelPlan = Omit<TravelPlan, 'id'>;

/** 模型常返回 markdown 代码块或前后缀说明，先剥离再 parse，降低 DeepSeek 非纯 JSON 的失败率 */
function extractJsonString(raw: string): string {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch?.[1]) {
    return fenceMatch[1].trim();
  }
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }
  return trimmed;
}

/** 修复模型 JSON 里常见的非标准写法 */
function normalizeJsonLikeString(raw: string): string {
  return raw
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/,\s*([}\]])/g, '$1')
    .trim();
}

/** 尝试补齐被 max_tokens 截断的不完整 JSON */
function closeTruncatedJson(raw: string): string | null {
  let base = raw.trim().replace(/,\s*$/, '');
  base = base.replace(/,\s*"[^"\\]*(?:\\.[^"\\]*)*"\s*:\s*("([^"\\]*(?:\\.[^"\\]*)*)?)?$/, '');
  base = base.replace(/:\s*"[^"\\]*(?:\\.[^"\\]*)*$/, ': ""');

  const closers: string[] = [];
  let inString = false;
  let escaped = false;

  for (let index = 0; index < base.length; index += 1) {
    const ch = base[index] ?? '';
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === '{') {
      closers.push('}');
      continue;
    }
    if (ch === '[') {
      closers.push(']');
      continue;
    }
    if (ch === '}' || ch === ']') {
      closers.pop();
    }
  }

  if (inString) {
    base += '"';
  }

  let closed = base;
  while (closers.length > 0) {
    closed += closers.pop() ?? '';
  }

  try {
    JSON.parse(closed);
    return closed;
  } catch {
    return null;
  }
}

function parseJsonFromAiResponse(raw: string): unknown {
  const candidates = [
    raw.trim(),
    extractJsonString(raw),
    normalizeJsonLikeString(extractJsonString(raw)),
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }
    try {
      return JSON.parse(candidate);
    } catch {
      // try next candidate
    }
  }

  const repaired = closeTruncatedJson(normalizeJsonLikeString(extractJsonString(raw)));
  if (repaired) {
    return JSON.parse(repaired);
  }

  throw new Error('invalid json');
}

function parseCoordinates(record: Record<string, unknown>): MapCoordinates | null {
  // 不同 prompt 版本字段名不一致，统一进 MapCoordinates
  const lng = record.longitude ?? record.lng;
  const lat = record.latitude ?? record.lat;
  if (typeof lng === 'number' && typeof lat === 'number' && Number.isFinite(lng) && Number.isFinite(lat)) {
    return { longitude: lng, latitude: lat };
  }
  return null;
}

function parseActivityCoordinates(value: unknown): MapCoordinates | null {
  if (!value) {
    return null;
  }
  if (Array.isArray(value) && value.length >= 2) {
    const longitude = Number(value[0]);
    const latitude = Number(value[1]);
    if (Number.isFinite(longitude) && Number.isFinite(latitude)) {
      return { longitude, latitude };
    }
    return null;
  }
  if (typeof value === 'object') {
    return parseCoordinates(value as Record<string, unknown>);
  }
  return null;
}

function parseActivity(value: unknown): TravelPlanActivity | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  const time = typeof record.time === 'string' ? record.time.trim() : '';
  const description = typeof record.description === 'string' ? record.description.trim() : '';
  if (!time || !description) {
    return null;
  }
  const activity: TravelPlanActivity = { time, description };
  if (typeof record.location === 'string' && record.location.trim()) {
    activity.location = record.location.trim();
  }
  if (typeof record.cost === 'number' && Number.isFinite(record.cost)) {
    activity.cost = record.cost;
  }
  const coordinates = parseActivityCoordinates(record.coordinates ?? record.coords);
  if (coordinates) {
    activity.coordinates = coordinates;
  }
  return activity;
}

function parseDailyPlan(value: unknown): TravelPlanDay | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  const day = typeof record.day === 'number' ? record.day : Number(record.day);
  const title = typeof record.title === 'string' ? record.title.trim() : '';
  if (!Number.isFinite(day) || day < 1 || !title) {
    return null;
  }
  if (!Array.isArray(record.activities)) {
    return null;
  }
  const activities = record.activities
    .map(parseActivity)
    .filter((item): item is TravelPlanActivity => item !== null);
  if (activities.length === 0) {
    return null;
  }
  return { day, title, activities };
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function sumActivityCosts(dailyPlans: TravelPlanDay[]): number {
  return dailyPlans.reduce(
    (sum, day) =>
      sum + day.activities.reduce((daySum, act) => daySum + (act.cost ?? 0), 0),
    0,
  );
}

/**
 * 将 DeepSeek 等模型返回的文本解析为结构化旅行计划（不含 `id`）。
 *
 * @remarks
 * - 容忍 markdown 代码块包裹的 JSON
 * - 坐标字段兼容 `longitude`/`lng`、`coordinates` 数组等多种形状
 * - `totalCost` 缺失时回退为活动费用之和或演示默认值
 *
 * @param raw - 模型原始输出字符串
 * @returns 可交给 {@link assembleTravelPlan} 组装的计划字段
 * @throws {DeepSeekApiError} JSON 非法或缺少必填字段时
 */
export function parseTravelPlanFromAiResponse(raw: string): ParsedTravelPlan {
  let parsed: unknown;
  try {
    parsed = parseJsonFromAiResponse(raw);
  } catch {
    throw new DeepSeekApiError('AI 返回的计划数据不是合法 JSON');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new DeepSeekApiError('AI 返回的计划数据格式无效');
  }

  const record = parsed as Record<string, unknown>;
  const title = typeof record.title === 'string' ? record.title.trim() : '';
  const summary = typeof record.summary === 'string' ? record.summary.trim() : '';

  if (!title || !summary) {
    throw new DeepSeekApiError('AI 返回的计划缺少 title 或 summary');
  }

  if (!Array.isArray(record.dailyPlans)) {
    throw new DeepSeekApiError('AI 返回的计划缺少 dailyPlans');
  }

  const dailyPlans = record.dailyPlans
    .map(parseDailyPlan)
    .filter((item): item is TravelPlanDay => item !== null);

  if (dailyPlans.length === 0) {
    throw new DeepSeekApiError('AI 返回的 dailyPlans 无效或为空');
  }

  const tags = parseStringArray(record.tags);
  const suitableAudience =
    typeof record.suitableAudience === 'string' && record.suitableAudience.trim()
      ? record.suitableAudience.trim()
      : undefined;
  let totalCost =
    typeof record.totalCost === 'number' && Number.isFinite(record.totalCost)
      ? Math.round(record.totalCost)
      : sumActivityCosts(dailyPlans);

  // 模型漏填总价时：先汇总活动 cost，仍无效则用演示默认，保证卡片能展示预算
  if (totalCost <= 0) {
    totalCost = sumActivityCosts(dailyPlans) || 1500;
  }

  const practicalInfo = parseTravelPlanPracticalInfo(record.practicalInfo);

  return {
    title,
    summary,
    dailyPlans,
    totalCost,
    tags: tags.length > 0 ? tags : ['穷游', 'AI'],
    suitableAudience,
    practicalInfo,
  };
}
