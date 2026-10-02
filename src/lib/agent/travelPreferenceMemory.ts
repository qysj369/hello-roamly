import type { SearchExtractParams } from '@/lib/home/extractSearchParams';
import type { SearchPlanRequest, SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

export const TRAVEL_PREFERENCE_MEMORY_KEY = 'holo-travel-agent-memory';

export type PreferenceWeights = {
  viralPenalty: number;
  foodBoost: number;
  quietBoost: number;
};

export type TravelPreferenceMemory = {
  peopleType: string | null;
  theme: string | null;
  lastCity: string | null;
  lastDays: number | null;
  historyTitles: string[];
  weights: PreferenceWeights;
};

export type SessionPreferenceOverride = {
  peopleType?: string | null;
  theme?: string | null;
};

const EMPTY_WEIGHTS: PreferenceWeights = {
  viralPenalty: 0,
  foodBoost: 0,
  quietBoost: 0,
};

const EMPTY: TravelPreferenceMemory = {
  peopleType: null,
  theme: null,
  lastCity: null,
  lastDays: null,
  historyTitles: [],
  weights: { ...EMPTY_WEIGHTS },
};

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function readTravelPreferenceMemory(): TravelPreferenceMemory {
  if (!canUseStorage()) return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(TRAVEL_PREFERENCE_MEMORY_KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<TravelPreferenceMemory>;
    return {
      peopleType: typeof parsed.peopleType === 'string' ? parsed.peopleType : null,
      theme: typeof parsed.theme === 'string' ? parsed.theme : null,
      lastCity: typeof parsed.lastCity === 'string' ? parsed.lastCity : null,
      lastDays: typeof parsed.lastDays === 'number' ? parsed.lastDays : null,
      historyTitles: Array.isArray(parsed.historyTitles)
        ? parsed.historyTitles.filter((item): item is string => typeof item === 'string').slice(0, 8)
        : [],
      weights: {
        viralPenalty: Number(parsed.weights?.viralPenalty) || 0,
        foodBoost: Number(parsed.weights?.foodBoost) || 0,
        quietBoost: Number(parsed.weights?.quietBoost) || 0,
      },
    };
  } catch {
    return { ...EMPTY };
  }
}

export function writeTravelPreferenceMemory(next: TravelPreferenceMemory): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(TRAVEL_PREFERENCE_MEMORY_KEY, JSON.stringify(next));
}

export function rememberTravelPreference(
  plan: SearchStructuredPlan,
  options?: { skipLongTerm?: boolean },
): TravelPreferenceMemory {
  const current = readTravelPreferenceMemory();
  const title = `${plan.baseInfo.targetCity}${plan.baseInfo.days}天${plan.baseInfo.peopleType}`;
  const historyTitles = [title, ...current.historyTitles.filter((item) => item !== title)].slice(0, 8);
  const next: TravelPreferenceMemory = {
    peopleType: options?.skipLongTerm
      ? current.peopleType
      : plan.baseInfo.peopleType.trim() || current.peopleType,
    theme: options?.skipLongTerm ? current.theme : plan.baseInfo.theme?.trim() || current.theme,
    lastCity: plan.baseInfo.targetCity.trim() || current.lastCity,
    lastDays: plan.baseInfo.days || current.lastDays,
    historyTitles,
    weights: current.weights,
  };
  writeTravelPreferenceMemory(next);
  return next;
}

export function resetTravelPreferenceMemory(): TravelPreferenceMemory {
  writeTravelPreferenceMemory({ ...EMPTY, weights: { ...EMPTY_WEIGHTS } });
  return { ...EMPTY, weights: { ...EMPTY_WEIGHTS } };
}

export function learnPreferenceFromEdit(
  kind: 'party' | 'foods' | 'spots' | 'budget' | 'days' | 'traffic',
): PreferenceWeights {
  const current = readTravelPreferenceMemory();
  const weights = { ...current.weights };
  if (kind === 'spots') weights.viralPenalty = Math.min(3, weights.viralPenalty + 1);
  if (kind === 'foods') weights.foodBoost = Math.min(3, weights.foodBoost + 1);
  if (kind === 'party') weights.quietBoost = Math.min(3, weights.quietBoost + 1);
  writeTravelPreferenceMemory({ ...current, weights });
  return weights;
}

/** 只补用户没说的人群/主题；sessionOverride 仅本次生效 */
export function applyMemoryToExtract(
  params: SearchExtractParams,
  override?: SessionPreferenceOverride | null,
): SearchExtractParams {
  const memory = readTravelPreferenceMemory();
  return {
    ...params,
    peopleType: params.peopleType?.trim() || override?.peopleType?.trim() || memory.peopleType || undefined,
    theme: params.theme?.trim() || override?.theme?.trim() || memory.theme || undefined,
  };
}

export function applyMemoryToRequest(
  params: SearchPlanRequest,
  override?: SessionPreferenceOverride | null,
): SearchPlanRequest {
  const memory = readTravelPreferenceMemory();
  return {
    ...params,
    peopleType: params.peopleType.trim() || override?.peopleType?.trim() || memory.peopleType || params.peopleType,
    theme: params.theme?.trim() || override?.theme?.trim() || memory.theme || null,
  };
}

export function buildPreferenceMemoryPrompt(override?: SessionPreferenceOverride | null): string {
  const memory = readTravelPreferenceMemory();
  const bits = [
    memory.peopleType ? `常用同行：${memory.peopleType}` : '',
    memory.theme ? `常用主题：${memory.theme}` : '',
    memory.lastCity ? `最近目的地：${memory.lastCity}` : '',
    memory.weights.viralPenalty > 0 ? `降低网红点权重+${memory.weights.viralPenalty}` : '',
    memory.weights.foodBoost > 0 ? `增加本地老店+${memory.weights.foodBoost}` : '',
    override?.peopleType ? `本次临时覆盖人群：${override.peopleType}（不写回长期偏好）` : '',
    override?.theme ? `本次临时覆盖主题：${override.theme}` : '',
  ].filter(Boolean);
  if (bits.length === 0) return '';
  return `用户长期偏好（仅作参考，以本次已确认参数为准；偏爱小众则少排网红打卡，偏爱美食则加本地老店）：${bits.join('，')}`;
}
