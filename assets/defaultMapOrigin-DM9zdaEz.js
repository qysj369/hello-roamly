import { c as convertCoordinates } from "./coordinates-D-_oeTwy.js";
import { D as DEFAULT_PRODUCT_ORIGIN } from "./knownOriginFallbacks-BTkbXw-0.js";
DEFAULT_PRODUCT_ORIGIN.label;
function buildDefaultDemoOrigin() {
  const gcj = { longitude: DEFAULT_PRODUCT_ORIGIN.lng, latitude: DEFAULT_PRODUCT_ORIGIN.lat };
  const wgs = convertCoordinates(gcj, "gcj02", "wgs84");
  return {
    label: DEFAULT_PRODUCT_ORIGIN.label,
    longitude: wgs.longitude,
    latitude: wgs.latitude,
    gcjLng: gcj.longitude,
    gcjLat: gcj.latitude
  };
}
export {
  buildDefaultDemoOrigin as b
};
