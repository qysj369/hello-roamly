import { CITY_COORDINATES } from '@/data/cityCoordinates';
import { geocodePlanPlaces } from '@/lib/map/geocode';
import { isWithinPlanRegion, distanceKm } from '@/lib/map/planGeoBounds';
import { getPlanBaseCenter } from '@/lib/map/planMapPoints';
import { inferCityFromAddress } from '@/lib/map/inferCityFromAddress';
import { resolveKnownPlanLocationFallback } from '@/lib/map/knownPlanLocationFallbacks';
import { hasMapService } from '@/lib/map/provider';
import type { TravelPlan } from '@/types/domain/travelPlan';
import { getPlanDestination } from '@/utils/travelPlanView';

const MUNICIPALITIES = new Set(['北京', '上海', '天津', '重庆']);

function toAmapCityParam(cityName: string): string {
  return MUNICIPALITIES.has(cityName) ? cityName : `${cityName.replace(/市$/, '')}市`;
}

/** 从标题/需求文案中提取城市名（不含「市」后缀） */
export function extractCityFromPlanText(text?: string): string | undefined {
  const trimmed = text?.trim();
  if (!trimmed) {
    return undefined;
  }

  const inferred = inferCityFromAddress(trimmed);
  if (inferred) {
    return inferred.replace(/市$/, '');
  }

  const citySuffix = trimmed.match(/([\u4e00-\u9fa5]{2,6})市/);
  if (citySuffix?.[1]) {
    return citySuffix[1];
  }

  return Object.keys(CITY_COORDINATES).find((name) => trimmed.includes(name));
}

/** 从行程目的地推断高德 city 参数（避免「锦城湖」解析到外省） */
export function resolvePlanGeocodeCity(plan: TravelPlan): string | undefined {
  const candidates = [
    getPlanDestination(plan),
    plan.title,
    plan.summary,
    ...plan.dailyPlans.flatMap((day) =>
      day.activities.map((activity) => activity.location?.trim()).filter(Boolean) as string[],
    ),
  ];

  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (!trimmed) {
      continue;
    }

    const inferred = inferCityFromAddress(trimmed);
    if (inferred) {
      return inferred;
    }

    const citySuffix = trimmed.match(/([\u4e00-\u9fa5]{2,6})市/);
    if (citySuffix?.[1]) {
      return toAmapCityParam(citySuffix[1]);
    }

    const matched = Object.keys(CITY_COORDINATES).find((name) => trimmed.includes(name));
    if (matched) {
      return toAmapCityParam(matched);
    }
  }

  return undefined;
}

/** 拼接「城市 + POI」提高歧义地点解析准确率 */
export function buildPlanLocationGeocodeQuery(location: string, city?: string): string {
  const trimmed = location.trim();
  if (!trimmed || !city) {
    return trimmed;
  }

  const cityCore = city.replace(/市$/, '');
  if (trimmed.includes(cityCore)) {
    return trimmed;
  }

  return `${cityCore}${trimmed}`;
}

/** 清洗 AI 行程地点文案，生成多个 geocode 候选 */
export function buildPlanLocationGeocodeVariants(location: string, city?: string): string[] {
  const trimmed = location.trim();
  if (!trimmed) {
    return [];
  }

  const variants = new Set<string>([trimmed]);
  const segments = trimmed
    .split(/[·•|｜/\\-–—]/)
    .map((part) => part.trim())
    .filter(Boolean);

  for (const segment of segments) {
    variants.add(segment);
    const cleaned = segment
      .replace(/^(第?\d+天\s*[:：]?\s*|day\s*\d+\s*[:：]?\s*)/i, '')
      .replace(/^(上午|下午|晚上|中午)\s*/u, '')
      .trim();
    if (cleaned) {
      variants.add(cleaned);
    }
  }

  const cityCore = city?.replace(/市$/, '');
  if (cityCore) {
    for (const variant of [...variants]) {
      if (!variant.includes(cityCore)) {
        variants.add(buildPlanLocationGeocodeQuery(variant, city));
      }
    }
  }

  return [...variants].filter((value) => value.length >= 2);
}

function collectUniqueLocations(plan: TravelPlan): string[] {
  const locations = new Set<string>();
  plan.dailyPlans.forEach((day) => {
    day.activities.forEach((activity) => {
      if (activity.location?.trim() && !activity.coordinates) {
        locations.add(activity.location.trim());
      }
    });
  });
  return [...locations];
}

function inferCityFromCoordinates(coords: { longitude: number; latitude: number }): string | undefined {
  let nearest: { name: string; distance: number } | null = null;

  for (const [name, cityCoords] of Object.entries(CITY_COORDINATES)) {
    const distance = distanceKm(coords, cityCoords);
    if (distance > 80) {
      continue;
    }
    if (!nearest || distance < nearest.distance) {
      nearest = { name, distance };
    }
  }

  return nearest ? toAmapCityParam(nearest.name) : undefined;
}

function resolveGeocodedCoords(
  location: string,
  geocoded: Map<string, { longitude: number; latitude: number } | null>,
  city: string | undefined,
  proximity: { longitude: number; latitude: number },
): { longitude: number; latitude: number } | null {
  const variants = buildPlanLocationGeocodeVariants(location, city);
  for (const variant of variants) {
    const coords = geocoded.get(variant);
    if (coords && isWithinPlanRegion(coords, proximity)) {
      return coords;
    }
  }

  const known = resolveKnownPlanLocationFallback(location, city);
  if (known) {
    const coords = { longitude: known.lng, latitude: known.lat };
    if (isWithinPlanRegion(coords, proximity)) {
      return coords;
    }
  }

  return null;
}

/** 为计划中缺少 coordinates 的活动调用当前地图服务商 Geocoding */
export async function geocodeTravelPlan(plan: TravelPlan): Promise<TravelPlan> {
  const locations = collectUniqueLocations(plan);

  if (!hasMapService() || locations.length === 0) {
    return plan;
  }

  const proximity = getPlanBaseCenter(plan);
  const city = resolvePlanGeocodeCity(plan) ?? inferCityFromCoordinates(proximity);
  const querySet = new Set<string>();
  locations.forEach((location) => {
    buildPlanLocationGeocodeVariants(location, city).forEach((variant) => {
      querySet.add(variant);
    });
  });

  const geocoded = await geocodePlanPlaces([...querySet], { proximity, city });

  return {
    ...plan,
    dailyPlans: plan.dailyPlans.map((day) => ({
      ...day,
      activities: day.activities.map((activity) => {
        if (activity.coordinates || !activity.location?.trim()) {
          return activity;
        }
        const coords = resolveGeocodedCoords(activity.location.trim(), geocoded, city, proximity);
        if (!coords) {
          return activity;
        }
        return { ...activity, coordinates: coords };
      }),
    })),
  };
}
