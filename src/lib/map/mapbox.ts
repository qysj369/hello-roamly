import { readEnv } from '@/lib/config/env';
import { normalizeMapCredential } from '@/lib/map/credentials';

/** Mapbox 公网 token，在 .env.local 中配置 VITE_MAPBOX_TOKEN */
export function getMapboxToken(): string | undefined {
  return normalizeMapCredential(readEnv('VITE_MAPBOX_TOKEN'));
}

export const DEFAULT_MAP_VIEW = {
  longitude: 116.4074,
  latitude: 39.9042,
  zoom: 10,
} as const;
