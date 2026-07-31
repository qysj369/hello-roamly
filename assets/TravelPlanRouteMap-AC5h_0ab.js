import { a as reactExports, j as jsxRuntimeExports } from "./vendor-react-DtfH6MSw.js";
import { M as MapServicePlaceholder } from "./MapServicePlaceholder-Xf-uj5s5.js";
import { eQ as useGeneratedPlansStore, e$ as useQuery, d_ as queryKeys, bl as cn, a1 as MapPin, k as AsyncFeedback, dC as mapboxGlExports, $ as Map, a7 as NavigationControl, ad as Popup, a2 as Marker } from "./index-DwV1qlqh.js";
import { b as buildPlanMapPoints, a as geocodeTravelPlan, d as getPlanBaseCenter, c as getMapDisplayPoints, f as filterMapViewportPoints } from "./geocodeTravelPlan-BXQEsjoj.js";
import { i as hasMapService, D as DEFAULT_AMAP_VIEW, d as getMapProviderLabel, f as getMapboxToken, a as DEFAULT_MAP_VIEW, r as resolveMapProvider } from "./provider-CMJI8edA.js";
import { l as loadAmap } from "./amapGeocoderClient-CjYlis2t.js";
import "./vendor-three-Blpl5Qyv.js";
import "./credentials-BlGlDwm4.js";
import "./knownOriginFallbacks-BTkbXw-0.js";
const planMapPointsQueryKey = (planId) => [...queryKeys.plans.mapPoints(planId), "geo-v9"];
async function fetchPlanMapPoints(plan) {
  const enrichedPlan = await geocodeTravelPlan(plan);
  const points = buildPlanMapPoints(enrichedPlan);
  const geocodedCount = points.filter((point) => point.geocoded).length;
  return { points, enrichedPlan, geocodedCount };
}
function usePlanMapPoints(plan) {
  var _a, _b, _c;
  const addPlan = useGeneratedPlansStore((state) => state.addPlan);
  const mapReady = hasMapService();
  const query = useQuery({
    queryKey: planMapPointsQueryKey((plan == null ? void 0 : plan.id) ?? ""),
    queryFn: () => fetchPlanMapPoints(plan),
    enabled: Boolean(plan && mapReady),
    staleTime: 1e3 * 60 * 60 * 24,
    gcTime: 1e3 * 60 * 60 * 24
  });
  const fallbackPoints = plan ? buildPlanMapPoints(plan) : [];
  reactExports.useEffect(() => {
    var _a2;
    if (!((_a2 = query.data) == null ? void 0 : _a2.enrichedPlan)) {
      return;
    }
    addPlan(query.data.enrichedPlan);
  }, [addPlan, (_a = query.data) == null ? void 0 : _a.enrichedPlan]);
  return {
    points: ((_b = query.data) == null ? void 0 : _b.points) ?? fallbackPoints,
    geocodedCount: ((_c = query.data) == null ? void 0 : _c.geocodedCount) ?? 0,
    isGeocoding: query.isFetching,
    isGeocodingInitial: query.isLoading && !query.data,
    geocodeError: query.isError ? "地点解析失败，已使用估算位置" : null,
    hasMapService: mapReady
  };
}
function markerHtml(point, selected) {
  const bg = selected ? "background:#7c3aed;box-shadow:0 0 0 2px #a78bfa" : point.geocoded ? "background:#059669" : "background:#2563eb";
  return `<div style="width:28px;height:28px;border-radius:9999px;border:2px solid #fff;color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;${bg}">${point.order + 1}</div>`;
}
function popupHtml(point, providerLabel) {
  const location = point.location ? `<p style="margin:4px 0 0;color:#64748b;font-size:11px">${point.location}</p>` : "";
  return `<div style="max-width:12rem;font-size:12px;line-height:1.4">
    <p style="margin:0;font-size:10px;font-weight:600;color:#2563eb">第 ${point.day} 天 · ${point.time}</p>
    <p style="margin:4px 0 0;font-weight:600;color:#0f172a">${point.name}</p>
    <p style="margin:4px 0 0;color:#475569">${point.description}</p>
    ${location}
    <p style="margin:4px 0 0;font-size:10px;color:#94a3b8">${point.geocoded ? `${providerLabel} 精确定位` : "城市中心估算位置"}</p>
  </div>`;
}
function AmapPlanRouteMap({ plan, className }) {
  const containerId = reactExports.useId().replace(/:/g, "");
  const mapRef = reactExports.useRef(null);
  const markersRef = reactExports.useRef([]);
  const infoWindowRef = reactExports.useRef(null);
  const planCenter = reactExports.useMemo(() => getPlanBaseCenter(plan), [plan]);
  const { points, geocodedCount, isGeocoding, isGeocodingInitial, geocodeError } = usePlanMapPoints(plan);
  const displayPoints = reactExports.useMemo(
    () => getMapDisplayPoints(points, planCenter),
    [points, planCenter]
  );
  const [selectedPointId, setSelectedPointId] = reactExports.useState(null);
  const [mapError, setMapError] = reactExports.useState(null);
  const providerLabel = getMapProviderLabel("amap");
  const selectedPoint = reactExports.useMemo(
    () => displayPoints.find((point) => point.id === selectedPointId) ?? null,
    [displayPoints, selectedPointId]
  );
  const viewportPoints = reactExports.useMemo(
    () => filterMapViewportPoints(displayPoints, planCenter),
    [displayPoints, planCenter]
  );
  reactExports.useEffect(() => {
    let disposed = false;
    loadAmap().then((AMapNS) => {
      if (disposed) {
        return;
      }
      const map = new AMapNS.Map(containerId, {
        zoom: DEFAULT_AMAP_VIEW.zoom,
        center: [planCenter.longitude, planCenter.latitude],
        viewMode: "2D"
      });
      map.add(new AMapNS.Scale());
      map.add(new AMapNS.ToolBar({ position: { top: "10px", right: "10px" } }));
      map.on("click", () => {
        setSelectedPointId(null);
        map.clearInfoWindow();
      });
      mapRef.current = map;
      infoWindowRef.current = new AMapNS.InfoWindow({ offset: [0, -12] });
    }).catch((reason) => {
      setMapError(reason instanceof Error ? reason.message : "高德地图加载失败");
    });
    return () => {
      var _a;
      disposed = true;
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
      (_a = mapRef.current) == null ? void 0 : _a.destroy();
      mapRef.current = null;
      infoWindowRef.current = null;
    };
  }, [containerId, planCenter.latitude, planCenter.longitude]);
  reactExports.useEffect(() => {
    const map = mapRef.current;
    if (!map || isGeocodingInitial || displayPoints.length === 0) {
      return;
    }
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    loadAmap().then((AMapNS) => {
      const markers = displayPoints.map((point) => {
        const marker = new AMapNS.Marker({
          position: [point.longitude, point.latitude],
          anchor: "center",
          content: markerHtml(point, false),
          extData: { pointId: point.id },
          zIndex: 100 + point.order
        });
        marker.on("click", () => {
          setSelectedPointId(point.id);
        });
        marker.setMap(map);
        return marker;
      });
      markersRef.current = markers;
      if (viewportPoints.length === 1) {
        map.setZoomAndCenter(13, [viewportPoints[0].longitude, viewportPoints[0].latitude]);
      } else if (viewportPoints.length >= 2) {
        const viewportMarkers = markers.filter((marker) => {
          var _a;
          const pointId = (_a = marker.getExtData()) == null ? void 0 : _a.pointId;
          return viewportPoints.some((point) => point.id === pointId);
        });
        map.setFitView(
          viewportMarkers.length > 0 ? viewportMarkers : markers,
          false,
          [56, 56, 56, 56],
          14
        );
      }
    });
  }, [displayPoints, isGeocodingInitial, viewportPoints]);
  reactExports.useEffect(() => {
    const map = mapRef.current;
    const infoWindow = infoWindowRef.current;
    if (!map || !infoWindow) {
      return;
    }
    markersRef.current.forEach((marker) => {
      var _a;
      const pointId = (_a = marker.getExtData()) == null ? void 0 : _a.pointId;
      const point = displayPoints.find((item) => item.id === pointId);
      if (point) {
        marker.setMap(map);
        const isSelected = point.id === selectedPointId;
        marker.setContent(markerHtml(point, isSelected));
      }
    });
    if (!selectedPoint) {
      infoWindow.close();
      return;
    }
    infoWindow.setContent(popupHtml(selectedPoint, providerLabel));
    infoWindow.open(map, [selectedPoint.longitude, selectedPoint.latitude]);
  }, [displayPoints, selectedPoint, selectedPointId, providerLabel]);
  if (mapError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: cn("mt-6 border-t border-slate-200/90 pt-6", className), children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-rose-600", children: mapError }) });
  }
  if (displayPoints.length === 0 && !isGeocoding) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "section",
      {
        className: cn("mt-6 border-t border-slate-200/90 pt-6", className),
        "aria-labelledby": "travel-plan-map-title",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { id: "travel-plan-map-title", className: "mb-3 text-sm font-semibold text-slate-900", children: "行程地图" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-48 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500", children: "暂无可展示的沿途景点。" })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      className: cn("mt-6 border-t border-slate-200/90 pt-6", className),
      "aria-labelledby": "travel-plan-map-title",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4 text-brand-600", "aria-hidden": true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { id: "travel-plan-map-title", className: "text-sm font-semibold text-slate-900", children: "行程地图" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-slate-500", children: [
            displayPoints.length,
            " 处要去的地方 ·",
            " ",
            isGeocoding ? "解析中" : geocodedCount > 0 ? `${geocodedCount} 处已精确定位` : "暂未精确定位，仅显示估算位置"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          AsyncFeedback,
          {
            className: "mb-2",
            isLoading: isGeocoding,
            loadingMessage: `正在通过 ${providerLabel} 精确定位活动地点…`,
            error: geocodeError
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative overflow-hidden rounded-xl border border-slate-200/90 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { id: containerId, className: "h-[min(22rem,50vh)] w-full min-h-56" }) })
      ]
    }
  );
}
function PlanMapMarker({
  point,
  selected,
  onSelect
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Marker,
    {
      longitude: point.longitude,
      latitude: point.latitude,
      anchor: "center",
      onClick: (event) => {
        event.originalEvent.stopPropagation();
        onSelect();
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: cn(
            "flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-md",
            selected && "bg-violet-600 ring-2 ring-violet-400",
            !selected && point.geocoded && "bg-emerald-600 hover:bg-emerald-700",
            !selected && !point.geocoded && "bg-brand-600 hover:bg-brand-700"
          ),
          "aria-label": `第 ${point.order + 1} 站：${point.name}`,
          title: point.geocoded ? "已地理编码定位" : "估算位置",
          children: point.order + 1
        }
      )
    }
  );
}
function MapboxPlanRouteMap({ plan, className }) {
  var _a, _b;
  const mapRef = reactExports.useRef(null);
  const mapboxToken = reactExports.useMemo(() => getMapboxToken(), []);
  const planCenter = reactExports.useMemo(() => getPlanBaseCenter(plan), [plan]);
  const { points, geocodedCount, isGeocoding, isGeocodingInitial, geocodeError } = usePlanMapPoints(plan);
  const displayPoints = reactExports.useMemo(
    () => getMapDisplayPoints(points, planCenter),
    [points, planCenter]
  );
  const [selectedPointId, setSelectedPointId] = reactExports.useState(null);
  const viewportPoints = reactExports.useMemo(
    () => filterMapViewportPoints(displayPoints, planCenter),
    [displayPoints, planCenter]
  );
  const selectedPoint = displayPoints.find((point) => point.id === selectedPointId) ?? null;
  const providerLabel = getMapProviderLabel("mapbox");
  reactExports.useEffect(() => {
    const map = mapRef.current;
    if (!map || displayPoints.length === 0 || isGeocodingInitial) {
      return;
    }
    if (viewportPoints.length === 1) {
      const only = viewportPoints[0];
      map.flyTo({
        center: [only.longitude, only.latitude],
        zoom: 13,
        duration: 800
      });
      return;
    }
    const bounds = new mapboxGlExports.LngLatBounds();
    viewportPoints.forEach((point) => {
      bounds.extend([point.longitude, point.latitude]);
    });
    map.fitBounds(bounds, { padding: 56, maxZoom: 14, duration: 800 });
  }, [displayPoints.length, isGeocodingInitial, viewportPoints]);
  if (!mapboxToken) {
    return null;
  }
  if (displayPoints.length === 0 && !isGeocoding) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "section",
      {
        className: cn("mt-6 border-t border-slate-200/90 pt-6", className),
        "aria-labelledby": "travel-plan-map-title",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { id: "travel-plan-map-title", className: "mb-3 text-sm font-semibold text-slate-900", children: "行程地图" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-48 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500", children: "暂无可展示的沿途景点。" })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      className: cn("mt-6 border-t border-slate-200/90 pt-6", className),
      "aria-labelledby": "travel-plan-map-title",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4 text-brand-600", "aria-hidden": true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { id: "travel-plan-map-title", className: "text-sm font-semibold text-slate-900", children: "行程地图" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-slate-500", children: [
            displayPoints.length,
            " 处要去的地方 ·",
            " ",
            geocodedCount > 0 ? `${geocodedCount} 处已精确定位` : "解析中"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] text-slate-400", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-emerald-600", "aria-hidden": true }),
            "精确定位",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 h-2 w-2 rounded-full bg-brand-600", "aria-hidden": true }),
            "估算"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          AsyncFeedback,
          {
            className: "mb-2",
            isLoading: isGeocoding,
            loadingMessage: `正在通过 ${providerLabel} 精确定位活动地点…`,
            error: geocodeError
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative overflow-hidden rounded-xl border border-slate-200/90 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-[min(22rem,50vh)] w-full min-h-56", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Map,
          {
            ref: mapRef,
            mapboxAccessToken: mapboxToken,
            initialViewState: {
              longitude: ((_a = displayPoints[0]) == null ? void 0 : _a.longitude) ?? DEFAULT_MAP_VIEW.longitude,
              latitude: ((_b = displayPoints[0]) == null ? void 0 : _b.latitude) ?? DEFAULT_MAP_VIEW.latitude,
              zoom: 11
            },
            style: { width: "100%", height: "100%" },
            mapStyle: "mapbox://styles/mapbox/streets-v12",
            attributionControl: true,
            reuseMaps: true,
            onClick: () => setSelectedPointId(null),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(NavigationControl, { position: "top-right", showCompass: true, showZoom: true }),
              displayPoints.map((point) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                PlanMapMarker,
                {
                  point,
                  selected: selectedPointId === point.id,
                  onSelect: () => setSelectedPointId(point.id)
                },
                point.id
              )),
              selectedPoint && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Popup,
                {
                  longitude: selectedPoint.longitude,
                  latitude: selectedPoint.latitude,
                  anchor: "bottom",
                  offset: 12,
                  closeOnClick: false,
                  onClose: () => setSelectedPointId(null),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-[12rem] p-1 text-xs", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-[10px] font-semibold text-brand-600", children: [
                      "第 ",
                      selectedPoint.day,
                      " 天 · ",
                      selectedPoint.time
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-semibold text-slate-900", children: selectedPoint.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 leading-relaxed text-slate-600", children: selectedPoint.description }),
                    selectedPoint.location && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 flex items-start gap-1 text-slate-500", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "mt-0.5 h-3 w-3 shrink-0", "aria-hidden": true }),
                      selectedPoint.location
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[10px] text-slate-400", children: selectedPoint.geocoded ? `${providerLabel} 精确定位` : "城市中心估算位置" })
                  ] })
                }
              )
            ]
          }
        ) }) })
      ]
    }
  );
}
function TravelPlanRouteMap({ plan, className }) {
  const provider = reactExports.useMemo(() => resolveMapProvider(), []);
  if (!hasMapService() || !provider) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: cn("mt-6 border-t border-slate-200/90 pt-6", className), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-sm font-semibold text-slate-900", children: "行程地图" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MapServicePlaceholder, { className: "min-h-56", compact: true })
    ] });
  }
  if (provider === "amap") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AmapPlanRouteMap, { plan, className });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(MapboxPlanRouteMap, { plan, className });
}
export {
  TravelPlanRouteMap as default
};
