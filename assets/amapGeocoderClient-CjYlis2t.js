import { r as resolveKnownOriginFallback, i as isCoarseLixiaDistrictCenter } from "./knownOriginFallbacks-BTkbXw-0.js";
import { f as AMapLoader, e7 as resolveAmapDestinationLabel, e8 as resolveAmapOriginLabel, e9 as resolveAmapPlaceName } from "./index-DwV1qlqh.js";
import { g as getAmapKey, c as configureAmapSecurity } from "./provider-CMJI8edA.js";
function inferCityFromAddress(address) {
  const trimmed = address.trim();
  if (!trimmed) {
    return void 0;
  }
  const direct = trimmed.match(
    /(北京|上海|天津|重庆|广州|深圳|杭州|南京|武汉|成都|西安|苏州|青岛|济南|福州|厦门|长沙|郑州|沈阳|哈尔滨|昆明|南宁|合肥|宁波|无锡|东莞|佛山|温州|泉州|莆田|聊城|临清|烟台|淄博|潍坊|临沂|济宁|泰安|威海|日照|菏泽|德州|滨州|枣庄|东营)(?:市)?/
  );
  if (direct == null ? void 0 : direct[1]) {
    const name = direct[1];
    return /^(北京|上海|天津|重庆)$/.test(name) ? name : `${name}市`;
  }
  if (/历下|市中|槐荫|天桥|历城|章丘|长清|莱芜/.test(trimmed)) {
    return "济南市";
  }
  if (/武侯|锦江|高新|青羊|金牛|成华|龙泉驿|双流|郫都|温江|天府|大源|春熙|宽窄|锦里|太古里/.test(trimmed)) {
    return "成都市";
  }
  return void 0;
}
function isPoiLikeOriginQuery(address) {
  return /小区|花园|苑|园|广场|大厦|中心|宿舍|公寓|城|里|村|社区|家园|府|居|庭|湾|谷|小镇/.test(
    address
  );
}
function buildOriginAddressVariants(address) {
  const trimmed = address.trim();
  if (!trimmed) {
    return [];
  }
  const variants = /* @__PURE__ */ new Set([trimmed]);
  const withoutLetterZone = trimmed.replace(/[A-Za-z]区$/u, "").trim();
  if (withoutLetterZone) {
    variants.add(withoutLetterZone);
  }
  const gardenMatch = trimmed.match(/([\u4e00-\u9fa5]{2,}(?:花园|小区|苑|家园|府|庭|湾|城))/);
  if (gardenMatch == null ? void 0 : gardenMatch[1]) {
    variants.add(gardenMatch[1]);
    const city = inferCityFromAddress(trimmed);
    if (city) {
      variants.add(`${city.replace(/市$/, "")}${gardenMatch[1]}`);
    }
  }
  return [...variants];
}
async function fetchServerOriginGeocode(address, city) {
  const trimmed = address.trim();
  if (!trimmed) {
    return null;
  }
  const params = new URLSearchParams({ address: trimmed });
  const resolvedCity = (city == null ? void 0 : city.trim()) || inferCityFromAddress(trimmed);
  if (resolvedCity) {
    params.set("city", resolvedCity);
  }
  try {
    const response = await fetch(`/api/map/geocode-origin?${params.toString()}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    if (typeof data.label !== "string" || typeof data.lng !== "number" || typeof data.lat !== "number") {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}
let loadPromise = null;
function loadAmap() {
  const key = getAmapKey();
  if (!key) {
    return Promise.reject(new Error("未配置 VITE_AMAP_KEY"));
  }
  if (!loadPromise) {
    configureAmapSecurity();
    loadPromise = AMapLoader.load({
      key,
      version: "2.0",
      plugins: ["AMap.Scale", "AMap.ToolBar", "AMap.Polyline", "AMap.Marker", "AMap.InfoWindow", "AMap.Geocoder", "AMap.PlaceSearch"]
    });
  }
  return loadPromise;
}
function readRegeocodePayload(result) {
  if (!(result == null ? void 0 : result.regeocode)) {
    return null;
  }
  return result.regeocode;
}
async function reverseGeocodeWithAmapGeocoder(longitude, latitude) {
  const labels = await reverseGeocodeAmapLabels(longitude, latitude);
  return (labels == null ? void 0 : labels.nearbyLabel) ?? null;
}
async function reverseGeocodeAmapLabels(longitude, latitude) {
  const AMapNS = await loadAmap();
  const GEOCODE_TIMEOUT_MS = 1e4;
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
      if (settled) {
        return;
      }
      settled = true;
      window.clearTimeout(timer);
      resolve(value);
    };
    const timer = window.setTimeout(() => finish(null), GEOCODE_TIMEOUT_MS);
    const geocoder = new AMapNS.Geocoder({
      city: "全国",
      radius: 800,
      extensions: "all"
    });
    geocoder.getAddress([longitude, latitude], (status, result) => {
      if (status !== "complete") {
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
        destinationLabel: resolveAmapDestinationLabel(payload)
      });
    });
  });
}
async function forwardGeocodeWithAmapPlaceSearch(keyword, city, timeoutMs = 1e4) {
  const trimmed = keyword.trim();
  if (!trimmed) {
    return null;
  }
  const AMapNS = await loadAmap();
  const cityLimit = city ?? inferCityFromAddress(trimmed) ?? "全国";
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
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
      citylimit: cityLimit !== "全国",
      pageSize: 1,
      extensions: "base"
    });
    placeSearch.search(trimmed, (status, result) => {
      var _a, _b, _c, _d, _e;
      if (status !== "complete") {
        finish(null);
        return;
      }
      const poi = (_b = (_a = result == null ? void 0 : result.poiList) == null ? void 0 : _a.pois) == null ? void 0 : _b[0];
      const location = poi == null ? void 0 : poi.location;
      if (!location) {
        finish(null);
        return;
      }
      const lng = typeof location.getLng === "function" ? location.getLng() : location.lng;
      const lat = typeof location.getLat === "function" ? location.getLat() : location.lat;
      if (lng == null || lat == null || !Number.isFinite(lng) || !Number.isFinite(lat)) {
        finish(null);
        return;
      }
      const addressPart = (_c = poi.address) == null ? void 0 : _c.trim();
      const label = addressPart ? `${((_d = poi.name) == null ? void 0 : _d.trim()) || trimmed}（${addressPart}）` : ((_e = poi.name) == null ? void 0 : _e.trim()) || trimmed;
      finish({ label, lng, lat });
    });
  });
}
async function forwardGeocodeWithAmapGeocoder(address, options) {
  const trimmed = address.trim();
  if (!trimmed) {
    return null;
  }
  const city = (options == null ? void 0 : options.city) ?? inferCityFromAddress(trimmed) ?? "全国";
  const timeoutMs = (options == null ? void 0 : options.timeoutMs) ?? 1e4;
  if (isPoiLikeOriginQuery(trimmed)) {
    const fromPoi = await forwardGeocodeWithAmapPlaceSearch(trimmed, city, timeoutMs);
    if (fromPoi) {
      return fromPoi;
    }
  }
  const AMapNS = await loadAmap();
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
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
      var _a, _b;
      if (status !== "complete") {
        finish(null);
        return;
      }
      const geocode = (_a = result.geocodes) == null ? void 0 : _a[0];
      const location = geocode == null ? void 0 : geocode.location;
      if (!location) {
        finish(null);
        return;
      }
      const lng = typeof location.getLng === "function" ? location.getLng() : location.lng;
      const lat = typeof location.getLat === "function" ? location.getLat() : location.lat;
      if (lng == null || lat == null || !Number.isFinite(lng) || !Number.isFinite(lat)) {
        finish(null);
        return;
      }
      finish({
        label: ((_b = geocode.formattedAddress) == null ? void 0 : _b.trim()) || trimmed,
        lng,
        lat
      });
    });
  });
}
function preferKnownOriginOverCoarseGeocode(address, variants, result) {
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
async function resolveOriginAddressToCoords(address) {
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
    }
  }
  for (const variant of variants) {
    const fromServer = await fetchServerOriginGeocode(variant);
    if (fromServer) {
      return preferKnownOriginOverCoarseGeocode(address, variants, fromServer);
    }
  }
  for (const variant of variants) {
    const fallback2 = resolveKnownOriginFallback(variant);
    if (fallback2) {
      return { label: fallback2.label, lng: fallback2.lng, lat: fallback2.lat };
    }
  }
  const fallback = resolveKnownOriginFallback(address);
  if (fallback) {
    return { label: fallback.label, lng: fallback.lng, lat: fallback.lat };
  }
  return null;
}
export {
  forwardGeocodeWithAmapGeocoder as a,
  forwardGeocodeWithAmapPlaceSearch as b,
  reverseGeocodeAmapLabels as c,
  reverseGeocodeWithAmapGeocoder as d,
  fetchServerOriginGeocode as f,
  inferCityFromAddress as i,
  loadAmap as l,
  resolveOriginAddressToCoords as r
};
