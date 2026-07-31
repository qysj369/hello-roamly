import { j as jsxRuntimeExports } from "./vendor-react-DtfH6MSw.js";
import { dl as isChinaPrimaryMarket, bl as cn } from "./index-DwV1qlqh.js";
import { e as getMapProviderMode, j as hasMapboxCredentials, h as hasAmapCredentials } from "./provider-CMJI8edA.js";
function MapServicePlaceholder({ className, compact = false }) {
  const mode = getMapProviderMode();
  const chinaFirst = isChinaPrimaryMarket();
  const showAmap = mode === "auto" || mode === "amap";
  const showMapbox = (mode === "auto" || mode === "mapbox") && (!chinaFirst || mode === "mapbox" || hasMapboxCredentials());
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "flex h-full min-h-48 flex-col items-center justify-center gap-3 rounded-xl bg-slate-100 px-4 py-6 text-center text-sm text-slate-600",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-slate-800", children: "未配置地图服务" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-500", children: [
          "中国版推荐高德；海外或备选可配置 Mapbox。复制",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-white px-1", children: ".env.local.example" }),
          " 为",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-white px-1", children: ".env.local" }),
          " 并填入 Key，保存后",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-medium text-slate-700", children: "重启" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-white px-1", children: "pnpm dev" }),
          "（Vite 仅在启动时读取环境变量）。"
        ] }),
        !compact && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md space-y-3 text-left text-xs", children: [
          showAmap && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-white bg-white/80 p-3 shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-slate-800", children: "高德地图（推荐）" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-slate-500", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "a",
                {
                  className: "text-brand-600 underline",
                  href: "https://console.amap.com/dev/key/app",
                  target: "_blank",
                  rel: "noreferrer",
                  children: "高德开放平台"
                }
              ),
              " ",
              "创建 Web 端 Key + 安全密钥"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "mt-2 overflow-x-auto rounded bg-slate-50 p-2 text-[10px] leading-relaxed text-slate-700", children: `VITE_AMAP_KEY=你的Key
VITE_AMAP_SECURITY_CODE=安全密钥` }),
            hasAmapCredentials() && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-emerald-600", children: "已检测到高德 Key" })
          ] }),
          showMapbox && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-white bg-white/80 p-3 shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-slate-800", children: "Mapbox（备选）" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "mt-2 overflow-x-auto rounded bg-slate-50 p-2 text-[10px] text-slate-700", children: "VITE_MAPBOX_TOKEN=pk.你的token" }),
            hasMapboxCredentials() && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-emerald-600", children: "已检测到 Mapbox Token" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-[10px] text-slate-400", children: "强制指定服务商：VITE_MAP_PROVIDER=amap 或 mapbox" })
        ] })
      ]
    }
  );
}
export {
  MapServicePlaceholder as M
};
