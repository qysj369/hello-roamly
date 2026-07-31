import { a as reactExports, j as jsxRuntimeExports } from "./vendor-react-DtfH6MSw.js";
import { bw as createLucideIcon, bQ as fetchUserAiSessions, b1 as buildDiscoverFeed, eN as useDebouncedValue, e$ as useQuery, dx as keepPreviousData, d_ as queryKeys, bA as demoGuides, bT as findTravelPlanById, dS as paths, aA as TravelPlanCard, Z as Link, at as Sparkles, q as BookOpen, bl as cn, b_ as formatRelativeZh, cf as getGuideCoverAlt, cg as getGuideCoverUrl, d2 as guideDetailPath, cB as getPlanDaysLabel, cC as getPlanDestination, cw as getPlanBudgetLabel, c_ as getTravelPlanCoverAlt, cy as getPlanCoverImage, eG as travelPlanDetailPath, cO as getSavedUserPlanCoverUrl, eg as savedUserPlanDetailPath, bU as findUserById, cn as getMomentDescription, cp as getMomentImageAlt, cm as getMomentCoverUrl, f8 as userProfilePath, a8 as OptimizedImage, R as DiscoverRecommendBadge, m as AvatarImage, bZ as formatProfileStatCount, M as DEMO_USERS, L as DEMO_CURRENT_USER_ID, d$ as rankDiscoverUsersForViewer, c9 as getCountryLabel, aS as areDiscoverFiltersEqual, ew as suggestRelaxedDiscoverFilters, cd as getDiscoverHotPicks, ea as resolveHotPickPreview, aF as Users, _ as LoaderCircle, ce as getDiscoverRecommendationProfile, Q as Dialog, u as CITY_COORDINATES, cN as getRecentTravelPlans, bf as canViewTravelMoment, cG as getPlanStyleTags, aw as TRAVEL_INTEREST_OPTIONS, ao as Search, y as ChevronDown, aa as PAGE_CONTAINER_PADDING_MATCHED } from "./index-DwV1qlqh.js";
import { S as SlidersHorizontal } from "./AiChatMessage-Dy98aHtB.js";
import { u as useInfiniteScroll } from "./useInfiniteScroll-BdqSKKek.js";
import { U as UserPlus } from "./CapsuleContextBanner-bsCrmr4p.js";
import "./maplibre-gl-H57bTsm_.js";
import "./defaultMapOrigin-DM9zdaEz.js";
import { M as MapPinned } from "./map-pinned-CwnGvlJZ.js";
import { I as Info } from "./info-DlxnCctM.js";
/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "m3 16 4 4 4-4", key: "1co6wj" }],
  ["path", { d: "M7 20V4", key: "1yoxec" }],
  ["path", { d: "M11 4h10", key: "1w87gc" }],
  ["path", { d: "M11 8h7", key: "djye34" }],
  ["path", { d: "M11 12h4", key: "q8tih4" }]
];
const ArrowDownWideNarrow = createLucideIcon("arrow-down-wide-narrow", __iconNode);
const DISCOVER_FEED_DELAY_MS = 80;
function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
async function fetchDiscoverFeed(filters, sortMode) {
  let publicSavedSessions = [];
  try {
    const response = await fetchUserAiSessions({ public: true });
    publicSavedSessions = response.items;
  } catch {
    publicSavedSessions = [];
  }
  await delay(DISCOVER_FEED_DELAY_MS);
  return buildDiscoverFeed(filters, sortMode, publicSavedSessions);
}
const DISCOVER_FEED_DEBOUNCE_MS = 220;
function useDiscoverFeed(filters, sortMode = "recommend", debounceMs = DISCOVER_FEED_DEBOUNCE_MS) {
  const debouncedQuery = useDebouncedValue(filters.q, debounceMs);
  const effectiveFilters = reactExports.useMemo(
    () => ({
      ...filters,
      q: debouncedQuery
    }),
    [filters, debouncedQuery]
  );
  const query = useQuery({
    queryKey: queryKeys.discover.feed(effectiveFilters, sortMode),
    queryFn: () => fetchDiscoverFeed(effectiveFilters, sortMode),
    placeholderData: keepPreviousData
  });
  const items = query.data ?? [];
  return {
    items,
    total: items.length,
    isDebouncing: filters.q !== debouncedQuery,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch
  };
}
const PIN_ASPECT = {
  compact: "aspect-[5/6]",
  standard: "aspect-[4/5]",
  tall: "aspect-[3/4]"
};
const PIN_WEIGHT = {
  compact: 3,
  standard: 4,
  tall: 5
};
function filterMasonryFeedItems(items, contentType) {
  if (contentType === "all") {
    return items;
  }
  if (contentType === "plan") {
    return items.filter((item) => item.kind === "plan" || item.kind === "savedPlan");
  }
  return items.filter((item) => item.kind === contentType);
}
function hashSeed(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
function getDiscoverPinSize(item, index) {
  const seed = hashSeed(item.id) + index;
  if (item.kind === "moment") {
    return seed % 4 === 0 ? "tall" : seed % 2 === 0 ? "standard" : "compact";
  }
  if (item.kind === "guide") {
    const guide = demoGuides.find((entry) => entry.id === item.guideId);
    if (guide == null ? void 0 : guide.tags.some((tag) => tag.includes("摄影") || tag.includes("自然"))) {
      return "tall";
    }
    return seed % 3 === 0 ? "standard" : "compact";
  }
  const cycle = ["compact", "standard", "tall", "standard"];
  return cycle[seed % cycle.length];
}
function getDiscoverPinAspectClass(size) {
  return PIN_ASPECT[size];
}
function getDiscoverPinWeight(size) {
  return PIN_WEIGHT[size];
}
function buildMasonryPinEntries(items) {
  return items.map((item, index) => ({
    item,
    index,
    pinSize: getDiscoverPinSize(item, index)
  }));
}
function distributeMasonryColumns(entries, columnCount) {
  const safeCount = Math.max(1, columnCount);
  const columns = Array.from({ length: safeCount }, () => []);
  const heights = new Array(safeCount).fill(0);
  for (const entry of entries) {
    let targetColumn = 0;
    for (let column = 1; column < safeCount; column += 1) {
      if (heights[column] < heights[targetColumn]) {
        targetColumn = column;
      }
    }
    columns[targetColumn].push(entry);
    heights[targetColumn] += getDiscoverPinWeight(entry.pinSize);
  }
  return columns;
}
function getDiscoverMasonryColumnCount(width) {
  if (width >= 1280) {
    return 5;
  }
  if (width >= 1024) {
    return 4;
  }
  if (width >= 640) {
    return 3;
  }
  return 2;
}
function useDiscoverMasonryColumns() {
  const [columnCount, setColumnCount] = reactExports.useState(
    () => typeof window !== "undefined" ? getDiscoverMasonryColumnCount(window.innerWidth) : 2
  );
  reactExports.useEffect(() => {
    const update = () => {
      setColumnCount(getDiscoverMasonryColumnCount(window.innerWidth));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return columnCount;
}
const DISCOVER_FEED_PAGE_SIZE = 12;
function useInfiniteDiscoverFeed(filters, sortMode = "recommend") {
  const { items: allItems, total, isDebouncing } = useDiscoverFeed(filters, sortMode);
  const [visibleCount, setVisibleCount] = reactExports.useState(DISCOVER_FEED_PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setVisibleCount(DISCOVER_FEED_PAGE_SIZE);
    setIsLoadingMore(false);
  }, [allItems]);
  const items = reactExports.useMemo(
    () => allItems.slice(0, visibleCount),
    [allItems, visibleCount]
  );
  const hasMore = visibleCount < allItems.length;
  const loadMore = reactExports.useCallback(() => {
    if (!hasMore || isLoadingMore) {
      return;
    }
    setIsLoadingMore(true);
    setVisibleCount((count) => Math.min(count + DISCOVER_FEED_PAGE_SIZE, allItems.length));
    setIsLoadingMore(false);
  }, [allItems.length, hasMore, isLoadingMore]);
  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading: isLoadingMore,
    disabled: allItems.length === 0
  });
  return {
    items,
    total,
    isDebouncing,
    hasMore,
    isLoadingMore,
    isInitialLoading: isDebouncing && items.length === 0,
    sentinelRef,
    loadMore
  };
}
const daysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString();
const daysFromNow = (n) => new Date(Date.now() + n * 864e5).toISOString();
const DEMO_TRAVEL_BUDDY_SEEKING = [
  {
    id: "seek-maple-iceland",
    userId: "user-maple",
    planTitle: "冰岛极光摄影行",
    destination: "冰岛",
    days: 5,
    budgetLabel: "¥12,000",
    startDate: daysFromNow(21),
    message: "希望找会开车、能熬夜等极光的旅伴",
    status: "open",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3)
  },
  {
    id: "seek-nomad-vn",
    userId: "user-nomad",
    planTitle: "越南柬埔寨陆路穷游",
    destination: "越南",
    days: 7,
    budgetLabel: "¥2,800",
    message: "青旅拼房，接受搭车与夜巴",
    status: "open",
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1)
  },
  {
    id: "seek-roamly-hz",
    userId: "user-roamly-demo",
    planTitle: "杭州西湖周末轻游",
    destination: "杭州",
    days: 2,
    budgetLabel: "¥600",
    startDate: daysFromNow(7),
    status: "open",
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5)
  }
];
function FeedSectionTitle({ title, href }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "flex items-center gap-1.5 text-sm font-semibold text-slate-900", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MapPinned, { className: "h-4 w-4 text-violet-600", "aria-hidden": true }),
      title
    ] }),
    href && /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: href, className: "text-xs font-medium text-violet-700 hover:underline", children: "查看全部" })
  ] });
}
function DiscoverPlanCardsSection({ items, showSectionTitle = true }) {
  const planEntries = reactExports.useMemo(() => {
    const entries = [];
    for (const item of items) {
      if (item.kind !== "plan") {
        continue;
      }
      const plan = findTravelPlanById(item.planId);
      if (plan) {
        entries.push({ feedId: item.id, plan });
      }
    }
    return entries;
  }, [items]);
  if (planEntries.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
    showSectionTitle && /* @__PURE__ */ jsxRuntimeExports.jsx(FeedSectionTitle, { title: "旅行计划", href: paths.guides }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3", children: planEntries.map(({ feedId, plan }) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TravelPlanCard, { plan, showInteractions: true }) }, feedId)) })
  ] });
}
reactExports.memo(DiscoverPlanCardsSection);
const KIND_META = {
  guide: { label: "攻略", Icon: BookOpen, accent: "bg-emerald-500/90" },
  plan: { label: "计划", Icon: MapPinned, accent: "bg-violet-500/90" },
  savedPlan: { label: "穷游方案", Icon: MapPinned, accent: "bg-brand-500/90" },
  moment: { label: "瞬间", Icon: Sparkles, accent: "bg-fuchsia-500/90" }
};
function PinShell({
  href,
  coverUrl,
  coverAlt,
  badge,
  recommendBadge,
  title,
  subtitle,
  meta,
  aspectClass,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Link,
    {
      to: href,
      className: cn(
        "group relative block overflow-hidden rounded-2xl bg-slate-200 shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:ring-violet-200/60",
        className
      ),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("relative w-full overflow-hidden", aspectClass), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          OptimizedImage,
          {
            src: coverUrl,
            alt: coverAlt,
            fill: true,
            sizes: "(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 280px",
            className: "transition duration-500 group-hover:scale-[1.05]"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/75", "aria-hidden": true }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute left-2 right-2 top-2 flex flex-wrap items-start justify-between gap-1", children: [
          badge,
          recommendBadge
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-x-0 bottom-0 p-3 pt-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "line-clamp-2 text-sm font-semibold leading-snug text-white drop-shadow-sm", children: title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 line-clamp-1 text-xs text-white/85", children: subtitle }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[10px] text-white/70", children: meta })
        ] })
      ] })
    }
  );
}
function CardShell({
  href,
  coverUrl,
  coverAlt,
  badge,
  title,
  subtitle,
  meta,
  tall = false,
  recommendBadge,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Link,
    {
      to: href,
      className: cn(
        "group block overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("relative overflow-hidden bg-slate-100", tall ? "aspect-[3/4]" : "aspect-[4/3]"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            OptimizedImage,
            {
              src: coverUrl,
              alt: coverAlt,
              fill: true,
              sizes: "(max-width: 640px) 90vw, 320px",
              className: "transition duration-500 group-hover:scale-[1.04]"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute left-2 right-2 top-2 flex flex-wrap items-start justify-between gap-1", children: [
            badge,
            recommendBadge
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "line-clamp-2 text-sm font-semibold leading-snug text-slate-900", children: title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "line-clamp-1 text-xs text-slate-500", children: subtitle }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-slate-400", children: meta })
        ] })
      ]
    }
  );
}
function DiscoverMasonryCard({
  item,
  recommendScore = 0,
  recommendReasons = [],
  layout = "pinterest",
  pinSize = "standard",
  className
}) {
  const kindMeta = KIND_META[item.kind];
  const badge = /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("rounded-md px-2 py-0.5 text-[10px] font-semibold text-white", kindMeta.accent), children: kindMeta.label });
  const recommendBadge = /* @__PURE__ */ jsxRuntimeExports.jsx(
    DiscoverRecommendBadge,
    {
      score: recommendScore,
      reasons: recommendReasons,
      interactive: true
    }
  );
  const usePin = layout === "pinterest";
  const aspectClass = getDiscoverPinAspectClass(pinSize);
  const render = (shell) => {
    if (item.kind === "guide") {
      const guide = demoGuides.find((entry) => entry.id === item.guideId);
      if (!guide) {
        return null;
      }
      return shell({
        href: guideDetailPath(guide.id),
        coverUrl: getGuideCoverUrl(guide),
        coverAlt: getGuideCoverAlt(guide),
        title: guide.title,
        subtitle: `${guide.city} · ${guide.budget}`,
        meta: `${guide.days} · ${formatRelativeZh(guide.updatedAt)}`,
        tall: guide.tags.includes("摄影") || guide.tags.includes("自然")
      });
    }
    if (item.kind === "plan") {
      const plan = findTravelPlanById(item.planId);
      if (!plan) {
        return null;
      }
      return shell({
        href: travelPlanDetailPath(plan.id),
        coverUrl: getPlanCoverImage(plan),
        coverAlt: getTravelPlanCoverAlt(plan),
        title: plan.title,
        subtitle: `${getPlanDestination(plan)} · ${getPlanBudgetLabel(plan)}`,
        meta: `${getPlanDaysLabel(plan)} · ${formatRelativeZh(item.updatedAt)}`
      });
    }
    if (item.kind === "savedPlan") {
      return shell({
        href: savedUserPlanDetailPath(item.userPlanId),
        coverUrl: getSavedUserPlanCoverUrl(item.userPlanId, item.locationName),
        coverAlt: `${item.title} 封面`,
        title: item.title,
        subtitle: `${item.locationName} · 蜗友公开方案`,
        meta: formatRelativeZh(item.updatedAt)
      });
    }
    const user = findUserById(item.authorId);
    const moment = user == null ? void 0 : user.travelMoments.find((entry) => entry.id === item.momentId);
    if (!moment || !user) {
      return null;
    }
    const momentTitle = moment.title ?? getMomentDescription(moment);
    return shell({
      href: userProfilePath(user.id),
      coverUrl: getMomentCoverUrl(moment),
      coverAlt: getMomentImageAlt(moment),
      title: momentTitle,
      subtitle: `${user.username}${moment.location ? ` · ${moment.location}` : ""}`,
      meta: `${moment.likeCount} 赞 · ${formatRelativeZh(moment.createdAt)}`,
      tall: Boolean(moment.imageUrls && moment.imageUrls.length > 1)
    });
  };
  return render(({ href, coverUrl, coverAlt, title, subtitle, meta, tall }) => {
    if (usePin) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        PinShell,
        {
          href,
          coverUrl,
          coverAlt,
          badge,
          recommendBadge,
          title,
          subtitle,
          meta,
          aspectClass: tall && pinSize !== "compact" ? getDiscoverPinAspectClass("tall") : aspectClass,
          className
        }
      );
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      CardShell,
      {
        href,
        coverUrl,
        coverAlt,
        badge,
        recommendBadge,
        title,
        subtitle,
        meta,
        tall,
        className
      }
    );
  });
}
function areDiscoverMasonryCardPropsEqual(prev, next) {
  return prev.item === next.item && prev.recommendScore === next.recommendScore && prev.recommendReasons === next.recommendReasons && prev.layout === next.layout && prev.pinSize === next.pinSize && prev.className === next.className;
}
const DiscoverMasonryCard$1 = reactExports.memo(DiscoverMasonryCard, areDiscoverMasonryCardPropsEqual);
function DiscoverPopularUserCard({
  user,
  recommendScore = 0,
  recommendReasons = [],
  className
}) {
  var _a;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Link,
    {
      to: userProfilePath(user.id),
      className: cn(
        "flex flex-col items-center rounded-2xl border border-slate-200/90 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md",
        className
      ),
      children: [
        user.avatar ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          AvatarImage,
          {
            src: user.avatar,
            displayName: user.username,
            size: 64,
            className: "h-16 w-16 border-2 border-white shadow-md ring-2 ring-violet-100"
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-lg font-bold text-violet-700 ring-2 ring-violet-100",
            "aria-hidden": true,
            children: user.username.slice(0, 1)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex w-full flex-col items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DiscoverRecommendBadge,
            {
              score: recommendScore,
              reasons: recommendReasons,
              interactive: true
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "line-clamp-1 w-full text-sm font-semibold text-slate-900", children: user.username })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 line-clamp-1 text-[11px] text-violet-700", children: user.travelPersonality.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 line-clamp-2 min-h-[2rem] text-xs leading-snug text-slate-500", children: ((_a = user.bio) == null ? void 0 : _a.trim()) || "热爱穷游与分享的旅人" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex w-full items-center justify-center gap-3 text-[10px] text-slate-500", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-slate-800", children: formatProfileStatCount(user.followersCount) }),
            " ",
            "粉丝"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-slate-800", children: formatProfileStatCount(user.stats.publishedPlanCount) }),
            " ",
            "计划"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mt-3 inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-3 w-3", "aria-hidden": true }),
          "查看主页"
        ] })
      ]
    }
  );
}
const DiscoverPopularUserCard$1 = reactExports.memo(
  DiscoverPopularUserCard,
  (prev, next) => prev.user === next.user && prev.recommendScore === next.recommendScore && prev.recommendReasons === next.recommendReasons && prev.className === next.className
);
function userMatchesDestination(user, destination) {
  var _a;
  if ((_a = user.bio) == null ? void 0 : _a.includes(destination)) {
    return true;
  }
  return user.visitedCountries.some((code) => {
    const label = getCountryLabel(code);
    return label.includes(destination) || destination.includes(label);
  });
}
function getDiscoverPopularUsers(filters, sortMode = "recommend") {
  const query = filters.q.trim().toLowerCase();
  const filtered = DEMO_USERS.filter((user) => {
    if (user.id === DEMO_CURRENT_USER_ID) {
      return false;
    }
    if (filters.destination && !userMatchesDestination(user, filters.destination)) {
      return false;
    }
    if (filters.travelType && !user.interests.includes(filters.travelType)) {
      return false;
    }
    if (query) {
      const blob = [
        user.username,
        user.bio ?? "",
        user.travelPersonality.title,
        user.travelPersonality.traits.join(" ")
      ].join(" ").toLowerCase();
      if (!blob.includes(query)) {
        return false;
      }
    }
    return true;
  });
  if (sortMode === "recent") {
    return [...filtered].sort((a, b) => b.followersCount - a.followersCount).map((user) => ({
      ...user,
      recommendScore: 0,
      recommendReasons: []
    }));
  }
  return rankDiscoverUsersForViewer(filtered);
}
function shouldShowDiscoverSection(filters, section) {
  {
    return filters.contentType === "all";
  }
}
const SKELETON_SIZES = ["compact", "standard", "tall", "standard", "compact"];
function DiscoverMasonryPinSkeleton({
  count = 6,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: Array.from({ length: count }, (_, index) => {
    const size = SKELETON_SIZES[index % SKELETON_SIZES.length];
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: cn(
          "overflow-hidden rounded-2xl bg-slate-200/80 ring-1 ring-slate-200/80",
          getDiscoverPinAspectClass(size),
          className
        ),
        "aria-hidden": true,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full w-full animate-pulse bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200" })
      },
      index
    );
  }) });
}
function DiscoverPinterestMasonry({
  items,
  users,
  filters,
  sortMode,
  sentinelRef,
  isLoadingMore = false,
  isInitialLoading = false,
  hasMore = false,
  className,
  hotDestinations = [],
  onSuggestDestination,
  onRelaxFilters
}) {
  const columnCount = useDiscoverMasonryColumns();
  const feedItems = reactExports.useMemo(
    () => filterMasonryFeedItems(items, filters.contentType),
    [items, filters.contentType]
  );
  const showUsers = shouldShowDiscoverSection(filters);
  const showMasonry = filters.contentType === "all" || filters.contentType === "guide" || filters.contentType === "plan" || filters.contentType === "moment";
  const columns = reactExports.useMemo(() => {
    const entries = buildMasonryPinEntries(feedItems);
    return distributeMasonryColumns(entries, columnCount);
  }, [feedItems, columnCount]);
  const isEmpty = (showMasonry ? feedItems.length : 0) + (showUsers ? users.length : 0) === 0;
  const relaxedFilters = reactExports.useMemo(
    () => isEmpty ? suggestRelaxedDiscoverFilters(filters) : null,
    [filters, isEmpty]
  );
  const fallbackPreviews = reactExports.useMemo(
    () => getDiscoverHotPicks(4).map((item) => resolveHotPickPreview(item)).filter((entry) => entry != null),
    []
  );
  if (!isInitialLoading && isEmpty) {
    const destination = filters.destination.trim();
    const uncovered = destination && !hotDestinations.includes(destination);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: cn(
          "overflow-hidden rounded-2xl border border-dashed border-violet-200 bg-gradient-to-b from-violet-50/80 to-white px-4 py-8 text-center",
          className
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-6 w-6", "aria-hidden": true }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-base font-semibold text-slate-800", children: uncovered ? `「${destination}」的内容还在路上` : destination ? `「${destination}」下暂时没有匹配内容` : "这组筛选太严格啦" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-500", children: "换个目的地或标签，下面这些地方一定有惊喜" }),
          fallbackPreviews.length > 0 && onSuggestDestination ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4", children: fallbackPreviews.map((pick) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => {
                if (pick.destinationHint && onSuggestDestination) {
                  onSuggestDestination(pick.destinationHint);
                }
              },
              className: "group overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative aspect-[4/3] w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  OptimizedImage,
                  {
                    src: pick.coverUrl,
                    alt: pick.title,
                    fill: true,
                    sizes: "160px",
                    className: "transition duration-300 group-hover:scale-105"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "line-clamp-1 text-xs font-semibold text-slate-800", children: pick.title }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-[10px] text-violet-600", children: "点我探索 →" })
                ] })
              ]
            },
            pick.item.id
          )) }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex flex-wrap justify-center gap-2", children: [
            relaxedFilters && onRelaxFilters ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => onRelaxFilters(relaxedFilters),
                className: "rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700",
                children: "放宽筛选，看更多内容"
              }
            ) : null,
            hotDestinations.length > 0 && onSuggestDestination ? hotDestinations.slice(0, 4).map((city) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => onSuggestDestination(city),
                className: "rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-800 hover:bg-violet-100",
                children: [
                  "看 ",
                  city
                ]
              },
              city
            )) : null
          ] })
        ]
      }
    );
  }
  const userSortHint = sortMode === "recommend" ? "按兴趣与合拍度" : "按粉丝人气";
  const gapClass = "gap-3 sm:gap-4 md:gap-4 lg:gap-5 xl:gap-6";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("space-y-6", className), children: [
    showUsers && users.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "aria-labelledby": "discover-masonry-users-title", className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "h3",
          {
            id: "discover-masonry-users-title",
            className: "flex items-center gap-1.5 text-sm font-semibold text-slate-900",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4 text-violet-600", "aria-hidden": true }),
              "热门旅人"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-slate-400", children: userSortHint })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", children: users.map((user) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-[148px] shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        DiscoverPopularUserCard$1,
        {
          user,
          recommendScore: user.recommendScore,
          recommendReasons: user.recommendReasons,
          className: "h-full p-3"
        }
      ) }, user.id)) })
    ] }),
    showMasonry && (isInitialLoading || feedItems.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: cn("flex", gapClass),
        role: "list",
        "aria-label": "发现瀑布流",
        "aria-busy": isInitialLoading,
        children: Array.from({ length: columnCount }, (_, columnIndex) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: cn("flex min-w-0 flex-1 flex-col", gapClass),
            role: "presentation",
            children: isInitialLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(DiscoverMasonryPinSkeleton, { count: columnIndex === 0 ? 3 : 2 }) : (columns[columnIndex] ?? []).map(({ item, pinSize }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "listitem", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              DiscoverMasonryCard$1,
              {
                item,
                recommendScore: item.recommendScore,
                recommendReasons: item.recommendReasons,
                pinSize,
                layout: "pinterest"
              }
            ) }, item.id))
          },
          columnIndex
        ))
      }
    ),
    showMasonry && !isInitialLoading && isLoadingMore && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex", gapClass), "aria-hidden": true, children: Array.from({ length: columnCount }, (_, columnIndex) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex min-w-0 flex-1 flex-col", gapClass), children: /* @__PURE__ */ jsxRuntimeExports.jsx(DiscoverMasonryPinSkeleton, { count: 1 }) }, columnIndex)) }),
    showMasonry && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: sentinelRef, className: "h-px w-full", "aria-hidden": true }),
      isLoadingMore && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center justify-center gap-2 text-sm text-slate-500", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-violet-600", "aria-hidden": true }),
        "加载更多 Pin…"
      ] }),
      !isLoadingMore && !hasMore && feedItems.length > 0 && !isInitialLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-slate-400", children: "瀑布流已浏览完毕" })
    ] })
  ] });
}
const DiscoverPinterestMasonry$1 = reactExports.memo(
  DiscoverPinterestMasonry,
  (prev, next) => prev.items === next.items && prev.users === next.users && areDiscoverFiltersEqual(prev.filters, next.filters) && prev.sortMode === next.sortMode && prev.isLoadingMore === next.isLoadingMore && prev.isInitialLoading === next.isInitialLoading && prev.hasMore === next.hasMore && prev.sentinelRef === next.sentinelRef && prev.className === next.className && prev.hotDestinations === next.hotDestinations && prev.onSuggestDestination === next.onSuggestDestination && prev.onRelaxFilters === next.onRelaxFilters
);
function DiscoverRecommendExplainDialog({
  open,
  onClose
}) {
  const profile = reactExports.useMemo(() => getDiscoverRecommendationProfile(), []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Dialog,
    {
      open,
      onClose,
      title: "推荐如何工作？",
      description: `基于 ${profile.username} 的旅行档案，在本地为你计算匹配度并排序（演示环境，无云端模型）。`,
      confirmLabel: "知道了",
      onConfirm: onClose,
      className: "max-w-lg",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-violet-100 bg-violet-50/80 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-violet-900", children: "你的兴趣画像" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "mt-2 space-y-1 text-xs text-violet-950/90", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-violet-700", children: "关注兴趣：" }),
              profile.interestLabels.join("、") || "未设置"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-violet-700", children: "旅行性格：" }),
              profile.personalityTitle,
              profile.personalityTraits.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-violet-800/80", children: [
                " ",
                "· ",
                profile.personalityTraits.join("、")
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-violet-700", children: "足迹：" }),
              profile.visitedLabels.length > 0 ? profile.visitedLabels.join("、") : "暂无记录"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-slate-800", children: "打分维度" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-2 space-y-2", children: profile.scoringFactors.map((factor) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "li",
            {
              className: "rounded-lg border border-slate-100 bg-slate-50 px-3 py-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-slate-900", children: factor.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs leading-relaxed text-slate-600", children: factor.detail })
              ]
            },
            factor.title
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] leading-relaxed text-slate-500", children: "匹配分 ≥ 45 的内容会显示「为你推荐」角标。切换「最新发布」时按更新时间排序，角标仍保留参考分。" })
      ] })
    }
  );
}
const OPTIONS = [
  { id: "recommend", label: "智能推荐", Icon: Sparkles },
  { id: "recent", label: "最新发布", Icon: ArrowDownWideNarrow }
];
function DiscoverSortToggle({ value, onChange, className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn(
        "inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5",
        className
      ),
      role: "group",
      "aria-label": "内容排序",
      children: OPTIONS.map(({ id, label, Icon }) => {
        const active = value === id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => onChange(id),
            className: cn(
              "inline-flex min-h-10 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition sm:min-h-0 sm:px-2.5 sm:py-1 sm:text-xs",
              active ? "bg-white text-violet-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            ),
            "aria-pressed": active,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5 shrink-0", "aria-hidden": true }),
              label
            ]
          },
          id
        );
      })
    }
  );
}
const RAW_CITIES = Object.keys(CITY_COORDINATES).filter((city) => city !== "周村古城");
const DISCOVER_CHINA_CITIES = [...RAW_CITIES].sort(
  (a, b) => a.localeCompare(b, "zh-CN")
);
const KNOWN_CITY_LABELS = [.../* @__PURE__ */ new Set([...DISCOVER_CHINA_CITIES, ...demoGuides.map((guide) => guide.city)])];
function increment(map, key, weight = 1) {
  const normalized = key.trim();
  if (!normalized) {
    return;
  }
  map.set(normalized, (map.get(normalized) ?? 0) + weight);
}
function resolveCityFromLocation(location) {
  var _a;
  const text = location.trim();
  if (!text) {
    return null;
  }
  for (const city of KNOWN_CITY_LABELS) {
    if (text.includes(city)) {
      return city;
    }
  }
  const tail = (_a = text.split(/[·•]/).pop()) == null ? void 0 : _a.trim();
  if (tail && tail.length <= 8) {
    return tail;
  }
  return null;
}
function rankEntries(map, limit) {
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-CN")).slice(0, limit).map(([label, count], index) => ({
    label,
    count,
    rank: index + 1
  }));
}
function collectDestinationCounts() {
  const counts = /* @__PURE__ */ new Map();
  for (const guide of demoGuides) {
    increment(counts, guide.city, 3);
  }
  for (const plan of getRecentTravelPlans(24)) {
    const city = resolveCityFromLocation(getPlanDestination(plan));
    if (city) {
      increment(counts, city, 2);
    }
  }
  for (const user of DEMO_USERS) {
    for (const moment of user.travelMoments) {
      if (!canViewTravelMoment({
        moment,
        authorId: user.id,
        viewerId: DEMO_CURRENT_USER_ID,
        isOwnProfile: user.id === DEMO_CURRENT_USER_ID
      })) {
        continue;
      }
      const city = resolveCityFromLocation(moment.location ?? "");
      if (city) {
        increment(counts, city, 1);
      }
    }
  }
  return counts;
}
function collectTagCounts() {
  const counts = /* @__PURE__ */ new Map();
  for (const guide of demoGuides) {
    for (const tag of guide.tags) {
      increment(counts, tag, 3);
    }
  }
  for (const plan of getRecentTravelPlans(24)) {
    for (const tag of getPlanStyleTags(plan)) {
      increment(counts, tag.label, 2);
    }
    for (const tag of plan.tags) {
      increment(counts, tag, 1);
    }
  }
  for (const user of DEMO_USERS) {
    for (const moment of user.travelMoments) {
      if (!canViewTravelMoment({
        moment,
        authorId: user.id,
        viewerId: DEMO_CURRENT_USER_ID,
        isOwnProfile: user.id === DEMO_CURRENT_USER_ID
      })) {
        continue;
      }
      for (const tag of moment.tags) {
        increment(counts, tag, 1);
      }
    }
  }
  return counts;
}
function getDiscoverTrends(destinationLimit = 20, tagLimit = 10) {
  const destinationRanked = rankEntries(collectDestinationCounts(), destinationLimit);
  return {
    destinations: destinationRanked.map((entry) => ({
      ...entry,
      value: entry.label
    })),
    tags: rankEntries(collectTagCounts(), tagLimit),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function getDiscoverCitiesWithContent() {
  return rankEntries(collectDestinationCounts(), 999).map((entry, index) => ({
    label: entry.label,
    value: entry.label,
    count: entry.count,
    rank: index + 1
  }));
}
const DISCOVER_TRAVEL_TYPES = [
  { value: "", label: "全部类型" },
  ...TRAVEL_INTEREST_OPTIONS.map((item) => ({ value: item.id, label: item.label }))
];
const DISCOVER_TIME_RANGES = [
  { value: "all", label: "全部时间" },
  { value: "7d", label: "近 7 天" },
  { value: "30d", label: "近 30 天" },
  { value: "90d", label: "近 3 个月" }
];
const DISCOVER_CONTENT_TYPES = [
  { value: "all", label: "全部内容" },
  { value: "guide", label: "攻略" },
  { value: "plan", label: "旅行计划" },
  { value: "moment", label: "旅行瞬间" }
];
function DiscoverFilterChips({
  label,
  value,
  options,
  onChange,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { className: cn("min-w-0", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("legend", { className: "mb-2 text-sm font-medium text-slate-600 sm:mb-1.5 sm:text-xs", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:pb-0.5", children: options.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => onChange(option.value),
        className: cn(
          "shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium transition sm:px-3 sm:py-1 sm:text-xs",
          value === option.value ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-violet-200"
        ),
        "aria-pressed": value === option.value,
        children: option.label
      },
      option.value || `all-${label}`
    )) })
  ] });
}
const KNOWN_DESTINATIONS = getDiscoverCitiesWithContent().map((city) => city.label);
function resolveDiscoverSearchInput(input, current) {
  const trimmed = input.trim();
  if (!trimmed) {
    return { destination: "", q: "" };
  }
  const matchedCity = KNOWN_DESTINATIONS.find(
    (city) => city === trimmed || trimmed.includes(city) || city.includes(trimmed)
  );
  if (matchedCity) {
    return { destination: matchedCity, q: "" };
  }
  return { destination: "", q: trimmed };
}
function getDiscoverSearchDisplayValue(filters) {
  return filters.destination || filters.q;
}
function DiscoverSearchFilters({
  filters,
  advancedFilterCount,
  hasActiveFilters,
  resultTotal,
  isDebouncing = false,
  onSearchChange,
  onTravelTypeChange,
  onTimeRangeChange,
  onContentTypeChange,
  onReset,
  onJumpToFeed,
  className
}) {
  const [filtersExpanded, setFiltersExpanded] = reactExports.useState(false);
  const [queryDraft, setQueryDraft] = reactExports.useState(() => getDiscoverSearchDisplayValue(filters));
  const isComposingRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (!isComposingRef.current) {
      setQueryDraft(getDiscoverSearchDisplayValue(filters));
    }
  }, [filters.destination, filters.q]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      className: cn(
        "sticky top-[var(--app-header-offset)] z-30 border-b border-slate-200/90 bg-slate-50/95 py-4 backdrop-blur-md sm:static sm:rounded-2xl sm:border sm:bg-white sm:shadow-sm",
        PAGE_CONTAINER_PADDING_MATCHED,
        className
      ),
      "aria-label": "发现页搜索与筛选",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold tracking-tight text-slate-900 sm:text-2xl", children: "发现" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-500 sm:text-xs", children: "搜关键词，或点下方城市/标签 · 瀑布流立刻更新" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "relative mt-4 block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "搜索目的地、关键词或标签" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Search,
            {
              className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400",
              "aria-hidden": true
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "search",
              value: queryDraft,
              onChange: (event) => {
                const next = event.target.value;
                setQueryDraft(next);
                if (!isComposingRef.current) {
                  onSearchChange(next);
                }
              },
              onCompositionStart: () => {
                isComposingRef.current = true;
              },
              onCompositionEnd: (event) => {
                isComposingRef.current = false;
                const next = event.currentTarget.value;
                setQueryDraft(next);
                onSearchChange(next);
              },
              placeholder: "搜索目的地、美食、路线…",
              className: "block w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-base shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 sm:py-2.5 sm:text-sm"
            }
          ),
          isDebouncing && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400", children: "筛选中…" })
        ] }),
        hasActiveFilters ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-violet-100 bg-violet-50/80 px-3 py-2",
            "aria-live": "polite",
            "aria-atomic": "true",
            children: isDebouncing ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-violet-700", children: "筛选中…" }) : resultTotal > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-medium text-violet-900", children: [
                "找到 ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold tabular-nums", children: resultTotal }),
                " 条相关内容"
              ] }),
              onJumpToFeed ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: onJumpToFeed,
                  className: "inline-flex items-center gap-0.5 text-xs font-semibold text-violet-700 hover:underline",
                  children: [
                    "往下看",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3.5 w-3.5", "aria-hidden": true })
                  ]
                }
              ) : null
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-violet-800", children: "暂无匹配内容，试试换关键词或点下方城市" })
          }
        ) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => setFiltersExpanded((open) => !open),
            className: "mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-lg px-1 text-sm font-semibold text-violet-700 sm:min-h-0 sm:text-xs",
            "aria-expanded": filtersExpanded,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersHorizontal, { className: "h-3.5 w-3.5", "aria-hidden": true }),
              "更多筛选",
              advancedFilterCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-violet-600 px-1.5 py-0.5 text-[10px] font-bold text-white", children: advancedFilterCount })
            ]
          }
        ),
        filtersExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-3 rounded-xl border border-slate-200/80 bg-white/80 p-3", children: [
          hasActiveFilters && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: onReset,
              className: "text-xs font-semibold text-violet-700 hover:underline",
              children: "重置全部筛选"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DiscoverFilterChips,
            {
              label: "旅行类型",
              value: filters.travelType,
              options: DISCOVER_TRAVEL_TYPES,
              onChange: onTravelTypeChange
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DiscoverFilterChips,
            {
              label: "发布时间",
              value: filters.timeRange,
              options: DISCOVER_TIME_RANGES,
              onChange: onTimeRangeChange
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DiscoverFilterChips,
            {
              label: "内容类型",
              value: filters.contentType,
              options: DISCOVER_CONTENT_TYPES,
              onChange: onContentTypeChange
            }
          )
        ] })
      ]
    }
  );
}
const DiscoverSearchFilters$1 = reactExports.memo(
  DiscoverSearchFilters,
  (prev, next) => areDiscoverFiltersEqual(prev.filters, next.filters) && prev.advancedFilterCount === next.advancedFilterCount && prev.hasActiveFilters === next.hasActiveFilters && prev.resultTotal === next.resultTotal && prev.isDebouncing === next.isDebouncing && prev.className === next.className && prev.onSearchChange === next.onSearchChange && prev.onTravelTypeChange === next.onTravelTypeChange && prev.onTimeRangeChange === next.onTimeRangeChange && prev.onContentTypeChange === next.onContentTypeChange && prev.onReset === next.onReset && prev.onJumpToFeed === next.onJumpToFeed
);
function DiscoverMasonryFeedSection({
  filters,
  sortMode,
  hasActiveFilters,
  interestSummary,
  onSortModeChange,
  feedSectionRef,
  hotDestinations = [],
  onSuggestDestination,
  onRelaxFilters
}) {
  const [explainOpen, setExplainOpen] = reactExports.useState(false);
  const {
    items,
    total,
    hasMore,
    isLoadingMore,
    isInitialLoading,
    sentinelRef
  } = useInfiniteDiscoverFeed(filters, sortMode);
  const popularUsers = reactExports.useMemo(
    () => getDiscoverPopularUsers(filters, sortMode),
    [filters, sortMode]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        ref: feedSectionRef,
        className: "scroll-mt-[5.5rem] flex flex-wrap items-end justify-between gap-3",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-slate-900 sm:text-sm", children: hasActiveFilters ? "筛选结果" : "全部内容" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-500 sm:mt-0.5 sm:text-xs", children: hasActiveFilters ? filters.destination ? `「${filters.destination}」· 共 ${total} 条 · 点卡片阅读` : filters.q.trim() ? `「${filters.q.trim()}」· 共 ${total} 条 · 点卡片阅读` : `共 ${total} 条 · 点卡片阅读` : sortMode === "recommend" ? `按 ${interestSummary} 等兴趣推荐 · 共 ${total} 条` : `按最新发布 · 共 ${total} 条` }),
            !hasActiveFilters && sortMode === "recommend" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => setExplainOpen(true),
                className: "mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-violet-700 hover:underline",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-3 w-3", "aria-hidden": true }),
                  "了解推荐逻辑"
                ]
              }
            ) : null
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex shrink-0 flex-wrap items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DiscoverSortToggle, { value: sortMode, onChange: onSortModeChange }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DiscoverPinterestMasonry$1,
      {
        items,
        users: popularUsers,
        filters,
        sortMode,
        sentinelRef,
        isLoadingMore,
        isInitialLoading,
        hasMore,
        hotDestinations,
        onSuggestDestination,
        onRelaxFilters
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DiscoverRecommendExplainDialog, { open: explainOpen, onClose: () => setExplainOpen(false) })
  ] });
}
const DiscoverMasonryFeedSection$1 = reactExports.memo(
  DiscoverMasonryFeedSection,
  (prev, next) => areDiscoverFiltersEqual(prev.filters, next.filters) && prev.sortMode === next.sortMode && prev.hasActiveFilters === next.hasActiveFilters && prev.interestSummary === next.interestSummary && prev.onSortModeChange === next.onSortModeChange && prev.feedSectionRef === next.feedSectionRef && prev.hotDestinations === next.hotDestinations && prev.onSuggestDestination === next.onSuggestDestination && prev.onRelaxFilters === next.onRelaxFilters
);
export {
  DEMO_TRAVEL_BUDDY_SEEKING as D,
  DISCOVER_CONTENT_TYPES as a,
  DISCOVER_FEED_DEBOUNCE_MS as b,
  DISCOVER_TIME_RANGES as c,
  DISCOVER_TRAVEL_TYPES as d,
  DiscoverMasonryFeedSection$1 as e,
  DiscoverSearchFilters$1 as f,
  getDiscoverTrends as g,
  resolveDiscoverSearchInput as r
};
