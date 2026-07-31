import { a as reactExports, j as jsxRuntimeExports } from "./vendor-react-DtfH6MSw.js";
import { bw as createLucideIcon, f2 as useSearchParams, bq as countActiveDiscoverFilters, br as countAdvancedDiscoverFilters, I as DEFAULT_DISCOVER_SORT_MODE, ea as resolveHotPickPreview, Z as Link, dS as paths, a8 as OptimizedImage, cc as getDiscoverCardCoverAlt, R as DiscoverRecommendBadge, ch as getHotPickHref, bl as cn, a1 as MapPin, eN as useDebouncedValue, y as ChevronDown, ag as RotateCcw, aI as X, eX as usePageSeo, eU as useLocation, cd as getDiscoverHotPicks, d0 as getViewerInterestSummary, bs as countDiscoverFeedResults, ew as suggestRelaxedDiscoverFilters, bB as discoverPageSeo } from "./index-DwV1qlqh.js";
import "./AiChatMessage-Dy98aHtB.js";
import { f as DiscoverSearchFilters, b as DISCOVER_FEED_DEBOUNCE_MS, d as DISCOVER_TRAVEL_TYPES, c as DISCOVER_TIME_RANGES, a as DISCOVER_CONTENT_TYPES, g as getDiscoverTrends, r as resolveDiscoverSearchInput, e as DiscoverMasonryFeedSection } from "./DiscoverMasonryFeedSection-B10gLj3Q.js";
import { C as CapsuleContextBanner } from "./CapsuleContextBanner-bsCrmr4p.js";
import "./maplibre-gl-H57bTsm_.js";
import "./defaultMapOrigin-DM9zdaEz.js";
import { H as Hash } from "./hash-KQEgZgI2.js";
import { a as MotionPage, M as MotionBlock } from "./MotionPage-Bc8Pg75O.js";
import "./vendor-three-Blpl5Qyv.js";
import "./moderate-B_EMCIaW.js";
import "./ai-CeNlrO9U.js";
import "./appMode-mvxqt0jz.js";
import "./credentials-BlGlDwm4.js";
import "./useInfiniteScroll-BdqSKKek.js";
import "./map-pinned-CwnGvlJZ.js";
import "./info-DlxnCctM.js";
import "./coordinates-D-_oeTwy.js";
import "./provider-CMJI8edA.js";
import "./knownOriginFallbacks-BTkbXw-0.js";
/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  [
    "path",
    {
      d: "M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4",
      key: "1slcih"
    }
  ]
];
const Flame = createLucideIcon("flame", __iconNode$1);
/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M16 7h6v6", key: "box55l" }],
  ["path", { d: "m22 7-8.5 8.5-5-5L2 17", key: "1t1m79" }]
];
const TrendingUp = createLucideIcon("trending-up", __iconNode);
function parseSortMode(params) {
  const sort = params.get("sort");
  return sort === "recent" ? "recent" : DEFAULT_DISCOVER_SORT_MODE;
}
function parseFilters(params) {
  const travelType = params.get("type") ?? "";
  const validInterests = ["food", "culture", "adventure", "shopping", "nature"];
  return {
    q: params.get("q") ?? "",
    destination: params.get("dest") ?? "",
    travelType: validInterests.includes(travelType) ? travelType : "",
    timeRange: ["all", "7d", "30d", "90d"].includes(params.get("time") ?? "") ? params.get("time") : "all",
    contentType: ["all", "guide", "plan", "moment"].includes(params.get("kind") ?? "") ? params.get("kind") : "all"
  };
}
function filtersToSearchParams(filters) {
  const params = new URLSearchParams();
  if (filters.q.trim()) {
    params.set("q", filters.q.trim());
  }
  if (filters.destination) {
    params.set("dest", filters.destination);
  }
  if (filters.travelType) {
    params.set("type", filters.travelType);
  }
  if (filters.timeRange !== "all") {
    params.set("time", filters.timeRange);
  }
  if (filters.contentType !== "all") {
    params.set("kind", filters.contentType);
  }
  return params;
}
function sortModeToSearchParams(sortMode, params) {
  if (sortMode !== DEFAULT_DISCOVER_SORT_MODE) {
    params.set("sort", sortMode);
  } else {
    params.delete("sort");
  }
}
function useDiscoverFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = reactExports.useMemo(() => parseFilters(searchParams), [searchParams]);
  const sortMode = reactExports.useMemo(() => parseSortMode(searchParams), [searchParams]);
  const activeFilterCount = reactExports.useMemo(() => countActiveDiscoverFilters(filters), [filters]);
  const advancedFilterCount = reactExports.useMemo(() => countAdvancedDiscoverFilters(filters), [filters]);
  const patchFilters = reactExports.useCallback(
    (patch) => {
      const next = { ...filters, ...patch };
      const params = filtersToSearchParams(next);
      sortModeToSearchParams(sortMode, params);
      setSearchParams(params, { replace: true });
    },
    [filters, sortMode, setSearchParams]
  );
  const setSortMode = reactExports.useCallback(
    (nextSort) => {
      const params = filtersToSearchParams(filters);
      sortModeToSearchParams(nextSort, params);
      setSearchParams(params, { replace: true });
    },
    [filters, setSearchParams]
  );
  const resetFilters = reactExports.useCallback(() => {
    const params = new URLSearchParams();
    sortModeToSearchParams(sortMode, params);
    setSearchParams(params, { replace: true });
  }, [sortMode, setSearchParams]);
  const setQuery = reactExports.useCallback((q) => patchFilters({ q }), [patchFilters]);
  const setDestination = reactExports.useCallback(
    (destination) => patchFilters({ destination }),
    [patchFilters]
  );
  const setTravelType = reactExports.useCallback(
    (travelType) => patchFilters({ travelType }),
    [patchFilters]
  );
  const setTimeRange = reactExports.useCallback(
    (timeRange) => patchFilters({ timeRange }),
    [patchFilters]
  );
  const setContentType = reactExports.useCallback(
    (contentType) => patchFilters({ contentType }),
    [patchFilters]
  );
  return {
    filters,
    sortMode,
    activeFilterCount,
    advancedFilterCount,
    hasActiveFilters: activeFilterCount > 0,
    patchFilters,
    setQuery,
    setDestination,
    setTravelType,
    setTimeRange,
    setContentType,
    setSortMode,
    resetFilters
  };
}
function DiscoverHotSpotlight({
  items,
  title = "热门推荐",
  subtitle,
  className
}) {
  const previews = items.map((item) => resolveHotPickPreview(item)).filter((entry) => entry != null);
  if (previews.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: cn("space-y-3", className), "aria-labelledby": "discover-hot-title", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "h2",
        {
          id: "discover-hot-title",
          className: "flex items-center gap-1.5 text-base font-semibold text-slate-900 sm:text-sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-4 w-4 text-orange-500", "aria-hidden": true }),
            title
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: paths.guides, className: "text-xs font-medium text-violet-700 hover:underline", children: "更多攻略" })
    ] }),
    subtitle ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: subtitle }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden", children: [
      previews.map((pick, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: getHotPickHref(pick.item),
          className: "group relative w-[min(72vw,280px)] shrink-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-900 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg md:w-auto md:shrink",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-[4/5] w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              OptimizedImage,
              {
                src: pick.coverUrl,
                alt: getDiscoverCardCoverAlt(pick.badge, pick.title),
                fill: true,
                priority: index < 2,
                sizes: "280px",
                className: "opacity-90 transition group-hover:scale-[1.03] group-hover:opacity-100"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute left-3 right-3 top-3 flex flex-wrap items-start justify-between gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-900", children: pick.badge }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                DiscoverRecommendBadge,
                {
                  score: pick.item.recommendScore,
                  reasons: pick.item.recommendReasons,
                  interactive: true
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-x-0 bottom-0 p-3 text-white", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "line-clamp-2 text-sm font-semibold leading-snug", children: pick.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 line-clamp-1 text-xs text-white/80", children: pick.subtitle })
            ] })
          ]
        },
        pick.item.id
      )),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex shrink-0 items-center self-center text-[10px] text-slate-400 md:hidden", children: "← 左右滑动" })
    ] })
  ] });
}
function formatTrendCount(count) {
  if (count >= 100) {
    return "99+";
  }
  return String(count);
}
function TrendChip({ label, count, rank, active, icon: Icon, onClick }) {
  const showHot = rank <= 3;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick,
      className: cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-medium transition sm:px-3 sm:py-1.5 sm:text-xs",
        active ? "border-violet-600 bg-violet-600 text-white shadow-md scale-[1.02]" : "border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:bg-violet-50/50 active:scale-95"
      ),
      "aria-pressed": active,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5 shrink-0 opacity-80", "aria-hidden": true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
              active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
            ),
            children: formatTrendCount(count)
          }
        ),
        showHot && !active && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-orange-500", "aria-hidden": true, children: "🔥" })
      ]
    }
  );
}
function DiscoverTrendsSection({
  destinations,
  tags,
  activeDestination = "",
  activeQuery = "",
  onDestinationSelect,
  onTagSelect,
  className
}) {
  const normalizedQuery = activeQuery.trim();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: cn("space-y-4", className), "aria-labelledby": "discover-trends-title", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "h2",
        {
          id: "discover-trends-title",
          className: "flex items-center gap-1.5 text-sm font-semibold text-slate-900",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4 text-emerald-600", "aria-hidden": true }),
            "快速筛选"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs text-slate-500", children: "点城市或标签切换下方瀑布流 · 再点一次取消" })
    ] }),
    destinations.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-2 flex items-center gap-1 text-xs font-medium text-slate-600", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5 text-orange-500", "aria-hidden": true }),
        "有内容的目的地"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: destinations.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        TrendChip,
        {
          label: item.label,
          count: item.count,
          rank: item.rank,
          icon: MapPin,
          active: activeDestination === item.value,
          onClick: () => onDestinationSelect(activeDestination === item.value ? "" : item.value)
        },
        item.value
      )) })
    ] }),
    tags.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-2 flex items-center gap-1 text-xs font-medium text-slate-600", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Hash, { className: "h-3.5 w-3.5 text-violet-500", "aria-hidden": true }),
        "热门标签"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", children: [
        tags.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          TrendChip,
          {
            label: item.label,
            count: item.count,
            rank: item.rank,
            icon: Hash,
            active: normalizedQuery === item.label,
            onClick: () => onTagSelect(normalizedQuery === item.label ? "" : item.label)
          },
          item.label
        )),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex shrink-0 items-center self-center text-[10px] text-slate-400", children: "← 左右滑动" })
      ] })
    ] })
  ] });
}
function DiscoverSearchFiltersSection({
  filters,
  advancedFilterCount,
  hasActiveFilters,
  resultTotal,
  onSearchChange,
  onTravelTypeChange,
  onTimeRangeChange,
  onContentTypeChange,
  onReset,
  onJumpToFeed
}) {
  const debouncedQuery = useDebouncedValue(filters.q, DISCOVER_FEED_DEBOUNCE_MS);
  const debouncedDestination = useDebouncedValue(filters.destination, DISCOVER_FEED_DEBOUNCE_MS);
  const isDebouncing = filters.q !== debouncedQuery || filters.destination !== debouncedDestination;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DiscoverSearchFilters,
    {
      filters,
      advancedFilterCount,
      hasActiveFilters,
      resultTotal,
      isDebouncing,
      onSearchChange,
      onTravelTypeChange,
      onTimeRangeChange,
      onContentTypeChange,
      onReset,
      onJumpToFeed
    }
  );
}
function labelForTravelType(value) {
  var _a;
  return (_a = DISCOVER_TRAVEL_TYPES.find((item) => item.value === value)) == null ? void 0 : _a.label;
}
function labelForContentType(value) {
  var _a;
  return (_a = DISCOVER_CONTENT_TYPES.find((item) => item.value === value)) == null ? void 0 : _a.label;
}
function labelForTimeRange(value) {
  var _a;
  return (_a = DISCOVER_TIME_RANGES.find((item) => item.value === value)) == null ? void 0 : _a.label;
}
function DiscoverFilterStatus({
  filters,
  total,
  onClearDestination,
  onClearQuery,
  onClearTravelType,
  onClearTimeRange,
  onClearContentType,
  onReset,
  onJumpToFeed,
  onRelax,
  className
}) {
  const chips = [];
  if (filters.destination) {
    chips.push({ key: "destination", label: filters.destination, onRemove: onClearDestination });
  }
  if (filters.q.trim()) {
    chips.push({ key: "query", label: filters.q.trim(), onRemove: onClearQuery });
  }
  if (filters.travelType) {
    chips.push({
      key: "travelType",
      label: labelForTravelType(filters.travelType) ?? filters.travelType,
      onRemove: onClearTravelType
    });
  }
  if (filters.timeRange !== "all") {
    chips.push({
      key: "timeRange",
      label: labelForTimeRange(filters.timeRange) ?? filters.timeRange,
      onRemove: onClearTimeRange
    });
  }
  if (filters.contentType !== "all") {
    chips.push({
      key: "contentType",
      label: labelForContentType(filters.contentType) ?? filters.contentType,
      onRemove: onClearContentType
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "space-y-2 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-fuchsia-50/70 px-4 py-3 shadow-sm",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-violet-900", children: total > 0 ? `已找到 ${total} 条旅行灵感` : "这组条件暂时没有内容" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 gap-2", children: [
            total > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: onJumpToFeed,
                className: "inline-flex items-center gap-1 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700",
                children: [
                  "往下看",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3.5 w-3.5", "aria-hidden": true })
                ]
              }
            ) : onRelax ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: onRelax,
                className: "rounded-full bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700",
                children: "换一组条件"
              }
            ) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: onReset,
                className: "inline-flex items-center gap-1 rounded-full border border-violet-300 bg-white px-3 py-1.5 text-xs font-semibold text-violet-800 hover:bg-violet-100",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-3 w-3", "aria-hidden": true }),
                  "重置"
                ]
              }
            )
          ] })
        ] }),
        chips.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: chips.map((chip) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: chip.onRemove,
            className: "inline-flex items-center gap-1 rounded-full border border-violet-200 bg-white/90 px-2.5 py-1 text-xs font-medium text-violet-900 hover:bg-white",
            children: [
              chip.label,
              /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3 opacity-60", "aria-hidden": true })
            ]
          },
          chip.key
        )) })
      ]
    }
  );
}
function DiscoverPage() {
  var _a, _b;
  usePageSeo(discoverPageSeo());
  const location = useLocation();
  const routeState = location.state ?? null;
  const feedSectionRef = reactExports.useRef(null);
  const {
    filters,
    sortMode,
    advancedFilterCount,
    hasActiveFilters,
    setQuery,
    setDestination,
    setTravelType,
    setTimeRange,
    setContentType,
    setSortMode,
    resetFilters,
    patchFilters
  } = useDiscoverFilters();
  const hotPicks = reactExports.useMemo(() => getDiscoverHotPicks(6), []);
  const trends = reactExports.useMemo(() => getDiscoverTrends(), []);
  const interestSummary = reactExports.useMemo(() => getViewerInterestSummary(), []);
  const coveredDestinations = reactExports.useMemo(
    () => trends.destinations.map((item) => item.label),
    [trends.destinations]
  );
  const resultTotal = reactExports.useMemo(
    () => countDiscoverFeedResults(filters, sortMode),
    [filters, sortMode]
  );
  const relaxedFilters = reactExports.useMemo(
    () => resultTotal === 0 ? suggestRelaxedDiscoverFilters(filters) : null,
    [filters, resultTotal]
  );
  const scrollToFeed = reactExports.useCallback(() => {
    var _a2;
    (_a2 = feedSectionRef.current) == null ? void 0 : _a2.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  const handleSearchChange = reactExports.useCallback(
    (input) => {
      const resolved = resolveDiscoverSearchInput(input);
      patchFilters(resolved);
    },
    [filters, patchFilters]
  );
  const handleDestinationSelect = reactExports.useCallback(
    (destination) => {
      const nextDestination = filters.destination === destination ? "" : destination;
      patchFilters({
        destination: nextDestination,
        q: nextDestination ? "" : filters.q
      });
    },
    [filters, patchFilters]
  );
  const handleTagSelect = reactExports.useCallback(
    (query) => {
      const nextQuery = filters.q.trim() === query ? "" : query;
      patchFilters({ q: nextQuery });
    },
    [filters.q, patchFilters]
  );
  const handleRelaxFilters = reactExports.useCallback(() => {
    if (!relaxedFilters) {
      return;
    }
    patchFilters(relaxedFilters);
    scrollToFeed();
  }, [patchFilters, relaxedFilters, scrollToFeed]);
  reactExports.useEffect(() => {
    var _a2;
    const destination = (_a2 = routeState == null ? void 0 : routeState.destination) == null ? void 0 : _a2.trim();
    if (!destination || filters.destination === destination) {
      return;
    }
    patchFilters({ destination, q: "" });
  }, [filters.destination, patchFilters, routeState == null ? void 0 : routeState.destination]);
  const contextDestination = ((_a = routeState == null ? void 0 : routeState.destination) == null ? void 0 : _a.trim()) || ((_b = routeState == null ? void 0 : routeState.aiDream) == null ? void 0 : _b.trim());
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MotionPage, { className: "flex flex-col gap-5 pb-8", children: [
    contextDestination ? /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      CapsuleContextBanner,
      {
        destination: contextDestination,
        dream: routeState == null ? void 0 : routeState.aiDream,
        source: (routeState == null ? void 0 : routeState.fromCapsule) ? "capsule_one" : routeState == null ? void 0 : routeState.source,
        variant: "discover"
      }
    ) }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DiscoverSearchFiltersSection,
      {
        filters,
        advancedFilterCount,
        hasActiveFilters,
        resultTotal,
        onSearchChange: handleSearchChange,
        onTravelTypeChange: setTravelType,
        onTimeRangeChange: setTimeRange,
        onContentTypeChange: setContentType,
        onReset: resetFilters,
        onJumpToFeed: scrollToFeed
      }
    ),
    hasActiveFilters ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      DiscoverFilterStatus,
      {
        filters,
        total: resultTotal,
        onClearDestination: () => setDestination(""),
        onClearQuery: () => setQuery(""),
        onClearTravelType: () => setTravelType(""),
        onClearTimeRange: () => setTimeRange("all"),
        onClearContentType: () => setContentType("all"),
        onReset: resetFilters,
        onJumpToFeed: scrollToFeed,
        onRelax: relaxedFilters ? handleRelaxFilters : void 0
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        DiscoverHotSpotlight,
        {
          items: hotPicks,
          title: "编辑精选",
          subtitle: "蜗友真实攻略、计划与瞬间 · 点卡片直接阅读"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        DiscoverTrendsSection,
        {
          destinations: trends.destinations,
          tags: trends.tags,
          activeDestination: filters.destination,
          activeQuery: filters.q,
          onDestinationSelect: handleDestinationSelect,
          onTagSelect: handleTagSelect
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      DiscoverMasonryFeedSection,
      {
        filters,
        sortMode,
        hasActiveFilters,
        interestSummary,
        onSortModeChange: setSortMode,
        feedSectionRef,
        hotDestinations: coveredDestinations,
        onSuggestDestination: handleDestinationSelect,
        onRelaxFilters: (relaxed) => {
          patchFilters(relaxed);
          scrollToFeed();
        }
      }
    ) })
  ] });
}
export {
  DiscoverPage as default
};
