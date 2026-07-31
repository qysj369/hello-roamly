const DEFAULT_PRODUCT_ORIGIN = {
  label: "济南市历下区中林路绿城百合花园",
  lng: 117.11566,
  lat: 36.69552
};
const LIXIA_DISTRICT_CENTER = {
  label: "济南市历下区",
  lng: 117.076,
  lat: 36.666
};
const LILY_GARDEN = DEFAULT_PRODUCT_ORIGIN;
const FALLBACKS = [
  { pattern: /绿城百合花园/, entry: LILY_GARDEN },
  { pattern: /百合花园/, entry: LILY_GARDEN },
  { pattern: /中林路.*百合|百合.*中林路/, entry: LILY_GARDEN },
  { pattern: /历下区中林路|中林路/, entry: LILY_GARDEN },
  { pattern: /济南市历下区|^历下区$|^济南历下/, entry: LILY_GARDEN },
  { pattern: /^济南市$|^济南$/, entry: LIXIA_DISTRICT_CENTER }
];
function matchKnownOriginFallback(address) {
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
function isCoarseLixiaDistrictCenter(lng, lat) {
  return Math.abs(lng - 117.076) < 2e-3 && Math.abs(lat - 36.666) < 2e-3;
}
function resolveKnownOriginFallback(address) {
  const trimmed = address.trim();
  if (!trimmed) {
    return null;
  }
  const withoutProvince = trimmed.replace(/^中国/, "").replace(/^山东省/, "").trim();
  return matchKnownOriginFallback(withoutProvince) ?? matchKnownOriginFallback(trimmed);
}
export {
  DEFAULT_PRODUCT_ORIGIN as D,
  isCoarseLixiaDistrictCenter as i,
  resolveKnownOriginFallback as r
};
