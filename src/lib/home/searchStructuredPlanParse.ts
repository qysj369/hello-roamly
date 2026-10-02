import type { SearchExtractParams } from '@/lib/home/extractSearchParams';
import type { SearchPlanRequest, SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

export const SEARCH_PLAN_LOADING_TEXT = 'AI正在规划你的专属行程…';
export const SEARCH_PLAN_RETRY_TEXT = '攻略未通过校验，正在重新生成…';
export const SEARCH_PLAN_FAIL_HINT = '生成格式异常，请修改描述重新搜索';

/** 首次请求失败后最多再试 2 次，合计不超过 3 次，禁止 while(true) */
export const SEARCH_PLAN_MAX_RETRIES = 2;
export const SEARCH_PLAN_MAX_ATTEMPTS = 1 + SEARCH_PLAN_MAX_RETRIES;

export function toSearchPlanRequest(params: SearchExtractParams): SearchPlanRequest | null {
  const targetCity = params.targetCity?.trim();
  const peopleType = params.peopleType?.trim();
  const days = params.days;
  if (!targetCity || !peopleType || days == null || days < 1 || days > 14) {
    return null;
  }
  return {
    startCity: params.startCity?.trim() || '',
    targetCity,
    days,
    peopleType,
    budget: params.budget ?? null,
    theme: params.theme ?? null,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/** 去掉代码块标记，抽出第一段 JSON 对象 */
export function sanitizeSearchPlanRaw(raw: string): string {
  let text = raw.trim();
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) {
    text = text.slice(start, end + 1);
  }
  return text.trim().replace(/\s+\n/g, '\n');
}

function unwrapPlanRoot(parsed: unknown): unknown {
  if (!isRecord(parsed)) return parsed;
  if (isRecord(parsed.baseInfo)) return parsed;
  if (isRecord(parsed.plan) && isRecord(parsed.plan.baseInfo)) return parsed.plan;
  return parsed;
}

export function validateSearchStructuredPlan(
  value: unknown,
  expectedDays: number,
): value is SearchStructuredPlan {
  if (!isRecord(value)) return false;
  const { baseInfo, budgetList, dayList } = value;
  if (!isRecord(baseInfo)) return false;
  if (typeof baseInfo.targetCity !== 'string' || !baseInfo.targetCity.trim()) return false;
  if (typeof baseInfo.days !== 'number' || !Number.isFinite(baseInfo.days)) return false;
  if (!Array.isArray(budgetList) || budgetList.length === 0) return false;
  if (!Array.isArray(dayList) || dayList.length !== expectedDays) return false;
  return dayList.every((day) => isRecord(day) && typeof day.day === 'number');
}

export function parseSearchStructuredPlan(
  raw: string,
  expectedDays: number,
): SearchStructuredPlan | null {
  try {
    const parsed = unwrapPlanRoot(JSON.parse(sanitizeSearchPlanRaw(raw)));
    if (!validateSearchStructuredPlan(parsed, expectedDays)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
