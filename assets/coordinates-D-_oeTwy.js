import { r as resolveMapProvider } from "./provider-CMJI8edA.js";
const PI = Math.PI;
const AXIS = 6378245;
const EE = 0.006693421622965943;
function outOfChina(longitude, latitude) {
  return longitude < 72.004 || longitude > 137.8347 || latitude < 0.8293 || latitude > 55.8271;
}
function transformLat(longitude, latitude) {
  let ret = -100 + 2 * longitude + 3 * latitude + 0.2 * latitude * latitude + 0.1 * longitude * latitude + 0.2 * Math.sqrt(Math.abs(longitude));
  ret += (20 * Math.sin(6 * longitude * PI) + 20 * Math.sin(2 * longitude * PI)) * 2 / 3;
  ret += (20 * Math.sin(latitude * PI) + 40 * Math.sin(latitude / 3 * PI)) * 2 / 3;
  ret += (160 * Math.sin(latitude / 12 * PI) + 320 * Math.sin(latitude * PI / 30)) * 2 / 3;
  return ret;
}
function transformLng(longitude, latitude) {
  let ret = 300 + longitude + 2 * latitude + 0.1 * longitude * longitude + 0.1 * longitude * latitude + 0.1 * Math.sqrt(Math.abs(longitude));
  ret += (20 * Math.sin(6 * longitude * PI) + 20 * Math.sin(2 * longitude * PI)) * 2 / 3;
  ret += (20 * Math.sin(longitude * PI) + 40 * Math.sin(longitude / 3 * PI)) * 2 / 3;
  ret += (150 * Math.sin(longitude / 12 * PI) + 300 * Math.sin(longitude / 30 * PI)) * 2 / 3;
  return ret;
}
function wgs84ToGcj02(longitude, latitude) {
  if (outOfChina(longitude, latitude)) {
    return { longitude, latitude };
  }
  let dLat = transformLat(longitude - 105, latitude - 35);
  let dLng = transformLng(longitude - 105, latitude - 35);
  const radLat = latitude / 180 * PI;
  let magic = Math.sin(radLat);
  magic = 1 - EE * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = dLat * 180 / (AXIS * (1 - EE) / (magic * sqrtMagic) * PI);
  dLng = dLng * 180 / (AXIS / sqrtMagic * Math.cos(radLat) * PI);
  return { longitude: longitude + dLng, latitude: latitude + dLat };
}
function gcj02ToWgs84(longitude, latitude) {
  if (outOfChina(longitude, latitude)) {
    return { longitude, latitude };
  }
  const gcj = wgs84ToGcj02(longitude, latitude);
  return {
    longitude: longitude * 2 - gcj.longitude,
    latitude: latitude * 2 - gcj.latitude
  };
}
function gcj02ToBd09(longitude, latitude) {
  const z = Math.sqrt(longitude * longitude + latitude * latitude) + 2e-5 * Math.sin(latitude * Math.PI * 3e3 / 180);
  const theta = Math.atan2(latitude, longitude) + 3e-6 * Math.cos(longitude * Math.PI * 3e3 / 180);
  return {
    longitude: z * Math.cos(theta) + 65e-4,
    latitude: z * Math.sin(theta) + 6e-3
  };
}
function convertCoordinates(coords, from, to) {
  if (from === to) {
    return coords;
  }
  if (from === "wgs84" && to === "gcj02") {
    return wgs84ToGcj02(coords.longitude, coords.latitude);
  }
  return gcj02ToWgs84(coords.longitude, coords.latitude);
}
function getActiveCoordinateSystem() {
  return resolveMapProvider() === "amap" ? "gcj02" : "wgs84";
}
export {
  getActiveCoordinateSystem as a,
  convertCoordinates as c,
  gcj02ToBd09 as g,
  wgs84ToGcj02 as w
};
