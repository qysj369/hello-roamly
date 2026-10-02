import { assembleSearchPlanFromKnowledge } from '@/lib/agent/assembleSearchPlanFromKnowledge';
import { applyKnowledgeRiskTip } from '@/lib/agent/cityTravelKnowledge';
import { rememberTravelPreference } from '@/lib/agent/travelPreferenceMemory';
import { matchSearchPlanGoldExample } from '@/lib/home/searchPlanGoldExamples';
import { normalizeSearchGeneratedPlan } from '@/lib/home/normalizeSearchGeneratedPlan';
import {
  SEARCH_PLAN_FAIL_HINT,
  SEARCH_PLAN_LOADING_TEXT,
  SEARCH_PLAN_MAX_ATTEMPTS,
  SEARCH_PLAN_RETRY_TEXT,
  parseSearchStructuredPlan,
} from '@/lib/home/searchStructuredPlanParse';
import { HOME_SEARCH_FAIL_HINT } from '@/lib/home/submitHomeSearchStep1';
import {
  SearchStructuredPlanApiError,
  fetchSearchStructuredPlanRaw,
} from '@/services/ai/api/fetchSearchStructuredPlan';
import type { SearchPlanRequest, SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

export type RequestSearchStructuredPlanResult =
  | { ok: true; plan: SearchStructuredPlan; attempts: number }
  | { ok: false; error: string; attempts: number };

/**
 * 调接口拿原文 → 清洗解析 → 失败最多再试 2 次。
 * 网络/服务错误不进入格式重试，避免页面一直「正在重新生成」。
 */
export async function requestSearchStructuredPlan(
  params: SearchPlanRequest,
  options?: {
    onStatus?: (message: string) => void;
    signal?: AbortSignal;
    fetchRaw?: typeof fetchSearchStructuredPlanRaw;
  },
): Promise<RequestSearchStructuredPlanResult> {
  const gold = matchSearchPlanGoldExample(params);
  if (gold) {
    options?.onStatus?.(SEARCH_PLAN_LOADING_TEXT);
    const plan = applyKnowledgeRiskTip(gold);
    rememberTravelPreference(plan);
    return { ok: true, plan, attempts: 1 };
  }
  const assembled = assembleSearchPlanFromKnowledge(params);
  if (assembled) {
    options?.onStatus?.(SEARCH_PLAN_LOADING_TEXT);
    const plan = applyKnowledgeRiskTip(assembled);
    rememberTravelPreference(plan);
    return { ok: true, plan, attempts: 1 };
  }

  const fetchRaw = options?.fetchRaw ?? fetchSearchStructuredPlanRaw;
  options?.onStatus?.(SEARCH_PLAN_LOADING_TEXT);

  let attempts = 0;
  for (let attempt = 0; attempt < SEARCH_PLAN_MAX_ATTEMPTS; attempt += 1) {
    attempts = attempt + 1;
    if (options?.signal?.aborted) {
      return { ok: false, error: '已取消生成', attempts };
    }
    if (attempt > 0) {
      options?.onStatus?.(SEARCH_PLAN_RETRY_TEXT);
    }

    let raw: string;
    try {
      raw = await fetchRaw(params, options?.signal);
    } catch (error) {
      if (options?.signal?.aborted) {
        return { ok: false, error: '已取消生成', attempts };
      }
      if (error instanceof SearchStructuredPlanApiError) {
        return { ok: false, error: error.message || HOME_SEARCH_FAIL_HINT, attempts };
      }
      return { ok: false, error: HOME_SEARCH_FAIL_HINT, attempts };
    }

    const plan = parseSearchStructuredPlan(raw, params.days);
    if (plan) {
      const normalized = applyKnowledgeRiskTip(normalizeSearchGeneratedPlan(plan));
      rememberTravelPreference(normalized);
      return { ok: true, plan: normalized, attempts };
    }
  }

  return { ok: false, error: SEARCH_PLAN_FAIL_HINT, attempts };
}
