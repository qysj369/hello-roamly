import type { MapRouteEndpoint } from '@/hooks/map/useMapPlanningAssistant';
import { forwardGeocodeWithAmapGeocoder } from '@/lib/map/amapGeocoderClient';
import { convertCoordinates } from '@/lib/map/coordinates';
import { isSameCityRegion } from '@/lib/map/planQueryBuilder';
import { resolveCityCenterSync } from '@/lib/map/parseTrailSearchQuery';
import { sanitizeLocationLabelForDisplay } from '@/lib/map/resolveAmapPlaceName';

export type PlanOriginSource = 'search' | 'gps' | 'manual' | 'ip' | 'fallback' | 'none';

export type ResolvedPlanOrigin = {
  endpoint: MapRouteEndpoint | null;
  labelForAi: string | null;
  source: PlanOriginSource;
};

/** 用户已在地图上/地址栏校正过的出发地，优先于搜索里的「济南历下区」等粗粒度词 */
function isManualOriginLocked(source: PlanOriginSource | undefined): boolean {
  return source === 'manual';
}

function toEndpoint(
  label: string,
  lng: number,
  lat: number,
  coordSystem: 'wgs84' | 'gcj02',
): MapRouteEndpoint {
  const gcj =
    coordSystem === 'gcj02'
      ? { longitude: lng, latitude: lat }
      : convertCoordinates({ longitude: lng, latitude: lat }, 'wgs84', 'gcj02');
  const wgs =
    coordSystem === 'wgs84'
      ? { longitude: lng, latitude: lat }
      : convertCoordinates({ longitude: lng, latitude: lat }, 'gcj02', 'wgs84');

  return {
    label: sanitizeLocationLabelForDisplay(label),
    gcjLng: gcj.longitude,
    gcjLat: gcj.latitude,
    wgsLng: wgs.longitude,
    wgsLat: wgs.latitude,
  };
}

/**
 * 出发地优先级：用户手动/地址校正 > 搜索里的「从 A 到 B」> 浏览器定位
 */
export async function resolvePlanOriginEndpoint(
  queryOrigin: string | null,
  gpsOrManualOrigin: MapRouteEndpoint | null,
  userOriginSource?: PlanOriginSource,
): Promise<ResolvedPlanOrigin> {
  if (gpsOrManualOrigin && isManualOriginLocked(userOriginSource)) {
    return {
      endpoint: gpsOrManualOrigin,
      labelForAi: gpsOrManualOrigin.label,
      source: 'manual',
    };
  }

  const trimmed = queryOrigin?.trim();
  if (trimmed) {
    const geocoded = await forwardGeocodeWithAmapGeocoder(trimmed);
    if (geocoded) {
      const endpoint = toEndpoint(geocoded.label, geocoded.lng, geocoded.lat, 'gcj02');
      return {
        endpoint,
        labelForAi: endpoint.label,
        source: 'search',
      };
    }

    const sync = resolveCityCenterSync(trimmed);
    if (sync) {
      const endpoint = toEndpoint(sync.label, sync.longitude, sync.latitude, sync.coordSystem);
      return {
        endpoint,
        labelForAi: endpoint.label,
        source: 'search',
      };
    }
  }

  if (gpsOrManualOrigin) {
    const source: PlanOriginSource =
      userOriginSource === 'fallback'
        ? 'fallback'
        : userOriginSource === 'ip'
          ? 'ip'
          : userOriginSource === 'manual'
            ? 'manual'
            : 'gps';
    return {
      endpoint: gpsOrManualOrigin,
      labelForAi: gpsOrManualOrigin.label,
      source,
    };
  }

  return { endpoint: null, labelForAi: null, source: 'none' };
}

/**
 * 何时把出发地写进规划：
 * - 搜索里写了路线（济南到成都 / 从济南去成都 等）→ 用解析出的出发地
 * - 静默出发地 + 跨城目的地 → 自动从家/默认点出发（用户无需填出发地）
 */
function isMultiStopDestinationLabel(destinationLabel: string | null): boolean {
  return Boolean(destinationLabel?.includes('→'));
}

function firstMultiStopLabel(destinationLabel: string): string {
  return destinationLabel.split('→')[0]?.trim() ?? destinationLabel.trim();
}

export function shouldAttachOriginToPlan(
  origin: ResolvedPlanOrigin,
  queryOrigin: string | null,
  destinationLabel: string | null,
): boolean {
  if (!origin.labelForAi || !destinationLabel?.trim()) {
    return false;
  }

  if (queryOrigin?.trim()) {
    return true;
  }

  const dest = isMultiStopDestinationLabel(destinationLabel)
    ? firstMultiStopLabel(destinationLabel)
    : destinationLabel.trim();

  if (isSameCityRegion(origin.labelForAi, dest)) {
    return false;
  }

  // 静默出发地：跨城即附带；仅过滤「单目的地 + 嘈杂 GPS 街道地址」
  if (
    origin.source === 'gps' &&
    !isMultiStopDestinationLabel(destinationLabel) &&
    /路\d+|街道|大厦|产业园/.test(origin.labelForAi)
  ) {
    return false;
  }

  return true;
}
