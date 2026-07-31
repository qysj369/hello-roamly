import { DEFAULT_DEMO_ORIGIN_LABEL } from '@/lib/map/defaultMapOrigin';
import {
  extractMultiStopDestinations,
} from '@/lib/map/travelQueryParsing';

export type PlanRequestHints = {
  searchQuery?: string | null;
  initialQuery?: string | null;
  rawQuery?: string | null;
};

/** 从 searchQuery / initialQuery / enriched query 中找多地联游原文 */
export function resolveEffectiveSearchQuery(hints: PlanRequestHints): string {
  const candidates = [hints.searchQuery, hints.initialQuery, hints.rawQuery]
    .map((value) => value?.trim())
    .filter(Boolean) as string[];

  for (const text of candidates) {
    if (extractMultiStopDestinations(text).length >= 2) {
      return text;
    }
  }

  return candidates[0] ?? '';
}

export function resolveDefaultOriginName(multiStopCount: number): string | null {
  if (multiStopCount >= 2) {
    return DEFAULT_DEMO_ORIGIN_LABEL;
  }
  return null;
}
