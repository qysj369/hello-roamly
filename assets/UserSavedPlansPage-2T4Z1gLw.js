import { j as jsxRuntimeExports } from "./vendor-react-DtfH6MSw.js";
import { S as SavedUserPlanListItem } from "./SavedUserPlanListItem-Unfb5qtf.js";
import { a as MotionPage, M as MotionBlock } from "./MotionPage-Bc8Pg75O.js";
import { a as useUserPlans } from "./useUserPlans-BzrRig6S.js";
import { eX as usePageSeo, Z as Link, dS as paths, at as Sparkles, _ as LoaderCircle, a1 as MapPin, g as APP_NAME } from "./index-DwV1qlqh.js";
import { A as ArrowLeft } from "./arrow-left-DfGUbiny.js";
import "./vendor-three-Blpl5Qyv.js";
function UserSavedPlansPage() {
  usePageSeo({
    title: `我的方案 — ${APP_NAME}`,
    path: paths.profilePlans
  });
  const { data, isLoading, error } = useUserPlans();
  const items = (data == null ? void 0 : data.items) ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MotionPage, { className: "mx-auto flex w-full max-w-3xl flex-col gap-4 pb-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to: paths.profile,
        className: "inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4", "aria-hidden": true }),
          "返回蜗居"
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-5 w-5", "aria-hidden": true }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-bold text-slate-900", children: "我的方案" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-600", children: "保存自地图 AI 的穷游方案，含完整追问对话" })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(MotionBlock, { children: [
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-sm text-slate-500", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin", "aria-hidden": true }),
        "加载中…"
      ] }) : null,
      error ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-2xl border border-rose-100 bg-rose-50 px-4 py-8 text-center text-sm text-rose-700", children: "加载失败，请刷新页面重试" }) : null,
      !isLoading && !error && items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-16 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "mx-auto h-8 w-8 text-slate-300", "aria-hidden": true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-slate-600", children: "还没有保存的方案" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: paths.home,
            className: "mt-4 inline-flex rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700",
            children: "去地图生成方案"
          }
        )
      ] }) : null,
      items.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: items.map((plan) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SavedUserPlanListItem, { plan }) }, plan.id)) }) : null
    ] })
  ] });
}
export {
  UserSavedPlansPage as default
};
