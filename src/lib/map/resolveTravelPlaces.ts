import { getCityCoordinates } from '@/data/cityCoordinates';
import { compactGeocodeLabelForDisplay } from '@/lib/map/resolveAmapPlaceName';
import {
  segmentGluedPlaceText,
  segmentPrimaryPlace,
  segmentTravelPlaces,
  stripTravelIntentNoise,
} from '@/lib/map/segmentTravelPlaces';
import { extractRouteEndpoints } from '@/lib/map/travelQueryParsing';

export type ResolvedTravelPlace = {
  name: string;
  label: string;
  longitude?: number;
  latitude?: number;
  source: 'local' | 'geocode';
};

export type GeocodePlaceFn = (
  keyword: string,
) => Promise<{ label: string; lng: number; lat: number } | null>;

const geocodeCache = new Map<string, ResolvedTravelPlace | null>();

function cacheKey(keyword: string): string {
  return keyword.trim().toLowerCase();
}

async function resolvePlaceKeyword(
  keyword: string,
  geocode: GeocodePlaceFn,
): Promise<ResolvedTravelPlace | null> {
  const trimmed = keyword.trim();
  if (!trimmed) {
    return null;
  }

  const cached = geocodeCache.get(cacheKey(trimmed));
  if (cached !== undefined) {
    return cached;
  }

  const local = getCityCoordinates(trimmed);
  if (local) {
    const resolved: ResolvedTravelPlace = {
      name: trimmed,
      label: trimmed,
      longitude: local.longitude,
      latitude: local.latitude,
      source: 'local',
    };
    geocodeCache.set(cacheKey(trimmed), resolved);
    return resolved;
  }

  const geocoded = await geocode(trimmed);
  if (!geocoded) {
    geocodeCache.set(cacheKey(trimmed), null);
    return null;
  }

  const resolved: ResolvedTravelPlace = {
    name: trimmed,
    label: compactGeocodeLabelForDisplay(geocoded.label) || trimmed,
    longitude: geocoded.lng,
    latitude: geocoded.lat,
    source: 'geocode',
  };
  geocodeCache.set(cacheKey(trimmed), resolved);
  return resolved;
}

/** 地理编码校验：从最长子串开始尝试，确认每个片段是真实地名 */
export async function geocodeValidatePlaceSegments(
  text: string,
  geocode: GeocodePlaceFn,
): Promise<string[]> {
  const stripped = stripTravelIntentNoise(text);
  if (!stripped) {
    return [];
  }

  const validated: string[] = [];
  let index = 0;
  const maxLen = Math.min(8, stripped.length);

  while (index < stripped.length) {
    let matched: string | null = null;

    for (let len = Math.min(maxLen, stripped.length - index); len >= 2; len -= 1) {
      const candidate = stripped.slice(index, index + len);
      if (!/^[\u4e00-\u9fa5]/.test(candidate)) {
        continue;
      }
      const resolved = await resolvePlaceKeyword(candidate, geocode);
      if (resolved) {
        matched = resolved.name;
        break;
      }
    }

    if (!matched) {
      index += 1;
      continue;
    }

    if (!validated.includes(matched)) {
      validated.push(matched);
    }
    index += matched.length;
  }

  const route = extractRouteEndpoints(text);
  if (route.origin) {
    return validated.filter(
      (stop) => stop !== route.origin && !route.origin!.includes(stop) && !stop.includes(route.origin!),
    );
  }

  return validated;
}

/** 同步分段 → 可选地理编码校验，得到有序站点列表 */
export async function resolveTravelPlacesFromText(
  text: string,
  geocode?: GeocodePlaceFn,
): Promise<ResolvedTravelPlace[]> {
  const trimmed = text.trim();
  if (!trimmed) {
    return [];
  }

  let names = segmentTravelPlaces(trimmed);
  const primary = segmentPrimaryPlace(trimmed);

  if (names.length < 2) {
    if (primary && geocode) {
      const resolved = await resolvePlaceKeyword(primary, geocode);
      if (resolved) {
        return [resolved];
      }
    }

    const stripped = stripTravelIntentNoise(trimmed);
    const gluedCandidates = segmentGluedPlaceText(stripped || trimmed);
    const shouldValidateGluedMulti =
      geocode && gluedCandidates.length >= 2 && !primary;

    if (shouldValidateGluedMulti) {
      const validated = await geocodeValidatePlaceSegments(trimmed, geocode);
      if (validated.length >= 2) {
        names = validated;
      }
    }
  }

  if (names.length < 2) {
    if (primary && !geocode) {
      return [{ name: primary, label: primary, source: 'local' as const }];
    }
    return [];
  }

  if (!geocode) {
    return names.map((name) => ({ name, label: name, source: 'local' as const }));
  }

  const resolved = await Promise.all(names.map((name) => resolvePlaceKeyword(name, geocode)));
  return resolved.filter((item): item is ResolvedTravelPlace => item != null);
}

export function clearTravelPlaceGeocodeCache(): void {
  geocodeCache.clear();
}
