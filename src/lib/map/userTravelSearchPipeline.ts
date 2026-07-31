/**
 * 用户随意输入的统一解析层（纯函数，无 IO）。
 * 规划/地图/测试均依赖此契约，避免各处重复解析逻辑漂移。
 */
import { parseTravelSearchIntent } from '@/lib/map/planQueryBuilder';
import {
  coalesceSearchQueryWithDestination,
  extractMultiStopDestinations,
  extractRouteEndpoints,
  extractSearchDestination,
  extractPrimaryLocation,
  type RouteEndpoints,
} from '@/lib/map/travelQueryParsing';
import { correctAdvisorSpeechIntent } from '@/lib/speech/advisorSpeechIntentCorrections';

export type ParsedUserTravelSearch = {
  /** 归一化后的完整 query（保留天数/预算/偏好，供 AI 使用） */
  normalizedQuery: string;
  /** 主目的地地名（单城或多城第一站） */
  primaryPlace: string | null;
  /** 展示用目的地标签（多城为 A→B→C） */
  destinationLabel: string;
  /** 解析出的多站名（≥2 才视为联游） */
  multiStopNames: string[];
  route: RouteEndpoints;
  /** 是否应走多地联游解析（仅当分段结果 ≥2 且非意图词误判） */
  isMultiStopQuery: boolean;
};

export function parseUserTravelSearch(raw: string): ParsedUserTravelSearch | null {
  const normalizedQuery = coalesceSearchQueryWithDestination(
    correctAdvisorSpeechIntent(raw.trim()),
  );
  if (!normalizedQuery) {
    return null;
  }

  const route = extractRouteEndpoints(normalizedQuery);
  const multiStopNames = extractMultiStopDestinations(normalizedQuery);
  const isMultiStopQuery = multiStopNames.length >= 2;

  const singleDestination =
    extractSearchDestination(normalizedQuery) ?? extractPrimaryLocation(normalizedQuery);

  const primaryPlace = isMultiStopQuery ? (multiStopNames[0] ?? null) : singleDestination;

  const destinationLabel = isMultiStopQuery
    ? multiStopNames.join('→')
    : (singleDestination ?? normalizedQuery);

  return {
    normalizedQuery,
    primaryPlace,
    destinationLabel,
    multiStopNames,
    route,
    isMultiStopQuery,
  };
}

/** 从解析结果读取行程意图（天数/预算/偏好），供规划 prompt 使用 */
export function readTravelSearchIntent(parsed: ParsedUserTravelSearch) {
  return parseTravelSearchIntent(parsed.normalizedQuery);
}

/** 只有天数、没有目的地，如单独输入「三天」 */
export function isDurationOnlyTravelQuery(raw: string): boolean {
  const parsed = parseUserTravelSearch(raw);
  if (!parsed) {
    return false;
  }
  if (parsed.isMultiStopQuery || parsed.route.destination || parsed.primaryPlace) {
    return false;
  }
  const intent = parseTravelSearchIntent(parsed.normalizedQuery);
  return Boolean(intent.days);
}
