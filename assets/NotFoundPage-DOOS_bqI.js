import { j as jsxRuntimeExports } from "./vendor-react-DtfH6MSw.js";
import { eX as usePageSeo, a5 as MotionLink, dS as paths, dK as notFoundPageSeo } from "./index-DwV1qlqh.js";
import { M as MotionSection } from "./MotionSection-C-QZ5G8C.js";
import "./vendor-three-Blpl5Qyv.js";
function NotFoundPage() {
  usePageSeo(notFoundPageSeo());
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MotionSection, { className: "rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-slate-900", children: "页面不存在" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-600", children: "请检查地址，或返回首页继续浏览。" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      MotionLink,
      {
        to: paths.home,
        className: "mt-6 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700",
        children: "返回首页"
      }
    )
  ] });
}
export {
  NotFoundPage as default
};
