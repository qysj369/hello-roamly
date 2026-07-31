import { a as reactExports, j as jsxRuntimeExports } from "./vendor-react-DtfH6MSw.js";
import { Z as Link, a1 as MapPin, b$ as formatSavedUserPlanMeta, b_ as formatRelativeZh, bl as cn, eg as savedUserPlanDetailPath } from "./index-DwV1qlqh.js";
import { G as Globe, L as Lock } from "./useUserPlans-BzrRig6S.js";
function SavedUserPlanListItem({ plan, className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Link,
    {
      to: savedUserPlanDetailPath(plan.id),
      className: cn(
        "block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-200 hover:shadow-sm",
        className
      ),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "truncate text-sm font-semibold text-slate-900", children: plan.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 flex items-center gap-1 text-xs text-slate-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5 shrink-0 text-brand-500", "aria-hidden": true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: formatSavedUserPlanMeta(plan) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-[11px] text-slate-500", children: [
            "保存于 ",
            formatRelativeZh(plan.createdAt)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              plan.isPublic ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
            ),
            children: plan.isPublic ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-3 w-3", "aria-hidden": true }),
              "公开"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3 w-3", "aria-hidden": true }),
              "私密"
            ] })
          }
        )
      ] })
    }
  );
}
const SavedUserPlanListItem$1 = reactExports.memo(SavedUserPlanListItem);
export {
  SavedUserPlanListItem$1 as S
};
