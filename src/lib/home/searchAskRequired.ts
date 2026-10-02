import {
  extractSearchParams,
  parseSearchDays,
  parseSearchPeopleType,
  type SearchExtractParams,
} from '@/lib/home/extractSearchParams';
import { sanitizeClarifyCityLabel } from '@/stores/planClarify/store';

export type SearchRequiredKey = 'targetCity' | 'days' | 'peopleType';

export const SEARCH_ASK_PROMPTS: Record<SearchRequiredKey, string> = {
  targetCity: '请问你打算去哪里旅行？',
  days: '计划游玩几天？',
  peopleType: '想和谁一起慢慢逛？（情侣 / 亲子 / 好友结伴 / 单人）',
};

export const SEARCH_OPTIONAL_BUDGET_LABEL = '未设置预算';
export const SEARCH_OPTIONAL_THEME_LABEL = '无特定游玩偏好';

/** 必填缺项按固定顺序：目的地 → 天数 → 人群 */
export function getMissRequiredField(params: SearchExtractParams): SearchRequiredKey[] {
  const miss: SearchRequiredKey[] = [];
  if (!params.targetCity?.trim()) miss.push('targetCity');
  if (params.days == null) miss.push('days');
  if (!params.peopleType?.trim()) miss.push('peopleType');
  return miss;
}

function parseAskCity(raw: string): string | undefined {
  const fromExtract = extractSearchParams(raw).targetCity?.trim();
  if (fromExtract) return fromExtract;
  const sanitized = sanitizeClarifyCityLabel(raw)?.trim();
  return sanitized || undefined;
}

function parseAskDays(raw: string): number | undefined {
  const fromPhrase = parseSearchDays(raw);
  if (fromPhrase != null && fromPhrase >= 1 && fromPhrase <= 14) {
    return fromPhrase;
  }
  const bare = /^(\d{1,2})$/.exec(raw.trim());
  if (!bare?.[1]) return undefined;
  const days = Number.parseInt(bare[1], 10);
  if (days < 1 || days > 14) return undefined;
  return days;
}

/** 把用户对本问的回答回填到参数；空答或无法识别则返回 null，不跳过本问 */
export function applySearchAskAnswer(
  params: SearchExtractParams,
  field: SearchRequiredKey,
  raw: string,
): SearchExtractParams | null {
  const text = raw.trim();
  if (!text) return null;

  if (field === 'targetCity') {
    const city = parseAskCity(text);
    if (!city) return null;
    return { ...params, targetCity: city };
  }
  if (field === 'days') {
    const days = parseAskDays(text);
    if (days == null) return null;
    return { ...params, days };
  }
  const peopleType = parseSearchPeopleType(text);
  if (!peopleType) return null;
  return { ...params, peopleType };
}

/** 必填齐后拼生成文案：预算/主题选填，缺则写标记，不默填数字 */
export function buildSearchExtractLaunchQuery(
  params: SearchExtractParams,
  originHint?: string | null,
): string {
  const city = params.targetCity?.trim() || '';
  const days = params.days;
  const people = params.peopleType?.trim() || '';
  const originLabel = params.startCity?.trim() || originHint?.trim() || '';
  const origin = originLabel ? `从${originLabel}出发，` : '';
  const theme = params.theme?.trim() || SEARCH_OPTIONAL_THEME_LABEL;

  if (params.budget != null && params.budget > 0) {
    return [
      `${origin}去${city}玩${days}天，同行：${people}，人均预算约${params.budget}元，${theme}`,
      `【目的地锁定】${city}`,
      `【用户已确认】城市${city}，${days}天，同行：${people}，预算约${params.budget}元，偏好：${theme}`,
    ].join('。');
  }

  return [
    `${origin}去${city}玩${days}天，同行：${people}，${SEARCH_OPTIONAL_BUDGET_LABEL}，${theme}`,
    `【目的地锁定】${city}`,
  ].join('。');
}
