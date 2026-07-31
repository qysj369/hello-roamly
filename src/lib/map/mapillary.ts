import { readEnv } from '@/lib/config/env';

/** Mapillary access token（Graph API / MapillaryJS） */
export function getMapillaryAccessToken(): string | undefined {
  const token = readEnv('VITE_MAPILLARY_ACCESS_TOKEN')?.trim();
  return token || undefined;
}

export function isMapillaryConfigured(): boolean {
  return Boolean(getMapillaryAccessToken());
}
