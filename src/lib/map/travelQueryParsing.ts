import { CITY_COORDINATES } from '@/data/cityCoordinates';
import { segmentPrimaryPlace, segmentTravelPlaces } from '@/lib/map/segmentTravelPlaces';

const CITY_NAMES = Object.keys(CITY_COORDINATES).sort((a, b) => b.length - a.length);

export type RouteEndpoints = {
  origin: string | null;
  destination: string | null;
};

function isLikelyOriginPlace(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) {
    return false;
  }
  if (CITY_NAMES.includes(trimmed)) {
    return true;
  }
  return /[市区县省]/.test(trimmed);
}

function cleanRoutePlaceName(name: string): string {
  let cleaned = name
    .trim()
    .replace(/[，,。；;].*$/, '')
    .replace(/[一二三四五六七八九十两\d]+(?:天|日).*$/, '')
    .replace(/\d+\s*(?:天|日|元).*$/, '')
    .trim();
  if (/(?:吃火锅|小吃|美食|摄影|打卡)/.test(cleaned)) {
    for (const city of CITY_NAMES) {
      if (cleaned.startsWith(city)) {
        return city;
      }
    }
  }
  return cleaned;
}

/** 「济南到莆田」「从济南去莆田」等双城路线解析 */
export function extractRouteEndpoints(text: string): RouteEndpoints {
  const trimmed = text.trim();
  if (!trimmed) {
    return { origin: null, destination: null };
  }

  const fromGoMatch = trimmed.match(
    /从\s*([\u4e00-\u9fa5]{2,12}?)\s*(?:出发\s*)?(?:去|往|到|飞|前往)\s*([\u4e00-\u9fa5]{2,12})/,
  );
  if (fromGoMatch?.[1] && fromGoMatch[2] && isLikelyOriginPlace(fromGoMatch[1])) {
    return {
      origin: cleanRoutePlaceName(fromGoMatch[1]),
      destination: cleanRoutePlaceName(fromGoMatch[2]),
    };
  }

  const routeMatch = trimmed.match(
    /(?:从\s*)?([\u4e00-\u9fa5]{2,12}?)\s*(?:到|至|→|->|—|－|-)\s*([\u4e00-\u9fa5]{2,12})/,
  );
  if (routeMatch?.[1] && routeMatch[2] && isLikelyOriginPlace(routeMatch[1])) {
    return {
      origin: cleanRoutePlaceName(routeMatch[1]),
      destination: cleanRoutePlaceName(routeMatch[2]),
    };
  }

  const departMatch = trimmed.match(
    /([\u4e00-\u9fa5]{2,10}?)\s*(?:出发|飞|飞往|坐高铁|坐动车|高铁|火车)\s*(?:去|到|往)?\s*([\u4e00-\u9fa5]{2,12})/,
  );
  if (departMatch?.[1] && departMatch[2] && isLikelyOriginPlace(departMatch[1])) {
    return {
      origin: cleanRoutePlaceName(departMatch[1]),
      destination: cleanRoutePlaceName(departMatch[2]),
    };
  }

  const goMatch = trimmed.match(/([\u4e00-\u9fa5]{2,10}?)\s*去\s*([\u4e00-\u9fa5]{2,12})/);
  if (goMatch?.[1] && goMatch[2] && isLikelyOriginPlace(goMatch[1])) {
    return {
      origin: cleanRoutePlaceName(goMatch[1]),
      destination: cleanRoutePlaceName(goMatch[2]),
    };
  }

  return { origin: null, destination: null };
}

/** 逆地理/full address 标签，不能当联游路线解析 */
export function isLikelyAdminGeocodeLabel(label: string): boolean {  const trimmed = label.trim();
  if (!trimmed) {
    return false;
  }
  if (/省/.test(trimmed)) {
    return true;
  }
  if (/^[\u4e00-\u9fa5]{2,6}市[\u4e00-\u9fa5]{2,10}(?:市|县|区)/.test(trimmed)) {
    return true;
  }
  return false;
}

/** 从「曲阜微山湖台儿庄三日游」等文案中提取多个站点（通用分段，不依赖逐城维护） */
export function extractMultiStopDestinations(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed || isLikelyAdminGeocodeLabel(trimmed)) {
    return [];
  }
  return segmentTravelPlaces(trimmed);
}

function findKnownCitiesInText(text: string): { city: string; index: number }[] {
  const found: { city: string; index: number }[] = [];
  for (const city of CITY_NAMES) {
    const index = text.indexOf(city);
    if (index >= 0) {
      found.push({ city, index });
    }
  }
  return found.sort((a, b) => a.index - b.index);
}

export function extractSearchDestination(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  const multiStops = extractMultiStopDestinations(trimmed);
  if (multiStops.length >= 2) {
    return multiStops.join('→');
  }

  const route = extractRouteEndpoints(trimmed);
  if (route.destination) {
    return route.destination;
  }

  const known = findKnownCitiesInText(trimmed);
  if (known.length >= 2) {
    return known[known.length - 1]!.city;
  }

  return extractPrimaryLocation(trimmed);
}

export function extractPrimaryLocation(text: string): string | null {
  return segmentPrimaryPlace(text);
}

export function normalizeTrailSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/^去\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function coalesceSearchQueryWithDestination(query: string): string {
  return normalizeTrailSearchQuery(query);
}
