import { convertCoordinates } from '@/lib/map/coordinates';
import type { UserMapOrigin } from '@/hooks/map/useUserMapOrigin';
import { DEFAULT_PRODUCT_ORIGIN } from '@/lib/map/knownOriginFallbacks';

/** 产品默认出发点（济南历下区 · 中林路绿城百合花园，GCJ-02） */
export const DEFAULT_DEMO_ORIGIN_LABEL = DEFAULT_PRODUCT_ORIGIN.label;

export function buildDefaultDemoOrigin(): UserMapOrigin {
  const gcj = { longitude: DEFAULT_PRODUCT_ORIGIN.lng, latitude: DEFAULT_PRODUCT_ORIGIN.lat };
  const wgs = convertCoordinates(gcj, 'gcj02', 'wgs84');
  return {
    label: DEFAULT_PRODUCT_ORIGIN.label,
    longitude: wgs.longitude,
    latitude: wgs.latitude,
    gcjLng: gcj.longitude,
    gcjLat: gcj.latitude,
  };
}
