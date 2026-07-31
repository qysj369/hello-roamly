import {
  CITY_COORDINATES,
  getCityCoordinates,
  getCityCoordinatesByGuideId,
  getCityCoordinatesFromLocation,
  GUIDE_ID_TO_CITY,
} from '@/data/cityCoordinates';
import { extractCityFromPlanText } from '@/lib/map/geocodeTravelPlan';
import { DEFAULT_MAP_VIEW } from '@/lib/map/mapbox';
import { isWithinPlanRegion } from '@/lib/map/planGeoBounds';
import { isTransitRouteStop } from '@/lib/map/planRouteStops';
import type { MapCoordinates, TravelPlan, TravelPlanActivity } from '@/types/domain/travelPlan';
import { getPlanDestination, getPlanGuideId } from '@/utils/travelPlanView';

export type PlanMapPoint = {
  id: string;
  name: string;
  description: string;
  location?: string;
  time: string;
  day: number;
  dayTitle: string;
  order: number;
  longitude: number;
  latitude: number;
  /** 是否来自 Geocoding / 活动内嵌坐标（相对城市偏移估算） */
  geocoded?: boolean;
};

function matchCityNameInText(text?: string): string | undefined {
  const trimmed = text?.trim();
  if (!trimmed) {
    return undefined;
  }
  return Object.keys(CITY_COORDINATES).find((name) => trimmed.includes(name));
}

function shouldUseGuideCityCenter(destination: string, guideId: string): boolean {
  const trimmed = destination.trim();
  if (!trimmed || trimmed === '目的地') {
    return true;
  }

  const guideCity = GUIDE_ID_TO_CITY[guideId];
  if (!guideCity) {
    return false;
  }

  const destCore = trimmed.replace(/市$/, '');
  const guideCore = guideCity.replace(/市$/, '');
  return trimmed.includes(guideCore) || destCore === guideCore;
}

/** 计划地图默认中心（供 Geocoding proximity） */
export function getPlanBaseCenter(plan: TravelPlan): { longitude: number; latitude: number } {
  const destination = getPlanDestination(plan);
  const fromDestination = getCityCoordinates(destination);
  if (fromDestination) {
    return fromDestination;
  }

  const fromTitle =
    matchCityNameInText(plan.title) ??
    matchCityNameInText(plan.summary) ??
    matchCityNameInText(destination);
  if (fromTitle) {
    const coords = getCityCoordinates(fromTitle);
    if (coords) {
      return coords;
    }
  }

  const extractedCity =
    extractCityFromPlanText(destination) ??
    extractCityFromPlanText(plan.title) ??
    extractCityFromPlanText(plan.summary);
  if (extractedCity) {
    const coords = getCityCoordinates(extractedCity);
    if (coords) {
      return coords;
    }
  }

  const guideId = getPlanGuideId(plan);
  const guideFallback = getCityCoordinatesByGuideId(guideId);
  if (guideFallback && shouldUseGuideCityCenter(destination, guideId)) {
    return guideFallback;
  }

  return {
    longitude: DEFAULT_MAP_VIEW.longitude,
    latitude: DEFAULT_MAP_VIEW.latitude,
  };
}

export type PlanRouteGeoJson = GeoJSON.Feature<GeoJSON.LineString>;

/** 围绕锚点螺旋偏移，避免多个活动叠在同一点 */
function offsetCoordinate(
  base: { longitude: number; latitude: number },
  index: number,
): { longitude: number; latitude: number } {
  const angle = ((index * 137.5) % 360) * (Math.PI / 180);
  const distance = 0.006 + (index % 4) * 0.0025;
  return {
    longitude: base.longitude + Math.cos(angle) * distance,
    latitude: base.latitude + Math.sin(angle) * distance,
  };
}

function resolveActivityCoordinate(
  activity: TravelPlanActivity,
  plan: TravelPlan,
  globalIndex: number,
): { coords: MapCoordinates; geocoded: boolean } {
  if (activity.coordinates) {
    return { coords: activity.coordinates, geocoded: true };
  }
  const fromLocation = activity.location ? getCityCoordinatesFromLocation(activity.location) : undefined;
  const base = fromLocation ?? getPlanBaseCenter(plan);
  return { coords: offsetCoordinate(base, globalIndex), geocoded: false };
}

/** 从 TravelPlan 提取地图标记点（按行程顺序） */
export function buildPlanMapPoints(plan: TravelPlan): PlanMapPoint[] {
  const points: PlanMapPoint[] = [];
  let order = 0;

  plan.dailyPlans.forEach((day) => {
    day.activities.forEach((activity, activityIndex) => {
      const { coords, geocoded } = resolveActivityCoordinate(activity, plan, order);
      const name =
        activity.location?.split('·')[0]?.trim() ||
        activity.description.slice(0, 24) ||
        `活动 ${order + 1}`;

      points.push({
        id: `point-${day.day}-${activityIndex}-${order}`,
        name,
        description: activity.description,
        location: activity.location,
        time: activity.time,
        day: day.day,
        dayTitle: day.title,
        order,
        longitude: coords.longitude,
        latitude: coords.latitude,
        geocoded,
      });
      order += 1;
    });
  });

  return points;
}

/**
 * 地图展示点：排除大交通节点，优先只显示目的地附近要去的地方。
 * 不要求已精确定位（无 geocode 时仍显示估算点）。
 */
export function getMapDisplayPoints(
  points: PlanMapPoint[],
  anchor?: MapCoordinates,
  maxRegionKm = 120,
): PlanMapPoint[] {
  const candidates = points.filter((point) => !isTransitRouteStop(point));

  if (!anchor || candidates.length === 0) {
    return candidates;
  }

  const inRegion = candidates.filter((point) =>
    isWithinPlanRegion(
      { longitude: point.longitude, latitude: point.latitude },
      anchor,
      maxRegionKm,
    ),
  );

  if (inRegion.length >= 1) {
    return inRegion;
  }

  return candidates;
}

/**
 * 参与路线绘制的点：精确定位 + 目的地市内游玩 + 排除大交通节点。
 * 跨城出发/返程（如济南↔临清）不再连成一条绕路弧线。
 */
export function getRouteDrawablePoints(
  points: PlanMapPoint[],
  anchor?: MapCoordinates,
  maxRegionKm = 120,
): PlanMapPoint[] {
  const geocoded = points.filter((point) => point.geocoded && !isTransitRouteStop(point));

  if (!anchor || geocoded.length === 0) {
    return geocoded;
  }

  const inRegion = geocoded.filter((point) =>
    isWithinPlanRegion(
      { longitude: point.longitude, latitude: point.latitude },
      anchor,
      maxRegionKm,
    ),
  );

  if (inRegion.length >= 2) {
    return inRegion;
  }
  if (inRegion.length === 1) {
    return inRegion;
  }

  return geocoded;
}

export function canDrawPlanRoute(points: PlanMapPoint[], anchor?: MapCoordinates): boolean {
  return getRouteDrawablePoints(points, anchor).length >= 2;
}

export function buildPlanRouteGeoJson(points: PlanMapPoint[]): PlanRouteGeoJson | null {
  if (points.length < 2) {
    return null;
  }

  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: points.map((point) => [point.longitude, point.latitude]),
    },
  };
}
