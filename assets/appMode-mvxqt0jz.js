import { e0 as readEnv } from "./index-DwV1qlqh.js";
const PRODUCTION_ALIASES = /* @__PURE__ */ new Set(["production", "prod", "online", "live"]);
function getAppRuntimeMode() {
  var _a;
  const explicit = (_a = readEnv("VITE_APP_MODE")) == null ? void 0 : _a.toLowerCase();
  if (explicit && PRODUCTION_ALIASES.has(explicit)) {
    return "production";
  }
  if (explicit === "development" || explicit === "dev" || explicit === "demo") {
    return "development";
  }
  {
    return "production";
  }
}
function isProductionAppMode() {
  return getAppRuntimeMode() === "production";
}
export {
  isProductionAppMode as i
};
