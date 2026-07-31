import { bw as createLucideIcon, dM as object, et as string, dA as literal, dL as number, aJ as _enum, bC as discriminatedUnion, aI as X, E as Compass, Z as Link, dS as paths, a1 as MapPin } from "./index-DwV1qlqh.js";
import { a as reactExports, j as jsxRuntimeExports } from "./vendor-react-DtfH6MSw.js";
/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
  ["line", { x1: "19", x2: "19", y1: "8", y2: "14", key: "1bvyxn" }],
  ["line", { x1: "22", x2: "16", y1: "11", y2: "11", key: "1shjgl" }]
];
const UserPlus = createLucideIcon("user-plus", __iconNode);
const paymentChannelIdSchema = _enum(["alipay", "wechat_pay"]);
const paymentOrderStatusSchema = _enum([
  "pending",
  "paid",
  "failed",
  "closed",
  "cancelled"
]);
const alipayCheckoutPayloadSchema = object({
  type: literal("alipay"),
  orderString: string().optional(),
  payUrl: string().optional()
});
const wechatCheckoutPayloadSchema = object({
  type: literal("wechat_pay"),
  appId: string().optional(),
  timeStamp: string().optional(),
  nonceStr: string().optional(),
  package: string().optional(),
  signType: string().optional(),
  paySign: string().optional(),
  h5Url: string().optional()
});
const paymentCheckoutPayloadSchema = discriminatedUnion("type", [
  alipayCheckoutPayloadSchema,
  wechatCheckoutPayloadSchema
]);
object({
  channel: paymentChannelIdSchema,
  amountFen: number().int().positive(),
  currency: literal("CNY").optional(),
  title: string().min(1).max(128),
  description: string().max(256).optional(),
  bizType: string().max(64).optional(),
  bizId: string().max(128).optional()
});
const paymentOrderSchema = object({
  id: string().min(1),
  channel: paymentChannelIdSchema,
  amountFen: number().int().positive(),
  currency: literal("CNY"),
  title: string(),
  status: paymentOrderStatusSchema,
  createdAt: string(),
  checkoutPayload: paymentCheckoutPayloadSchema.optional(),
  message: string().optional()
});
const createPaymentOrderResponseSchema = object({
  order: paymentOrderSchema
});
function CapsuleContextBanner({
  destination,
  dream,
  source,
  variant = "discover"
}) {
  const [dismissed, setDismissed] = reactExports.useState(false);
  const label = (destination == null ? void 0 : destination.trim()) || (dream == null ? void 0 : dream.trim());
  if (dismissed || !label) {
    return null;
  }
  const fromCapsule = source === "capsule_one";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      className: `relative overflow-hidden rounded-2xl border p-4 shadow-sm ${fromCapsule ? "border-cyan-400/35 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 text-cyan-50" : "border-cyan-400/40 bg-gradient-to-r from-cyan-50 to-violet-50 text-slate-800"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setDismissed(true),
            className: `absolute right-3 top-3 rounded-lg p-1 ${fromCapsule ? "text-cyan-300/60 hover:bg-white/10 hover:text-cyan-100" : "text-slate-400 hover:bg-white/60 hover:text-slate-600"}`,
            "aria-label": "关闭提示",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4", "aria-hidden": true })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "p",
          {
            className: `inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider ${fromCapsule ? "text-cyan-300/80" : "text-cyan-700"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Compass, { className: "h-3.5 w-3.5", "aria-hidden": true }),
              fromCapsule ? "Capsule One 注入" : "AI 规划上下文"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `mt-2 pr-8 text-sm ${fromCapsule ? "text-cyan-50/90" : "text-slate-800"}`, children: variant === "about" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          "你刚从 ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-cyan-300", children: "Capsule One" }),
          " 驾驶舱出发， 正在探索 ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-cyan-300", children: label }),
          " 相关灵感。"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          "已带入目的地",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-medium ${fromCapsule ? "text-cyan-200" : "text-violet-700"}`, children: [
            "「",
            label,
            "」"
          ] }),
          "，下方内容已为你聚焦相关攻略与瞬间。"
        ] }) }),
        dream && destination && dream !== destination ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `mt-1 text-xs ${fromCapsule ? "text-cyan-200/70" : "text-slate-600"}`, children: [
          "旅程构想：",
          dream
        ] }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-2", children: [
          variant !== "discover" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: paths.discover,
              state: { destination: label, fromCapsule },
              className: `inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold ${fromCapsule ? "bg-cyan-500/20 text-cyan-100 ring-1 ring-cyan-400/30 hover:bg-cyan-500/30" : "bg-white text-cyan-800 ring-1 ring-cyan-200 hover:bg-cyan-50"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5", "aria-hidden": true }),
                "去发现页看看"
              ]
            }
          ) : null,
          variant !== "guides" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: paths.guides,
              state: { aiDream: dream ?? label, aiPlan: destination ? { destination, days: 5, budget: "灵活" } : void 0 },
              className: `inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold ${fromCapsule ? "bg-cyan-500/20 text-cyan-100 ring-1 ring-cyan-400/30 hover:bg-cyan-500/30" : "bg-white text-violet-800 ring-1 ring-violet-200 hover:bg-violet-50"}`,
              children: "查看攻略库"
            }
          ) : null,
          fromCapsule ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: paths.home,
              className: "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-cyan-200/80 ring-1 ring-cyan-400/20 hover:bg-white/5",
              children: "返回驾驶舱"
            }
          ) : null
        ] })
      ]
    }
  );
}
export {
  CapsuleContextBanner as C,
  UserPlus as U,
  createPaymentOrderResponseSchema as c
};
