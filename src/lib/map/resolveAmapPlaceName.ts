/** 从高德逆地理结果提取「点击点附近」的准确地名 */

export type AmapAddressComponent = {
  province?: string;
  city?: string | string[];
  district?: string;
  township?: string;
  street?: string;
  streetNumber?: string;
  neighborhood?: { name?: string | string[] };
};

export type AmapRegeocodePoi = {
  name?: string;
  distance?: string | number;
  type?: string;
};

export type AmapRegeocodePayload = {
  formattedAddress?: string;
  formatted_address?: string;
  addressComponent?: AmapAddressComponent;
  pois?: AmapRegeocodePoi[];
};

const PROVINCE_PREFIX = /^(.+?(?:省|自治区|特别行政区))/;

function readCity(city: string | string[] | undefined): string | undefined {
  if (Array.isArray(city)) {
    return city[0]?.trim() || undefined;
  }
  return city?.trim() || undefined;
}

function readNeighborhood(name: string | string[] | undefined): string | undefined {
  if (Array.isArray(name)) {
    return name[0]?.trim() || undefined;
  }
  return name?.trim() || undefined;
}

function stripProvince(formatted: string): string {
  return formatted.replace(PROVINCE_PREFIX, '').trim();
}

function pickNearestPoi(pois: AmapRegeocodePoi[] | undefined, maxDistanceM = 800): string | null {
  if (!pois?.length) {
    return null;
  }

  let best: AmapRegeocodePoi | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const poi of pois) {
    if (!poi.name?.trim()) {
      continue;
    }
    const distance = Number(poi.distance);
    if (!Number.isFinite(distance)) {
      if (!best) {
        best = poi;
      }
      continue;
    }
    if (distance <= maxDistanceM && distance < bestDistance) {
      best = poi;
      bestDistance = distance;
    }
  }

  return best?.name?.trim() ?? pois[0]?.name?.trim() ?? null;
}

function buildFromAddressComponent(ac: AmapAddressComponent): string | null {
  const city = readCity(ac.city);
  const neighborhood = readNeighborhood(ac.neighborhood?.name);
  const parts = [city, ac.district, ac.township, neighborhood, ac.street, ac.streetNumber]
    .map((part) => part?.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return null;
  }

  return parts.join('');
}

function buildFromFormatted(formatted: string): string {
  const trimmed = stripProvince(formatted);
  const segments = trimmed.split(/[,，]/).map((part) => part.trim()).filter(Boolean);
  if (segments.length >= 2) {
    return segments.slice(0, Math.min(3, segments.length)).join('');
  }
  return trimmed || formatted;
}

/** 用户当前定位 — 城市 + 区县，如「济南市历下区」 */
export function resolveAmapOriginLabel(regeocode: AmapRegeocodePayload): string | null {
  if (regeocode.addressComponent) {
    const fromComponent = buildFromAddressComponent(regeocode.addressComponent);
    if (fromComponent) {
      return fromComponent;
    }
  }
  return resolveAmapPlaceName(regeocode);
}

/** 点击目的地 — 省 + 市，如「河南洛阳」 */
export function resolveAmapDestinationLabel(regeocode: AmapRegeocodePayload): string | null {
  const ac = regeocode.addressComponent;
  if (ac) {
    const province = ac.province?.replace(/(省|自治区|特别行政区)$/, '').trim();
    const city = readCity(ac.city)?.replace(/市$/, '').trim();
    if (province && city) {
      return `${province}${city}`;
    }
    const fromComponent = buildFromAddressComponent(ac);
    if (fromComponent) {
      return fromComponent;
    }
  }
  return resolveAmapPlaceName(regeocode);
}

/** 优先附近 POI，其次街道/乡镇，避免只取「山东省」或 AI 误猜市中心 */
export function resolveAmapPlaceName(regeocode: AmapRegeocodePayload): string | null {
  const poiName = pickNearestPoi(regeocode.pois);
  if (poiName) {
    return poiName;
  }

  if (regeocode.addressComponent) {
    const fromComponent = buildFromAddressComponent(regeocode.addressComponent);
    if (fromComponent) {
      return fromComponent;
    }
  }

  const formatted = regeocode.formattedAddress ?? regeocode.formatted_address;
  if (formatted?.trim()) {
    return buildFromFormatted(formatted.trim());
  }

  return null;
}

export function isCoordinateLikeLocationName(name: string): boolean {
  const trimmed = name.trim();
  if (/^-?\d+\.\d+\s*[,，]\s*-?\d+\.\d+$/.test(trimmed)) {
    return true;
  }
  if (/^(?:经度|纬度|坐标|lng|lat)\s*[:：]?/i.test(trimmed)) {
    return true;
  }
  return /经度\s*[\d.]+\s*[,，、]\s*纬度\s*[\d.]+/i.test(trimmed);
}

/** 展示用地名：过滤经纬度等技术坐标，避免出现在方案头与历史记录 */
export function sanitizeLocationLabelForDisplay(
  name: string | null | undefined,
  fallback = '所选地点',
): string {
  const trimmed = name?.trim();
  if (!trimmed || isCoordinateLikeLocationName(trimmed)) {
    return fallback;
  }
  return compactGeocodeLabelForDisplay(trimmed);
}

/** 「山东省济宁市曲阜市」→「曲阜」；避免地级前缀误当联游站点 */
export function compactGeocodeLabelForDisplay(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) {
    return trimmed;
  }

  // 「济南市历下区 → 杭州」展示取目的地，避免被压成「历下」
  if (/[→➜]/.test(trimmed)) {
    const lastStop = trimmed
      .split(/[→➜]/)
      .map((part) => part.trim())
      .filter(Boolean)
      .at(-1);
    if (lastStop && lastStop !== trimmed) {
      return compactGeocodeLabelForDisplay(lastStop);
    }
  }

  const withoutProvince = stripProvince(trimmed);
  const segments = withoutProvince.split(/[,，]/).map((part) => part.trim()).filter(Boolean);
  if (segments.length >= 2) {
    const last = segments[segments.length - 1] ?? '';
    const cityMatch = last.match(/([\u4e00-\u9fa5]{2,8})(?:市|县|区)$/);
    if (cityMatch?.[1]) {
      return cityMatch[1];
    }
    return last.replace(/(?:市|县|区)$/, '');
  }

  const embedded = withoutProvince.match(/[\u4e00-\u9fa5]{2,4}市([\u4e00-\u9fa5]{2,8})(?:市|县|区)/);
  if (embedded?.[1]) {
    return embedded[1];
  }

  return withoutProvince.replace(/(?:市|县|区)$/, '') || trimmed;
}

export function formatCoordinateLabel(lat: number, lng: number): string {
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}
