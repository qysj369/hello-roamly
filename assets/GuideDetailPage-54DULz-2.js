import { j as jsxRuntimeExports } from "./vendor-react-DtfH6MSw.js";
import { bw as createLucideIcon, bU as findUserById, ah as SNAIL_COMMUNITY, aD as User, Z as Link, dW as profilePathForUser, bW as formatDateZh, b_ as formatRelativeZh, bl as cn, dS as paths, aF as Users, eY as useParams, eW as useNavigate, d1 as guideDetailPageSeo, eX as usePageSeo, aE as UserFacingErrorAlert, a5 as MotionLink, a1 as MapPin, g as APP_NAME } from "./index-DwV1qlqh.js";
import { S as SLIME_TRAIL_AI_ATTRIBUTION } from "./slimeTrail-CE9U9eJw.js";
import { u as useGuideDetail, e as StructuredGuideViewer } from "./StructuredGuideViewer-CtSg4CrD.js";
import { G as GuideShareControls } from "./GuideShareControls-2sXwf9bT.js";
import { a as MotionPage, M as MotionBlock } from "./MotionPage-Bc8Pg75O.js";
import { u as useShareLandingTracking } from "./useShareLandingTracking-DSPHg4qR.js";
import { A as ArrowLeft } from "./arrow-left-DfGUbiny.js";
import "./vendor-three-Blpl5Qyv.js";
import "./SnailSlangTerm-Dp9sc9n7.js";
import "./check-fuogZiuU.js";
/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }]
];
const Calendar = createLucideIcon("calendar", __iconNode);
function StructuredGuideAuthorMeta({
  authorId,
  publishedAt,
  aiAssisted = false,
  className
}) {
  const author = findUserById(authorId);
  const authorName = (author == null ? void 0 : author.username) ?? SNAIL_COMMUNITY.defaultAuthorName;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "flex flex-col gap-2 rounded-xl border border-slate-200/90 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-slate-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 font-medium", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3.5 w-3.5 text-slate-400", "aria-hidden": true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: profilePathForUser(authorId), className: "hover:text-emerald-700 hover:underline", children: authorName })
          ] }),
          aiAssisted && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-medium text-violet-800", children: SLIME_TRAIL_AI_ATTRIBUTION })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-1.5 text-xs text-slate-500", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3.5 w-3.5 shrink-0", "aria-hidden": true }),
          "发布于 ",
          formatDateZh(publishedAt),
          "（",
          formatRelativeZh(publishedAt),
          "）"
        ] })
      ]
    }
  );
}
function GuideTravelBuddyFab({ destination, className }) {
  const state = { destination };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Link,
    {
      to: paths.travelBuddyNew,
      state,
      className: cn(
        "fixed bottom-20 right-4 z-30 inline-flex items-center gap-2 rounded-full",
        "border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 shadow-lg",
        "hover:bg-emerald-50 sm:bottom-6",
        className
      ),
      "aria-label": `寻找同路蜗友：${destination}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4", "aria-hidden": true }),
        "寻找同路蜗友"
      ]
    }
  );
}
function isStructuredGuideDetail(guide) {
  return guide.kind === "structured" && Boolean(guide.structured);
}
function GuideDetailPage() {
  const { guideId } = useParams();
  const navigate = useNavigate();
  const { data: guide, isPending, isError, error, refetch } = useGuideDetail(guideId);
  const isStructured = guide ? isStructuredGuideDetail(guide) : false;
  const structured = guide == null ? void 0 : guide.structured;
  const pageSeo = guide && guideId ? guideDetailPageSeo(guide.city, guide.title, guideId, {
    budget: guide.budget,
    days: guide.days
  }) : {
    title: `攻略详情 — ${APP_NAME}`,
    path: guideId ? `${paths.guides}/${encodeURIComponent(guideId)}` : paths.guides
  };
  usePageSeo(pageSeo);
  useShareLandingTracking({ contentKind: "guide", contentId: guideId });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MotionPage, { className: "relative flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: () => navigate(-1),
        className: "inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4", "aria-hidden": true }),
          "返回"
        ]
      }
    ) }),
    isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm",
        "aria-busy": "true",
        "aria-label": "加载攻略",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-16 rounded bg-slate-200" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 h-6 w-3/4 rounded bg-slate-200" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 h-4 w-full rounded bg-slate-100" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 h-4 w-2/3 rounded bg-slate-100" })
        ]
      }
    ) }),
    isError && !isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-red-100 bg-red-50/80 p-6 shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        UserFacingErrorAlert,
        {
          error,
          context: "guide",
          onRetry: () => {
            void refetch();
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: paths.guides,
          className: "mt-4 inline-flex w-full justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50",
          children: "返回攻略列表"
        }
      )
    ] }) }),
    guide && !isPending && isStructured && structured && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6", children: [
        guide.authorId && guide.publishedAt && /* @__PURE__ */ jsxRuntimeExports.jsx(
          StructuredGuideAuthorMeta,
          {
            authorId: guide.authorId,
            publishedAt: guide.publishedAt,
            aiAssisted: guide.aiAssisted,
            className: "mb-5"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StructuredGuideViewer, { guide: structured, variant: "default" })
      ] }) }),
      guide.tags.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "flex flex-wrap gap-2 px-1", children: guide.tags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "li",
        {
          className: "rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700",
          children: tag
        },
        tag
      )) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          GuideShareControls,
          {
            guide,
            variant: "primary",
            className: "justify-stretch sm:justify-start"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 sm:flex-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            MotionLink,
            {
              to: paths.home,
              className: "inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4", "aria-hidden": true }),
                "在地图中查看"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: paths.guides,
              className: "inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50",
              children: "更多攻略"
            }
          )
        ] })
      ] }) })
    ] }),
    guide && !isPending && !isStructured && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium uppercase tracking-wide text-brand-600", children: guide.city }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-1 text-xl font-bold leading-snug text-slate-900", children: guide.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "mt-4 grid grid-cols-2 gap-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-slate-50 px-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-xs text-slate-500", children: "预算参考" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-0.5 font-semibold text-slate-900", children: guide.budget })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-slate-50 px-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-xs text-slate-500", children: "行程天数" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-0.5 font-semibold text-slate-900", children: guide.days })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-4 flex flex-wrap gap-2", children: guide.tags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "li",
          {
            className: "rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700",
            children: tag
          },
          tag
        )) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          GuideShareControls,
          {
            guide,
            variant: "primary",
            className: "justify-stretch sm:justify-start"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 sm:flex-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            MotionLink,
            {
              to: paths.home,
              className: "inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4", "aria-hidden": true }),
                "在地图中查看"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: paths.guides,
              className: "inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50",
              children: "更多攻略"
            }
          )
        ] })
      ] }) })
    ] }),
    guide && !isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(GuideTravelBuddyFab, { destination: guide.city || guide.title })
  ] });
}
export {
  GuideDetailPage as default
};
