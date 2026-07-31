import { fetchServerOriginGeocode } from '@/services/map/fetchServerOriginGeocode';
import { buildOriginAddressVariants, inferCityFromAddress, isPoiLikeOriginQuery } from '@/lib/map/inferCityFromAddress';
import {
  isCoarseLixiaDistrictCenter,
  matchKnownOriginFallback,
  resolveKnownOriginFallback,
} from '@/lib/map/knownOriginFallbacks';
import { loadAmap } from '@/lib/map/amapLoader';
import {
  resolveAmapDestinationLabel,
  resolveAmapOriginLabel,
  resolveAmapPlaceName,
  type AmapRegeocodePayload,
} from '@/lib/map/resolveAmapPlaceName';

export type AmapReverseGeocodeLabels = {
  nearbyLabel: string | null;
  originLabel: string | null;
  destinationLabel: string | null;
};

function readRegeocodePayload(result: AMapGeocoderResult): AmapRegeocodePayload | null {
  if (!result?.regeocode) {
    return null;
  }
  return result.regeocode as AmapRegeocodePayload;
}

/** 前端高德逆地理（AMap.Geocoder，GCJ-02） */
export async function reverseGeocodeWithAmapGeocoder(
  longitude: number,
  latitude: number,
): Promise<string | null> {
  const labels = await reverseGeocodeAmapLabels(longitude, latitude);
  return labels?.nearbyLabel ?? null;
}

/** 逆地理并返回出发地/目的地等多级地名 */
export async function reverseGeocodeAmapLabels(
  longitude: number,
  latitude: number,
): Promise<AmapReverseGeocodeLabels | null> {
  const AMapNS = await loadAmap();

  const GEOCODE_TIMEOUT_MS = 10_000;

  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: AmapReverseGeocodeLabels | null) => {
      if (settled) {
        return;
      }
      settled = true;
      window.clearTimeout(timer);
      resolve(value);
    };

    const timer = window.setTimeout(() => finish(null), GEOCODE_TIMEOUT_MS);

    const geocoder = new AMapNS.Geocoder({
      city: '全国',
      radius: 800,
      extensions: 'all',
    });
    geocoder.getAddress([longitude, latitude], (status, result) => {
      if (status !== 'complete') {
        finish(null);
        return;
      }
      const payload = readRegeocodePayload(result);
      if (!payload) {
        finish(null);
        return;
      }
      finish({
        nearbyLabel: resolveAmapPlaceName(payload),
        originLabel: resolveAmapOriginLabel(payload),
        destinationLabel: resolveAmapDestinationLabel(payload),
      });
    });
  });
}

/** 前端高德 POI 搜索（小区/门牌比纯 Geocoder 更准） */
export async function forwardGeocodeWithAmapPlaceSearch(
  keyword: string,
  city?: string,
  timeoutMs = 10_000,
): Promise<{ label: string; lng: number; lat: number } | null> {
  const trimmed = keyword.trim();
  if (!trimmed) {
    return null;
  }

  const AMapNS = await loadAmap();
  const cityLimit = city ?? inferCityFromAddress(trimmed) ?? '全国';

  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: { label: string; lng: number; lat: number } | null) => {
      if (settled) {
        return;
      }
      settled = true;
      window.clearTimeout(timer);
      resolve(value);
    };

    const timer = window.setTimeout(() => finish(null), timeoutMs);

    const placeSearch = new AMapNS.PlaceSearch({
      city: cityLimit,
      citylimit: cityLimit !== '全国',
      pageSize: 1,
      extensions: 'base',
    });

    placeSearch.search(trimmed, (status, result) => {
      if (status !== 'complete') {
        finish(null);
        return;
      }

      const poi = result?.poiList?.pois?.[0];
      const location = poi?.location;
      if (!location) {
        finish(null);
        return;
      }

      const lng = typeof location.getLng === 'function' ? location.getLng() : location.lng;
      const lat = typeof location.getLat === 'function' ? location.getLat() : location.lat;
      if (lng == null || lat == null || !Number.isFinite(lng) || !Number.isFinite(lat)) {
        finish(null);
        return;
      }

      const addressPart = poi.address?.trim();
      const label = addressPart
        ? `${poi.name?.trim() || trimmed}（${addressPart}）`
        : poi.name?.trim() || trimmed;

      finish({ label, lng, lat });
    });
  });
}

/** 前端高德地理编码（地址 → GCJ-02 坐标） */
export async function forwardGeocodeWithAmapGeocoder(
  address: string,
  options?: { city?: string; timeoutMs?: number },
): Promise<{ label: string; lng: number; lat: number } | null> {
  const trimmed = address.trim();
  if (!trimmed) {
    return null;
  }

  const city = options?.city ?? inferCityFromAddress(trimmed) ?? '全国';
  const timeoutMs = options?.timeoutMs ?? 10_000;

  if (isPoiLikeOriginQuery(trimmed)) {
    const fromPoi = await forwardGeocodeWithAmapPlaceSearch(trimmed, city, timeoutMs);
    if (fromPoi) {
      return fromPoi;
    }
  }

  const AMapNS = await loadAmap();

  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: { label: string; lng: number; lat: number } | null) => {
      if (settled) {
        return;
      }
      settled = true;
      window.clearTimeout(timer);
      resolve(value);
    };

    const timer = window.setTimeout(() => finish(null), timeoutMs);

    const geocoder = new AMapNS.Geocoder({ city });
    geocoder.getLocation(trimmed, (status, result) => {
      if (status !== 'complete') {
        finish(null);
        return;
      }

      const geocode = result.geocodes?.[0];
      const location = geocode?.location;
      if (!location) {
        finish(null);
        return;
      }

      const lng = typeof location.getLng === 'function' ? location.getLng() : location.lng;
      const lat = typeof location.getLat === 'function' ? location.getLat() : location.lat;
      if (lng == null || lat == null || !Number.isFinite(lng) || !Number.isFinite(lat)) {
        finish(null);
        return;
      }

      finish({
        label: geocode.formattedAddress?.trim() || trimmed,
        lng,
        lat,
      });
    });
  });
}

function preferKnownOriginOverCoarseGeocode(
  address: string,
  variants: string[],
  result: { label: string; lng: number; lat: number },
): { label: string; lng: number; lat: number } {
  if (!isCoarseLixiaDistrictCenter(result.lng, result.lat)) {
    return result;
  }
  for (const variant of [...variants, address]) {
    const known = resolveKnownOriginFallback(variant);
    if (known) {
      return { label: known.label, lng: known.lng, lat: known.lat };
    }
  }
  return result;
}

/** 出发地地址解析：已知精确点 → 高德 API → 本站 API → 已知兜底 */
export async function resolveOriginAddressToCoords(
  address: string,
): Promise<{ label: string; lng: number; lat: number } | null> {
  const city = inferCityFromAddress(address);
  const variants = buildOriginAddressVariants(address);

  for (const variant of variants) {
    const known = resolveKnownOriginFallback(variant);
    if (known) {
      return { label: known.label, lng: known.lng, lat: known.lat };
    }
  }
  const directKnown = resolveKnownOriginFallback(address);
  if (directKnown) {
    return { label: directKnown.label, lng: directKnown.lng, lat: directKnown.lat };
  }

  for (const variant of variants) {
    try {
      if (isPoiLikeOriginQuery(variant)) {
        const fromJsPoi = await forwardGeocodeWithAmapPlaceSearch(variant, city);
        if (fromJsPoi) {
          return preferKnownOriginOverCoarseGeocode(address, variants, fromJsPoi);
        }
      }

      const fromJsGeo = await forwardGeocodeWithAmapGeocoder(variant, { city });
      if (fromJsGeo) {
        return preferKnownOriginOverCoarseGeocode(address, variants, fromJsGeo);
      }
    } catch {
      /* JS API 未加载或 Key 受限 */
    }
  }

  for (const variant of variants) {
    const fromServer = await fetchServerOriginGeocode(variant);
    if (fromServer) {
      return preferKnownOriginOverCoarseGeocode(address, variants, fromServer);
    }
  }

  for (const variant of variants) {
    const fallback = resolveKnownOriginFallback(variant);
    if (fallback) {
      return { label: fallback.label, lng: fallback.lng, lat: fallback.lat };
    }
  }

  const fallback = resolveKnownOriginFallback(address);
  if (fallback) {
    return { label: fallback.label, lng: fallback.lng, lat: fallback.lat };
  }

  return null;
}
