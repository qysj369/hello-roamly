/** 高德/网络均失败时的手工坐标兜底（GCJ-02） */
export type KnownOriginFallback = {
  label: string;
  lng: number;
  lat: number;
};

/** 产品默认出发点：历下区中林路绿城百合花园（经现场校正，GCJ-02） */
export const DEFAULT_PRODUCT_ORIGIN: KnownOriginFallback = {
  label: '济南市历下区中林路绿城百合花园',
  lng: 117.11566,
  lat: 36.69552,
};

/** 历下区行政中心（仅「济南全市」等极粗输入时使用） */
const LIXIA_DISTRICT_CENTER: KnownOriginFallback = {
  label: '济南市历下区',
  lng: 117.076,
  lat: 36.666,
};

const LILY_GARDEN = DEFAULT_PRODUCT_ORIGIN;

const FALLBACKS: { pattern: RegExp; entry: KnownOriginFallback }[] = [
  { pattern: /绿城百合花园/, entry: LILY_GARDEN },
  { pattern: /百合花园/, entry: LILY_GARDEN },
  { pattern: /中林路.*百合|百合.*中林路/, entry: LILY_GARDEN },
  { pattern: /历下区中林路|中林路/, entry: LILY_GARDEN },
  { pattern: /济南市历下区|^历下区$|^济南历下/, entry: LILY_GARDEN },
  { pattern: /^济南市$|^济南$/, entry: LIXIA_DISTRICT_CENTER },
];

export function matchKnownOriginFallback(address: string): KnownOriginFallback | null {
  const trimmed = address.trim();
  if (!trimmed) {
    return null;
  }
  for (const { pattern, entry } of FALLBACKS) {
    if (pattern.test(trimmed)) {
      return entry;
    }
  }
  return null;
}

/** 历下区行政中心（高德对「历下区」常落此点，与产品默认出发点不同） */
export function isCoarseLixiaDistrictCenter(lng: number, lat: number): boolean {
  return Math.abs(lng - 117.076) < 0.002 && Math.abs(lat - 36.666) < 0.002;
}

/** 去掉省前缀后再匹配，避免「山东省济南市历下区」漏匹配 */
export function resolveKnownOriginFallback(address: string): KnownOriginFallback | null {
  const trimmed = address.trim();
  if (!trimmed) {
    return null;
  }
  const withoutProvince = trimmed.replace(/^中国/, '').replace(/^山东省/, '').trim();
  return matchKnownOriginFallback(withoutProvince) ?? matchKnownOriginFallback(trimmed);
}
