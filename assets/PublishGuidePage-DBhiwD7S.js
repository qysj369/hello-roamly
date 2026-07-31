import { j as jsxRuntimeExports, a as reactExports } from "./vendor-react-DtfH6MSw.js";
import { S as SlimeTrailPublisher } from "./SlimeTrailPublisher-K_GzDCcr.js";
import { T as TRAVEL_BUDDY_BRAND } from "./travelBuddy-D507Vifi.js";
import { Z as Link, dS as paths, eW as useNavigate, eU as useLocation, aP as aiSnailGuideToEditorDraft, bv as createEmptyGuidePublishDraft, eX as usePageSeo, d2 as guideDetailPath } from "./index-DwV1qlqh.js";
import { a as MotionPage, M as MotionBlock } from "./MotionPage-Bc8Pg75O.js";
import { a as SLIME_TRAIL_PUBLISHER } from "./slimeTrail-CE9U9eJw.js";
import { A as ArrowLeft } from "./arrow-left-DfGUbiny.js";
import "./StructuredGuideViewer-CtSg4CrD.js";
import "./SnailSlangTerm-Dp9sc9n7.js";
import "./check-fuogZiuU.js";
import "./plus-CkCpxI1f.js";
import "./trash-2-DMzHlprq.js";
import "./circle-check-DVB7QD2m.js";
import "./pencil-BlnFE1Bo.js";
import "./vendor-three-Blpl5Qyv.js";
function PublishTravelBuddyCta() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-violet-200 bg-violet-50/60 p-4 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-slate-900", children: "是否寻找同路旅伴？" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-slate-600", children: [
      "去「",
      TRAVEL_BUDDY_BRAND.name,
      "」发布需求，让蜗友主动联系你"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to: paths.travelBuddyNew,
        className: "mt-3 inline-flex w-full items-center justify-center rounded-xl border border-violet-300 bg-white px-4 py-2.5 text-sm font-semibold text-violet-800 hover:bg-violet-50",
        children: [
          "去 ",
          TRAVEL_BUDDY_BRAND.name,
          " 发布"
        ]
      }
    )
  ] });
}
function PublishGuidePage() {
  var _a;
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state ?? null;
  const [publishedGuideId, setPublishedGuideId] = reactExports.useState(null);
  const initialDraft = reactExports.useMemo(() => {
    if (routeState == null ? void 0 : routeState.editorDraft) {
      return routeState.editorDraft;
    }
    if (routeState == null ? void 0 : routeState.aiGeneratedContent) {
      return aiSnailGuideToEditorDraft(routeState.aiGeneratedContent);
    }
    const days = (routeState == null ? void 0 : routeState.days) ?? 3;
    const draft = createEmptyGuidePublishDraft(days);
    if (routeState == null ? void 0 : routeState.destination) {
      return {
        ...draft,
        destination: routeState.destination,
        title: routeState.destination ? `${routeState.destination} 穷游攻略` : draft.title,
        days: String(routeState.days ?? days)
      };
    }
    return draft;
  }, [routeState]);
  usePageSeo({
    title: `发布攻略 — ${SLIME_TRAIL_PUBLISHER.title}`,
    path: paths.guidesPublish
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MotionPage, { className: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
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
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: paths.aiSnail,
          className: "text-xs font-medium text-emerald-700 hover:underline",
          children: "用 AI蜗牛 生成草稿"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-bold text-slate-900", children: SLIME_TRAIL_PUBLISHER.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-600", children: SLIME_TRAIL_PUBLISHER.subtitle }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-slate-500", children: "按宪法三卡填写：花费清单 · 行程流水账 · 蜗牛启示。支持从 AI 生成结果填入后审阅发布。" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      SlimeTrailPublisher,
      {
        initialDraft,
        aiGeneratedContent: (routeState == null ? void 0 : routeState.aiGeneratedContent) ?? null,
        sourceGuideId: (routeState == null ? void 0 : routeState.sourceGuideId) ?? ((_a = routeState == null ? void 0 : routeState.aiGeneratedContent) == null ? void 0 : _a.id),
        publishedGuideId,
        isPublished: Boolean(publishedGuideId),
        onPublished: (record) => {
          setPublishedGuideId(record.id);
        }
      }
    ) }),
    publishedGuideId && /* @__PURE__ */ jsxRuntimeExports.jsxs(MotionBlock, { className: "flex flex-col gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: guideDetailPath(publishedGuideId),
          className: "inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700",
          children: "查看已发布攻略详情"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(PublishTravelBuddyCta, {})
    ] })
  ] });
}
export {
  PublishGuidePage as default
};
