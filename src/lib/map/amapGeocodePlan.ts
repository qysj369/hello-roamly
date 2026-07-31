import { loadAmap } from '@/lib/map/amapLoader';
import {
  forwardGeocodeWithAmapGeocoder,
  forwardGeocodeWithAmapPlaceSearch,
} from '@/lib/map/amapGeocoderClient';
import { amapGeocodePlaceWithLabel, amapPlaceTextSearch } from '@/lib/map/amapGeocode';
import { buildPlanLocationGeocodeQuery } from '@/lib/map/geocodeTravelPlan';
import { resolveKnownPlanLocationFallback } from '@/lib/map/knownPlanLocationFallbacks';
import type { GeocodeOptions } from '@/lib/map/types';
import { fetchServerOriginGeocode } from '@/services/map/fetchServerOriginGeocode';
import type { MapCoordinates } from '@/types/domain/travelPlan';

const PLAN_GEO_CACHE = new Map<string, MapCoordinates | null>();
const PLAN_GEO_TIMEOUT_MS = 6_000;
const PLAN_GEO_CONCURRENCY = 3;

function planCacheKey(query: string, city?: string): string {
  return `plan|${query.trim()}|${city?.trim() ?? ''}`;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) {
    return [];
  }

  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const current = nextIndex;
      nextIndex += 1;
      results[current] = await mapper(items[current], current);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );

  return results;
}

function withTimeout<T>(promise: Promise<T | null>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => {
      window.setTimeout(() => resolve(null), ms);
    }),
  ]);
}

/** JS POI → Geocoder 顺序尝试（避免 REST 错 Key 与并发限流） */
async function geocodeWithAmapJsSdk(
  query: string,
  city?: string,
  cityCore?: string,
): Promise<MapCoordinates | null> {
  const fromPoi = await withTimeout(
    forwardGeocodeWithAmapPlaceSearch(query, cityCore, PLAN_GEO_TIMEOUT_MS).then((result) =>
      result ? { longitude: result.lng, latitude: result.lat } : null,
    ),
    PLAN_GEO_TIMEOUT_MS + 300,
  );
  if (fromPoi) {
    return fromPoi;
  }

  return withTimeout(
    forwardGeocodeWithAmapGeocoder(query, {
      city: city ?? cityCore,
      timeoutMs: PLAN_GEO_TIMEOUT_MS,
    }).then((result) => (result ? { longitude: result.lng, latitude: result.lat } : null)),
    PLAN_GEO_TIMEOUT_MS + 300,
  );
}

async function geocodeSinglePlanPlace(
  query: string,
  city?: string,
  cityCore?: string,
  options: GeocodeOptions = {},
): Promise<MapCoordinates | null> {
  const cacheKey = planCacheKey(query, city);
  if (PLAN_GEO_CACHE.has(cacheKey)) {
    return PLAN_GEO_CACHE.get(cacheKey) ?? null;
  }

  const enriched = city ? buildPlanLocationGeocodeQuery(query, city) : query;

  const known =
    resolveKnownPlanLocationFallback(enriched, city) ??
    resolveKnownPlanLocationFallback(query, city);
  if (known) {
    const coords = { longitude: known.lng, latitude: known.lat };
    PLAN_GEO_CACHE.set(cacheKey, coords);
    return coords;
  }

  let coords =
    (await geocodeWithAmapJsSdk(enriched, city, cityCore)) ??
    (enriched !== query ? await geocodeWithAmapJsSdk(query, city, cityCore) : null);

  if (!coords && cityCore) {
    coords = await withTimeout(
      amapPlaceTextSearch(enriched, cityCore).then((result) =>
        result ? { longitude: result.longitude, latitude: result.latitude } : null,
      ),
      PLAN_GEO_TIMEOUT_MS,
    );
    if (!coords && enriched !== query) {
      coords = await withTimeout(
        amapPlaceTextSearch(query, cityCore).then((result) =>
          result ? { longitude: result.longitude, latitude: result.latitude } : null,
        ),
        PLAN_GEO_TIMEOUT_MS,
      );
    }
  }

  if (!coords) {
    const fromServer = await fetchServerOriginGeocode(enriched, city);
    if (fromServer) {
      coords = { longitude: fromServer.lng, latitude: fromServer.lat };
    }
  }

  if (!coords && enriched !== query) {
    const fromServerRaw = await fetchServerOriginGeocode(query, city);
    if (fromServerRaw) {
      coords = { longitude: fromServerRaw.lng, latitude: fromServerRaw.lat };
    }
  }

  if (!coords) {
    const labeled =
      (await amapGeocodePlaceWithLabel(enriched, city, options)) ??
      (enriched !== query ? await amapGeocodePlaceWithLabel(query, city, options) : null);
    if (labeled) {
      coords = { longitude: labeled.longitude, latitude: labeled.latitude };
    }
  }

  PLAN_GEO_CACHE.set(cacheKey, coords);
  return coords;
}

/** 行程地图批量解析：限流并发，避免高德 QPS 超限导致全部失败 */
export async function amapGeocodePlanPlaces(
  queries: string[],
  options: GeocodeOptions = {},
): Promise<Map<string, MapCoordinates | null>> {
  const unique = [...new Set(queries.map((query) => query.trim()).filter(Boolean))];
  const result = new Map<string, MapCoordinates | null>();
  if (unique.length === 0) {
    return result;
  }

  const city = options.city?.trim();
  const cityCore = city?.replace(/市$/, '');

  await loadAmap().catch(() => undefined);

  const pairs = await mapWithConcurrency(unique, PLAN_GEO_CONCURRENCY, async (query) => {
    const coords = await geocodeSinglePlanPlace(query, city, cityCore, options);
    return [query, coords] as const;
  });

  pairs.forEach(([query, coords]) => {
    result.set(query, coords);
  });

  return result;
}

export function clearAmapPlanGeocodeCache(): void {
  PLAN_GEO_CACHE.clear();
}
