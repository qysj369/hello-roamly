import { mergeSearchPlanIncrement } from '@/lib/home/mergeSearchPlanIncrement';
import { parseSearchStructuredPlan } from '@/lib/home/searchStructuredPlanParse';
import { HOME_SEARCH_FAIL_HINT } from '@/lib/home/submitHomeSearchStep1';
import {
  SearchStructuredPlanApiError,
  fetchSearchPlanIncrementRaw,
} from '@/services/ai/api/fetchSearchStructuredPlan';
import type {
  SearchPlanIncrementFocus,
  SearchStructuredPlan,
} from '@/types/domain/searchStructuredPlan';

export const SEARCH_PLAN_INCREMENT_STATUS: Record<SearchPlanIncrementFocus, string> = {
  spots: '正在补充景点介绍…',
  foods: '正在补充本地美食推荐…',
  traffic: '正在完善交通出行指南…',
};

export const SEARCH_PLAN_INCREMENT_FAIL_HINT = '补充失败，已保留当前行程';

/** 一次请求，失败不重试、不覆盖旧行程 */
export async function requestSearchPlanIncrement(
  plan: SearchStructuredPlan,
  focus: SearchPlanIncrementFocus,
  options?: { signal?: AbortSignal },
): Promise<{ ok: true; plan: SearchStructuredPlan } | { ok: false; error: string }> {
  try {
    const raw = await fetchSearchPlanIncrementRaw({ increment: focus, plan }, options?.signal);
    const incoming = parseSearchStructuredPlan(raw, plan.baseInfo.days);
    if (!incoming) {
      return { ok: false, error: SEARCH_PLAN_INCREMENT_FAIL_HINT };
    }
    return { ok: true, plan: mergeSearchPlanIncrement(plan, incoming, focus) };
  } catch (error) {
    if (error instanceof SearchStructuredPlanApiError) {
      return { ok: false, error: error.message || SEARCH_PLAN_INCREMENT_FAIL_HINT };
    }
    return { ok: false, error: HOME_SEARCH_FAIL_HINT };
  }
}
