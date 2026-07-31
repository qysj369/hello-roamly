import { e0 as readEnv } from "./index-DwV1qlqh.js";
import { n as normalizeMapCredential } from "./credentials-BlGlDwm4.js";
function getAmapKey() {
  return normalizeMapCredential(readEnv("VITE_AMAP_KEY"));
}
function getAmapWebServiceKey() {
  return normalizeMapCredential(readEnv("VITE_AMAP_WEB_SERVICE_KEY")) ?? getAmapKey();
}
function getAmapSecurityCode() {
  return normalizeMapCredential(readEnv("VITE_AMAP_SECURITY_CODE"));
}
const DEFAULT_AMAP_VIEW = {
  longitude: 116.4074,
  latitude: 39.9042,
  zoom: 10
};
function configureAmapSecurity() {
  const code = getAmapSecurityCode();
  if (!code || typeof window === "undefined") {
    return;
  }
  window._AMapSecurityConfig = { securityJsCode: code };
}
function getMapboxToken() {
  return normalizeMapCredential(readEnv("VITE_MAPBOX_TOKEN"));
}
const DEFAULT_MAP_VIEW = {
  longitude: 116.4074,
  latitude: 39.9042,
  zoom: 10
};
function getMapProviderMode() {
  var _a;
  const raw = (_a = readEnv("VITE_MAP_PROVIDER")) == null ? void 0 : _a.toLowerCase();
  if (raw === "amap" || raw === "mapbox") {
    return raw;
  }
  return "auto";
}
function hasAmapCredentials() {
  return Boolean(getAmapKey() && getAmapSecurityCode());
}
function hasMapboxCredentials() {
  return Boolean(getMapboxToken());
}
function hasMapService() {
  const mode = getMapProviderMode();
  if (mode === "amap") {
    return hasAmapCredentials();
  }
  if (mode === "mapbox") {
    return hasMapboxCredentials();
  }
  return hasAmapCredentials() || hasMapboxCredentials();
}
function resolveMapProvider() {
  const mode = getMapProviderMode();
  if (mode === "amap") {
    return hasAmapCredentials() ? "amap" : null;
  }
  if (mode === "mapbox") {
    return hasMapboxCredentials() ? "mapbox" : null;
  }
  if (hasAmapCredentials()) {
    return "amap";
  }
  if (hasMapboxCredentials()) {
    return "mapbox";
  }
  return null;
}
function getMapProviderLabel(provider) {
  return provider === "amap" ? "高德地图" : "Mapbox";
}
export {
  DEFAULT_AMAP_VIEW as D,
  DEFAULT_MAP_VIEW as a,
  getAmapWebServiceKey as b,
  configureAmapSecurity as c,
  getMapProviderLabel as d,
  getMapProviderMode as e,
  getMapboxToken as f,
  getAmapKey as g,
  hasAmapCredentials as h,
  hasMapService as i,
  hasMapboxCredentials as j,
  resolveMapProvider as r
};
