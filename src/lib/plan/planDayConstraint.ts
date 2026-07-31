import { parseTravelSearchIntent } from '@/lib/map/planQueryBuilder';
import { getMultiStopNames } from '@/lib/plan/mapPlanCompleteness';
import { parsePlanSections, serializePlanSections } from '@/lib/plan/parsePlanSections';

const CN_DIGITS: Record<string, number> = {
  一: 1,
  两: 2,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
};

function parseChineseDayNumeral(value: string): number | null {
  if (/^\d+$/.test(value)) {
    return Number.parseInt(value, 10);
  }
  if (value === '十') {
    return 10;
  }
  if (value.startsWith('十') && value.length === 2) {
    const unit = CN_DIGITS[value[1] ?? ''];
    return unit != null ? 10 + unit : null;
  }
  if (value.endsWith('十') && value.length === 2) {
    const tens = CN_DIGITS[value[0] ?? ''];
    return tens != null ? tens * 10 : null;
  }
  return CN_DIGITS[value] ?? null;
}

/** 用户明确要求的天数（多地联游至少覆盖全部站点） */
export function resolveEffectivePlanDays(query: string, locationName: string): number | null {
  const intent = parseTravelSearchIntent(query);
  if (!intent.days || intent.days <= 0) {
    return null;
  }

  const stops = getMultiStopNames(locationName);
  if (stops.length >= 2) {
    return Math.max(intent.days, stops.length);
  }

  return intent.days;
}

export function buildStrictDayCountConstraint(days: number): string {
  return [
    `【强制天数】用户明确要求 ${days} 天行程。`,
    `方案简介与【行程流水账】必须且只能写第 1 天至第 ${days} 天，`,
    `禁止出现第 ${days + 1} 天及以后的内容，禁止在简介写「共 ${days + 1} 天」或更多。`,
  ].join('');
}

const DAY_HEADER_PATTERN =
  /(?:^|\n)(?:#{1,4}\s*)?(?:\*\*)?第\s*(?:([0-9]{1,2})|([一二三四五六七八九十两]+))\s*天/g;

/** 统计行程正文里出现了多少个「第N天」标题 */
export function countItineraryDayHeaders(itinerary: string): number {
  const seen = new Set<number>();
  for (const match of itinerary.matchAll(DAY_HEADER_PATTERN)) {
    const dayNum = match[1]
      ? Number.parseInt(match[1], 10)
      : parseChineseDayNumeral(match[2] ?? '');
    if (dayNum != null && dayNum > 0) {
      seen.add(dayNum);
    }
  }
  return seen.size;
}

/** 截掉超出用户要求天数的行程段落 */
export function clampItineraryToMaxDays(itinerary: string, maxDays: number): string {
  const trimmed = itinerary.trim();
  if (!trimmed || maxDays <= 0) {
    return trimmed;
  }

  let cutIndex: number | null = null;
  for (const match of trimmed.matchAll(DAY_HEADER_PATTERN)) {
    const dayNum = match[1]
      ? Number.parseInt(match[1], 10)
      : parseChineseDayNumeral(match[2] ?? '');
    if (dayNum != null && dayNum > maxDays && match.index != null) {
      cutIndex = match.index;
      break;
    }
  }

  if (cutIndex == null) {
    return trimmed;
  }

  return trimmed.slice(0, cutIndex).trim();
}

export function enforcePlanDayCountOnContent(
  content: string,
  query: string,
  locationName: string,
): string {
  const maxDays = resolveEffectivePlanDays(query, locationName);
  if (!maxDays) {
    return content;
  }

  const sections = parsePlanSections(content);
  const clampedItinerary = clampItineraryToMaxDays(sections.itinerary, maxDays);
  if (clampedItinerary === sections.itinerary) {
    return content;
  }

  return serializePlanSections({
    ...sections,
    itinerary: clampedItinerary,
  });
}
