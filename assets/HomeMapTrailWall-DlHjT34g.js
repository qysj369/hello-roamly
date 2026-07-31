var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { a as reactExports, j as jsxRuntimeExports } from "./vendor-react-DtfH6MSw.js";
import { bw as createLucideIcon, a0 as MapContext, bz as deepEqual, ej as segmentTravelPlaces, ei as segmentPrimaryPlace, ev as stripTravelIntentNoise, eh as segmentGluedPlaceText, c6 as getCityCoordinates, bn as compactGeocodeLabelForDisplay, bK as extractRouteEndpoints, bI as extractMultiStopDestinations, bL as extractSearchDestination, bJ as extractPrimaryLocation, bm as coalesceSearchQueryWithDestination, e0 as readEnv, aY as bindHideInjectedMapAssistants, bl as cn, X as HOME_MAP_TRAIL_VIEW, $ as Map$1, cY as getTrailWallMapStyle, W as HOME_MAP_TRAIL, z as ChevronLeft, D as ChevronRight, Z as Link, d2 as guideDetailPath, dV as primePlanVoiceNarration, b3 as buildGuidePlanQuery, a$ as buildCrossCityPlanQuery, en as speakPlanVoiceNarration, b8 as buildRoutePlanningIntro, b9 as buildRoutePlanningSummary, ee as sanitizeLocationLabelForDisplay, A as AI_API, dP as parseSseStream, ef as sanitizePlanContentForDisplay, bS as finalizeMapPlanContent, dr as isMapPlanDeliverable, bp as correctAdvisorSpeechIntent, dR as parseTravelSearchIntent, ds as isSameCityRegion, ct as getMultiStopNames, eR as useGlobalMapPlanningStore, es as stopPlanVoiceNarration, eA as toErrorMessage, b5 as buildMultiStopSearchPlanQuery, b0 as buildCrossCitySearchPlanQuery, b2 as buildEnrichedSearchPlanQuery, e3 as registerPlanCancelHandler, bR as filterTrailGuidesByDestination, bO as fetchGuideList, eU as useLocation, eW as useNavigate, eZ as usePlanFirstTokenWatch, a_ as buildAdvisorHandoffState, eS as useHomeMapPlanningBarStore, i as AiChatMarkdown, V as HOME_MAP_CARD_SHELL, a9 as PAGE_CONTAINER_NEG_MARGIN_X } from "./index-DwV1qlqh.js";
import { w as wgs84ToGcj02, c as convertCoordinates } from "./coordinates-D-_oeTwy.js";
import { a as forwardGeocodeWithAmapGeocoder, l as loadAmap, c as reverseGeocodeAmapLabels, d as reverseGeocodeWithAmapGeocoder } from "./amapGeocoderClient-CjYlis2t.js";
import { a as MapContext$1, d as deepEqual$1, M as Map$2 } from "./maplibre-gl-H57bTsm_.js";
import { e as getMapProviderMode, j as hasMapboxCredentials, f as getMapboxToken, h as hasAmapCredentials } from "./provider-CMJI8edA.js";
import { j as useShallow } from "./vendor-three-Blpl5Qyv.js";
import { w as withTimeout, u as useUserMapOrigin } from "./useUserMapOrigin-BWlu1g6v.js";
import { b as buildDefaultDemoOrigin } from "./defaultMapOrigin-DM9zdaEz.js";
import "./knownOriginFallbacks-BTkbXw-0.js";
import "./credentials-BlGlDwm4.js";
/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M11 5h10", key: "1cz7ny" }],
  ["path", { d: "M11 12h10", key: "1438ji" }],
  ["path", { d: "M11 19h10", key: "11t30w" }],
  ["path", { d: "M4 4h1v5", key: "10yrso" }],
  ["path", { d: "M4 9h2", key: "r1h2o0" }],
  ["path", { d: "M6.5 20H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02", key: "xtkcd5" }]
];
const ListOrdered = createLucideIcon("list-ordered", __iconNode$1);
/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",
      key: "vktsd0"
    }
  ],
  ["circle", { cx: "7.5", cy: "7.5", r: ".5", fill: "currentColor", key: "kqv944" }]
];
const Tag = createLucideIcon("tag", __iconNode);
function assert$1(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
let sourceCounter$1 = 0;
function createSource$1(map, id, props) {
  if (map.style && map.style._loaded) {
    const options = { ...props };
    delete options.id;
    delete options.children;
    map.addSource(id, options);
    return map.getSource(id);
  }
  return null;
}
function updateSource$1(source, props, prevProps) {
  assert$1(props.id === prevProps.id, "source id changed");
  assert$1(props.type === prevProps.type, "source type changed");
  let changedKey = "";
  let changedKeyCount = 0;
  for (const key in props) {
    if (key !== "children" && key !== "id" && !deepEqual(prevProps[key], props[key])) {
      changedKey = key;
      changedKeyCount++;
    }
  }
  if (!changedKeyCount) {
    return;
  }
  const type = props.type;
  if (type === "geojson") {
    source.setData(props.data);
  } else if (type === "image") {
    source.updateImage({
      url: props.url,
      coordinates: props.coordinates
    });
  } else if ("setCoordinates" in source && changedKeyCount === 1 && changedKey === "coordinates") {
    source.setCoordinates(props.coordinates);
  } else if ("setUrl" in source && changedKey === "url") {
    source.setUrl(props.url);
  } else if ("setTiles" in source && changedKey === "tiles") {
    source.setTiles(props.tiles);
  } else {
    console.warn(`Unable to update <Source> prop: ${changedKey}`);
  }
}
function Source$1(props) {
  const map = reactExports.useContext(MapContext).map.getMap();
  const propsRef = reactExports.useRef(props);
  const [, setStyleLoaded] = reactExports.useState(0);
  const id = reactExports.useMemo(() => props.id || `jsx-source-${sourceCounter$1++}`, []);
  reactExports.useEffect(() => {
    if (map) {
      const forceUpdate = () => setTimeout(() => setStyleLoaded((version) => version + 1), 0);
      map.on("styledata", forceUpdate);
      forceUpdate();
      return () => {
        var _a;
        map.off("styledata", forceUpdate);
        if (map.style && map.style._loaded && map.getSource(id)) {
          const allLayers = (_a = map.getStyle()) == null ? void 0 : _a.layers;
          if (allLayers) {
            for (const layer of allLayers) {
              if (layer.source === id) {
                map.removeLayer(layer.id);
              }
            }
          }
          map.removeSource(id);
        }
      };
    }
    return void 0;
  }, [map]);
  let source = map && map.style && map.getSource(id);
  if (source) {
    updateSource$1(source, props, propsRef.current);
  } else {
    source = createSource$1(map, id, props);
  }
  propsRef.current = props;
  return source && reactExports.Children.map(props.children, (child) => child && reactExports.cloneElement(child, {
    source: id
  })) || null;
}
function updateLayer$1(map, id, props, prevProps) {
  assert$1(props.id === prevProps.id, "layer id changed");
  assert$1(props.type === prevProps.type, "layer type changed");
  if (props.type === "custom" || prevProps.type === "custom") {
    return;
  }
  const { layout = {}, paint = {}, filter, minzoom, maxzoom, beforeId } = props;
  if (beforeId !== prevProps.beforeId) {
    map.moveLayer(id, beforeId);
  }
  if (layout !== prevProps.layout) {
    const prevLayout = prevProps.layout || {};
    for (const key in layout) {
      if (!deepEqual(layout[key], prevLayout[key])) {
        map.setLayoutProperty(id, key, layout[key]);
      }
    }
    for (const key in prevLayout) {
      if (!layout.hasOwnProperty(key)) {
        map.setLayoutProperty(id, key, void 0);
      }
    }
  }
  if (paint !== prevProps.paint) {
    const prevPaint = prevProps.paint || {};
    for (const key in paint) {
      if (!deepEqual(paint[key], prevPaint[key])) {
        map.setPaintProperty(id, key, paint[key]);
      }
    }
    for (const key in prevPaint) {
      if (!paint.hasOwnProperty(key)) {
        map.setPaintProperty(id, key, void 0);
      }
    }
  }
  if (!deepEqual(filter, prevProps.filter)) {
    map.setFilter(id, filter);
  }
  if (minzoom !== prevProps.minzoom || maxzoom !== prevProps.maxzoom) {
    map.setLayerZoomRange(id, minzoom, maxzoom);
  }
}
function createLayer$1(map, id, props) {
  if (map.style && map.style._loaded && (!("source" in props) || map.getSource(props.source))) {
    const options = { ...props, id };
    delete options.beforeId;
    map.addLayer(options, props.beforeId);
  }
}
let layerCounter$1 = 0;
function Layer$1(props) {
  const map = reactExports.useContext(MapContext).map.getMap();
  const propsRef = reactExports.useRef(props);
  const [, setStyleLoaded] = reactExports.useState(0);
  const id = reactExports.useMemo(() => props.id || `jsx-layer-${layerCounter$1++}`, []);
  reactExports.useEffect(() => {
    if (map) {
      const forceUpdate = () => setStyleLoaded((version) => version + 1);
      map.on("styledata", forceUpdate);
      forceUpdate();
      return () => {
        map.off("styledata", forceUpdate);
        if (map.style && map.style._loaded && map.getLayer(id)) {
          map.removeLayer(id);
        }
      };
    }
    return void 0;
  }, [map]);
  const layer = map && map.style && map.getLayer(id);
  if (layer) {
    try {
      updateLayer$1(map, id, props, propsRef.current);
    } catch (error) {
      console.warn(error);
    }
  } else {
    createLayer$1(map, id, props);
  }
  propsRef.current = props;
  return null;
}
const geocodeCache = /* @__PURE__ */ new Map();
function cacheKey(keyword) {
  return keyword.trim().toLowerCase();
}
async function resolvePlaceKeyword(keyword, geocode) {
  const trimmed = keyword.trim();
  if (!trimmed) {
    return null;
  }
  const cached = geocodeCache.get(cacheKey(trimmed));
  if (cached !== void 0) {
    return cached;
  }
  const local = getCityCoordinates(trimmed);
  if (local) {
    const resolved2 = {
      name: trimmed,
      label: trimmed,
      longitude: local.longitude,
      latitude: local.latitude,
      source: "local"
    };
    geocodeCache.set(cacheKey(trimmed), resolved2);
    return resolved2;
  }
  const geocoded = await geocode(trimmed);
  if (!geocoded) {
    geocodeCache.set(cacheKey(trimmed), null);
    return null;
  }
  const resolved = {
    name: trimmed,
    label: compactGeocodeLabelForDisplay(geocoded.label) || trimmed,
    longitude: geocoded.lng,
    latitude: geocoded.lat,
    source: "geocode"
  };
  geocodeCache.set(cacheKey(trimmed), resolved);
  return resolved;
}
async function geocodeValidatePlaceSegments(text, geocode) {
  const stripped = stripTravelIntentNoise(text);
  if (!stripped) {
    return [];
  }
  const validated = [];
  let index = 0;
  const maxLen = Math.min(8, stripped.length);
  while (index < stripped.length) {
    let matched = null;
    for (let len = Math.min(maxLen, stripped.length - index); len >= 2; len -= 1) {
      const candidate = stripped.slice(index, index + len);
      if (!/^[\u4e00-\u9fa5]/.test(candidate)) {
        continue;
      }
      const resolved = await resolvePlaceKeyword(candidate, geocode);
      if (resolved) {
        matched = resolved.name;
        break;
      }
    }
    if (!matched) {
      index += 1;
      continue;
    }
    if (!validated.includes(matched)) {
      validated.push(matched);
    }
    index += matched.length;
  }
  const route = extractRouteEndpoints(text);
  if (route.origin) {
    return validated.filter(
      (stop) => stop !== route.origin && !route.origin.includes(stop) && !stop.includes(route.origin)
    );
  }
  return validated;
}
async function resolveTravelPlacesFromText(text, geocode) {
  const trimmed = text.trim();
  if (!trimmed) {
    return [];
  }
  let names = segmentTravelPlaces(trimmed);
  const primary = segmentPrimaryPlace(trimmed);
  if (names.length < 2) {
    if (primary && geocode) {
      const resolved2 = await resolvePlaceKeyword(primary, geocode);
      if (resolved2) {
        return [resolved2];
      }
    }
    const stripped = stripTravelIntentNoise(trimmed);
    const gluedCandidates = segmentGluedPlaceText(stripped || trimmed);
    const shouldValidateGluedMulti = geocode && gluedCandidates.length >= 2 && !primary;
    if (shouldValidateGluedMulti) {
      const validated = await geocodeValidatePlaceSegments(trimmed, geocode);
      if (validated.length >= 2) {
        names = validated;
      }
    }
  }
  if (names.length < 2) {
    if (primary && !geocode) {
      return [{ name: primary, label: primary, source: "local" }];
    }
    return [];
  }
  if (!geocode) {
    return names.map((name) => ({ name, label: name, source: "local" }));
  }
  const resolved = await Promise.all(names.map((name) => resolvePlaceKeyword(name, geocode)));
  return resolved.filter((item) => item != null);
}
function shortPlaceName(formatted) {
  const parts = formatted.split(/[,，]/).map((part) => part.trim()).filter(Boolean);
  const raw = parts[0] ?? formatted;
  return compactGeocodeLabelForDisplay(raw);
}
async function geocodeHint(hint) {
  const local = getCityCoordinates(hint);
  if (local) {
    return {
      label: hint,
      longitude: local.longitude,
      latitude: local.latitude,
      coordSystem: "wgs84"
    };
  }
  const geocoded = await forwardGeocodeWithAmapGeocoder(hint);
  if (!geocoded) {
    return null;
  }
  return {
    label: shortPlaceName(geocoded.label),
    longitude: geocoded.lng,
    latitude: geocoded.lat,
    coordSystem: "gcj02"
  };
}
function resolveCityCenterSync(query) {
  var _a;
  const trimmed = query.trim();
  if (!trimmed) {
    return null;
  }
  const multiStops = extractMultiStopDestinations(trimmed);
  const hint = multiStops[0] ?? extractSearchDestination(trimmed) ?? extractPrimaryLocation(trimmed) ?? ((_a = trimmed.split(/[，,]/)[0]) == null ? void 0 : _a.trim()) ?? trimmed;
  const local = getCityCoordinates(hint);
  if (!local) {
    return null;
  }
  return {
    label: hint,
    longitude: local.longitude,
    latitude: local.latitude,
    coordSystem: "wgs84"
  };
}
async function resolveSearchLocation(query) {
  var _a;
  const trimmed = coalesceSearchQueryWithDestination(query);
  if (!trimmed) {
    return null;
  }
  const geocode = async (keyword) => {
    const result = await forwardGeocodeWithAmapGeocoder(keyword);
    return result ? { label: result.label, lng: result.lng, lat: result.lat } : null;
  };
  const hint = extractSearchDestination(trimmed) ?? extractPrimaryLocation(trimmed) ?? ((_a = trimmed.split(/[，,]/)[0]) == null ? void 0 : _a.trim()) ?? trimmed;
  const fromHint = await geocodeHint(hint);
  if (fromHint) {
    return fromHint;
  }
  const resolvedPlaces = await resolveTravelPlacesFromText(trimmed, geocode);
  if (resolvedPlaces.length >= 1) {
    const first = resolvedPlaces[0];
    if (first.longitude != null && first.latitude != null) {
      return {
        label: shortPlaceName(first.label),
        longitude: first.longitude,
        latitude: first.latitude,
        coordSystem: first.source === "local" ? "wgs84" : "gcj02"
      };
    }
  }
  return geocodeHint(trimmed);
}
function toResolvedStop(place) {
  if (place.longitude == null || place.latitude == null) {
    return null;
  }
  return {
    stopName: place.name,
    label: shortPlaceName(place.label),
    longitude: place.longitude,
    latitude: place.latitude,
    coordSystem: place.source === "local" ? "wgs84" : "gcj02"
  };
}
function resolveMultiStopFromLocalTable(stopNames) {
  if (stopNames.length < 2) {
    return null;
  }
  const stops = [];
  for (const stopName of stopNames) {
    const local = getCityCoordinates(stopName);
    if (!local) {
      return null;
    }
    stops.push({
      stopName,
      label: stopName,
      longitude: local.longitude,
      latitude: local.latitude,
      coordSystem: "wgs84"
    });
  }
  return {
    routeLabel: stops.map((stop) => stop.stopName).join("→"),
    stops,
    primary: stops[0]
  };
}
async function resolveMultiStopSearchLocations(query) {
  const trimmed = coalesceSearchQueryWithDestination(query);
  if (!trimmed) {
    return null;
  }
  const geocode = async (keyword) => {
    const result = await forwardGeocodeWithAmapGeocoder(keyword);
    return result ? { label: result.label, lng: result.lng, lat: result.lat } : null;
  };
  const resolvedPlaces = await resolveTravelPlacesFromText(trimmed, geocode);
  const stops = resolvedPlaces.map((place) => toResolvedStop(place)).filter((item) => item != null);
  if (stops.length < 2) {
    return null;
  }
  const routeLabel = stops.map((stop) => stop.stopName).join("→");
  return {
    routeLabel,
    stops,
    primary: stops[0]
  };
}
function toMapClickEvent(event) {
  var _a, _b;
  return {
    lng: event.lnglat.getLng(),
    lat: event.lnglat.getLat(),
    x: ((_a = event.pixel) == null ? void 0 : _a.x) ?? 0,
    y: ((_b = event.pixel) == null ? void 0 : _b.y) ?? 0
  };
}
function bindAmapMapClick(map, handleMapClick) {
  const listener = (event) => {
    handleMapClick(toMapClickEvent(event));
  };
  if (map.clickListener) {
    map.off("click", map.clickListener);
  }
  map.clickListener = listener;
  map.on("click", map.clickListener);
  return () => {
    if (map.clickListener) {
      map.off("click", map.clickListener);
      map.clickListener = void 0;
    }
  };
}
const DEFAULT_AMAP_TRAIL_MAP_STYLE = "amap://styles/normal";
const AMAP_TRAIL_ZOOM_DETAIL = 11;
function getAmapTrailMapStyle() {
  return readEnv("VITE_AMAP_TRAIL_STYLE") ?? DEFAULT_AMAP_TRAIL_MAP_STYLE;
}
function applyAmapTrailMapFeatures(map, zoom) {
  if (zoom < AMAP_TRAIL_ZOOM_DETAIL) {
    map.setFeatures(["bg", "road", "point"]);
    return;
  }
  map.setFeatures(["bg", "road", "point", "building"]);
}
function ensureAmapTrailLabelsVisible(map) {
  map.setStatus({ showLabel: true });
  applyAmapTrailMapFeatures(map, map.getZoom());
}
function bindAmapTrailZoomFeatures(map) {
  const sync = () => {
    ensureAmapTrailLabelsVisible(map);
  };
  map.on("complete", sync);
  map.on("zoomend", sync);
  sync();
  return () => {
    map.off("complete", sync);
    map.off("zoomend", sync);
  };
}
function createAmapTrailMapOptions(center, zoom) {
  return {
    zoom,
    center,
    viewMode: "2D",
    mapStyle: getAmapTrailMapStyle(),
    showLabel: true,
    features: ["bg", "road", "point"]
  };
}
function trailMapVisualFilter(brightness = 1) {
  const base = Math.max(brightness, 0.88);
  return `brightness(${base * 0.9}) saturate(0.92) contrast(1.04)`;
}
function wgs84LineToAmapPath(coordinates) {
  return coordinates.map(([longitude, latitude]) => {
    const gcj = wgs84ToGcj02(longitude, latitude);
    return [gcj.longitude, gcj.latitude];
  });
}
function wgs84PointToAmapPoint(coordinates) {
  const [longitude, latitude] = coordinates;
  const gcj = wgs84ToGcj02(longitude ?? 0, latitude ?? 0);
  return [gcj.longitude, gcj.latitude];
}
function crawlerMarkerHtml(color) {
  return `<div style="position:relative;width:22px;height:22px">
  <div style="position:absolute;inset:0;border-radius:9999px;background:${color}44;filter:blur(2px)"></div>
  <div style="position:absolute;left:6px;top:6px;width:10px;height:10px;border-radius:9999px;background:#fff;border:2px solid ${color}"></div>
</div>`;
}
function applyAmapFlyTo(map, target) {
  if (target.longitude == null || target.latitude == null) {
    return;
  }
  const gcj = wgs84ToGcj02(target.longitude, target.latitude);
  map.setZoomAndCenter(target.zoom ?? 9, [gcj.longitude, gcj.latitude]);
}
function readTrailProps(properties) {
  const props = properties;
  if (!props.id) {
    return null;
  }
  return {
    id: props.id,
    colorEnd: props.colorEnd ?? "#10b981"
  };
}
function HomeAmapTrailLayers({
  lineCollection,
  userRouteCollection,
  userOriginPoint,
  userOriginGcjPoint,
  crawlerCollection,
  activeTrailId,
  pulseOpacity,
  pulseBrightness,
  onTrailClick,
  onTrailHover,
  onMapClick,
  flyTo,
  className
}) {
  const containerId = reactExports.useId().replace(/:/g, "");
  const mapRef = reactExports.useRef(null);
  const linesRef = reactExports.useRef(/* @__PURE__ */ new Map());
  const userRouteRef = reactExports.useRef(null);
  const userOriginMarkerRef = reactExports.useRef(null);
  const userMarkersRef = reactExports.useRef([]);
  const crawlerRef = reactExports.useRef(null);
  const onMapClickRef = reactExports.useRef(onMapClick);
  const pendingFlyRef = reactExports.useRef(flyTo);
  const unbindZoomFeaturesRef = reactExports.useRef(null);
  const unbindAssistantGuardRef = reactExports.useRef(null);
  const shellRef = reactExports.useRef(null);
  const [mapError, setMapError] = reactExports.useState(null);
  onMapClickRef.current = onMapClick;
  pendingFlyRef.current = flyTo;
  const initialCenter = wgs84ToGcj02(HOME_MAP_TRAIL_VIEW.longitude, HOME_MAP_TRAIL_VIEW.latitude);
  reactExports.useEffect(() => {
    let disposed = false;
    loadAmap().then((AMapNS) => {
      if (disposed) {
        return;
      }
      const map = new AMapNS.Map(
        containerId,
        createAmapTrailMapOptions([initialCenter.longitude, initialCenter.latitude], HOME_MAP_TRAIL_VIEW.zoom)
      );
      unbindZoomFeaturesRef.current = bindAmapTrailZoomFeatures(map);
      mapRef.current = map;
      if (pendingFlyRef.current) {
        applyAmapFlyTo(map, pendingFlyRef.current);
      }
    }).catch((reason) => {
      setMapError(reason instanceof Error ? reason.message : "高德地图加载失败");
    });
    return () => {
      var _a, _b, _c, _d, _e, _f;
      disposed = true;
      (_a = unbindZoomFeaturesRef.current) == null ? void 0 : _a.call(unbindZoomFeaturesRef);
      unbindZoomFeaturesRef.current = null;
      linesRef.current.forEach(({ glow, core }) => {
        glow.setMap(null);
        core.setMap(null);
      });
      linesRef.current.clear();
      (_b = userRouteRef.current) == null ? void 0 : _b.glow.setMap(null);
      (_c = userRouteRef.current) == null ? void 0 : _c.core.setMap(null);
      userRouteRef.current = null;
      (_d = userOriginMarkerRef.current) == null ? void 0 : _d.setMap(null);
      userOriginMarkerRef.current = null;
      userMarkersRef.current.forEach((marker) => marker.setMap(null));
      userMarkersRef.current = [];
      (_e = crawlerRef.current) == null ? void 0 : _e.setMap(null);
      crawlerRef.current = null;
      (_f = mapRef.current) == null ? void 0 : _f.destroy();
      mapRef.current = null;
    };
  }, [containerId, initialCenter.latitude, initialCenter.longitude]);
  reactExports.useEffect(() => {
    var _a;
    const shell = shellRef.current;
    if (!shell || mapError) {
      return void 0;
    }
    (_a = unbindAssistantGuardRef.current) == null ? void 0 : _a.call(unbindAssistantGuardRef);
    unbindAssistantGuardRef.current = bindHideInjectedMapAssistants(shell);
    return () => {
      var _a2;
      (_a2 = unbindAssistantGuardRef.current) == null ? void 0 : _a2.call(unbindAssistantGuardRef);
      unbindAssistantGuardRef.current = null;
    };
  }, [mapError]);
  reactExports.useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return void 0;
    }
    return bindAmapMapClick(map, (event) => {
      var _a;
      (_a = onMapClickRef.current) == null ? void 0 : _a.call(onMapClickRef, event);
    });
  }, [onMapClick]);
  reactExports.useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyTo) {
      return;
    }
    applyAmapFlyTo(map, flyTo);
  }, [flyTo]);
  reactExports.useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    linesRef.current.forEach(({ glow, core }) => {
      map.remove(glow);
      map.remove(core);
    });
    linesRef.current.clear();
    if (lineCollection.features.length === 0) {
      return;
    }
    let cancelled = false;
    loadAmap().then((AMapNS) => {
      if (cancelled || !mapRef.current) {
        return;
      }
      lineCollection.features.forEach((feature) => {
        const meta = readTrailProps(feature.properties);
        if (!meta || feature.geometry.type !== "LineString") {
          return;
        }
        const path = wgs84LineToAmapPath(feature.geometry.coordinates);
        const bindTrailEvents = (line) => {
          line.on("click", () => onTrailClick(meta.id));
          line.on("mouseover", () => onTrailHover(meta.id));
          line.on("mouseout", () => onTrailHover(null));
        };
        const glow = new AMapNS.Polyline({
          path,
          strokeColor: "#334155",
          strokeWeight: 3,
          strokeOpacity: 0.25,
          zIndex: 10,
          bubble: false,
          extData: { id: meta.id }
        });
        const core = new AMapNS.Polyline({
          path,
          strokeColor: meta.colorEnd,
          strokeWeight: 1.6,
          strokeOpacity: 0.45,
          zIndex: 11,
          bubble: false,
          extData: { id: meta.id }
        });
        bindTrailEvents(glow);
        bindTrailEvents(core);
        map.add(glow);
        map.add(core);
        linesRef.current.set(meta.id, { glow, core });
      });
    });
    return () => {
      cancelled = true;
    };
  }, [lineCollection, onTrailClick, onTrailHover]);
  reactExports.useEffect(() => {
    var _a, _b;
    const map = mapRef.current;
    if (!map) {
      return;
    }
    (_a = userRouteRef.current) == null ? void 0 : _a.glow.setMap(null);
    (_b = userRouteRef.current) == null ? void 0 : _b.core.setMap(null);
    userRouteRef.current = null;
    userMarkersRef.current.forEach((marker) => marker.setMap(null));
    userMarkersRef.current = [];
    const feature = userRouteCollection == null ? void 0 : userRouteCollection.features[0];
    if (!feature || feature.geometry.type !== "LineString") {
      return;
    }
    const props = feature.properties;
    const waypointCoords = (props == null ? void 0 : props.waypoints) && props.waypoints.length >= 2 ? props.waypoints : [
      feature.geometry.coordinates[0],
      feature.geometry.coordinates[feature.geometry.coordinates.length - 1]
    ];
    let cancelled = false;
    const path = wgs84LineToAmapPath(feature.geometry.coordinates);
    loadAmap().then((AMapNS) => {
      if (cancelled || !mapRef.current) {
        return;
      }
      const glow = new AMapNS.Polyline({
        path,
        strokeColor: "#a855f7",
        strokeWeight: 7,
        strokeOpacity: 0.35,
        zIndex: 45,
        bubble: true
      });
      const core = new AMapNS.Polyline({
        path,
        strokeColor: "#22d3ee",
        strokeWeight: 3,
        strokeOpacity: 0.95,
        zIndex: 46,
        bubble: true
      });
      map.add(glow);
      map.add(core);
      userRouteRef.current = { glow, core };
      const markers = waypointCoords.filter((point) => Boolean(point)).map((point, index) => {
        const isOrigin = index === 0;
        const isLast = index === waypointCoords.length - 1;
        const color = isOrigin ? "#22d3ee" : isLast ? "#a855f7" : "#fbbf24";
        return new AMapNS.Marker({
          position: wgs84PointToAmapPoint(point),
          anchor: "center",
          content: `<div style="width:12px;height:12px;border-radius:9999px;background:${color};border:2px solid #fff;box-shadow:0 0 8px ${color}"></div>`,
          zIndex: 120
        });
      });
      markers.forEach((marker) => marker.setMap(map));
      userMarkersRef.current = markers;
    });
    return () => {
      cancelled = true;
    };
  }, [userRouteCollection]);
  reactExports.useEffect(() => {
    var _a;
    const map = mapRef.current;
    if (!map) {
      return;
    }
    (_a = userOriginMarkerRef.current) == null ? void 0 : _a.setMap(null);
    userOriginMarkerRef.current = null;
    if (!userOriginGcjPoint && !userOriginPoint) {
      return;
    }
    let cancelled = false;
    loadAmap().then((AMapNS) => {
      if (cancelled || !mapRef.current) {
        return;
      }
      const position = userOriginGcjPoint ? [userOriginGcjPoint[0], userOriginGcjPoint[1]] : wgs84PointToAmapPoint(userOriginPoint);
      const marker = new AMapNS.Marker({
        position,
        anchor: "center",
        content: '<div style="position:relative;width:18px;height:18px"><div style="position:absolute;inset:-4px;border-radius:9999px;background:#22d3ee33;animation:pulse 2s infinite"></div><div style="position:absolute;inset:0;border-radius:9999px;background:#22d3ee;border:2px solid #fff;box-shadow:0 0 10px #22d3ee"></div></div>',
        zIndex: 125
      });
      marker.setMap(map);
      userOriginMarkerRef.current = marker;
    });
    return () => {
      cancelled = true;
    };
  }, [userOriginGcjPoint, userOriginPoint]);
  reactExports.useEffect(() => {
    const glowOpacity = pulseOpacity * 0.35 * pulseBrightness;
    const activeId = activeTrailId ?? "";
    linesRef.current.forEach((pair, id) => {
      var _a;
      const active = id === activeId;
      const meta = lineCollection.features.find(
        (feature) => {
          var _a2;
          return ((_a2 = readTrailProps(feature.properties)) == null ? void 0 : _a2.id) === id;
        }
      );
      const colorEnd = ((_a = readTrailProps(meta == null ? void 0 : meta.properties)) == null ? void 0 : _a.colorEnd) ?? "#10b981";
      pair.glow.setOptions({
        strokeColor: active ? "#6ee7b7" : "#334155",
        strokeWeight: active ? 8 : 3,
        strokeOpacity: glowOpacity
      });
      pair.core.setOptions({
        strokeColor: colorEnd,
        strokeWeight: active ? 3.2 : 1.6,
        strokeOpacity: active ? pulseOpacity : 0.45
      });
    });
  }, [activeTrailId, lineCollection.features, pulseBrightness, pulseOpacity]);
  reactExports.useEffect(() => {
    const map = mapRef.current;
    const pointFeature = crawlerCollection.features[0];
    if (!map || !pointFeature || pointFeature.geometry.type !== "Point") {
      return;
    }
    const props = pointFeature.properties;
    const color = props.color ?? "#10b981";
    const position = wgs84PointToAmapPoint(pointFeature.geometry.coordinates);
    loadAmap().then((AMapNS) => {
      if (!mapRef.current) {
        return;
      }
      if (!crawlerRef.current) {
        crawlerRef.current = new AMapNS.Marker({
          position,
          anchor: "center",
          content: crawlerMarkerHtml(color),
          zIndex: 130
        });
        crawlerRef.current.setMap(map);
      } else {
        crawlerRef.current.setPosition(position);
        crawlerRef.current.setContent(crawlerMarkerHtml(color));
      }
    });
  }, [crawlerCollection]);
  if (mapError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex h-full items-center justify-center text-sm text-rose-400", className), children: mapError });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref: shellRef,
      className: cn("home-amap-trail-layers relative h-full w-full", className),
      style: { filter: trailMapVisualFilter(pulseBrightness) },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { id: containerId, className: "h-full w-full" })
    }
  );
}
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
let sourceCounter = 0;
function createSource(map, id, props) {
  if (map.style && map.style._loaded) {
    const options = { ...props };
    delete options.id;
    delete options.children;
    map.addSource(id, options);
    return map.getSource(id);
  }
  return null;
}
function updateSource(source, props, prevProps) {
  var _a, _b, _c;
  assert(props.id === prevProps.id, "source id changed");
  assert(props.type === prevProps.type, "source type changed");
  let changedKey = "";
  let changedKeyCount = 0;
  for (const key in props) {
    if (key !== "children" && key !== "id" && !deepEqual$1(prevProps[key], props[key])) {
      changedKey = key;
      changedKeyCount++;
    }
  }
  if (!changedKeyCount) {
    return;
  }
  const type = props.type;
  if (type === "geojson") {
    source.setData(props.data);
  } else if (type === "image") {
    source.updateImage({
      url: props.url,
      coordinates: props.coordinates
    });
  } else {
    switch (changedKey) {
      case "coordinates":
        (_a = source.setCoordinates) == null ? void 0 : _a.call(source, props.coordinates);
        break;
      case "url":
        (_b = source.setUrl) == null ? void 0 : _b.call(source, props.url);
        break;
      case "tiles":
        (_c = source.setTiles) == null ? void 0 : _c.call(source, props.tiles);
        break;
      default:
        console.warn(`Unable to update <Source> prop: ${changedKey}`);
    }
  }
}
function Source(props) {
  const map = reactExports.useContext(MapContext$1).map.getMap();
  const propsRef = reactExports.useRef(props);
  const [, setStyleLoaded] = reactExports.useState(0);
  const id = reactExports.useMemo(() => props.id || `jsx-source-${sourceCounter++}`, []);
  reactExports.useEffect(() => {
    if (map) {
      const forceUpdate = () => setTimeout(() => setStyleLoaded((version) => version + 1), 0);
      map.on("styledata", forceUpdate);
      forceUpdate();
      return () => {
        var _a;
        map.off("styledata", forceUpdate);
        if (map.style && map.style._loaded && map.getSource(id)) {
          const allLayers = (_a = map.getStyle()) == null ? void 0 : _a.layers;
          if (allLayers) {
            for (const layer of allLayers) {
              if (layer.source === id) {
                map.removeLayer(layer.id);
              }
            }
          }
          map.removeSource(id);
        }
      };
    }
    return void 0;
  }, [map]);
  let source = map && map.style && map.getSource(id);
  if (source) {
    updateSource(source, props, propsRef.current);
  } else {
    source = createSource(map, id, props);
  }
  propsRef.current = props;
  return source && reactExports.Children.map(props.children, (child) => child && reactExports.cloneElement(child, {
    source: id
  })) || null;
}
function updateLayer(map, id, props, prevProps) {
  assert(props.id === prevProps.id, "layer id changed");
  assert(props.type === prevProps.type, "layer type changed");
  if (props.type === "custom" || prevProps.type === "custom") {
    return;
  }
  const { layout = {}, paint = {}, filter, minzoom, maxzoom, beforeId } = props;
  if (beforeId !== prevProps.beforeId) {
    map.moveLayer(id, beforeId);
  }
  if (layout !== prevProps.layout) {
    const prevLayout = prevProps.layout || {};
    for (const key in layout) {
      if (!deepEqual$1(layout[key], prevLayout[key])) {
        map.setLayoutProperty(id, key, layout[key]);
      }
    }
    for (const key in prevLayout) {
      if (!layout.hasOwnProperty(key)) {
        map.setLayoutProperty(id, key, void 0);
      }
    }
  }
  if (paint !== prevProps.paint) {
    const prevPaint = prevProps.paint || {};
    for (const key in paint) {
      if (!deepEqual$1(paint[key], prevPaint[key])) {
        map.setPaintProperty(id, key, paint[key]);
      }
    }
    for (const key in prevPaint) {
      if (!paint.hasOwnProperty(key)) {
        map.setPaintProperty(id, key, void 0);
      }
    }
  }
  if (!deepEqual$1(filter, prevProps.filter)) {
    map.setFilter(id, filter);
  }
  if (minzoom !== prevProps.minzoom || maxzoom !== prevProps.maxzoom) {
    map.setLayerZoomRange(id, minzoom, maxzoom);
  }
}
function createLayer(map, id, props) {
  if (map.style && map.style._loaded && (!("source" in props) || map.getSource(props.source))) {
    const options = { ...props, id };
    delete options.beforeId;
    map.addLayer(options, props.beforeId);
  }
}
let layerCounter = 0;
function Layer(props) {
  const map = reactExports.useContext(MapContext$1).map.getMap();
  const propsRef = reactExports.useRef(props);
  const [, setStyleLoaded] = reactExports.useState(0);
  const id = reactExports.useMemo(() => props.id || `jsx-layer-${layerCounter++}`, []);
  reactExports.useEffect(() => {
    if (map) {
      const forceUpdate = () => setStyleLoaded((version) => version + 1);
      map.on("styledata", forceUpdate);
      forceUpdate();
      return () => {
        map.off("styledata", forceUpdate);
        if (map.style && map.style._loaded && map.getLayer(id)) {
          map.removeLayer(id);
        }
      };
    }
    return void 0;
  }, [map]);
  const layer = map && map.style && map.getLayer(id);
  if (layer) {
    try {
      updateLayer(map, id, props, propsRef.current);
    } catch (error) {
      console.warn(error);
    }
  } else {
    createLayer(map, id, props);
  }
  propsRef.current = props;
  return null;
}
const INTERACTIVE_LAYERS = ["trail-wall-core", "trail-wall-glow"];
function readTrailIdFromFeatures(features) {
  var _a;
  const feature = features == null ? void 0 : features.find((item) => {
    var _a2;
    return INTERACTIVE_LAYERS.includes(((_a2 = item.layer) == null ? void 0 : _a2.id) ?? "");
  });
  const trailId = (_a = feature == null ? void 0 : feature.properties) == null ? void 0 : _a.id;
  return typeof trailId === "string" ? trailId : null;
}
function UserOriginLayerMapbox({
  userOriginCollection
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Source$1, { id: "user-origin-point", type: "geojson", data: userOriginCollection, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Layer$1,
      {
        id: "user-origin-glow",
        type: "circle",
        paint: {
          "circle-radius": 14,
          "circle-color": "#22d3ee",
          "circle-opacity": 0.25,
          "circle-blur": 0.6
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Layer$1,
      {
        id: "user-origin-core",
        type: "circle",
        paint: {
          "circle-radius": 6,
          "circle-color": "#22d3ee",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff"
        }
      }
    )
  ] });
}
function UserRouteLayersMapbox({
  userRouteCollection
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Source$1, { id: "user-route-line", type: "geojson", data: userRouteCollection, lineMetrics: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Layer$1,
      {
        id: "user-route-glow",
        type: "line",
        paint: {
          "line-color": "#a855f7",
          "line-width": 7,
          "line-opacity": 0.35,
          "line-blur": 2
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Layer$1,
      {
        id: "user-route-core",
        type: "line",
        paint: {
          "line-gradient": [
            "interpolate",
            ["linear"],
            ["line-progress"],
            0,
            "#22d3ee",
            1,
            "#a855f7"
          ],
          "line-width": 3.2,
          "line-opacity": 0.95
        }
      }
    )
  ] });
}
function buildLinePaint(props) {
  const glowOpacity = props.pulseOpacity * 0.35 * props.pulseBrightness;
  const activeId = props.activeTrailId ?? "";
  return {
    glow: {
      "line-color": ["case", ["==", ["get", "id"], activeId], "#6ee7b7", "#334155"],
      "line-width": ["case", ["==", ["get", "id"], activeId], 8, 3],
      "line-opacity": glowOpacity,
      "line-blur": 2.5
    },
    core: {
      "line-gradient": [
        "interpolate",
        ["linear"],
        ["line-progress"],
        0,
        ["get", "colorStart"],
        1,
        ["get", "colorEnd"]
      ],
      "line-width": ["case", ["==", ["get", "id"], activeId], 3.2, 1.6],
      "line-opacity": ["case", ["==", ["get", "id"], activeId], props.pulseOpacity, 0.45]
    }
  };
}
function TrailMapLayersMapbox(props) {
  var _a, _b;
  const paint = buildLinePaint(props);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Source$1, { id: "trail-wall-lines", type: "geojson", data: props.lineCollection, lineMetrics: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Layer$1, { id: "trail-wall-glow", type: "line", paint: paint.glow }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Layer$1, { id: "trail-wall-core", type: "line", paint: paint.core })
    ] }),
    ((_a = props.userRouteCollection) == null ? void 0 : _a.features.length) ? /* @__PURE__ */ jsxRuntimeExports.jsx(UserRouteLayersMapbox, { userRouteCollection: props.userRouteCollection }) : null,
    ((_b = props.userOriginCollection) == null ? void 0 : _b.features.length) ? /* @__PURE__ */ jsxRuntimeExports.jsx(UserOriginLayerMapbox, { userOriginCollection: props.userOriginCollection }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Source$1, { id: "trail-wall-crawler", type: "geojson", data: props.crawlerCollection, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Layer$1,
        {
          id: "trail-wall-crawler-glow",
          type: "circle",
          paint: {
            "circle-radius": 12,
            "circle-color": ["get", "color"],
            "circle-opacity": 0.25,
            "circle-blur": 0.8
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Layer$1,
        {
          id: "trail-wall-crawler",
          type: "circle",
          paint: {
            "circle-radius": 5,
            "circle-color": "#ffffff",
            "circle-stroke-width": 2,
            "circle-stroke-color": ["get", "color"]
          }
        }
      )
    ] })
  ] });
}
function TrailMapLayersMaplibre(props) {
  var _a, _b;
  const paint = buildLinePaint(props);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Source, { id: "trail-wall-lines", type: "geojson", data: props.lineCollection, lineMetrics: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Layer, { id: "trail-wall-glow", type: "line", paint: paint.glow }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Layer, { id: "trail-wall-core", type: "line", paint: paint.core })
    ] }),
    ((_a = props.userRouteCollection) == null ? void 0 : _a.features.length) ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Source, { id: "user-route-line", type: "geojson", data: props.userRouteCollection, lineMetrics: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Layer,
        {
          id: "user-route-glow",
          type: "line",
          paint: {
            "line-color": "#a855f7",
            "line-width": 7,
            "line-opacity": 0.35,
            "line-blur": 2
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Layer,
        {
          id: "user-route-core",
          type: "line",
          paint: {
            "line-gradient": [
              "interpolate",
              ["linear"],
              ["line-progress"],
              0,
              "#22d3ee",
              1,
              "#a855f7"
            ],
            "line-width": 3.2,
            "line-opacity": 0.95
          }
        }
      )
    ] }) : null,
    ((_b = props.userOriginCollection) == null ? void 0 : _b.features.length) ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Source, { id: "user-origin-point", type: "geojson", data: props.userOriginCollection, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Layer,
        {
          id: "user-origin-glow",
          type: "circle",
          paint: {
            "circle-radius": 14,
            "circle-color": "#22d3ee",
            "circle-opacity": 0.25,
            "circle-blur": 0.6
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Layer,
        {
          id: "user-origin-core",
          type: "circle",
          paint: {
            "circle-radius": 6,
            "circle-color": "#22d3ee",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff"
          }
        }
      )
    ] }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Source, { id: "trail-wall-crawler", type: "geojson", data: props.crawlerCollection, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Layer,
        {
          id: "trail-wall-crawler-glow",
          type: "circle",
          paint: {
            "circle-radius": 12,
            "circle-color": ["get", "color"],
            "circle-opacity": 0.25,
            "circle-blur": 0.8
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Layer,
        {
          id: "trail-wall-crawler",
          type: "circle",
          paint: {
            "circle-radius": 5,
            "circle-color": "#ffffff",
            "circle-stroke-width": 2,
            "circle-stroke-color": ["get", "color"]
          }
        }
      )
    ] })
  ] });
}
function HomeMapTrailGlLayers({
  mapRef,
  viewState,
  onViewStateChange,
  lineCollection,
  userRouteCollection,
  userOriginPoint,
  crawlerCollection,
  activeTrailId,
  pulseOpacity,
  pulseBrightness,
  onTrailClick,
  onTrailHover,
  onMapClick,
  flyTo,
  className,
  runtime
}) {
  const syncViewState = reactExports.useCallback(
    (next) => {
      onViewStateChange({
        longitude: next.longitude,
        latitude: next.latitude,
        zoom: next.zoom,
        pitch: next.pitch ?? 0,
        bearing: next.bearing ?? 0
      });
    },
    [onViewStateChange]
  );
  reactExports.useEffect(() => {
    var _a, _b;
    if (!flyTo || flyTo.longitude == null || flyTo.latitude == null) {
      return;
    }
    const map = (_b = (_a = mapRef.current) == null ? void 0 : _a.getMap) == null ? void 0 : _b.call(_a);
    if (!map) {
      return;
    }
    map.flyTo({
      center: [flyTo.longitude, flyTo.latitude],
      zoom: flyTo.zoom ?? 9,
      duration: 1200
    });
  }, [flyTo, mapRef]);
  const handleMapboxClick = reactExports.useCallback(
    (event) => {
      const trailId = readTrailIdFromFeatures(event.features);
      if (trailId) {
        onTrailClick(trailId);
        return;
      }
      onMapClick == null ? void 0 : onMapClick({
        lng: event.lngLat.lng,
        lat: event.lngLat.lat,
        x: event.point.x,
        y: event.point.y
      });
    },
    [onMapClick, onTrailClick]
  );
  const handleMapboxMouseEnter = reactExports.useCallback(
    (event) => {
      const trailId = readTrailIdFromFeatures(event.features);
      if (trailId) {
        onTrailHover(trailId);
        event.target.getCanvas().style.cursor = "pointer";
      }
    },
    [onTrailHover]
  );
  const handleMapboxMouseLeave = reactExports.useCallback(
    (event) => {
      onTrailHover(null);
      event.target.getCanvas().style.cursor = "grab";
    },
    [onTrailHover]
  );
  const handleMaplibreClick = reactExports.useCallback(
    (event) => {
      const trailId = readTrailIdFromFeatures(event.features);
      if (trailId) {
        onTrailClick(trailId);
        return;
      }
      onMapClick == null ? void 0 : onMapClick({
        lng: event.lngLat.lng,
        lat: event.lngLat.lat,
        x: event.point.x,
        y: event.point.y
      });
    },
    [onMapClick, onTrailClick]
  );
  const handleMaplibreMouseEnter = reactExports.useCallback(
    (event) => {
      const trailId = readTrailIdFromFeatures(event.features);
      if (trailId) {
        onTrailHover(trailId);
        event.target.getCanvas().style.cursor = "pointer";
      }
    },
    [onTrailHover]
  );
  const handleMaplibreMouseLeave = reactExports.useCallback(
    (event) => {
      onTrailHover(null);
      event.target.getCanvas().style.cursor = "grab";
    },
    [onTrailHover]
  );
  const userOriginCollection = reactExports.useMemo(() => {
    if (!userOriginPoint) {
      return null;
    }
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { id: "__user_origin__" },
          geometry: {
            type: "Point",
            coordinates: userOriginPoint
          }
        }
      ]
    };
  }, [userOriginPoint]);
  const layerProps = {
    activeTrailId,
    pulseOpacity,
    pulseBrightness,
    lineCollection,
    userRouteCollection,
    userOriginCollection,
    crawlerCollection
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn("home-map-trail-layers relative h-full w-full", className),
      style: { filter: `brightness(${pulseBrightness})` },
      children: [
        runtime.provider === "maplibre" ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "pointer-events-none absolute left-1/2 top-20 z-10 max-w-[90%] -translate-x-1/2 rounded-lg border border-amber-400/30 bg-amber-950/80 px-3 py-1 text-center text-[10px] text-amber-100/90 backdrop-blur-sm", children: "演示暗色底图 · 配置 VITE_MAPBOX_TOKEN 可切换 Mapbox 暗黑样式" }) : null,
        runtime.provider === "mapbox" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          Map$1,
          {
            ref: mapRef,
            mapboxAccessToken: runtime.token,
            ...viewState,
            onMove: (event) => syncViewState(event.viewState),
            mapStyle: runtime.style,
            interactiveLayerIds: INTERACTIVE_LAYERS,
            onClick: handleMapboxClick,
            onMouseEnter: handleMapboxMouseEnter,
            onMouseLeave: handleMapboxMouseLeave,
            attributionControl: false,
            reuseMaps: true,
            style: { width: "100%", height: "100%" },
            cursor: "grab",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrailMapLayersMapbox, { ...layerProps })
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          Map$2,
          {
            ...viewState,
            onMove: (event) => syncViewState(event.viewState),
            mapStyle: runtime.style,
            interactiveLayerIds: INTERACTIVE_LAYERS,
            onClick: handleMaplibreClick,
            onMouseEnter: handleMaplibreMouseEnter,
            onMouseLeave: handleMaplibreMouseLeave,
            attributionControl: false,
            reuseMaps: true,
            style: { width: "100%", height: "100%" },
            cursor: "grab",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrailMapLayersMaplibre, { ...layerProps })
          }
        )
      ]
    }
  );
}
const TRAIL_WALL_FALLBACK_MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
function resolveTrailWallMapRuntime() {
  const mode = getMapProviderMode();
  if (mode === "mapbox" && hasMapboxCredentials()) {
    const token = getMapboxToken();
    if (token) {
      return { provider: "mapbox", token, style: getTrailWallMapStyle() };
    }
  }
  if (mode === "amap" && hasAmapCredentials()) {
    return { provider: "amap" };
  }
  if (mode === "auto") {
    if (hasAmapCredentials()) {
      return { provider: "amap" };
    }
    const token = getMapboxToken();
    if (token) {
      return { provider: "mapbox", token, style: getTrailWallMapStyle() };
    }
  }
  return {
    provider: "maplibre",
    style: TRAIL_WALL_FALLBACK_MAP_STYLE
  };
}
function HomeMapTrailLayers(props) {
  const runtime = reactExports.useMemo(() => resolveTrailWallMapRuntime(), []);
  if (runtime.provider === "amap") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(HomeAmapTrailLayers, { ...props });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(HomeMapTrailGlLayers, { ...props, runtime });
}
const DRAG_THRESHOLD_PX = 5;
function isInteractivePointerTarget(target) {
  if (!(target instanceof Element)) {
    return false;
  }
  return Boolean(target.closest('button, a, input, textarea, select, label, [role="button"]'));
}
function useHorizontalDragScroll() {
  const ref = reactExports.useRef(null);
  const dragRef = reactExports.useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    scrollLeft: 0,
    moved: false
  });
  const scrollBy = reactExports.useCallback((delta) => {
    var _a;
    (_a = ref.current) == null ? void 0 : _a.scrollBy({ left: delta, behavior: "smooth" });
  }, []);
  reactExports.useEffect(() => {
    const el = ref.current;
    if (!el) {
      return void 0;
    }
    const canScroll = () => el.scrollWidth > el.clientWidth + 1;
    const finishDrag = (pointerId) => {
      const drag = dragRef.current;
      if (!drag.active) {
        return;
      }
      drag.active = false;
      el.classList.remove("is-dragging");
      try {
        if (el.hasPointerCapture(pointerId)) {
          el.releasePointerCapture(pointerId);
        }
      } catch {
      }
    };
    const onPointerDown = (event) => {
      if (event.button !== 0 || !canScroll() || isInteractivePointerTarget(event.target)) {
        return;
      }
      dragRef.current = {
        active: true,
        pointerId: event.pointerId,
        startX: event.clientX,
        scrollLeft: el.scrollLeft,
        moved: false
      };
      el.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event) => {
      const drag = dragRef.current;
      if (!drag.active || event.pointerId !== drag.pointerId) {
        return;
      }
      const delta = event.clientX - drag.startX;
      if (Math.abs(delta) > DRAG_THRESHOLD_PX) {
        drag.moved = true;
        el.classList.add("is-dragging");
      }
      if (drag.moved) {
        event.preventDefault();
        el.scrollLeft = drag.scrollLeft - delta;
      }
    };
    const onPointerUp = (event) => {
      finishDrag(event.pointerId);
    };
    const onClickCapture = (event) => {
      if (dragRef.current.moved) {
        event.preventDefault();
        event.stopPropagation();
        dragRef.current.moved = false;
      }
    };
    const onWheel = (event) => {
      if (!canScroll()) {
        return;
      }
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (delta === 0) {
        return;
      }
      event.preventDefault();
      el.scrollLeft += delta;
    };
    const moveOptions = { passive: false };
    const capture = true;
    el.addEventListener("pointerdown", onPointerDown, capture);
    el.addEventListener("pointermove", onPointerMove, moveOptions);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    el.addEventListener("click", onClickCapture, capture);
    el.addEventListener("wheel", onWheel, moveOptions);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown, capture);
      el.removeEventListener("pointermove", onPointerMove, moveOptions);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("click", onClickCapture, capture);
      el.removeEventListener("wheel", onWheel, moveOptions);
    };
  }, []);
  return { ref, scrollBy };
}
function TrailGuideCard({
  guide,
  active,
  onPlanGuide,
  planning = false,
  compact = false
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(compact ? "w-[17rem] shrink-0 snap-start sm:w-[18rem]" : "w-full"), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        disabled: planning,
        onClick: () => onPlanGuide(guide),
        className: cn(
          "home-map-trail-card w-full rounded-xl text-left transition disabled:cursor-not-allowed disabled:opacity-60",
          compact ? "p-2.5" : "p-3",
          active && "home-map-trail-card--active"
        ),
        title: "一键规划此路线",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "home-map-trail-card__route text-[10px] font-medium", children: [
                guide.start_city,
                " → ",
                guide.end_city
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "h3",
                {
                  className: cn(
                    "home-map-trail-card__title mt-0.5 font-semibold",
                    compact ? "line-clamp-1 text-xs" : "line-clamp-2 text-sm"
                  ),
                  children: guide.title
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "span",
              {
                className: cn(
                  "home-map-trail-card__budget inline-flex shrink-0 items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px]",
                  guide.budgetSource === "cost_breakdown" && "home-map-trail-card__budget--from-list"
                ),
                title: guide.budgetNote ?? `预算 ${guide.budget}`,
                "aria-label": guide.budgetNote ? `预算 ${guide.budget}，${guide.budgetNote}` : `预算 ${guide.budget}`,
                children: [
                  guide.budgetSource === "cost_breakdown" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ListOrdered, { className: "h-2.5 w-2.5 shrink-0 opacity-80", "aria-hidden": true }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "h-2.5 w-2.5 shrink-0 opacity-70", "aria-hidden": true }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: guide.budget })
                ]
              }
            )
          ] }),
          !compact ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-slate-400", children: guide.summary }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1.5 text-[10px] text-slate-500", children: [
              guide.days,
              " 天"
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "home-map-trail-card__meta mt-1 text-[10px]", children: [
            guide.days,
            " 天 · 点击一键规划"
          ] })
        ]
      }
    ),
    !compact ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to: guideDetailPath(guide.id),
        className: "mt-1 flex items-center gap-0.5 text-[10px] text-emerald-400 hover:underline",
        onClick: (event) => event.stopPropagation(),
        children: [
          "查看详情",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3", "aria-hidden": true })
        ]
      }
    ) : null
  ] });
}
function HomeMapTrailMobileStrip({
  guides,
  highlightedTrailId,
  onPlanGuide,
  planning = false
}) {
  const { ref: scrollRef, scrollBy } = useHorizontalDragScroll();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "aside",
    {
      className: "home-map-trail-strip pointer-events-auto relative z-20 w-full min-w-0 shrink-0 overflow-hidden",
      "aria-label": "攻略列表",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between gap-2 px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "home-map-trail-strip__title text-xs font-semibold sm:text-sm", children: HOME_MAP_TRAIL.feedTitle }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "home-map-trail-strip__subtitle text-[10px] sm:text-[11px]", children: [
              "共 ",
              guides.length,
              " 条 · 点击卡片一键规划"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                "aria-label": "向左浏览攻略",
                onClick: () => scrollBy(-320),
                className: "home-map-trail-strip__nav-btn inline-flex h-7 w-7 items-center justify-center rounded-lg transition",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4", "aria-hidden": true })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                "aria-label": "向右浏览攻略",
                onClick: () => scrollBy(320),
                className: "home-map-trail-strip__nav-btn inline-flex h-7 w-7 items-center justify-center rounded-lg transition",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4", "aria-hidden": true })
              }
            ),
            highlightedTrailId ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              Link,
              {
                to: guideDetailPath(highlightedTrailId),
                className: "home-map-trail-strip__detail-link ml-1 hidden text-[10px] font-medium hover:underline sm:inline",
                children: "详情 →"
              }
            ) : null
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            ref: scrollRef,
            className: "home-map-trail-strip__scroll min-w-0 max-w-full overflow-x-auto overscroll-x-contain px-3 pb-3",
            role: "list",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "home-map-trail-strip__track flex flex-nowrap gap-2", children: guides.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                role: "listitem",
                className: "home-map-trail-strip__empty shrink-0 rounded-xl border border-dashed px-4 py-3 text-xs",
                children: HOME_MAP_TRAIL.stripEmptyHint
              }
            ) : guides.map((guide) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-trail-id": guide.id, role: "listitem", className: "shrink-0 snap-start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TrailGuideCard,
              {
                guide,
                active: guide.id === highlightedTrailId,
                onPlanGuide,
                planning,
                compact: true
              }
            ) }, guide.id)) })
          }
        )
      ]
    }
  );
}
function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash + value.charCodeAt(i) * (i + 3)) % 997;
  }
  return hash;
}
function quadraticPoint(p0, p1, p2, t) {
  const u = 1 - t;
  const lng = u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0];
  const lat = u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1];
  return [lng, lat];
}
function controlPoint(start, end, bendSeed) {
  const midLng = (start[0] + end[0]) / 2;
  const midLat = (start[1] + end[1]) / 2;
  const hash = hashString(bendSeed);
  const sign = hash % 2 === 0 ? 1 : -1;
  const magnitude = 0.12 + hash % 7 * 0.02;
  const deltaLng = (end[0] - start[0]) * magnitude * sign;
  const deltaLat = (end[1] - start[1]) * magnitude * -sign;
  return [midLng + deltaLng, midLat + deltaLat];
}
function sampleQuadraticBezier(start, end, steps = 40, bendSeed = `${start.join(",")}-${end.join(",")}`) {
  const control = controlPoint(start, end, bendSeed);
  const points = [];
  for (let i = 0; i <= steps; i += 1) {
    points.push(quadraticPoint(start, control, end, i / steps));
  }
  return points;
}
const USER_ROUTE_ID = "__user_route__";
function buildUserRouteLineCollection(origin, destination) {
  const coordinates = sampleQuadraticBezier(origin, destination, 48, USER_ROUTE_ID);
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          id: USER_ROUTE_ID,
          colorStart: "#22d3ee",
          colorEnd: "#a855f7"
        },
        geometry: {
          type: "LineString",
          coordinates
        }
      }
    ]
  };
}
function buildMultiStopRouteLineCollection(waypoints) {
  if (waypoints.length < 2) {
    return { type: "FeatureCollection", features: [] };
  }
  const coordinates = [];
  for (let index = 0; index < waypoints.length - 1; index += 1) {
    const segment = sampleQuadraticBezier(
      waypoints[index],
      waypoints[index + 1],
      32,
      `${USER_ROUTE_ID}_${index}`
    );
    if (index === 0) {
      coordinates.push(...segment);
    } else {
      coordinates.push(...segment.slice(1));
    }
  }
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          id: USER_ROUTE_ID,
          colorStart: "#22d3ee",
          colorEnd: "#a855f7",
          waypointCount: waypoints.length,
          waypoints
        },
        geometry: {
          type: "LineString",
          coordinates
        }
      }
    ]
  };
}
function computeRouteFlyTarget(origin, destination) {
  return computeBoundsFlyTarget([origin, destination]);
}
function computeBoundsFlyTarget(points) {
  if (points.length === 0) {
    return { longitude: 117.076, latitude: 36.666, zoom: 8 };
  }
  if (points.length === 1) {
    return { longitude: points[0][0], latitude: points[0][1], zoom: 9 };
  }
  let minLng = points[0][0];
  let maxLng = points[0][0];
  let minLat = points[0][1];
  let maxLat = points[0][1];
  for (const [lng, lat] of points) {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }
  const longitude = (minLng + maxLng) / 2;
  const latitude = (minLat + maxLat) / 2;
  const span = Math.max(maxLng - minLng, maxLat - minLat);
  const zoom = span > 12 ? 4.5 : span > 8 ? 5.2 : span > 5 ? 6 : span > 2 ? 7 : span > 0.8 ? 8 : 9;
  return { longitude, latitude, zoom };
}
function buildOriginEndpoint(origin) {
  return {
    label: origin.label,
    gcjLng: origin.gcjLng,
    gcjLat: origin.gcjLat,
    wgsLng: origin.longitude,
    wgsLat: origin.latitude
  };
}
function useCrossCityDestinationPlan({
  userOrigin,
  refreshOrigin,
  applyFallbackOrigin,
  planning,
  locateOnMap,
  setUserRouteCollection,
  showPlanError
}) {
  const resolveOrigin = reactExports.useCallback(async () => {
    let origin = userOrigin ?? await refreshOrigin();
    if (!origin) {
      return null;
    }
    return buildOriginEndpoint(origin);
  }, [applyFallbackOrigin, refreshOrigin, userOrigin]);
  const planToDestination = reactExports.useCallback(
    async (destination, guide) => {
      if (planning.isGenerating) {
        return;
      }
      planning.closeModal();
      primePlanVoiceNarration();
      const originPoint = await resolveOrigin();
      if (!originPoint) {
        showPlanError("未获取到出发地：请在下方输入地址点「地址校正」，或点「地图选出发地」");
        return;
      }
      const routeLine = buildUserRouteLineCollection(
        [originPoint.wgsLng, originPoint.wgsLat],
        [destination.wgsLng, destination.wgsLat]
      );
      setUserRouteCollection(routeLine);
      locateOnMap(
        computeRouteFlyTarget(
          [originPoint.wgsLng, originPoint.wgsLat],
          [destination.wgsLng, destination.wgsLat]
        )
      );
      const planQuery = guide ? buildGuidePlanQuery(originPoint.label, guide) : buildCrossCityPlanQuery(originPoint.label, destination.label);
      const trigger = guide ? "card_click" : "map_click";
      speakPlanVoiceNarration(buildRoutePlanningIntro(originPoint.label, destination.label));
      const result = await planning.generateFromMapDestination(originPoint, destination, {
        planQuery,
        trigger
      });
      if (typeof result === "string") {
        showPlanError(result);
        return;
      }
      if (result) {
        speakPlanVoiceNarration(
          buildRoutePlanningSummary(originPoint.label, destination.label, result.content)
        );
      }
    },
    [
      locateOnMap,
      planning,
      resolveOrigin,
      setUserRouteCollection,
      showPlanError
    ]
  );
  const planFromMapClick = reactExports.useCallback(
    async (event) => {
      const destGcj = { longitude: event.lng, latitude: event.lat };
      const destWgs = convertCoordinates(destGcj, "gcj02", "wgs84");
      const labels = await reverseGeocodeAmapLabels(event.lng, event.lat);
      const destinationLabel = sanitizeLocationLabelForDisplay(
        (labels == null ? void 0 : labels.destinationLabel) ?? (labels == null ? void 0 : labels.originLabel) ?? (labels == null ? void 0 : labels.nearbyLabel),
        "所选地点"
      );
      await planToDestination({
        label: destinationLabel,
        gcjLng: destGcj.longitude,
        gcjLat: destGcj.latitude,
        wgsLng: destWgs.longitude,
        wgsLat: destWgs.latitude
      });
    },
    [planToDestination]
  );
  const planFromCoordinates = reactExports.useCallback(
    async (wgsLng, wgsLat, label, guide) => {
      const gcj = convertCoordinates({ longitude: wgsLng, latitude: wgsLat }, "wgs84", "gcj02");
      await planToDestination(
        {
          label,
          gcjLng: gcj.longitude,
          gcjLat: gcj.latitude,
          wgsLng,
          wgsLat
        },
        guide
      );
    },
    [planToDestination]
  );
  return { planFromMapClick, planFromCoordinates, planToDestination };
}
const PLAN_STREAM_FLUSH_MS = 200;
function createThrottledFlusher(flush, intervalMs = PLAN_STREAM_FLUSH_MS) {
  let timer = null;
  const schedule = () => {
    if (timer !== null) {
      return;
    }
    timer = setTimeout(() => {
      timer = null;
      flush();
    }, intervalMs);
  };
  const flushNow = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    flush();
  };
  const cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };
  return { schedule, flushNow, cancel };
}
class GenerateMapPlanApiError extends Error {
  constructor(message, options) {
    super(message);
    __publicField(this, "status");
    __publicField(this, "code");
    this.name = "GenerateMapPlanApiError";
    this.status = options == null ? void 0 : options.status;
    this.code = options == null ? void 0 : options.code;
  }
}
const PLAN_FETCH_TIMEOUT_MS = 75e3;
function mergeAbortSignals(userSignal) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort(new DOMException("规划请求超时", "TimeoutError"));
  }, PLAN_FETCH_TIMEOUT_MS);
  const abortFrom = (source) => {
    window.clearTimeout(timeoutId);
    if (!controller.signal.aborted) {
      controller.abort(source == null ? void 0 : source.reason);
    }
  };
  if (userSignal == null ? void 0 : userSignal.aborted) {
    abortFrom(userSignal);
    return controller.signal;
  }
  userSignal == null ? void 0 : userSignal.addEventListener("abort", () => abortFrom(userSignal), { once: true });
  controller.signal.addEventListener(
    "abort",
    () => {
      window.clearTimeout(timeoutId);
    },
    { once: true }
  );
  return controller.signal;
}
async function fetchMapPlanFromApi(params, options) {
  const response = await fetch(AI_API.generatePlan, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(params),
    signal: mergeAbortSignals(options == null ? void 0 : options.signal)
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload && "error" in payload && payload.error ? payload.error : `生成方案失败（HTTP ${response.status}）`;
    throw new GenerateMapPlanApiError(message, {
      status: response.status,
      code: payload && "code" in payload ? payload.code : void 0
    });
  }
  if (!payload || !("content" in payload) || !payload.content) {
    throw new GenerateMapPlanApiError("API 返回格式无效", { status: response.status });
  }
  return payload;
}
async function fetchMapPlanWithStream(options) {
  var _a, _b;
  const response = await fetch(AI_API.generatePlanStream, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream"
    },
    body: JSON.stringify(options.params),
    signal: options.signal
  });
  const contentType = response.headers.get("Content-Type") ?? "";
  if (!response.ok && !contentType.includes("text/event-stream")) {
    let message = `流式规划失败 (${response.status})`;
    try {
      const json = await response.json();
      if (json.error) {
        message = json.error;
      }
    } catch {
    }
    throw new GenerateMapPlanApiError(message);
  }
  if (!response.body) {
    throw new GenerateMapPlanApiError("未收到流式响应");
  }
  let finished = false;
  let doneFromServer = false;
  let unconfigured = false;
  let locationName = ((_a = options.params.locationName) == null ? void 0 : _a.trim()) || "所选地点";
  let accumulated = "";
  await parseSseStream(
    response.body,
    {
      onEvent: (event, data) => {
        var _a2, _b2, _c, _d, _e, _f;
        if (event === "ping") {
          return;
        }
        if (event === "status") {
          const message = data.message ?? "";
          if (message) {
            (_a2 = options.onStatus) == null ? void 0 : _a2.call(options, message);
          }
          return;
        }
        if (event === "delta") {
          const text = data.text ?? "";
          if (text) {
            accumulated += text;
            (_b2 = options.onDelta) == null ? void 0 : _b2.call(options, text);
          }
          return;
        }
        if (event === "sync") {
          const text = data.text ?? "";
          if (text) {
            accumulated = text;
            (_c = options.onSync) == null ? void 0 : _c.call(options, text);
          }
          return;
        }
        if (event === "done") {
          const payload = data;
          if ((_d = payload.locationName) == null ? void 0 : _d.trim()) {
            locationName = payload.locationName.trim();
          }
          if ((_e = payload.content) == null ? void 0 : _e.trim()) {
            accumulated = finalizeMapPlanContent(
              payload.content.trim(),
              locationName,
              options.params.originName,
              options.params.searchQuery ?? options.params.initialQuery ?? options.params.query
            );
            (_f = options.onSync) == null ? void 0 : _f.call(options, accumulated);
            doneFromServer = true;
          }
          finished = true;
          return;
        }
        if (event === "error") {
          const payload = data;
          if (payload.code === "deepseek_unconfigured") {
            unconfigured = true;
            return;
          }
          throw new GenerateMapPlanApiError(payload.message ?? "流式规划失败", {
            code: payload.code
          });
        }
      }
    },
    options.signal
  );
  if (unconfigured) {
    return fetchMapPlanFromApi(options.params, { signal: options.signal });
  }
  if ((_b = options.signal) == null ? void 0 : _b.aborted) {
    throw new GenerateMapPlanApiError("已停止生成", { code: "aborted" });
  }
  let content = sanitizePlanContentForDisplay(accumulated.trim());
  if (!doneFromServer) {
    content = finalizeMapPlanContent(
      content,
      locationName,
      options.params.originName,
      options.params.searchQuery ?? options.params.initialQuery ?? options.params.query
    );
  }
  if (!content || !isMapPlanDeliverable(content)) {
    throw new GenerateMapPlanApiError("方案内容为空，请重试");
  }
  if (!finished && !doneFromServer) {
    throw new GenerateMapPlanApiError("连接已断开，请重新点击一键规划", {
      code: "plan_incomplete"
    });
  }
  return {
    locationName,
    content
  };
}
function parseUserTravelSearch(raw) {
  const normalizedQuery = coalesceSearchQueryWithDestination(
    correctAdvisorSpeechIntent(raw.trim())
  );
  if (!normalizedQuery) {
    return null;
  }
  const route = extractRouteEndpoints(normalizedQuery);
  const multiStopNames = extractMultiStopDestinations(normalizedQuery);
  const isMultiStopQuery = multiStopNames.length >= 2;
  const singleDestination = extractSearchDestination(normalizedQuery) ?? extractPrimaryLocation(normalizedQuery);
  const primaryPlace = isMultiStopQuery ? multiStopNames[0] ?? null : singleDestination;
  const destinationLabel = isMultiStopQuery ? multiStopNames.join("→") : singleDestination ?? normalizedQuery;
  return {
    normalizedQuery,
    primaryPlace,
    destinationLabel,
    multiStopNames,
    route,
    isMultiStopQuery
  };
}
function isDurationOnlyTravelQuery(raw) {
  const parsed = parseUserTravelSearch(raw);
  if (!parsed) {
    return false;
  }
  if (parsed.isMultiStopQuery || parsed.route.destination || parsed.primaryPlace) {
    return false;
  }
  const intent = parseTravelSearchIntent(parsed.normalizedQuery);
  return Boolean(intent.days);
}
const MULTI_STOP_TIMEOUT_MS = 8e3;
const GEOCODE_HINT_TIMEOUT_MS = 5e3;
async function resolveUserTravelSearch(raw) {
  const parsed = parseUserTravelSearch(raw);
  if (!parsed) {
    return null;
  }
  if (parsed.isMultiStopQuery) {
    const localMultiStop = resolveMultiStopFromLocalTable(parsed.multiStopNames);
    if (localMultiStop) {
      return { parsed, location: localMultiStop.primary, multiStop: localMultiStop };
    }
    const multiStop = await withTimeout(
      resolveMultiStopSearchLocations(parsed.normalizedQuery),
      MULTI_STOP_TIMEOUT_MS,
      "识别目的地超时，请稍后重试"
    ).catch(() => null);
    if (multiStop) {
      return { parsed, location: multiStop.primary, multiStop };
    }
  }
  const syncFromQuery = resolveCityCenterSync(parsed.normalizedQuery);
  if (syncFromQuery) {
    return { parsed, location: syncFromQuery, multiStop: null };
  }
  if (parsed.primaryPlace) {
    const syncFromPrimary = resolveCityCenterSync(parsed.primaryPlace);
    if (syncFromPrimary) {
      return { parsed, location: syncFromPrimary, multiStop: null };
    }
    const fromPrimaryHint = await withTimeout(
      resolveSearchLocation(parsed.primaryPlace),
      GEOCODE_HINT_TIMEOUT_MS,
      "识别目的地超时，请稍后重试"
    ).catch(() => null);
    if (fromPrimaryHint) {
      return { parsed, location: fromPrimaryHint, multiStop: null };
    }
  }
  const fromFullQuery = await withTimeout(
    resolveSearchLocation(parsed.normalizedQuery),
    GEOCODE_HINT_TIMEOUT_MS,
    "识别目的地超时，请稍后重试"
  ).catch(() => null);
  if (!fromFullQuery) {
    return null;
  }
  return { parsed, location: fromFullQuery, multiStop: null };
}
function formatTravelSearchResolveError(parsed) {
  if (!(parsed == null ? void 0 : parsed.primaryPlace)) {
    return "未能识别目的地，请加上城市名，如「开封 亲子 四天」";
  }
  return `暂时无法定位「${parsed.primaryPlace}」，请检查网络后重试，或只输入城市名`;
}
function isManualOriginLocked(source) {
  return source === "manual";
}
function toEndpoint(label, lng, lat, coordSystem) {
  const gcj = coordSystem === "gcj02" ? { longitude: lng, latitude: lat } : convertCoordinates({ longitude: lng, latitude: lat }, "wgs84", "gcj02");
  const wgs = coordSystem === "wgs84" ? { longitude: lng, latitude: lat } : convertCoordinates({ longitude: lng, latitude: lat }, "gcj02", "wgs84");
  return {
    label: sanitizeLocationLabelForDisplay(label),
    gcjLng: gcj.longitude,
    gcjLat: gcj.latitude,
    wgsLng: wgs.longitude,
    wgsLat: wgs.latitude
  };
}
async function resolvePlanOriginEndpoint(queryOrigin, gpsOrManualOrigin, userOriginSource) {
  if (gpsOrManualOrigin && isManualOriginLocked(userOriginSource)) {
    return {
      endpoint: gpsOrManualOrigin,
      labelForAi: gpsOrManualOrigin.label,
      source: "manual"
    };
  }
  const trimmed = queryOrigin == null ? void 0 : queryOrigin.trim();
  if (trimmed) {
    const geocoded = await forwardGeocodeWithAmapGeocoder(trimmed);
    if (geocoded) {
      const endpoint = toEndpoint(geocoded.label, geocoded.lng, geocoded.lat, "gcj02");
      return {
        endpoint,
        labelForAi: endpoint.label,
        source: "search"
      };
    }
    const sync = resolveCityCenterSync(trimmed);
    if (sync) {
      const endpoint = toEndpoint(sync.label, sync.longitude, sync.latitude, sync.coordSystem);
      return {
        endpoint,
        labelForAi: endpoint.label,
        source: "search"
      };
    }
  }
  if (gpsOrManualOrigin) {
    const source = userOriginSource === "fallback" ? "fallback" : userOriginSource === "ip" ? "ip" : userOriginSource === "manual" ? "manual" : "gps";
    return {
      endpoint: gpsOrManualOrigin,
      labelForAi: gpsOrManualOrigin.label,
      source
    };
  }
  return { endpoint: null, labelForAi: null, source: "none" };
}
function isMultiStopDestinationLabel(destinationLabel) {
  return Boolean(destinationLabel == null ? void 0 : destinationLabel.includes("→"));
}
function firstMultiStopLabel(destinationLabel) {
  var _a;
  return ((_a = destinationLabel.split("→")[0]) == null ? void 0 : _a.trim()) ?? destinationLabel.trim();
}
function shouldAttachOriginToPlan(origin, queryOrigin, destinationLabel) {
  if (!origin.labelForAi || !(destinationLabel == null ? void 0 : destinationLabel.trim())) {
    return false;
  }
  if (queryOrigin == null ? void 0 : queryOrigin.trim()) {
    return true;
  }
  const dest = isMultiStopDestinationLabel(destinationLabel) ? firstMultiStopLabel(destinationLabel) : destinationLabel.trim();
  if (isSameCityRegion(origin.labelForAi, dest)) {
    return false;
  }
  if (origin.source === "gps" && !isMultiStopDestinationLabel(destinationLabel) && /路\d+|街道|大厦|产业园/.test(origin.labelForAi)) {
    return false;
  }
  return true;
}
function buildPlanRouteDisplayLabel(destinationLabel, originName) {
  var _a;
  const dest = destinationLabel.trim();
  if (!dest) {
    return "所选地点";
  }
  const origin = originName == null ? void 0 : originName.trim();
  if (!origin) {
    return dest;
  }
  if (dest.includes("→")) {
    const firstStop = (_a = dest.split("→")[0]) == null ? void 0 : _a.trim();
    if (firstStop && isSameCityRegion(origin, firstStop)) {
      return dest;
    }
    return `${origin} → ${dest}`;
  }
  if (isSameCityRegion(origin, dest)) {
    return dest;
  }
  return `${origin} → ${dest}`;
}
function filterOriginFromMultiStops(stops, originName) {
  const origin = originName == null ? void 0 : originName.trim();
  if (!origin || stops.length < 2) {
    return stops;
  }
  const originCity = extractPrimaryLocation(origin) ?? origin;
  return stops.filter((stop) => {
    if (stop === origin || stop === originCity) {
      return false;
    }
    if (isSameCityRegion(origin, stop)) {
      return false;
    }
    return true;
  });
}
function preferPlanRouteLabel(clientLabel, serverLabel) {
  const client = clientLabel.trim();
  const server = serverLabel.trim();
  if (!client) {
    return server || "所选地点";
  }
  if (!server) {
    return client;
  }
  const clientStops = getMultiStopNames(client);
  const serverStops = getMultiStopNames(server);
  if (clientStops.length >= 2 && clientStops.length >= serverStops.length) {
    return client;
  }
  if (serverStops.length >= 2 && serverStops.length > clientStops.length) {
    return server;
  }
  if (client.includes("→") && !server.includes("→")) {
    return client;
  }
  return server;
}
const GEOCODE_TIMEOUT_MS = 12e3;
function buildDefaultOriginEndpoint() {
  const demo = buildDefaultDemoOrigin();
  return {
    label: demo.label,
    gcjLng: demo.gcjLng,
    gcjLat: demo.gcjLat,
    wgsLng: demo.longitude,
    wgsLat: demo.latitude
  };
}
const INITIAL_LOCATION_LABEL = "正在识别地点：...";
function formatPlanningLabel(name) {
  return `正在规划：${name}`;
}
function isAbortError(err) {
  return err instanceof DOMException && err.name === "AbortError";
}
async function runFetchPlan(params, signal, stream) {
  return fetchMapPlanWithStream({
    params: {
      lng: params.lng,
      lat: params.lat,
      query: params.query,
      locationName: params.locationName,
      originName: params.originName ?? void 0,
      searchQuery: params.searchQuery,
      initialQuery: params.initialQuery ?? params.searchQuery
    },
    signal,
    onDelta: stream == null ? void 0 : stream.onDelta,
    onSync: stream == null ? void 0 : stream.onSync,
    onStatus: stream == null ? void 0 : stream.onStatus
  });
}
function useMapPlanningAssistant() {
  const global = useGlobalMapPlanningStore(
    useShallow((state) => ({
      resultOpen: state.resultOpen,
      resultLocation: state.resultLocation,
      resultContent: state.resultContent,
      conversationTurns: state.conversationTurns,
      followUpLoading: state.followUpLoading,
      followUpError: state.followUpError,
      saveLoading: state.saveLoading,
      saveError: state.saveError,
      saveSuccess: state.saveSuccess,
      planStreaming: state.planStreaming,
      openPlanResult: state.openPlanResult,
      beginPlanStreamSession: state.beginPlanStreamSession,
      finishPlanStream: state.finishPlanStream,
      closeResult: state.closeResult
    }))
  );
  const [modalOpen, setModalOpen] = reactExports.useState(false);
  const [anchor, setAnchor] = reactExports.useState({ x: 0, y: 0 });
  const [coords, setCoords] = reactExports.useState({ lng: 0, lat: 0 });
  const [resolvedLocationName, setResolvedLocationName] = reactExports.useState(null);
  const [query, setQuery] = reactExports.useState("");
  const [locationLabel, setLocationLabel] = reactExports.useState(INITIAL_LOCATION_LABEL);
  const [loading, setLoading] = reactExports.useState(false);
  const [streamPreview, setStreamPreview] = reactExports.useState("");
  const [error, setError] = reactExports.useState(null);
  const planRequestRef = reactExports.useRef(0);
  const abortRef = reactExports.useRef(null);
  const streamPreviewRef = reactExports.useRef("");
  const streamFlushRef = reactExports.useRef(
    createThrottledFlusher(() => {
      const content = streamPreviewRef.current;
      setStreamPreview(content);
      useGlobalMapPlanningStore.getState().replacePlanStreamContent(content);
    })
  );
  const releasePlanRequest = reactExports.useCallback((requestId) => {
    streamFlushRef.current.cancel();
    useGlobalMapPlanningStore.getState().setPlanStreamStatus(null);
    if (requestId === planRequestRef.current) {
      abortRef.current = null;
      setLoading(false);
      setStreamPreview("");
      streamPreviewRef.current = "";
    }
  }, []);
  const abortActivePlanRequest = reactExports.useCallback(() => {
    var _a;
    planRequestRef.current += 1;
    (_a = abortRef.current) == null ? void 0 : _a.abort();
    abortRef.current = null;
    stopPlanVoiceNarration();
    setLoading(false);
    setStreamPreview("");
    streamPreviewRef.current = "";
    useGlobalMapPlanningStore.setState({
      planStreaming: false,
      planStreamStatus: null
    });
  }, []);
  const cancelActivePlanRequest = reactExports.useCallback(() => {
    abortActivePlanRequest();
    useGlobalMapPlanningStore.getState().closeResult();
  }, [abortActivePlanRequest]);
  const closeModal = reactExports.useCallback(() => {
    cancelActivePlanRequest();
    setModalOpen(false);
    setError(null);
  }, [cancelActivePlanRequest]);
  reactExports.useEffect(() => {
    registerPlanCancelHandler(cancelActivePlanRequest);
    return () => {
      registerPlanCancelHandler(null);
    };
  }, [cancelActivePlanRequest]);
  const syncPlanStreamContent = reactExports.useCallback((fullText) => {
    streamPreviewRef.current = fullText;
    streamFlushRef.current.flushNow();
  }, []);
  const pushPlanStreamDelta = reactExports.useCallback((text) => {
    if (!text) {
      return;
    }
    streamPreviewRef.current += text;
    streamFlushRef.current.schedule();
  }, []);
  const handlePlanStreamStatus = reactExports.useCallback((message) => {
    useGlobalMapPlanningStore.getState().setPlanStreamStatus(message);
  }, []);
  const completePlanStream = reactExports.useCallback(
    (params) => {
      streamFlushRef.current.cancel();
      useGlobalMapPlanningStore.getState().setPlanStreamStatus(null);
      global.finishPlanStream(params);
    },
    [global]
  );
  const beginPlanRequest = reactExports.useCallback(() => {
    streamPreviewRef.current = "";
    setStreamPreview("");
    streamFlushRef.current.cancel();
    useGlobalMapPlanningStore.getState().setPlanStreamStatus(null);
    abortActivePlanRequest();
    const requestId = planRequestRef.current;
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    return { requestId, signal: controller.signal };
  }, [abortActivePlanRequest]);
  const handleMapClick = reactExports.useCallback(async (event) => {
    setAnchor({ x: event.x, y: event.y });
    setCoords({ lng: event.lng, lat: event.lat });
    setQuery("");
    setResolvedLocationName(null);
    setLocationLabel("正在识别地点：...");
    setError(null);
    setModalOpen(true);
    try {
      const address = await withTimeout(
        reverseGeocodeWithAmapGeocoder(event.lng, event.lat),
        GEOCODE_TIMEOUT_MS,
        "识别地点超时"
      );
      const label = sanitizeLocationLabelForDisplay(address, "所选地点");
      setResolvedLocationName(label);
      setLocationLabel(formatPlanningLabel(label));
    } catch {
      const fallback = "所选地点";
      setResolvedLocationName(fallback);
      setLocationLabel(formatPlanningLabel(fallback));
    }
  }, []);
  const generatePlan = reactExports.useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      setError("请填写旅行需求");
      return;
    }
    const { requestId, signal } = beginPlanRequest();
    const displayLocation = sanitizeLocationLabelForDisplay(
      resolvedLocationName ?? trimmed
    );
    global.beginPlanStreamSession({
      trigger: "map_click",
      locationName: displayLocation,
      lng: coords.lng,
      lat: coords.lat,
      initialQuery: trimmed
    });
    try {
      const result = await runFetchPlan(
        {
          lng: coords.lng,
          lat: coords.lat,
          query: trimmed,
          locationName: displayLocation
        },
        signal,
        {
          onDelta: pushPlanStreamDelta,
          onSync: syncPlanStreamContent,
          onStatus: handlePlanStreamStatus
        }
      );
      if (requestId !== planRequestRef.current) {
        return;
      }
      const planContent = result.content.trim() || streamPreviewRef.current.trim();
      if (!planContent) {
        global.closeResult();
        setError("方案内容为空，请重试");
        return;
      }
      setLocationLabel(formatPlanningLabel(displayLocation));
      setModalOpen(false);
      setLoading(false);
      completePlanStream({
        trigger: "map_click",
        locationName: result.locationName,
        content: planContent,
        lng: coords.lng,
        lat: coords.lat,
        initialQuery: trimmed
      });
    } catch (err) {
      if (requestId !== planRequestRef.current) {
        return;
      }
      global.closeResult();
      if (isAbortError(err)) {
        return;
      }
      setError(toErrorMessage(err, "生成方案失败，请稍后再试"));
    } finally {
      releasePlanRequest(requestId);
    }
  }, [
    beginPlanRequest,
    coords.lat,
    coords.lng,
    global,
    pushPlanStreamDelta,
    syncPlanStreamContent,
    handlePlanStreamStatus,
    completePlanStream,
    releasePlanRequest,
    query,
    resolvedLocationName
  ]);
  const generateFromSearchQuery = reactExports.useCallback(
    async (searchText, onLocated, options) => {
      var _a, _b;
      const trimmed = coalesceSearchQueryWithDestination(
        correctAdvisorSpeechIntent(searchText.trim())
      );
      if (!trimmed) {
        return "请输入旅行需求";
      }
      const parsedSearch = parseUserTravelSearch(trimmed);
      if (!parsedSearch) {
        return "请输入旅行需求";
      }
      if (isDurationOnlyTravelQuery(trimmed)) {
        return "请加上城市名，如「成都 三天」";
      }
      const { requestId, signal } = beginPlanRequest();
      setModalOpen(false);
      const route = parsedSearch.route;
      const localPreview = resolveCityCenterSync(trimmed) ?? (parsedSearch.primaryPlace ? resolveCityCenterSync(parsedSearch.primaryPlace) : null);
      const provisionalLabel = parsedSearch.destinationLabel;
      let provisionalGcj = { lng: 116.4074, lat: 39.9042 };
      if (localPreview) {
        const previewGcj = convertCoordinates(
          { longitude: localPreview.longitude, latitude: localPreview.latitude },
          localPreview.coordSystem,
          "gcj02"
        );
        provisionalGcj = { lng: previewGcj.longitude, lat: previewGcj.latitude };
      }
      global.beginPlanStreamSession({
        trigger: "search",
        locationName: provisionalLabel,
        lng: provisionalGcj.lng,
        lat: provisionalGcj.lat,
        initialQuery: trimmed
      });
      try {
        const searchResolved = await resolveUserTravelSearch(trimmed);
        if (!searchResolved) {
          global.closeResult();
          return formatTravelSearchResolveError(parsedSearch);
        }
        const { location: resolved, multiStop: multiStopResolved } = searchResolved;
        const gcj = convertCoordinates(
          { longitude: resolved.longitude, latitude: resolved.latitude },
          resolved.coordSystem,
          "gcj02"
        );
        const flyWgs84 = convertCoordinates(
          { longitude: resolved.longitude, latitude: resolved.latitude },
          resolved.coordSystem,
          "wgs84"
        );
        provisionalGcj = { lng: gcj.longitude, lat: gcj.latitude };
        setCoords({ lng: gcj.longitude, lat: gcj.latitude });
        setResolvedLocationName(resolved.label);
        onLocated == null ? void 0 : onLocated({
          longitude: flyWgs84.longitude,
          latitude: flyWgs84.latitude,
          zoom: 9
        });
        const intent = parseTravelSearchIntent(trimmed);
        const parsedMultiStops = (multiStopResolved == null ? void 0 : multiStopResolved.stops.map((stop) => stop.stopName)) ?? (intent.multiStops.length >= 2 ? intent.multiStops : extractMultiStopDestinations(trimmed));
        const originInput = (options == null ? void 0 : options.origin) ?? buildDefaultOriginEndpoint();
        const originSource = (options == null ? void 0 : options.origin) ? options == null ? void 0 : options.originSource : "fallback";
        const originResolved = await resolvePlanOriginEndpoint(
          route.origin,
          originInput,
          originSource
        );
        const provisionalDestLabel = parsedMultiStops.length >= 2 ? parsedMultiStops.join("→") : sanitizeLocationLabelForDisplay(resolved.label);
        const attachOrigin = shouldAttachOriginToPlan(
          originResolved,
          route.origin,
          provisionalDestLabel
        );
        const originLabel = attachOrigin ? originResolved.labelForAi : parsedMultiStops.length >= 2 ? originResolved.labelForAi ?? buildDefaultOriginEndpoint().label : null;
        const multiStops = filterOriginFromMultiStops(parsedMultiStops, originLabel);
        const destLabel = multiStops.length >= 2 ? multiStops.join("→") : sanitizeLocationLabelForDisplay(resolved.label);
        const routeLabel = buildPlanRouteDisplayLabel(destLabel, originLabel);
        const crossCity = Boolean(originLabel) && !isSameCityRegion(originLabel, multiStops.length >= 2 ? multiStops[0] : destLabel);
        const aiQuery = multiStops.length >= 2 ? buildMultiStopSearchPlanQuery(multiStops, intent, originLabel) : crossCity ? buildCrossCitySearchPlanQuery(originLabel, destLabel, intent, trimmed) : buildEnrichedSearchPlanQuery(trimmed, destLabel, intent);
        const destEndpoint = {
          label: destLabel,
          gcjLng: gcj.longitude,
          gcjLat: gcj.latitude,
          wgsLng: flyWgs84.longitude,
          wgsLat: flyWgs84.latitude
        };
        const stopEndpoints = (multiStopResolved == null ? void 0 : multiStopResolved.stops.map((stop) => {
          const stopGcj = convertCoordinates(
            { longitude: stop.longitude, latitude: stop.latitude },
            stop.coordSystem,
            "gcj02"
          );
          const stopWgs = convertCoordinates(
            { longitude: stop.longitude, latitude: stop.latitude },
            stop.coordSystem,
            "wgs84"
          );
          return {
            label: stop.label,
            gcjLng: stopGcj.longitude,
            gcjLat: stopGcj.latitude,
            wgsLng: stopWgs.longitude,
            wgsLat: stopWgs.latitude
          };
        })) ?? (multiStops.length >= 2 ? [destEndpoint] : []);
        if (multiStops.length >= 2 && stopEndpoints.length >= 2) {
          (_a = options == null ? void 0 : options.onMultiStopRoute) == null ? void 0 : _a.call(options, originResolved.endpoint, stopEndpoints);
          const waypoints = [];
          if (originResolved.endpoint) {
            waypoints.push([originResolved.endpoint.wgsLng, originResolved.endpoint.wgsLat]);
          }
          for (const stop of stopEndpoints) {
            waypoints.push([stop.wgsLng, stop.wgsLat]);
          }
          if (waypoints.length >= 2) {
            onLocated == null ? void 0 : onLocated(computeBoundsFlyTarget(waypoints));
          }
        } else if (crossCity && originResolved.endpoint) {
          (_b = options == null ? void 0 : options.onCrossCityRoute) == null ? void 0 : _b.call(options, originResolved.endpoint, destEndpoint);
          onLocated == null ? void 0 : onLocated(
            computeRouteFlyTarget(
              [originResolved.endpoint.wgsLng, originResolved.endpoint.wgsLat],
              [destEndpoint.wgsLng, destEndpoint.wgsLat]
            )
          );
        }
        useGlobalMapPlanningStore.setState({
          resultLocation: routeLabel,
          coords: { lng: gcj.longitude, lat: gcj.latitude }
        });
        const result = await runFetchPlan(
          {
            lng: gcj.longitude,
            lat: gcj.latitude,
            query: aiQuery,
            searchQuery: trimmed,
            initialQuery: trimmed,
            locationName: destLabel,
            originName: originLabel ?? void 0
          },
          signal,
          {
            onDelta: pushPlanStreamDelta,
            onSync: syncPlanStreamContent,
            onStatus: handlePlanStreamStatus
          }
        );
        if (requestId !== planRequestRef.current) {
          return null;
        }
        const planContent = result.content.trim() || streamPreviewRef.current.trim();
        if (!planContent) {
          global.closeResult();
          return "方案内容为空，请重试";
        }
        setLoading(false);
        completePlanStream({
          trigger: "search",
          locationName: buildPlanRouteDisplayLabel(
            preferPlanRouteLabel(routeLabel, result.locationName),
            attachOrigin ? originLabel : null
          ),
          content: planContent,
          lng: gcj.longitude,
          lat: gcj.latitude,
          initialQuery: trimmed
        });
        return null;
      } catch (err) {
        if (requestId !== planRequestRef.current) {
          return null;
        }
        global.closeResult();
        if (isAbortError(err)) {
          return null;
        }
        return toErrorMessage(err, "生成方案失败，请稍后再试");
      } finally {
        releasePlanRequest(requestId);
      }
    },
    [
      beginPlanRequest,
      completePlanStream,
      global,
      pushPlanStreamDelta,
      syncPlanStreamContent,
      handlePlanStreamStatus,
      releasePlanRequest
    ]
  );
  const generateFromGuide = reactExports.useCallback(
    async (guide, originLabel, onLocated) => {
      const gcj = convertCoordinates(
        { longitude: guide.end_coords[0], latitude: guide.end_coords[1] },
        "wgs84",
        "gcj02"
      );
      const planQuery = buildGuidePlanQuery(originLabel ?? "当前位置", guide);
      const { requestId, signal } = beginPlanRequest();
      setModalOpen(false);
      global.closeResult();
      setCoords({ lng: gcj.longitude, lat: gcj.latitude });
      setResolvedLocationName(guide.end_city);
      onLocated == null ? void 0 : onLocated({
        longitude: guide.end_coords[0],
        latitude: guide.end_coords[1],
        zoom: 9
      });
      global.beginPlanStreamSession({
        trigger: "card_click",
        locationName: guide.end_city,
        lng: gcj.longitude,
        lat: gcj.latitude,
        initialQuery: planQuery
      });
      try {
        const result = await runFetchPlan(
          {
            lng: gcj.longitude,
            lat: gcj.latitude,
            query: planQuery,
            locationName: guide.end_city,
            originName: originLabel ?? void 0
          },
          signal,
          {
            onDelta: pushPlanStreamDelta,
            onSync: syncPlanStreamContent,
            onStatus: handlePlanStreamStatus
          }
        );
        if (requestId !== planRequestRef.current) {
          return null;
        }
        const planContent = result.content.trim() || streamPreviewRef.current.trim();
        if (!planContent) {
          global.closeResult();
          return "方案内容为空，请重试";
        }
        setLoading(false);
        completePlanStream({
          trigger: "card_click",
          locationName: result.locationName,
          content: planContent,
          lng: gcj.longitude,
          lat: gcj.latitude,
          initialQuery: planQuery
        });
        return null;
      } catch (err) {
        if (requestId !== planRequestRef.current) {
          return null;
        }
        global.closeResult();
        if (isAbortError(err)) {
          return null;
        }
        return toErrorMessage(err, "生成方案失败，请稍后再试");
      } finally {
        releasePlanRequest(requestId);
      }
    },
    [
      beginPlanRequest,
      completePlanStream,
      global,
      pushPlanStreamDelta,
      syncPlanStreamContent,
      handlePlanStreamStatus,
      releasePlanRequest
    ]
  );
  const generateFromMapDestination = reactExports.useCallback(
    async (origin, destination, options) => {
      var _a;
      const planQuery = (options == null ? void 0 : options.planQuery) ?? buildCrossCityPlanQuery(origin.label, destination.label);
      const trigger = (options == null ? void 0 : options.trigger) ?? "map_click";
      const { requestId, signal } = beginPlanRequest();
      setModalOpen(false);
      global.closeResult();
      setCoords({ lng: destination.gcjLng, lat: destination.gcjLat });
      setResolvedLocationName(destination.label);
      setQuery(planQuery);
      (_a = options == null ? void 0 : options.onLocated) == null ? void 0 : _a.call(options, {
        longitude: (origin.wgsLng + destination.wgsLng) / 2,
        latitude: (origin.wgsLat + destination.wgsLat) / 2,
        zoom: void 0
      });
      global.beginPlanStreamSession({
        trigger,
        locationName: destination.label,
        lng: destination.gcjLng,
        lat: destination.gcjLat,
        initialQuery: planQuery
      });
      try {
        const result = await runFetchPlan(
          {
            lng: destination.gcjLng,
            lat: destination.gcjLat,
            query: planQuery,
            locationName: destination.label,
            originName: origin.label
          },
          signal,
          {
            onDelta: pushPlanStreamDelta,
            onSync: syncPlanStreamContent,
            onStatus: handlePlanStreamStatus
          }
        );
        if (requestId !== planRequestRef.current) {
          return null;
        }
        const planContent = result.content.trim() || streamPreviewRef.current.trim();
        if (!planContent) {
          global.closeResult();
          return "方案内容为空，请重试";
        }
        setLoading(false);
        completePlanStream({
          trigger,
          locationName: result.locationName,
          content: planContent,
          lng: destination.gcjLng,
          lat: destination.gcjLat,
          initialQuery: planQuery
        });
        return { content: planContent, locationName: result.locationName };
      } catch (err) {
        if (requestId !== planRequestRef.current) {
          return null;
        }
        global.closeResult();
        if (isAbortError(err)) {
          return null;
        }
        return toErrorMessage(err, "生成方案失败，请稍后再试");
      } finally {
        releasePlanRequest(requestId);
      }
    },
    [
      beginPlanRequest,
      completePlanStream,
      global,
      pushPlanStreamDelta,
      syncPlanStreamContent,
      handlePlanStreamStatus,
      releasePlanRequest
    ]
  );
  return {
    modalOpen,
    anchor,
    locationLabel,
    query,
    loading,
    isGenerating: loading || global.planStreaming,
    streamPreview,
    planStreaming: global.planStreaming,
    error,
    resultOpen: global.resultOpen,
    resultLocation: global.resultLocation,
    resultContent: global.resultContent,
    conversationTurns: global.conversationTurns,
    followUpLoading: global.followUpLoading,
    followUpError: global.followUpError,
    saveLoading: global.saveLoading,
    saveError: global.saveError,
    saveSuccess: global.saveSuccess,
    setQuery,
    handleMapClick,
    generateFromSearchQuery,
    generateFromGuide,
    generateFromMapDestination,
    closeModal,
    cancelActivePlanRequest,
    closeResult: global.closeResult,
    generatePlan
  };
}
const PLAN_LOADING_MESSAGES = [
  "已收到需求，正在连接 AI…",
  "正在撰写简介与行程…",
  "行程出来后会接着补蜗牛提示…",
  "马上呈现完整方案…"
];
function usePlanLoadingMessage(active) {
  const serverStatus = useGlobalMapPlanningStore(
    (state) => active ? state.planStreamStatus : null
  );
  const [index, setIndex] = reactExports.useState(0);
  reactExports.useEffect(() => {
    if (!active) {
      setIndex(0);
      return void 0;
    }
    const timer = window.setInterval(() => {
      setIndex((current) => Math.min(current + 1, PLAN_LOADING_MESSAGES.length - 1));
    }, 2800);
    return () => {
      window.clearInterval(timer);
    };
  }, [active]);
  if (serverStatus == null ? void 0 : serverStatus.trim()) {
    return serverStatus.trim();
  }
  return PLAN_LOADING_MESSAGES[index] ?? PLAN_LOADING_MESSAGES[0];
}
const TAG_GRADIENTS = {
  budget: { start: "#34d399", end: "#10b981" },
  food: { start: "#fbbf24", end: "#f97316" },
  photo: { start: "#38bdf8", end: "#6366f1" },
  nature: { start: "#2dd4bf", end: "#14b8a6" }
};
function trailGradientForTag(tag) {
  const pair = TAG_GRADIENTS[tag];
  return { colorStart: pair.start, colorEnd: pair.end };
}
const TRAIL_WALL_HUB_CITY = "北京";
const TRAIL_WALL_HUB_COORDS = [116.4074, 39.9042];
function parseGuideDays(days) {
  const match = days.match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : 1;
}
function inferTrailTag(guide) {
  const blob = `${guide.tags.join(" ")} ${guide.title}`;
  if (/美食|小吃|吃|火锅|湘菜/.test(blob)) {
    return "food";
  }
  if (/摄影|拍照|打卡|海景|胶片/.test(blob)) {
    return "photo";
  }
  if (/自然|户外|徒步|洱海|西湖|公园|山/.test(blob)) {
    return "nature";
  }
  return "budget";
}
function resolveEndCoords(guide) {
  const coords = getCityCoordinates(guide.city);
  if (!coords) {
    return null;
  }
  return [coords.longitude, coords.latitude];
}
function resolveBudgetLabel(guide) {
  var _a, _b;
  const structuredTotal = (_b = (_a = guide.structured) == null ? void 0 : _a.costBreakdown) == null ? void 0 : _b.total;
  if (structuredTotal != null && structuredTotal > 0) {
    return {
      label: `¥${structuredTotal}`,
      note: "来自攻略花费清单合计（交通+住宿+餐饮+娱乐）",
      source: "cost_breakdown"
    };
  }
  return {
    label: guide.budget,
    note: "来自攻略列表标注预算",
    source: "list_label"
  };
}
function buildTrailSummary(guide, budgetLabel, budgetNote) {
  var _a, _b, _c;
  const note = budgetNote ?? (((_b = (_a = guide.structured) == null ? void 0 : _a.costBreakdown) == null ? void 0 : _b.total) ? `预算参考 ${budgetLabel}（攻略花费清单合计）` : `预算参考 ${budgetLabel}`);
  if ((_c = guide.listCard) == null ? void 0 : _c.excerpt) {
    return `${guide.listCard.excerpt} · ${note}`;
  }
  return `${guide.city} · ${guide.days} · ${note}`;
}
function guideToTrailWallItem(guide) {
  const endCoords = resolveEndCoords(guide);
  if (!endCoords) {
    return null;
  }
  const tag = inferTrailTag(guide);
  const { colorStart, colorEnd } = trailGradientForTag(tag);
  const { label: budgetLabel, note: budgetNote, source: budgetSource } = resolveBudgetLabel(guide);
  return {
    id: guide.id,
    title: guide.title,
    start_city: TRAIL_WALL_HUB_CITY,
    end_city: guide.city,
    start_coords: TRAIL_WALL_HUB_COORDS,
    end_coords: endCoords,
    days: parseGuideDays(guide.days),
    budget: budgetLabel,
    budgetNote,
    budgetSource,
    summary: buildTrailSummary(guide, budgetLabel, budgetNote),
    tag,
    colorStart,
    colorEnd
  };
}
function guidesToTrailWallItems(guides) {
  return guides.map(guideToTrailWallItem).filter((item) => item !== null);
}
const BEZIER_STEPS = 48;
function buildLineFeature(guide) {
  const coordinates = sampleQuadraticBezier(
    guide.start_coords,
    guide.end_coords,
    BEZIER_STEPS,
    guide.id
  );
  return {
    type: "Feature",
    properties: {
      id: guide.id,
      title: guide.title,
      start_city: guide.start_city,
      end_city: guide.end_city,
      days: guide.days,
      budget: guide.budget,
      summary: guide.summary,
      colorStart: guide.colorStart,
      colorEnd: guide.colorEnd
    },
    geometry: {
      type: "LineString",
      coordinates
    }
  };
}
function buildTrailWallLineCollection(guides) {
  return {
    type: "FeatureCollection",
    features: guides.map(buildLineFeature)
  };
}
function buildCrawlerPoint(guide, progress) {
  const coordinates = sampleQuadraticBezier(
    guide.start_coords,
    guide.end_coords,
    BEZIER_STEPS,
    guide.id
  );
  const index = Math.min(
    coordinates.length - 1,
    Math.max(0, Math.floor(progress * (coordinates.length - 1)))
  );
  const [longitude, latitude] = coordinates[index];
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          id: guide.id,
          color: guide.colorEnd
        },
        geometry: {
          type: "Point",
          coordinates: [longitude, latitude]
        }
      }
    ]
  };
}
function findTrailGuideById(guides, id) {
  if (!id) {
    return void 0;
  }
  return guides.find((guide) => guide.id === id);
}
function useHomeTrailWall() {
  const [viewState, setViewState] = reactExports.useState({
    ...HOME_MAP_TRAIL_VIEW
  });
  const [guides, setGuides] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [filter, setFilter] = reactExports.useState("all");
  const [highlightedTrailId, setHighlightedTrailId] = reactExports.useState(null);
  const [hoveredTrailId, setHoveredTrailId] = reactExports.useState(null);
  const [pulseOpacity, setPulseOpacity] = reactExports.useState(0.85);
  const [pulseBrightness, setPulseBrightness] = reactExports.useState(1);
  const [crawlerProgress, setCrawlerProgress] = reactExports.useState(0);
  const rafRef = reactExports.useRef(null);
  const startRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    let cancelled = false;
    async function loadGuides() {
      setLoading(true);
      try {
        const response = await fetchGuideList({ limit: 50 });
        if (cancelled) {
          return;
        }
        const items = guidesToTrailWallItems(response.items);
        setGuides(items);
        setHighlightedTrailId((current) => {
          var _a;
          return current ?? ((_a = items[0]) == null ? void 0 : _a.id) ?? null;
        });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void loadGuides();
    return () => {
      cancelled = true;
    };
  }, []);
  const visibleGuides = reactExports.useMemo(() => {
    const byTag = guides.filter((guide) => filter === "all" || guide.tag === filter);
    return filterTrailGuidesByDestination(byTag, searchQuery);
  }, [guides, filter, searchQuery]);
  const stripGuides = reactExports.useMemo(() => {
    return guides.filter((guide) => filter === "all" || guide.tag === filter);
  }, [guides, filter]);
  const activeTrailId = highlightedTrailId ?? hoveredTrailId;
  const lineCollection = reactExports.useMemo(
    () => buildTrailWallLineCollection(visibleGuides),
    [visibleGuides]
  );
  const highlightedGuide = reactExports.useMemo(
    () => findTrailGuideById(visibleGuides, activeTrailId),
    [visibleGuides, activeTrailId]
  );
  const crawlerGuide = reactExports.useMemo(
    () => findTrailGuideById(guides, highlightedTrailId) ?? visibleGuides[0],
    [guides, highlightedTrailId, visibleGuides]
  );
  const crawlerCollection = reactExports.useMemo(() => {
    if (!crawlerGuide) {
      return buildCrawlerPoint(
        {
          id: "fallback",
          start_coords: [116.4074, 39.9042],
          end_coords: [116.4074, 39.9042],
          colorEnd: "#10b981"
        },
        0
      );
    }
    return buildCrawlerPoint(crawlerGuide, crawlerProgress);
  }, [crawlerGuide, crawlerProgress]);
  const handleViewStateChange = reactExports.useCallback((next) => {
    setViewState(next);
  }, []);
  const selectTrail = reactExports.useCallback((guide) => {
    setHighlightedTrailId(guide.id);
    setCrawlerProgress(0);
    startRef.current = null;
  }, []);
  reactExports.useEffect(() => {
    if (!highlightedTrailId) {
      return;
    }
    const node = document.querySelector(
      `[data-trail-id="${highlightedTrailId}"]`
    );
    node == null ? void 0 : node.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [highlightedTrailId, visibleGuides]);
  reactExports.useEffect(() => {
    if (!highlightedTrailId && visibleGuides[0]) {
      setHighlightedTrailId(visibleGuides[0].id);
    }
  }, [highlightedTrailId, visibleGuides]);
  reactExports.useEffect(() => {
    const tick = (timestamp) => {
      if (startRef.current === null) {
        startRef.current = timestamp;
      }
      const elapsed = timestamp - startRef.current;
      const pulse = 0.55 + 0.35 * Math.sin(elapsed / 520);
      setPulseOpacity(pulse);
      setPulseBrightness(0.92 + 0.12 * Math.sin(elapsed / 520));
      setCrawlerProgress(elapsed % 12e3 / 12e3);
      rafRef.current = window.requestAnimationFrame(tick);
    };
    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [highlightedTrailId]);
  return {
    viewState,
    guides,
    visibleGuides,
    stripGuides,
    loading,
    searchQuery,
    filter,
    highlightedTrailId,
    hoveredTrailId,
    activeTrailId,
    highlightedGuide,
    pulseOpacity,
    pulseBrightness,
    lineCollection,
    crawlerCollection,
    setSearchQuery,
    setFilter,
    selectTrail,
    setHighlightedTrailId,
    setHoveredTrailId,
    handleViewStateChange
  };
}
function isUserTravelSearchInput(query) {
  const trimmed = query.trim();
  if (!trimmed) {
    return false;
  }
  if (/^从.+出发/.test(trimmed)) {
    return false;
  }
  if (trimmed.includes("参考轨迹攻略")) {
    return false;
  }
  return true;
}
function HomeMapTrailWall({
  fullBleed = false,
  variant
}) {
  var _a;
  const layoutVariant = variant ?? (fullBleed ? "cockpit" : "embedded");
  const location = useLocation();
  const navigate = useNavigate();
  const consumedHomeQuery = reactExports.useRef(null);
  const mapRef = reactExports.useRef(null);
  const [mapFlyTo, setMapFlyTo] = reactExports.useState(null);
  const [userRouteCollection, setUserRouteCollection] = reactExports.useState(null);
  const [planError, setPlanError] = reactExports.useState(null);
  const lastPlanRetryRef = reactExports.useRef(null);
  const planning = useMapPlanningAssistant();
  const {
    origin: userOrigin,
    source: originSource,
    refreshOrigin,
    applyFallbackOrigin
  } = useUserMapOrigin();
  const {
    viewState,
    guides,
    stripGuides,
    searchQuery,
    highlightedTrailId,
    activeTrailId,
    pulseOpacity,
    pulseBrightness,
    lineCollection,
    crawlerCollection,
    setSearchQuery,
    selectTrail,
    setHighlightedTrailId,
    setHoveredTrailId,
    handleViewStateChange
  } = useHomeTrailWall();
  const viewStateRef = reactExports.useRef(viewState);
  viewStateRef.current = viewState;
  const { generateFromSearchQuery } = planning;
  const locateOnMap = reactExports.useCallback((target) => {
    setMapFlyTo({ ...target });
  }, []);
  const flyToGuide = reactExports.useCallback((guide) => {
    locateOnMap({
      longitude: guide.end_coords[0],
      latitude: guide.end_coords[1],
      zoom: 9
    });
  }, [locateOnMap]);
  const handleSelectTrail = reactExports.useCallback(
    (guide) => {
      selectTrail(guide);
      flyToGuide(guide);
    },
    [flyToGuide, selectTrail]
  );
  const showPlanError = reactExports.useCallback((message) => {
    setPlanError(message);
  }, []);
  const crossCityPlan = useCrossCityDestinationPlan({
    userOrigin,
    refreshOrigin,
    applyFallbackOrigin,
    planning,
    locateOnMap,
    setUserRouteCollection,
    showPlanError
  });
  reactExports.useEffect(() => {
    if (!mapFlyTo) {
      return;
    }
    handleViewStateChange({
      ...viewStateRef.current,
      longitude: mapFlyTo.longitude,
      latitude: mapFlyTo.latitude,
      zoom: mapFlyTo.zoom ?? 9
    });
  }, [mapFlyTo, handleViewStateChange]);
  const lastFlownOriginKeyRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    var _a2;
    const trimmed = searchQuery.trim();
    const destinationHint = trimmed && isUserTravelSearchInput(trimmed) ? extractSearchDestination(trimmed) ?? ((_a2 = trimmed.split(/[，,]/)[0]) == null ? void 0 : _a2.trim()) ?? trimmed : null;
    if (destinationHint && resolveCityCenterSync(destinationHint)) {
      return;
    }
    const origin = userOrigin ?? buildDefaultDemoOrigin();
    if (!(origin == null ? void 0 : origin.gcjLng)) {
      return;
    }
    const key = `${origin.gcjLng.toFixed(5)},${origin.gcjLat.toFixed(5)}`;
    if (lastFlownOriginKeyRef.current === key) {
      return;
    }
    lastFlownOriginKeyRef.current = key;
    locateOnMap({
      longitude: origin.longitude,
      latitude: origin.latitude,
      zoom: 11
    });
  }, [userOrigin, searchQuery, locateOnMap]);
  reactExports.useEffect(() => {
    var _a2;
    const trimmed = searchQuery.trim();
    if (!isUserTravelSearchInput(trimmed)) {
      return;
    }
    const cityHint = extractSearchDestination(trimmed) ?? ((_a2 = trimmed.split(/[，,]/)[0]) == null ? void 0 : _a2.trim()) ?? trimmed;
    const resolved = resolveCityCenterSync(cityHint);
    if (!resolved) {
      return;
    }
    locateOnMap({
      longitude: resolved.longitude,
      latitude: resolved.latitude,
      zoom: 9
    });
  }, [locateOnMap, searchQuery]);
  const handleSearchSubmit = reactExports.useCallback(
    async (query) => {
      setPlanError(null);
      setUserRouteCollection(null);
      lastPlanRetryRef.current = { kind: "search", query };
      const originForPlan = userOrigin;
      const originEndpoint = {
        label: originForPlan.label,
        gcjLng: originForPlan.gcjLng,
        gcjLat: originForPlan.gcjLat,
        wgsLng: originForPlan.longitude,
        wgsLat: originForPlan.latitude
      };
      const errorMessage = await generateFromSearchQuery(query, locateOnMap, {
        origin: originEndpoint,
        originSource,
        onCrossCityRoute: (origin, destination) => {
          setUserRouteCollection(
            buildUserRouteLineCollection(
              [origin.wgsLng, origin.wgsLat],
              [destination.wgsLng, destination.wgsLat]
            )
          );
          locateOnMap(
            computeRouteFlyTarget(
              [origin.wgsLng, origin.wgsLat],
              [destination.wgsLng, destination.wgsLat]
            )
          );
        },
        onMultiStopRoute: (origin, stops) => {
          const waypoints = [];
          if (origin) {
            waypoints.push([origin.wgsLng, origin.wgsLat]);
          }
          for (const stop of stops) {
            waypoints.push([stop.wgsLng, stop.wgsLat]);
          }
          if (waypoints.length >= 2) {
            setUserRouteCollection(buildMultiStopRouteLineCollection(waypoints));
            locateOnMap(computeBoundsFlyTarget(waypoints));
          }
        }
      });
      showPlanError(errorMessage);
      return errorMessage;
    },
    [generateFromSearchQuery, locateOnMap, showPlanError, userOrigin, originSource]
  );
  const handleGuidePlan = reactExports.useCallback(
    (guide) => {
      if (planning.isGenerating) {
        return;
      }
      setPlanError(null);
      lastPlanRetryRef.current = { kind: "guide", guide };
      handleSelectTrail(guide);
      void crossCityPlan.planFromCoordinates(
        guide.end_coords[0],
        guide.end_coords[1],
        guide.end_city,
        guide
      );
    },
    [crossCityPlan, handleSelectTrail, planning.isGenerating]
  );
  const handleMapClick = reactExports.useCallback(
    (event) => {
      lastPlanRetryRef.current = { kind: "map", event };
      void crossCityPlan.planFromMapClick(event);
    },
    [crossCityPlan]
  );
  const handleRetryPlan = reactExports.useCallback(() => {
    const action = lastPlanRetryRef.current;
    if (!action) {
      return;
    }
    if (planning.isGenerating) {
      planning.cancelActivePlanRequest();
    }
    setPlanError(null);
    window.setTimeout(() => {
      switch (action.kind) {
        case "search":
          void handleSearchSubmit(action.query).then(showPlanError);
          break;
        case "guide":
          handleGuidePlan(action.guide);
          break;
        case "map":
          void crossCityPlan.planFromMapClick(action.event);
          break;
      }
    }, 0);
  }, [crossCityPlan, handleGuidePlan, handleSearchSubmit, planning, showPlanError]);
  reactExports.useEffect(() => {
    var _a2, _b;
    const state = location.state ?? {};
    const planQuery = (_a2 = state.planQuery) == null ? void 0 : _a2.trim();
    const seedQuery = (_b = state.seedQuery) == null ? void 0 : _b.trim();
    const stateKey = planQuery ? `plan:${planQuery}` : seedQuery ? `seed:${seedQuery}` : null;
    if (!stateKey || consumedHomeQuery.current === stateKey) {
      return;
    }
    consumedHomeQuery.current = stateKey;
    navigate(location.pathname, { replace: true, state: null });
    if (planQuery) {
      setSearchQuery(planQuery);
      void handleSearchSubmit(planQuery).then(showPlanError);
      return;
    }
    setSearchQuery(seedQuery);
  }, [handleSearchSubmit, location.pathname, location.state, navigate, setSearchQuery, showPlanError]);
  const userOriginPoint = reactExports.useMemo(() => {
    if (!userRouteCollection) {
      return null;
    }
    return [userOrigin.longitude, userOrigin.latitude];
  }, [userRouteCollection, userOrigin]);
  const userOriginGcjPoint = reactExports.useMemo(() => {
    if (!userRouteCollection) {
      return null;
    }
    return [userOrigin.gcjLng, userOrigin.gcjLat];
  }, [userRouteCollection, userOrigin]);
  const searchGenerating = planning.isGenerating;
  const planLoadingMessage = usePlanLoadingMessage(searchGenerating);
  const { waitingTooLong: planFirstTokenSlow } = usePlanFirstTokenWatch({
    active: searchGenerating && !planning.resultOpen,
    hasContent: Boolean((_a = planning.streamPreview) == null ? void 0 : _a.trim())
  });
  const planSessionId = useGlobalMapPlanningStore((state) => state.planSessionId);
  const resultLocation = useGlobalMapPlanningStore((state) => state.resultLocation);
  const resultContent = useGlobalMapPlanningStore((state) => state.resultContent);
  const planCoords = useGlobalMapPlanningStore((state) => state.coords);
  const planInitialQuery = useGlobalMapPlanningStore((state) => state.initialQuery);
  const advisorHandoff = reactExports.useMemo(() => {
    const prompt = searchQuery.trim() || (planInitialQuery == null ? void 0 : planInitialQuery.trim());
    if (!prompt && !resultContent) {
      return void 0;
    }
    return buildAdvisorHandoffState({
      initialPrompt: prompt,
      source: "home_map",
      locationName: resultLocation,
      lng: planCoords.lng,
      lat: planCoords.lat,
      planSessionId,
      planContent: resultContent
    });
  }, [
    planCoords.lat,
    planCoords.lng,
    planInitialQuery,
    planSessionId,
    resultContent,
    resultLocation,
    searchQuery
  ]);
  const controlPanelProps = reactExports.useMemo(
    () => ({
      searchQuery,
      generating: searchGenerating,
      onSearchChange: setSearchQuery,
      onSearchSubmit: handleSearchSubmit,
      advisorHandoff,
      onRetrySearch: () => {
        const action = lastPlanRetryRef.current;
        if ((action == null ? void 0 : action.kind) === "search") {
          void handleSearchSubmit(action.query);
        }
      }
    }),
    [
      searchQuery,
      searchGenerating,
      setSearchQuery,
      handleSearchSubmit,
      advisorHandoff
    ]
  );
  const planErrorBanner = planError && !searchGenerating ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "border border-rose-200 bg-rose-50 px-3 py-2.5 shadow-sm",
        layoutVariant === "hero" ? "border-x-0 border-b-0 border-t-rose-200/80" : "mb-3 rounded-xl"
      ),
      role: "alert",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs leading-snug text-rose-700", children: planError }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-wrap gap-2", children: [
          lastPlanRetryRef.current ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: handleRetryPlan,
              className: "rounded-md border border-emerald-300 bg-white px-2 py-1 text-[10px] font-medium text-emerald-800 hover:bg-emerald-50",
              children: "重试"
            }
          ) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setPlanError(null),
              className: "rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-700 hover:bg-slate-50",
              children: "知道了"
            }
          )
        ] })
      ]
    }
  ) : null;
  const setHomeMapBar = useHomeMapPlanningBarStore((state) => state.setBar);
  reactExports.useEffect(() => {
    setHomeMapBar(controlPanelProps);
  }, [setHomeMapBar, controlPanelProps]);
  reactExports.useEffect(() => {
    return () => {
      setHomeMapBar(null);
    };
  }, [setHomeMapBar]);
  reactExports.useEffect(() => {
    if (searchGenerating) {
      setPlanError(null);
    }
  }, [searchGenerating]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(layoutVariant === "hero" && "home-map-trail-hero-stack flex w-full flex-col"), children: [
    layoutVariant !== "hero" ? planErrorBanner : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "section",
      {
        className: cn(
          "home-map-trail-wall relative flex min-w-0 flex-col overflow-hidden",
          layoutVariant === "cockpit" ? "h-full min-h-0 rounded-none border-0 bg-slate-950" : layoutVariant === "hero" ? cn("home-map-trail-wall--hero bg-slate-950", HOME_MAP_CARD_SHELL) : cn(
            "rounded-2xl border border-slate-800",
            PAGE_CONTAINER_NEG_MARGIN_X,
            "min-h-[calc(100dvh-var(--app-header-offset)-7.5rem)]"
          )
        ),
        "aria-label": "地图轨迹墙",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "relative min-h-0 flex-1 overflow-hidden",
              "data-map-planning-root": true,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  HomeMapTrailLayers,
                  {
                    mapRef,
                    viewState,
                    onViewStateChange: handleViewStateChange,
                    lineCollection,
                    userRouteCollection,
                    userOriginPoint,
                    userOriginGcjPoint,
                    crawlerCollection,
                    activeTrailId,
                    pulseOpacity,
                    pulseBrightness,
                    onTrailClick: (trailId) => {
                      const guide = findTrailGuideById(guides, trailId);
                      if (guide) {
                        handleGuidePlan(guide);
                      } else {
                        setHighlightedTrailId(trailId);
                      }
                    },
                    onTrailHover: setHoveredTrailId,
                    onMapClick: handleMapClick,
                    flyTo: mapFlyTo,
                    className: "absolute inset-0 cursor-pointer"
                  }
                ),
                searchGenerating && !planning.resultOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "pointer-events-auto absolute inset-0 z-30 flex items-center justify-center bg-slate-950/35 backdrop-blur-[2px]",
                    "aria-live": "polite",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-[min(calc(100%-2rem),24rem)] max-h-[min(70vh,28rem)] rounded-2xl border border-emerald-400/30 bg-slate-900/90 px-5 py-4 text-left shadow-xl", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-sm font-medium text-white", children: "AI 正在为你定制穷游方案" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-center text-xs text-emerald-200/90", children: planLoadingMessage }),
                      planning.streamPreview ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: "mt-3 max-h-[min(50vh,18rem)] overflow-y-auto rounded-lg border border-slate-700/80 bg-slate-950/60 px-3 py-2 text-left text-xs leading-relaxed text-slate-200",
                          "aria-live": "polite",
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(AiChatMarkdown, { content: planning.streamPreview })
                        }
                      ) : planFirstTokenSlow ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "div",
                        {
                          className: "mt-3 rounded-lg border border-amber-400/40 bg-amber-950/40 px-3 py-2 text-center",
                          role: "status",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-amber-100", children: "等待偏久，可能是网络或 AI 繁忙" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[10px] leading-snug text-amber-100/80", children: "可继续等，或停止后重试" })
                          ]
                        }
                      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-center text-[10px] text-slate-400", children: "正在连接 AI，首字即将出现…" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: "mx-auto mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-700/80",
                          "aria-hidden": true,
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full w-1/3 animate-[plan-loading-slide_1.4s_ease-in-out_infinite] rounded-full bg-emerald-400/80" })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-center text-[10px] text-slate-500", children: "文字会边生成边出现，可随时停止" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap items-center justify-center gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            type: "button",
                            onClick: planning.cancelActivePlanRequest,
                            className: "rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700",
                            children: "停止生成"
                          }
                        ),
                        planFirstTokenSlow && lastPlanRetryRef.current ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            type: "button",
                            onClick: handleRetryPlan,
                            className: "rounded-lg border border-emerald-500/50 bg-emerald-900/50 px-3 py-1.5 text-xs font-medium text-emerald-100 hover:bg-emerald-900/80",
                            children: "重试"
                          }
                        ) : null
                      ] })
                    ] })
                  }
                ) : null
              ]
            }
          ),
          planErrorBanner,
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            HomeMapTrailMobileStrip,
            {
              guides: stripGuides,
              highlightedTrailId,
              onPlanGuide: handleGuidePlan,
              planning: searchGenerating
            }
          )
        ]
      }
    )
  ] });
}
export {
  HomeMapTrailWall as default
};
