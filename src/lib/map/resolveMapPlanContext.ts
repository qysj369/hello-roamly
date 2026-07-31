import {
  buildMultiStopSearchPlanQuery,
  parseTravelSearchIntent,
} from '@/lib/map/planQueryBuilder';
import { filterOriginFromMultiStops } from '@/lib/map/planRouteLabel';
import {
  extractMultiStopDestinations,
  isLikelyAdminGeocodeLabel,
} from '@/lib/map/travelQueryParsing';
import {
  resolveDefaultOriginName,
  resolveEffectiveSearchQuery,
} from '@/lib/map/resolveEffectivePlanRequest';
import { getMultiStopNames } from '@/lib/plan/mapPlanCompleteness';

import type { GeocodePlaceFn } from '@/lib/map/resolveTravelPlaces';
import { resolveTravelPlacesFromText } from '@/lib/map/resolveTravelPlaces';

export type ResolvedMapPlanContext = {
  locationName: string;
  query: string;
  multiStops: string[];
};

function resolveMultiStopsFromInputs(
  searchQuery: string,
  rawQuery: string,
  fallbackLocationName: string,
  originName?: string | null,
): string[] {
  const candidates = [searchQuery.trim(), rawQuery.trim()].filter(Boolean);
  for (const text of candidates) {
    const fromSearch = extractMultiStopDestinations(text);
    if (fromSearch.length >= 2) {
      return filterOriginFromMultiStops(fromSearch, originName);
    }
  }

  const clientStops = getMultiStopNames(fallbackLocationName);
  if (
    clientStops.length >= 2 &&
    !isLikelyAdminGeocodeLabel(fallbackLocationName) &&
    !clientStops.some((stop) => isLikelyAdminGeocodeLabel(stop))
  ) {
    return filterOriginFromMultiStops(clientStops, originName);
  }

  return [];
}

function buildMultiStopContext(
  multiStops: string[],
  effectiveSearchQuery: string,
  trimmedQuery: string,
  originName?: string | null,
): ResolvedMapPlanContext {
  const intent = parseTravelSearchIntent(effectiveSearchQuery || trimmedQuery);
  const dayCount = Math.max(intent.days ?? 0, multiStops.length);
  return {
    locationName: multiStops.join('→'),
    query: buildMultiStopSearchPlanQuery(
      multiStops,
      { ...intent, days: dayCount },
      originName ?? resolveDefaultOriginName(multiStops.length),
    ),
    multiStops,
  };
}

/** 从需求文案解析多地联游；服务端兜底，不依赖前端是否已更新 */
export function resolveMapPlanContext(
  rawQuery: string,
  fallbackLocationName: string,
  options?: {
    searchQuery?: string | null;
    initialQuery?: string | null;
    originName?: string | null;
  },
): ResolvedMapPlanContext {
  const trimmedQuery = rawQuery.trim();
  const effectiveSearchQuery = resolveEffectiveSearchQuery({
    searchQuery: options?.searchQuery,
    initialQuery: options?.initialQuery,
    rawQuery: trimmedQuery,
  });
  const multiStops = resolveMultiStopsFromInputs(
    effectiveSearchQuery,
    trimmedQuery,
    fallbackLocationName,
    options?.originName,
  );

  if (multiStops.length >= 2) {
    return buildMultiStopContext(
      multiStops,
      effectiveSearchQuery,
      trimmedQuery,
      options?.originName,
    );
  }

  return {
    locationName: fallbackLocationName.trim() || '所选地点',
    query: trimmedQuery,
    multiStops: [],
  };
}

/** 服务端：同步解析不足时用高德地理编码校验，覆盖未知地名 */
export async function resolveMapPlanContextAsync(
  rawQuery: string,
  fallbackLocationName: string,
  options?: {
    searchQuery?: string | null;
    initialQuery?: string | null;
    originName?: string | null;
    geocode?: GeocodePlaceFn;
  },
): Promise<ResolvedMapPlanContext> {
  const sync = resolveMapPlanContext(rawQuery, fallbackLocationName, options);
  if (sync.multiStops.length >= 2) {
    return sync;
  }

  const geocode = options?.geocode;
  if (!geocode) {
    return sync;
  }

  const trimmedQuery = rawQuery.trim();
  const effectiveSearchQuery = resolveEffectiveSearchQuery({
    searchQuery: options?.searchQuery,
    initialQuery: options?.initialQuery,
    rawQuery: trimmedQuery,
  });
  const candidateText = effectiveSearchQuery || trimmedQuery;
  const resolved = await resolveTravelPlacesFromText(candidateText, geocode);
  const multiStops = filterOriginFromMultiStops(
    resolved.map((place) => place.name),
    options?.originName,
  );

  if (multiStops.length >= 2) {
    return buildMultiStopContext(
      multiStops,
      effectiveSearchQuery,
      trimmedQuery,
      options?.originName,
    );
  }

  return sync;
}

export function buildMultiStopDayStructure(locationName: string, totalDays?: number): string {
  if (!locationName.includes('→')) {
    return '';
  }
  const stops = locationName.split('→').map((stop) => stop.trim()).filter(Boolean);
  if (stops.length < 2) {
    return '';
  }
  const days = Math.max(totalDays ?? stops.length, stops.length);
  const stopLines = stops.map((stop, index) => {
    const isLast = index === stops.length - 1;
    if (!isLast || days === stops.length) {
      return `${index + 1}. 第${index + 1}天 · ${stop}（含转场与市内玩法，正文须出现站名「${stop}」）`;
    }
    return `${index + 1}. 第${stops.length}天至第${days}天 · ${stop}（深度游/整理返程，正文须出现站名「${stop}」）`;
  });
  return [
    `【强制行程结构】共${days}天，必须严格覆盖全部 ${stops.length} 个站点，缺一不可：`,
    ...stopLines,
    '禁止合并或省略任一站点；禁止多天都写在同一个城市（末站可安排深度游）；禁止只写部分站而省略其他站。',
  ].join('\n');
}
