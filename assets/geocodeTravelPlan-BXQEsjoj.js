import { cC as getPlanDestination, c6 as getCityCoordinates, cE as getPlanGuideId, c7 as getCityCoordinatesByGuideId, u as CITY_COORDINATES, T as GUIDE_ID_TO_CITY, c8 as getCityCoordinatesFromLocation } from "./index-DwV1qlqh.js";
import { g as getAmapKey, b as getAmapWebServiceKey, r as resolveMapProvider, f as getMapboxToken, a as DEFAULT_MAP_VIEW, i as hasMapService } from "./provider-CMJI8edA.js";
import { f as fetchServerOriginGeocode, b as forwardGeocodeWithAmapPlaceSearch, a as forwardGeocodeWithAmapGeocoder, l as loadAmap, i as inferCityFromAddress } from "./amapGeocoderClient-CjYlis2t.js";
const GEO_URL = "https://restapi.amap.com/v3/geocode/geo";
const REGEO_URL = "https://restapi.amap.com/v3/geocode/regeo";
const PLACE_TEXT_URL = "https://restapi.amap.com/v3/place/text";
const CACHE$1 = /* @__PURE__ */ new Map();
const REVERSE_CACHE$1 = /* @__PURE__ */ new Map();
function parseLocation(location) {
  const [lng, lat] = location.split(",").map((part) => Number.parseFloat(part.trim()));
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return null;
  }
  return { longitude: lng, latitude: lat };
}
function buildCacheKey$1(query, proximity) {
  const prox = proximity ? `${proximity.longitude},${proximity.latitude}` : "";
  return `amap|${query.trim()}|${prox}`;
}
function shortPlaceName(formatted) {
  const parts = formatted.split(/[,，]/).map((part) => part.trim()).filter(Boolean);
  return parts[0] ?? formatted;
}
async function amapGeocodePlace(query, options = {}) {
  var _a;
  const trimmed = query.trim();
  if (!trimmed) {
    return null;
  }
  const city = (_a = options.city) == null ? void 0 : _a.trim();
  const cityCore = city == null ? void 0 : city.replace(/市$/, "");
  const enriched = city ? buildPlanLocationGeocodeQuery(trimmed, city) : trimmed;
  const tryJsSdk = async (query2) => {
    try {
      const fromPoi = await forwardGeocodeWithAmapPlaceSearch(query2, cityCore);
      if (fromPoi) {
        return { longitude: fromPoi.lng, latitude: fromPoi.lat };
      }
      const fromGeo = await forwardGeocodeWithAmapGeocoder(query2, { city: city ?? cityCore });
      if (fromGeo) {
        return { longitude: fromGeo.lng, latitude: fromGeo.lat };
      }
    } catch {
    }
    return null;
  };
  const fromJs = await tryJsSdk(trimmed);
  if (fromJs) {
    return fromJs;
  }
  if (enriched !== trimmed) {
    const fromEnrichedJs = await tryJsSdk(enriched);
    if (fromEnrichedJs) {
      return fromEnrichedJs;
    }
  }
  const fromServer = await fetchServerOriginGeocode(enriched);
  if (fromServer) {
    return { longitude: fromServer.lng, latitude: fromServer.lat };
  }
  if (enriched !== trimmed) {
    const fromServerRaw = await fetchServerOriginGeocode(trimmed);
    if (fromServerRaw) {
      return { longitude: fromServerRaw.lng, latitude: fromServerRaw.lat };
    }
  }
  if (city) {
    const fromPoi = await amapPlaceTextSearch(trimmed, cityCore);
    if (fromPoi) {
      return { longitude: fromPoi.longitude, latitude: fromPoi.latitude };
    }
    if (enriched !== trimmed) {
      const fromEnrichedPoi = await amapPlaceTextSearch(enriched, cityCore);
      if (fromEnrichedPoi) {
        return { longitude: fromEnrichedPoi.longitude, latitude: fromEnrichedPoi.latitude };
      }
    }
  }
  const labeled = await amapGeocodePlaceWithLabel(enriched, city, options);
  if (labeled) {
    return { longitude: labeled.longitude, latitude: labeled.latitude };
  }
  if (enriched !== trimmed) {
    const fallback = await amapGeocodePlaceWithLabel(trimmed, city, options);
    return fallback ? { longitude: fallback.longitude, latitude: fallback.latitude } : null;
  }
  return null;
}
async function amapGeocodePlaceWithLabel(query, city, options = {}) {
  var _a, _b;
  const key = getAmapWebServiceKey();
  const trimmed = query.trim();
  if (!key || !trimmed) {
    return null;
  }
  const cacheKey = buildCacheKey$1(`${trimmed}|${city ?? ""}`, options.proximity);
  const cached = CACHE$1.get(cacheKey);
  if (cached) {
    return cached ? { label: trimmed, longitude: cached.longitude, latitude: cached.latitude } : null;
  }
  const params = new URLSearchParams({
    key,
    address: trimmed,
    output: "JSON"
  });
  if (city == null ? void 0 : city.trim()) {
    params.set("city", city.trim());
  }
  if (options.proximity) {
    params.set("location", `${options.proximity.longitude},${options.proximity.latitude}`);
  }
  try {
    const response = await fetch(`${GEO_URL}?${params.toString()}`);
    if (!response.ok) {
      CACHE$1.set(cacheKey, null);
      return null;
    }
    const data = await response.json();
    const geocode = (_a = data.geocodes) == null ? void 0 : _a[0];
    if (data.status !== "1" || !(geocode == null ? void 0 : geocode.location)) {
      CACHE$1.set(cacheKey, null);
      return null;
    }
    const coords = parseLocation(geocode.location);
    if (!coords) {
      CACHE$1.set(cacheKey, null);
      return null;
    }
    CACHE$1.set(cacheKey, coords);
    return {
      label: ((_b = geocode.formatted_address) == null ? void 0 : _b.trim()) || trimmed,
      longitude: coords.longitude,
      latitude: coords.latitude
    };
  } catch {
    CACHE$1.set(cacheKey, null);
    return null;
  }
}
async function amapPlaceTextSearch(keywords, city) {
  var _a, _b, _c, _d;
  const key = getAmapWebServiceKey();
  const trimmed = keywords.trim();
  if (!key || !trimmed) {
    return null;
  }
  const params = new URLSearchParams({
    key,
    keywords: trimmed,
    offset: "1",
    page: "1",
    extensions: "base",
    output: "JSON"
  });
  if (city == null ? void 0 : city.trim()) {
    params.set("city", city.trim());
    params.set("citylimit", "true");
  }
  try {
    const response = await fetch(`${PLACE_TEXT_URL}?${params.toString()}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    const poi = (_a = data.pois) == null ? void 0 : _a[0];
    if (data.status !== "1" || !(poi == null ? void 0 : poi.location)) {
      return null;
    }
    const coords = parseLocation(poi.location);
    if (!coords) {
      return null;
    }
    const addressPart = (_b = poi.address) == null ? void 0 : _b.trim();
    const label = addressPart ? `${((_c = poi.name) == null ? void 0 : _c.trim()) || trimmed}（${addressPart}）` : ((_d = poi.name) == null ? void 0 : _d.trim()) || trimmed;
    return { label, longitude: coords.longitude, latitude: coords.latitude };
  } catch {
    return null;
  }
}
async function amapGeocodePlaces(queries, options = {}) {
  const unique = [...new Set(queries.map((q) => q.trim()).filter(Boolean))];
  const result = /* @__PURE__ */ new Map();
  const batchSize = 4;
  for (let index = 0; index < unique.length; index += batchSize) {
    const batch = unique.slice(index, index + batchSize);
    const pairs = await Promise.all(
      batch.map(async (query) => [query, await amapGeocodePlace(query, options)])
    );
    pairs.forEach(([query, coords]) => {
      result.set(query, coords);
    });
  }
  return result;
}
async function amapReverseGeocodePlace(longitude, latitude) {
  var _a, _b;
  const key = getAmapKey();
  if (!key) {
    return null;
  }
  const cacheKey = `amap|${longitude.toFixed(5)},${latitude.toFixed(5)}`;
  if (REVERSE_CACHE$1.has(cacheKey)) {
    return REVERSE_CACHE$1.get(cacheKey) ?? null;
  }
  const params = new URLSearchParams({
    key,
    location: `${longitude},${latitude}`,
    output: "JSON",
    extensions: "base"
  });
  try {
    const response = await fetch(`${REGEO_URL}?${params.toString()}`);
    if (!response.ok) {
      REVERSE_CACHE$1.set(cacheKey, null);
      return null;
    }
    const data = await response.json();
    if (data.status !== "1" || !((_a = data.regeocode) == null ? void 0 : _a.formatted_address)) {
      REVERSE_CACHE$1.set(cacheKey, null);
      return null;
    }
    const formatted = data.regeocode.formatted_address;
    const result = {
      placeName: shortPlaceName(formatted),
      coordinates: { longitude, latitude },
      countryCode: ((_b = data.regeocode.addressComponent) == null ? void 0 : _b.country) === "中国" ? "CN" : void 0
    };
    REVERSE_CACHE$1.set(cacheKey, result);
    return result;
  } catch {
    REVERSE_CACHE$1.set(cacheKey, null);
    return null;
  }
}
const CHENGDU = "成都";
const NANJING = "南京";
const HANGZHOU = "杭州";
const BEIJING = "北京";
const RULES = [
  { pattern: /锦城湖/, entry: { label: "锦城湖", lng: 104.0433, lat: 30.5742 }, cities: [CHENGDU] },
  { pattern: /宽窄巷子/, entry: { label: "宽窄巷子", lng: 104.0531, lat: 30.6635 }, cities: [CHENGDU] },
  { pattern: /春熙路|太古里|IFS|国际金融中心/, entry: { label: "春熙路商圈", lng: 104.0815, lat: 30.6573 }, cities: [CHENGDU] },
  { pattern: /武侯祠/, entry: { label: "武侯祠", lng: 104.0488, lat: 30.6469 }, cities: [CHENGDU] },
  { pattern: /锦里/, entry: { label: "锦里古街", lng: 104.049, lat: 30.6453 }, cities: [CHENGDU] },
  { pattern: /杜甫草堂|浣花溪/, entry: { label: "杜甫草堂", lng: 104.0302, lat: 30.6601 }, cities: [CHENGDU] },
  { pattern: /大熊猫|熊猫基地/, entry: { label: "成都大熊猫繁育研究基地", lng: 104.1419, lat: 30.7347 }, cities: [CHENGDU] },
  { pattern: /铁像寺/, entry: { label: "铁像寺水街", lng: 104.0412, lat: 30.5868 }, cities: [CHENGDU] },
  { pattern: /大源中央公园|大源/, entry: { label: "大源中央公园", lng: 104.0445, lat: 30.5518 }, cities: [CHENGDU] },
  { pattern: /四川大学.*江安|江安校区/, entry: { label: "四川大学江安校区", lng: 104.0067, lat: 30.574 }, cities: [CHENGDU] },
  { pattern: /青城山/, entry: { label: "青城山", lng: 103.5672, lat: 30.9001 }, cities: [CHENGDU] },
  { pattern: /都江堰/, entry: { label: "都江堰景区", lng: 103.6238, lat: 30.9983 }, cities: [CHENGDU] },
  { pattern: /文殊院/, entry: { label: "文殊院", lng: 104.0734, lat: 30.6712 }, cities: [CHENGDU] },
  { pattern: /东郊记忆/, entry: { label: "东郊记忆", lng: 104.123, lat: 30.6698 }, cities: [CHENGDU] },
  { pattern: /环球中心/, entry: { label: "环球中心", lng: 104.0638, lat: 30.5702 }, cities: [CHENGDU] },
  { pattern: /人民公园|鹤鸣茶社/, entry: { label: "人民公园", lng: 104.0559, lat: 30.6624 }, cities: [CHENGDU] },
  { pattern: /天府广场/, entry: { label: "天府广场", lng: 104.0657, lat: 30.6572 }, cities: [CHENGDU] },
  { pattern: /九眼桥/, entry: { label: "九眼桥", lng: 104.0864, lat: 30.6411 }, cities: [CHENGDU] },
  { pattern: /锦城公园/, entry: { label: "锦城公园", lng: 104.0485, lat: 30.5785 }, cities: [CHENGDU] },
  { pattern: /中和湿地/, entry: { label: "中和湿地公园", lng: 104.0895, lat: 30.5485 }, cities: [CHENGDU] },
  { pattern: /夫子庙/, entry: { label: "夫子庙", lng: 118.7942, lat: 32.0215 }, cities: [NANJING] },
  { pattern: /中山陵/, entry: { label: "中山陵", lng: 118.8489, lat: 32.059 }, cities: [NANJING] },
  { pattern: /玄武湖/, entry: { label: "玄武湖", lng: 118.7972, lat: 32.074 }, cities: [NANJING] },
  { pattern: /鸡鸣寺/, entry: { label: "鸡鸣寺", lng: 118.7955, lat: 32.0608 }, cities: [NANJING] },
  { pattern: /西湖(?!区)/, entry: { label: "西湖", lng: 120.1485, lat: 30.2425 }, cities: [HANGZHOU] },
  { pattern: /灵隐寺/, entry: { label: "灵隐寺", lng: 120.1012, lat: 30.2408 }, cities: [HANGZHOU] },
  { pattern: /河坊街/, entry: { label: "河坊街", lng: 120.1692, lat: 30.2398 }, cities: [HANGZHOU] },
  { pattern: /故宫/, entry: { label: "故宫博物院", lng: 116.3971, lat: 39.9175 }, cities: [BEIJING] },
  { pattern: /天安门/, entry: { label: "天安门广场", lng: 116.3975, lat: 39.9087 }, cities: [BEIJING] },
  { pattern: /颐和园/, entry: { label: "颐和园", lng: 116.2752, lat: 39.9998 }, cities: [BEIJING] },
  { pattern: /天坛/, entry: { label: "天坛公园", lng: 116.4069, lat: 39.8819 }, cities: [BEIJING] },
  { pattern: /南锣鼓巷/, entry: { label: "南锣鼓巷", lng: 116.4032, lat: 39.9365 }, cities: [BEIJING] }
];
function normalizeCityToken(city) {
  const trimmed = city == null ? void 0 : city.trim();
  if (!trimmed) {
    return void 0;
  }
  return trimmed.replace(/市$/, "");
}
function cityMatches(rule, city) {
  var _a;
  if (!((_a = rule.cities) == null ? void 0 : _a.length)) {
    return true;
  }
  const cityCore = normalizeCityToken(city);
  if (!cityCore) {
    return true;
  }
  return rule.cities.some((name) => cityCore.includes(name) || name.includes(cityCore));
}
function matchKnownPlanLocationFallback(query, city) {
  const trimmed = query.trim();
  if (!trimmed) {
    return null;
  }
  for (const rule of RULES) {
    if (!cityMatches(rule, city)) {
      continue;
    }
    if (rule.pattern.test(trimmed)) {
      return rule.entry;
    }
  }
  return null;
}
function resolveKnownPlanLocationFallback(query, city) {
  const trimmed = query.trim();
  if (!trimmed) {
    return null;
  }
  const direct = matchKnownPlanLocationFallback(trimmed, city);
  if (direct) {
    return direct;
  }
  const segments = trimmed.split(/[·•|｜/\\-–—]/).map((part) => part.trim()).filter(Boolean);
  for (const segment of segments) {
    const hit = matchKnownPlanLocationFallback(segment, city);
    if (hit) {
      return hit;
    }
  }
  return null;
}
const PLAN_GEO_CACHE = /* @__PURE__ */ new Map();
const PLAN_GEO_TIMEOUT_MS = 6e3;
const PLAN_GEO_CONCURRENCY = 3;
function planCacheKey(query, city) {
  return `plan|${query.trim()}|${(city == null ? void 0 : city.trim()) ?? ""}`;
}
async function mapWithConcurrency(items, concurrency, mapper) {
  if (items.length === 0) {
    return [];
  }
  const results = new Array(items.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < items.length) {
      const current = nextIndex;
      nextIndex += 1;
      results[current] = await mapper(items[current], current);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker())
  );
  return results;
}
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((resolve) => {
      window.setTimeout(() => resolve(null), ms);
    })
  ]);
}
async function geocodeWithAmapJsSdk(query, city, cityCore) {
  const fromPoi = await withTimeout(
    forwardGeocodeWithAmapPlaceSearch(query, cityCore, PLAN_GEO_TIMEOUT_MS).then(
      (result) => result ? { longitude: result.lng, latitude: result.lat } : null
    ),
    PLAN_GEO_TIMEOUT_MS + 300
  );
  if (fromPoi) {
    return fromPoi;
  }
  return withTimeout(
    forwardGeocodeWithAmapGeocoder(query, {
      city: city ?? cityCore,
      timeoutMs: PLAN_GEO_TIMEOUT_MS
    }).then((result) => result ? { longitude: result.lng, latitude: result.lat } : null),
    PLAN_GEO_TIMEOUT_MS + 300
  );
}
async function geocodeSinglePlanPlace(query, city, cityCore, options = {}) {
  const cacheKey = planCacheKey(query, city);
  if (PLAN_GEO_CACHE.has(cacheKey)) {
    return PLAN_GEO_CACHE.get(cacheKey) ?? null;
  }
  const enriched = city ? buildPlanLocationGeocodeQuery(query, city) : query;
  const known = resolveKnownPlanLocationFallback(enriched, city) ?? resolveKnownPlanLocationFallback(query, city);
  if (known) {
    const coords2 = { longitude: known.lng, latitude: known.lat };
    PLAN_GEO_CACHE.set(cacheKey, coords2);
    return coords2;
  }
  let coords = await geocodeWithAmapJsSdk(enriched, city, cityCore) ?? (enriched !== query ? await geocodeWithAmapJsSdk(query, city, cityCore) : null);
  if (!coords && cityCore) {
    coords = await withTimeout(
      amapPlaceTextSearch(enriched, cityCore).then(
        (result) => result ? { longitude: result.longitude, latitude: result.latitude } : null
      ),
      PLAN_GEO_TIMEOUT_MS
    );
    if (!coords && enriched !== query) {
      coords = await withTimeout(
        amapPlaceTextSearch(query, cityCore).then(
          (result) => result ? { longitude: result.longitude, latitude: result.latitude } : null
        ),
        PLAN_GEO_TIMEOUT_MS
      );
    }
  }
  if (!coords) {
    const fromServer = await fetchServerOriginGeocode(enriched, city);
    if (fromServer) {
      coords = { longitude: fromServer.lng, latitude: fromServer.lat };
    }
  }
  if (!coords && enriched !== query) {
    const fromServerRaw = await fetchServerOriginGeocode(query, city);
    if (fromServerRaw) {
      coords = { longitude: fromServerRaw.lng, latitude: fromServerRaw.lat };
    }
  }
  if (!coords) {
    const labeled = await amapGeocodePlaceWithLabel(enriched, city, options) ?? (enriched !== query ? await amapGeocodePlaceWithLabel(query, city, options) : null);
    if (labeled) {
      coords = { longitude: labeled.longitude, latitude: labeled.latitude };
    }
  }
  PLAN_GEO_CACHE.set(cacheKey, coords);
  return coords;
}
async function amapGeocodePlanPlaces(queries, options = {}) {
  var _a;
  const unique = [...new Set(queries.map((query) => query.trim()).filter(Boolean))];
  const result = /* @__PURE__ */ new Map();
  if (unique.length === 0) {
    return result;
  }
  const city = (_a = options.city) == null ? void 0 : _a.trim();
  const cityCore = city == null ? void 0 : city.replace(/市$/, "");
  await loadAmap().catch(() => void 0);
  const pairs = await mapWithConcurrency(unique, PLAN_GEO_CONCURRENCY, async (query) => {
    const coords = await geocodeSinglePlanPlace(query, city, cityCore, options);
    return [query, coords];
  });
  pairs.forEach(([query, coords]) => {
    result.set(query, coords);
  });
  return result;
}
const GEOCODE_BASE = "https://api.mapbox.com/geocoding/v5/mapbox.places";
const CACHE = /* @__PURE__ */ new Map();
const REVERSE_CACHE = /* @__PURE__ */ new Map();
function buildCacheKey(query, proximity) {
  const prox = proximity ? `${proximity.longitude},${proximity.latitude}` : "";
  return `${query.trim()}|${prox}`;
}
async function geocodePlace$1(query, { token, proximity, limit = 1 }) {
  var _a;
  const trimmed = query.trim();
  if (!trimmed) {
    return null;
  }
  const cacheKey = buildCacheKey(trimmed, proximity);
  if (CACHE.has(cacheKey)) {
    return CACHE.get(cacheKey) ?? null;
  }
  const pathSegment = encodeURIComponent(trimmed);
  const params = new URLSearchParams({
    access_token: token,
    limit: String(limit),
    language: "zh",
    country: "cn"
  });
  if (proximity) {
    params.set("proximity", `${proximity.longitude},${proximity.latitude}`);
  }
  const url = `${GEOCODE_BASE}/${pathSegment}.json?${params.toString()}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      CACHE.set(cacheKey, null);
      return null;
    }
    const data = await response.json();
    const feature = (_a = data.features) == null ? void 0 : _a[0];
    if (!(feature == null ? void 0 : feature.center) || feature.center.length < 2) {
      CACHE.set(cacheKey, null);
      return null;
    }
    const [longitude, latitude] = feature.center;
    const coords = { longitude, latitude };
    CACHE.set(cacheKey, coords);
    return coords;
  } catch {
    CACHE.set(cacheKey, null);
    return null;
  }
}
async function geocodePlaces$1(queries, options) {
  const unique = [...new Set(queries.map((q) => q.trim()).filter(Boolean))];
  const result = /* @__PURE__ */ new Map();
  const batchSize = 4;
  const batches = [];
  for (let index = 0; index < unique.length; index += batchSize) {
    batches.push(unique.slice(index, index + batchSize));
  }
  const batchResults = await Promise.all(
    batches.map(
      (batch) => Promise.all(
        batch.map(async (query) => {
          const coords = await geocodePlace$1(query, options);
          return [query, coords];
        })
      )
    )
  );
  batchResults.flat().forEach(([query, coords]) => {
    result.set(query, coords);
  });
  return result;
}
function extractCountryCode(feature) {
  var _a, _b;
  const country = (_a = feature == null ? void 0 : feature.context) == null ? void 0 : _a.find((item) => item.id.startsWith("country."));
  const code = (_b = country == null ? void 0 : country.short_code) == null ? void 0 : _b.toUpperCase();
  if (!code) {
    return void 0;
  }
  return code.length > 2 ? code.slice(0, 2) : code;
}
async function reverseGeocodePlace$1(longitude, latitude, token) {
  var _a, _b;
  const cacheKey = `${longitude.toFixed(5)},${latitude.toFixed(5)}`;
  if (REVERSE_CACHE.has(cacheKey)) {
    return REVERSE_CACHE.get(cacheKey) ?? null;
  }
  const params = new URLSearchParams({
    access_token: token,
    language: "zh",
    limit: "1"
  });
  const url = `${GEOCODE_BASE}/${longitude},${latitude}.json?${params.toString()}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      REVERSE_CACHE.set(cacheKey, null);
      return null;
    }
    const data = await response.json();
    const feature = (_a = data.features) == null ? void 0 : _a[0];
    if (!(feature == null ? void 0 : feature.center) || feature.center.length < 2) {
      REVERSE_CACHE.set(cacheKey, null);
      return null;
    }
    const [lng, lat] = feature.center;
    const coordinates = { longitude: lng, latitude: lat };
    const shortLabel = ((_b = feature.place_name.split(",")[0]) == null ? void 0 : _b.trim()) || feature.place_name;
    const result = {
      placeName: shortLabel,
      coordinates,
      countryCode: extractCountryCode(feature)
    };
    REVERSE_CACHE.set(cacheKey, result);
    return result;
  } catch {
    REVERSE_CACHE.set(cacheKey, null);
    return null;
  }
}
async function geocodePlace(query, options = {}) {
  const provider = resolveMapProvider();
  if (provider === "amap") {
    return amapGeocodePlace(query, options);
  }
  if (provider === "mapbox") {
    const token = getMapboxToken();
    if (!token) {
      return null;
    }
    return geocodePlace$1(query, { token, ...options, limit: options.limit ?? 1 });
  }
  return null;
}
async function geocodePlaces(queries, options = {}) {
  const provider = resolveMapProvider();
  if (provider === "amap") {
    return amapGeocodePlaces(queries, options);
  }
  if (provider === "mapbox") {
    const token = getMapboxToken();
    if (!token) {
      return /* @__PURE__ */ new Map();
    }
    return geocodePlaces$1(queries, { token, ...options });
  }
  return /* @__PURE__ */ new Map();
}
async function geocodePlanPlaces(queries, options = {}) {
  const provider = resolveMapProvider();
  if (provider === "amap") {
    return amapGeocodePlanPlaces(queries, options);
  }
  return geocodePlaces(queries, options);
}
async function reverseGeocodePlace(longitude, latitude) {
  const provider = resolveMapProvider();
  if (provider === "amap") {
    return amapReverseGeocodePlace(longitude, latitude);
  }
  if (provider === "mapbox") {
    const token = getMapboxToken();
    if (!token) {
      return null;
    }
    return reverseGeocodePlace$1(longitude, latitude, token);
  }
  return null;
}
function distanceKm(a, b) {
  const latMid = (a.latitude + b.latitude) / 2 * (Math.PI / 180);
  const dx = (a.longitude - b.longitude) * 111 * Math.cos(latMid);
  const dy = (a.latitude - b.latitude) * 111;
  return Math.hypot(dx, dy);
}
function isWithinPlanRegion(coords, anchor, maxKm = 120) {
  return distanceKm(coords, anchor) <= maxKm;
}
function filterMapViewportPoints(points, anchor, maxKm = 120) {
  const geocoded = points.filter((point) => point.geocoded);
  if (geocoded.length === 0) {
    return points;
  }
  const inRegion = geocoded.filter(
    (point) => isWithinPlanRegion(
      { longitude: point.longitude, latitude: point.latitude },
      anchor,
      maxKm
    )
  );
  if (inRegion.length >= 2) {
    return inRegion;
  }
  if (inRegion.length === 1) {
    return inRegion;
  }
  if (geocoded.length >= 2) {
    return geocoded;
  }
  return points;
}
const TRANSIT_ROUTE_PATTERNS = [
  /家门口/,
  /出发地/,
  /返程/,
  /回程/,
  /返回(?:家|城|市|济南|临清|成都|杭州|南京)/,
  /(?:西|东|南|北)?(?:高铁)?站$/,
  /(?:高铁|火车|动车|城际)(?:站|枢纽)?/,
  /(?:国际)?机场|航站楼|候机楼/,
  /(?:出发|抵达|到达|接站|送站)站/,
  /大交通/,
  /接驳(?:车|段)?/,
  /换乘枢纽/,
  /(?:G|D|K|Z|T|C)\d{1,4}(?:次)?(?:列车|高铁|动车)?/,
  /乘坐(?:高铁|动车|火车|飞机|航班)/,
  /(?:济南|临清|成都|杭州|南京|北京|上海)(?:西|东|南|北)?站/,
  /酒店(?:接站|入住|放行李)/,
  /住宿区(?:接站|入住)?/
];
function routeStopText(point) {
  return [point.name, point.location, point.description, point.dayTitle].filter(Boolean).join(" ");
}
function isTransitRouteStop(point) {
  const text = routeStopText(point);
  return TRANSIT_ROUTE_PATTERNS.some((pattern) => pattern.test(text));
}
function matchCityNameInText(text) {
  const trimmed = text == null ? void 0 : text.trim();
  if (!trimmed) {
    return void 0;
  }
  return Object.keys(CITY_COORDINATES).find((name) => trimmed.includes(name));
}
function shouldUseGuideCityCenter(destination, guideId) {
  const trimmed = destination.trim();
  if (!trimmed || trimmed === "目的地") {
    return true;
  }
  const guideCity = GUIDE_ID_TO_CITY[guideId];
  if (!guideCity) {
    return false;
  }
  const destCore = trimmed.replace(/市$/, "");
  const guideCore = guideCity.replace(/市$/, "");
  return trimmed.includes(guideCore) || destCore === guideCore;
}
function getPlanBaseCenter(plan) {
  const destination = getPlanDestination(plan);
  const fromDestination = getCityCoordinates(destination);
  if (fromDestination) {
    return fromDestination;
  }
  const fromTitle = matchCityNameInText(plan.title) ?? matchCityNameInText(plan.summary) ?? matchCityNameInText(destination);
  if (fromTitle) {
    const coords = getCityCoordinates(fromTitle);
    if (coords) {
      return coords;
    }
  }
  const extractedCity = extractCityFromPlanText(destination) ?? extractCityFromPlanText(plan.title) ?? extractCityFromPlanText(plan.summary);
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
    latitude: DEFAULT_MAP_VIEW.latitude
  };
}
function offsetCoordinate(base, index) {
  const angle = index * 137.5 % 360 * (Math.PI / 180);
  const distance = 6e-3 + index % 4 * 25e-4;
  return {
    longitude: base.longitude + Math.cos(angle) * distance,
    latitude: base.latitude + Math.sin(angle) * distance
  };
}
function resolveActivityCoordinate(activity, plan, globalIndex) {
  if (activity.coordinates) {
    return { coords: activity.coordinates, geocoded: true };
  }
  const fromLocation = activity.location ? getCityCoordinatesFromLocation(activity.location) : void 0;
  const base = fromLocation ?? getPlanBaseCenter(plan);
  return { coords: offsetCoordinate(base, globalIndex), geocoded: false };
}
function buildPlanMapPoints(plan) {
  const points = [];
  let order = 0;
  plan.dailyPlans.forEach((day) => {
    day.activities.forEach((activity, activityIndex) => {
      var _a, _b;
      const { coords, geocoded } = resolveActivityCoordinate(activity, plan, order);
      const name = ((_b = (_a = activity.location) == null ? void 0 : _a.split("·")[0]) == null ? void 0 : _b.trim()) || activity.description.slice(0, 24) || `活动 ${order + 1}`;
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
        geocoded
      });
      order += 1;
    });
  });
  return points;
}
function getMapDisplayPoints(points, anchor, maxRegionKm = 120) {
  const candidates = points.filter((point) => !isTransitRouteStop(point));
  if (!anchor || candidates.length === 0) {
    return candidates;
  }
  const inRegion = candidates.filter(
    (point) => isWithinPlanRegion(
      { longitude: point.longitude, latitude: point.latitude },
      anchor,
      maxRegionKm
    )
  );
  if (inRegion.length >= 1) {
    return inRegion;
  }
  return candidates;
}
const MUNICIPALITIES = /* @__PURE__ */ new Set(["北京", "上海", "天津", "重庆"]);
function toAmapCityParam(cityName) {
  return MUNICIPALITIES.has(cityName) ? cityName : `${cityName.replace(/市$/, "")}市`;
}
function extractCityFromPlanText(text) {
  const trimmed = text == null ? void 0 : text.trim();
  if (!trimmed) {
    return void 0;
  }
  const inferred = inferCityFromAddress(trimmed);
  if (inferred) {
    return inferred.replace(/市$/, "");
  }
  const citySuffix = trimmed.match(/([\u4e00-\u9fa5]{2,6})市/);
  if (citySuffix == null ? void 0 : citySuffix[1]) {
    return citySuffix[1];
  }
  return Object.keys(CITY_COORDINATES).find((name) => trimmed.includes(name));
}
function resolvePlanGeocodeCity(plan) {
  const candidates = [
    getPlanDestination(plan),
    plan.title,
    plan.summary,
    ...plan.dailyPlans.flatMap(
      (day) => day.activities.map((activity) => {
        var _a;
        return (_a = activity.location) == null ? void 0 : _a.trim();
      }).filter(Boolean)
    )
  ];
  for (const candidate of candidates) {
    const trimmed = candidate == null ? void 0 : candidate.trim();
    if (!trimmed) {
      continue;
    }
    const inferred = inferCityFromAddress(trimmed);
    if (inferred) {
      return inferred;
    }
    const citySuffix = trimmed.match(/([\u4e00-\u9fa5]{2,6})市/);
    if (citySuffix == null ? void 0 : citySuffix[1]) {
      return toAmapCityParam(citySuffix[1]);
    }
    const matched = Object.keys(CITY_COORDINATES).find((name) => trimmed.includes(name));
    if (matched) {
      return toAmapCityParam(matched);
    }
  }
  return void 0;
}
function buildPlanLocationGeocodeQuery(location, city) {
  const trimmed = location.trim();
  if (!trimmed || !city) {
    return trimmed;
  }
  const cityCore = city.replace(/市$/, "");
  if (trimmed.includes(cityCore)) {
    return trimmed;
  }
  return `${cityCore}${trimmed}`;
}
function buildPlanLocationGeocodeVariants(location, city) {
  const trimmed = location.trim();
  if (!trimmed) {
    return [];
  }
  const variants = /* @__PURE__ */ new Set([trimmed]);
  const segments = trimmed.split(/[·•|｜/\\-–—]/).map((part) => part.trim()).filter(Boolean);
  for (const segment of segments) {
    variants.add(segment);
    const cleaned = segment.replace(/^(第?\d+天\s*[:：]?\s*|day\s*\d+\s*[:：]?\s*)/i, "").replace(/^(上午|下午|晚上|中午)\s*/u, "").trim();
    if (cleaned) {
      variants.add(cleaned);
    }
  }
  const cityCore = city == null ? void 0 : city.replace(/市$/, "");
  if (cityCore) {
    for (const variant of [...variants]) {
      if (!variant.includes(cityCore)) {
        variants.add(buildPlanLocationGeocodeQuery(variant, city));
      }
    }
  }
  return [...variants].filter((value) => value.length >= 2);
}
function collectUniqueLocations(plan) {
  const locations = /* @__PURE__ */ new Set();
  plan.dailyPlans.forEach((day) => {
    day.activities.forEach((activity) => {
      var _a;
      if (((_a = activity.location) == null ? void 0 : _a.trim()) && !activity.coordinates) {
        locations.add(activity.location.trim());
      }
    });
  });
  return [...locations];
}
function inferCityFromCoordinates(coords) {
  let nearest = null;
  for (const [name, cityCoords] of Object.entries(CITY_COORDINATES)) {
    const distance = distanceKm(coords, cityCoords);
    if (distance > 80) {
      continue;
    }
    if (!nearest || distance < nearest.distance) {
      nearest = { name, distance };
    }
  }
  return nearest ? toAmapCityParam(nearest.name) : void 0;
}
function resolveGeocodedCoords(location, geocoded, city, proximity) {
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
async function geocodeTravelPlan(plan) {
  const locations = collectUniqueLocations(plan);
  if (!hasMapService() || locations.length === 0) {
    return plan;
  }
  const proximity = getPlanBaseCenter(plan);
  const city = resolvePlanGeocodeCity(plan) ?? inferCityFromCoordinates(proximity);
  const querySet = /* @__PURE__ */ new Set();
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
        var _a;
        if (activity.coordinates || !((_a = activity.location) == null ? void 0 : _a.trim())) {
          return activity;
        }
        const coords = resolveGeocodedCoords(activity.location.trim(), geocoded, city, proximity);
        if (!coords) {
          return activity;
        }
        return { ...activity, coordinates: coords };
      })
    }))
  };
}
export {
  geocodeTravelPlan as a,
  buildPlanMapPoints as b,
  getMapDisplayPoints as c,
  getPlanBaseCenter as d,
  extractCityFromPlanText as e,
  filterMapViewportPoints as f,
  geocodePlace as g,
  reverseGeocodePlace as r
};
