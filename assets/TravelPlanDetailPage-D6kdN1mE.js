const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/TravelPlanRouteMap-AC5h_0ab.js","assets/vendor-react-DtfH6MSw.js","assets/MapServicePlaceholder-Xf-uj5s5.js","assets/index-DwV1qlqh.js","assets/vendor-three-Blpl5Qyv.js","assets/provider-CMJI8edA.js","assets/credentials-BlGlDwm4.js","assets/geocodeTravelPlan-BXQEsjoj.js","assets/amapGeocoderClient-CjYlis2t.js","assets/knownOriginFallbacks-BTkbXw-0.js"])))=>i.map(i=>d[i]);
import { _ as __vitePreload } from "./vendor-three-Blpl5Qyv.js";
import { a as reactExports, j as jsxRuntimeExports } from "./vendor-react-DtfH6MSw.js";
import { a as TravelPlanDetailHeader, c as TravelPlanOverview, b as TravelPlanItineraryTimeline, d as TravelPlanPracticalInfo, T as TravelPlanDetailActions } from "./TravelPlanPracticalInfo-BmJHJlJH.js";
import { bl as cn, dp as isEnrichedTravelPlan, K as DEFAULT_OG_IMAGE_URL, f8 as userProfilePath, g as APP_NAME, ed as resolveSiteOrigin, eG as travelPlanDetailPath, eQ as useGeneratedPlansStore, bT as findTravelPlanById, eY as useParams, eW as useNavigate, eH as travelPlanPageSeo, dS as paths, eX as usePageSeo, Z as Link } from "./index-DwV1qlqh.js";
import { a as MotionPage, M as MotionBlock } from "./MotionPage-Bc8Pg75O.js";
import { b as getAiProviderDisplay } from "./ai-CeNlrO9U.js";
import { u as useShareLandingTracking } from "./useShareLandingTracking-DSPHg4qR.js";
import { A as ArrowLeft } from "./arrow-left-DfGUbiny.js";
import "./travelPlanCompanionNavigation-DBWwdSWF.js";
import "./info-DlxnCctM.js";
import "./appMode-mvxqt0jz.js";
import "./credentials-BlGlDwm4.js";
const SECTION_LINKS = [
  { id: "travel-plan-overview-title", label: "概览" },
  { id: "travel-plan-map-title", label: "地图" },
  { id: "travel-plan-itinerary-title", label: "行程" },
  { id: "travel-plan-practical-title", label: "实用" },
  { id: "travel-plan-actions-title", label: "行动" }
];
function TravelPlanDetailNav({ className }) {
  const scrollToSection = reactExports.useCallback((sectionId) => {
    const element = document.getElementById(sectionId);
    element == null ? void 0 : element.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "nav",
    {
      className: cn(
        "sticky top-[var(--app-header-offset)] z-10 -mx-5 mb-1 flex gap-1 overflow-x-auto border-b border-slate-200/90 bg-white/95 px-5 py-2 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:mb-4 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:rounded-xl lg:border lg:px-3 lg:py-2",
        className
      ),
      "aria-label": "计划详情章节",
      children: SECTION_LINKS.map(({ id, label }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => scrollToSection(id),
          className: "shrink-0 rounded-lg px-3 py-1.5 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-brand-700 lg:w-full",
          children: label
        },
        id
      ))
    }
  );
}
const MANAGED_SELECTOR = "data-roamly-jsonld";
function applyJsonLd(id, data) {
  if (typeof document === "undefined") {
    return () => void 0;
  }
  const scriptId = `jsonld-${id}`;
  const existing = document.getElementById(scriptId);
  existing == null ? void 0 : existing.remove();
  if (!data) {
    return () => void 0;
  }
  const script = document.createElement("script");
  script.id = scriptId;
  script.type = "application/ld+json";
  script.setAttribute(MANAGED_SELECTOR, "true");
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
  return () => {
    var _a;
    (_a = document.getElementById(scriptId)) == null ? void 0 : _a.remove();
  };
}
function useJsonLd(id, data) {
  reactExports.useEffect(() => {
    return applyJsonLd(id, data);
  }, [id, data]);
}
function buildActivityItem(activity, position) {
  const item = {
    "@type": "TouristAttraction",
    name: activity.description
  };
  if (activity.location) {
    item.address = {
      "@type": "PostalAddress",
      addressLocality: activity.location
    };
  }
  if (activity.coordinates) {
    item.geo = {
      "@type": "GeoCoordinates",
      latitude: activity.coordinates.latitude,
      longitude: activity.coordinates.longitude
    };
  }
  return {
    "@type": "ListItem",
    position,
    item
  };
}
function buildDayItem(day) {
  return {
    "@type": "ListItem",
    position: day.day,
    item: {
      "@type": "Trip",
      name: day.title,
      itinerary: {
        "@type": "ItemList",
        numberOfItems: day.activities.length,
        itemListElement: day.activities.map(
          (activity, index) => buildActivityItem(activity, index + 1)
        )
      }
    }
  };
}
function buildTravelPlanJsonLd(plan, planId) {
  var _a;
  const origin = resolveSiteOrigin();
  const pageUrl = `${origin}${travelPlanDetailPath(planId)}`;
  const enriched = isEnrichedTravelPlan(plan) ? plan : null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "@id": `${pageUrl}#trip`,
    name: plan.title,
    description: plan.summary,
    url: pageUrl,
    inLanguage: "zh-CN",
    keywords: plan.tags.join(", "),
    provider: {
      "@type": "Organization",
      name: APP_NAME,
      url: origin
    },
    offers: {
      "@type": "Offer",
      price: plan.totalCost,
      priceCurrency: "CNY",
      availability: "https://schema.org/InStock",
      url: pageUrl
    },
    itinerary: {
      "@type": "ItemList",
      numberOfItems: plan.dailyPlans.length,
      itemListElement: plan.dailyPlans.map((day) => buildDayItem(day))
    }
  };
  if (enriched == null ? void 0 : enriched.presentation.destination) {
    jsonLd.touristDestination = {
      "@type": "Place",
      name: enriched.presentation.destination
    };
  }
  if (plan.suitableAudience) {
    jsonLd.audience = {
      "@type": "Audience",
      audienceType: plan.suitableAudience
    };
  }
  const image = (enriched == null ? void 0 : enriched.presentation.coverImageUrl) ?? DEFAULT_OG_IMAGE_URL;
  jsonLd.image = image;
  if (enriched == null ? void 0 : enriched.presentation.generatedAt) {
    jsonLd.datePublished = enriched.presentation.generatedAt;
    jsonLd.dateModified = enriched.presentation.generatedAt;
  }
  if (enriched == null ? void 0 : enriched.presentation.creator) {
    const { creator } = enriched.presentation;
    jsonLd.author = {
      "@type": "Person",
      name: creator.nickname,
      url: `${origin}${userProfilePath(creator.id)}`,
      ...creator.avatarUrl ? { image: creator.avatarUrl } : {}
    };
  }
  if (((_a = enriched == null ? void 0 : enriched.presentation.stats) == null ? void 0 : _a.likeCount) !== void 0) {
    jsonLd.interactionStatistic = {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/LikeAction",
      userInteractionCount: enriched.presentation.stats.likeCount
    };
  }
  return jsonLd;
}
function useTravelPlanJsonLd(plan, planId) {
  const jsonLd = reactExports.useMemo(() => {
    if (!plan || !(planId == null ? void 0 : planId.trim())) {
      return null;
    }
    return buildTravelPlanJsonLd(plan, planId.trim());
  }, [plan, planId]);
  useJsonLd("travel-plan", jsonLd);
}
function useTravelPlan(planId) {
  const generatedPlans = useGeneratedPlansStore((state) => state.plans);
  return reactExports.useMemo(() => {
    if (!(planId == null ? void 0 : planId.trim())) {
      return void 0;
    }
    return findTravelPlanById(planId.trim(), generatedPlans);
  }, [generatedPlans, planId]);
}
const TravelPlanRouteMap = reactExports.lazy(
  () => __vitePreload(() => import("./TravelPlanRouteMap-AC5h_0ab.js"), true ? __vite__mapDeps([0,1,2,3,4,5,6,7,8,9]) : void 0)
);
function PlanMapFallback() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "mt-6 flex min-h-56 animate-pulse items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-sm text-slate-500",
      "aria-busy": "true",
      "aria-label": "地图加载中",
      children: "地图加载中…"
    }
  );
}
function TravelPlanDetailPage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const plan = useTravelPlan(planId);
  const pageSeo = reactExports.useMemo(() => {
    if (plan && planId) {
      return travelPlanPageSeo(plan.title, planId, plan.tags[0]);
    }
    return {
      title: `旅行计划 — ${APP_NAME}`,
      path: planId ? `${paths.plans}/${encodeURIComponent(planId)}` : paths.plans
    };
  }, [plan, planId]);
  usePageSeo(pageSeo);
  useTravelPlanJsonLd(plan, planId);
  useShareLandingTracking({ contentKind: "travel_plan", contentId: planId });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MotionPage, { className: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: () => navigate(-1),
        className: "inline-flex min-h-11 items-center gap-1 rounded-lg px-1 text-base font-medium text-brand-600 hover:bg-brand-50 hover:text-brand-700 sm:min-h-0 sm:text-sm",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4", "aria-hidden": true }),
          "返回"
        ]
      }
    ) }),
    !plan && /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-slate-900", children: "未找到该旅行计划" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-600", children: "计划可能已过期，或链接不正确。" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: paths.home,
          className: "mt-4 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700",
          children: "返回首页"
        }
      )
    ] }) }),
    plan && /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("article", { className: "rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6 lg:p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,17.5rem)] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TravelPlanDetailHeader, { plan }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TravelPlanDetailNav, { className: "mt-4 lg:hidden" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm leading-relaxed text-slate-700 lg:text-base", children: plan.summary }),
        getAiProviderDisplay() === "mock" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 rounded-lg border border-amber-200/90 bg-amber-50/90 px-3 py-2 text-xs leading-relaxed text-amber-900", children: [
          "当前为",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-semibold", children: "演示模式" }),
          "生成的行程要点（已针对部分城市如济南优化）。在 `.env.local` 配置",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-white/80 px-1", children: "VITE_DEEPSEEK_API_KEY" }),
          " ",
          "并重新生成，可获得更细的 AI 逐条攻略。"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TravelPlanOverview, { plan }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(PlanMapFallback, {}), children: /* @__PURE__ */ jsxRuntimeExports.jsx(TravelPlanRouteMap, { plan }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TravelPlanItineraryTimeline, { plan, expandFirstActivity: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TravelPlanPracticalInfo, { plan })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "mt-6 min-w-0 lg:mt-0 lg:sticky lg:top-[calc(var(--app-header-offset)+0.75rem)] lg:self-start", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TravelPlanDetailNav, { className: "mt-0 hidden lg:flex" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TravelPlanDetailActions, { plan, className: "mt-4" })
      ] })
    ] }) }) })
  ] });
}
export {
  TravelPlanDetailPage as default
};
