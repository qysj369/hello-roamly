import { withTimeout } from '@/utils/withTimeout';
import {
  resolveCityCenterSync,
  resolveMultiStopFromLocalTable,
  resolveMultiStopSearchLocations,
  resolveSearchLocation,
  type ResolvedMultiStopSearch,
  type ResolvedSearchLocation,
} from '@/lib/map/parseTrailSearchQuery';
import {
  parseUserTravelSearch,
  type ParsedUserTravelSearch,
} from '@/lib/map/userTravelSearchPipeline';

const MULTI_STOP_TIMEOUT_MS = 8_000;
const GEOCODE_HINT_TIMEOUT_MS = 5_000;

export type ResolvedUserTravelSearch = {
  parsed: ParsedUserTravelSearch;
  location: ResolvedSearchLocation;
  multiStop: ResolvedMultiStopSearch | null;
};

/**
 * 统一目的地识别：本地城市表 → 主地名 geocode → 全句 geocode（仅在前两步失败时）。
 * 避免对每条随意输入都做全句慢速扫描。
 */
export async function resolveUserTravelSearch(
  raw: string,
): Promise<ResolvedUserTravelSearch | null> {
  const parsed = parseUserTravelSearch(raw);
  if (!parsed) {
    return null;
  }

  if (parsed.isMultiStopQuery) {
    const localMultiStop = resolveMultiStopFromLocalTable(parsed.multiStopNames);
    if (localMultiStop) {
      return { parsed, location: localMultiStop.primary, multiStop: localMultiStop };
    }

    const multiStop = await withTimeout(
      resolveMultiStopSearchLocations(parsed.normalizedQuery),
      MULTI_STOP_TIMEOUT_MS,
      '识别目的地超时，请稍后重试',
    ).catch(() => null);
    if (multiStop) {
      return { parsed, location: multiStop.primary, multiStop };
    }
  }

  const syncFromQuery = resolveCityCenterSync(parsed.normalizedQuery);
  if (syncFromQuery) {
    return { parsed, location: syncFromQuery, multiStop: null };
  }

  if (parsed.primaryPlace) {
    const syncFromPrimary = resolveCityCenterSync(parsed.primaryPlace);
    if (syncFromPrimary) {
      return { parsed, location: syncFromPrimary, multiStop: null };
    }

    const fromPrimaryHint = await withTimeout(
      resolveSearchLocation(parsed.primaryPlace),
      GEOCODE_HINT_TIMEOUT_MS,
      '识别目的地超时，请稍后重试',
    ).catch(() => null);
    if (fromPrimaryHint) {
      return { parsed, location: fromPrimaryHint, multiStop: null };
    }
  }

  const fromFullQuery = await withTimeout(
    resolveSearchLocation(parsed.normalizedQuery),
    GEOCODE_HINT_TIMEOUT_MS,
    '识别目的地超时，请稍后重试',
  ).catch(() => null);

  if (!fromFullQuery) {
    return null;
  }

  return { parsed, location: fromFullQuery, multiStop: null };
}

/** 用户可读错误（不暴露英文/技术栈） */
export function formatTravelSearchResolveError(parsed: ParsedUserTravelSearch | null): string {
  if (!parsed?.primaryPlace) {
    return '未能识别目的地，请加上城市名，如「开封 亲子 四天」';
  }
  return `暂时无法定位「${parsed.primaryPlace}」，请检查网络后重试，或只输入城市名`;
}
