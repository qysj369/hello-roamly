import { j as jsxRuntimeExports, a as reactExports } from "./vendor-react-DtfH6MSw.js";
import { bw as createLucideIcon, dh as http, e$ as useQuery, dl as isChinaPrimaryMarket, bo as copy, ab as PRIMARY_MARKET_CODE, e0 as readEnv, _ as LoaderCircle, bl as cn, aG as Wallet, c4 as getAssetCdnBase, cj as getImageCdnTemplate, d7 as hasAssetCdn, d9 as hasImageCdn, eb as resolvePublicAssetUrl, dU as preferChinaCdn, as as SiteComplianceBar, am as SNAIL_SLANG_GLOSSARY, ah as SNAIL_COMMUNITY, Z as Link, dS as paths, ai as SNAIL_COMMUNITY_CREED, dq as isInviteEnabled, cu as getPendingInviteCode, U as Gift, dI as normalizeInviteCode, da as hasInviteBackend, L as DEMO_CURRENT_USER_ID, du as isSentryEnabled, cR as getSentryDsn, cS as getSentryEnvironment, t as Button, e6 as reportError, cT as getShareStatsSummary, bk as clearShareEvents, dv as isShareAnalyticsEnabled, c1 as formatShareChannel, c0 as formatShareAction, c2 as formatShareContentKind, b_ as formatRelativeZh, aq as Share2, bA as demoGuides, cW as getStoredAccessToken, d6 as hasAccessToken, c5 as getBuildMarket, f1 as useReducedMotion, f5 as useUiStore, dG as motion, at as Sparkles, ci as getHttpErrorMessage, cN as getRecentTravelPlans, eX as usePageSeo, eU as useLocation, n as BRAND_LOGO_TEXT, aj as SNAIL_GLOBAL_COPY, bx as currentUserProfilePath, g as APP_NAME, aK as aboutPageSeo } from "./index-DwV1qlqh.js";
import { M as MotionSection } from "./MotionSection-C-QZ5G8C.js";
import { M as MapPinned } from "./map-pinned-CwnGvlJZ.js";
import { S as SnailSlangTerm } from "./SnailSlangTerm-Dp9sc9n7.js";
import { E as Earth } from "./earth-uhLNJ2d4.js";
import { S as Shield, b as useInviteSummary, a as InviteCodeCardSkeleton, I as InviteCodeCard, r as redeemInviteCode, s as simulateInviteRegistration } from "./useInviteSummary-BqXiTpQp.js";
import { i as isProductionAppMode } from "./appMode-mvxqt0jz.js";
import { c as createPaymentOrderResponseSchema, U as UserPlus, C as CapsuleContextBanner } from "./CapsuleContextBanner-bsCrmr4p.js";
import { T as Trash2 } from "./trash-2-DMzHlprq.js";
import { G as GuideShareControls } from "./GuideShareControls-2sXwf9bT.js";
import { d as moderateUserContent, i as isContentModerationEnabled, h as hasModerationBackend, c as isModerationDemoBlockEnabled, b as isContentModerationStrict } from "./moderate-B_EMCIaW.js";
import { r as resolveMapProvider, e as getMapProviderMode, d as getMapProviderLabel } from "./provider-CMJI8edA.js";
import { a as getActiveCoordinateSystem } from "./coordinates-D-_oeTwy.js";
import "./vendor-three-Blpl5Qyv.js";
import "./check-fuogZiuU.js";
import "./credentials-BlGlDwm4.js";
/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [
  ["path", { d: "M12 20v-9", key: "1qisl0" }],
  ["path", { d: "M14 7a4 4 0 0 1 4 4v3a6 6 0 0 1-12 0v-3a4 4 0 0 1 4-4z", key: "uouzyp" }],
  ["path", { d: "M14.12 3.88 16 2", key: "qol33r" }],
  ["path", { d: "M21 21a4 4 0 0 0-3.81-4", key: "1b0z45" }],
  ["path", { d: "M21 5a4 4 0 0 1-3.55 3.97", key: "5cxbf6" }],
  ["path", { d: "M22 13h-4", key: "1jl80f" }],
  ["path", { d: "M3 21a4 4 0 0 1 3.81-4", key: "1fjd4g" }],
  ["path", { d: "M3 5a4 4 0 0 0 3.55 3.97", key: "1d7oge" }],
  ["path", { d: "M6 13H2", key: "82j7cp" }],
  ["path", { d: "m8 2 1.88 1.88", key: "fmnt4t" }],
  ["path", { d: "M9 7.13V6a3 3 0 1 1 6 0v1.13", key: "1vgav8" }]
];
const Bug = createLucideIcon("bug", __iconNode$4);
/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }],
  ["path", { d: "M18 17V9", key: "2bz60n" }],
  ["path", { d: "M13 17V5", key: "1frdt8" }],
  ["path", { d: "M8 17v-3", key: "17ska0" }]
];
const ChartColumn = createLucideIcon("chart-column", __iconNode$3);
/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "M16.247 7.761a6 6 0 0 1 0 8.478", key: "1fwjs5" }],
  ["path", { d: "M19.075 4.933a10 10 0 0 1 0 14.134", key: "ehdyv1" }],
  ["path", { d: "M4.925 19.067a10 10 0 0 1 0-14.134", key: "1q22gi" }],
  ["path", { d: "M7.753 16.239a6 6 0 0 1 0-8.478", key: "r2q7qm" }],
  ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }]
];
const Radio = createLucideIcon("radio", __iconNode$2);
/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
];
const RefreshCw = createLucideIcon("refresh-cw", __iconNode$1);
/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
];
const ShieldCheck = createLucideIcon("shield-check", __iconNode);
async function fetchGithubZen() {
  const { data } = await http.get("https://api.github.com/zen", {
    headers: { Accept: "text/plain" },
    responseType: "text"
  });
  const text = typeof data === "string" ? data.trim() : "";
  if (!text) {
    throw new Error("GitHub Zen API 返回为空");
  }
  return text;
}
const githubZenQueryKey = ["github", "zen"];
function useGithubZen() {
  return useQuery({
    queryKey: githubZenQueryKey,
    queryFn: fetchGithubZen
  });
}
const CONTENT_MODERATION_SCENES = [
  {
    id: "ai_chat",
    label: "AI 对话",
    description: "用户发给旅行顾问的提问与补充说明"
  },
  {
    id: "site_chat",
    label: "站内私信",
    description: "旅伴匹配与消息列表中的用户消息"
  },
  {
    id: "travel_moment",
    label: "旅行瞬间",
    description: "图文动态标题与正文（发布流程接入）"
  },
  {
    id: "profile_bio",
    label: "个人简介",
    description: "昵称、签名等资料字段"
  },
  {
    id: "comment",
    label: "评论",
    description: "攻略与动态下的评论内容"
  }
];
function getContentSceneLabel(scene) {
  var _a;
  return ((_a = CONTENT_MODERATION_SCENES.find((item) => item.id === scene)) == null ? void 0 : _a.label) ?? scene;
}
function AboutMarketChinaSection() {
  const chinaFirst = isChinaPrimaryMarket();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    MotionSection,
    {
      className: "rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/90 via-white to-white p-6 shadow-sm",
      delay: 0.05,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPinned, { className: "h-5 w-5", "aria-hidden": true }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-semibold text-slate-900", children: copy.about.marketChinaTitle })
          ] }),
          chinaFirst ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800", children: [
            copy.about.marketChinaBadge,
            " · ",
            PRIMARY_MARKET_CODE
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600", children: "GLOBAL" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm leading-relaxed text-slate-600", children: copy.about.marketChinaLead }),
        chinaFirst ? /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-4 space-y-2 border-t border-emerald-100/80 pt-4", children: copy.about.marketChinaBullets.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-2 text-sm leading-relaxed text-slate-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500", "aria-hidden": true }),
          item
        ] }, item)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm leading-relaxed text-slate-600", children: copy.about.marketChinaGlobalNote }),
        chinaFirst && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 rounded-xl border border-emerald-100 bg-white/80 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-slate-800", children: copy.about.marketChinaExpandTitle }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-xs leading-relaxed text-slate-600", children: copy.about.marketChinaExpandBody })
        ] })
      ]
    }
  );
}
function isTruthyFlag(value) {
  if (!value) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}
function isPaymentUiEnabled() {
  return isTruthyFlag(readEnv("VITE_PAYMENT_UI_ENABLED"));
}
function isAlipayChannelEnabled() {
  return isTruthyFlag(readEnv("VITE_PAYMENT_ALIPAY_ENABLED"));
}
function isWechatPayChannelEnabled() {
  return isTruthyFlag(readEnv("VITE_PAYMENT_WECHAT_ENABLED"));
}
function hasPaymentBackend() {
  var _a;
  return Boolean((_a = readEnv("VITE_API_BASE_URL")) == null ? void 0 : _a.trim());
}
const CHANNEL_DEFS = {
  alipay: { label: "支付宝", shortLabel: "支付宝" },
  wechat_pay: { label: "微信支付", shortLabel: "微信" }
};
function channelEnabled(id) {
  if (id === "alipay") {
    return isAlipayChannelEnabled();
  }
  return isWechatPayChannelEnabled();
}
function buildUnavailableReason(id) {
  if (!isChinaPrimaryMarket()) {
    return "当前为全球构建，中国支付渠道默认关闭";
  }
  if (!isPaymentUiEnabled()) {
    return "未开启 VITE_PAYMENT_UI_ENABLED";
  }
  if (!channelEnabled(id)) {
    return id === "alipay" ? "未开启 VITE_PAYMENT_ALIPAY_ENABLED" : "未开启 VITE_PAYMENT_WECHAT_ENABLED";
  }
  if (!hasPaymentBackend()) {
    return "需配置 VITE_API_BASE_URL 与后端商户密钥";
  }
  return "商户签约与回调待接入";
}
function listPaymentChannels() {
  const ids = ["alipay", "wechat_pay"];
  return ids.map((id) => {
    const reserved = isChinaPrimaryMarket();
    const enabled = channelEnabled(id) && isPaymentUiEnabled();
    const backend = hasPaymentBackend();
    const available = reserved && enabled && backend;
    return {
      id,
      ...CHANNEL_DEFS[id],
      reserved,
      available,
      unavailableReason: available ? void 0 : buildUnavailableReason(id)
    };
  });
}
function getPaymentChannelLabel(id) {
  return CHANNEL_DEFS[id].label;
}
class PaymentNotConfiguredError extends Error {
  constructor(channel, detail) {
    super(detail ?? `${getPaymentChannelLabel(channel)} 尚未配置，接口已预留`);
    this.name = "PaymentNotConfiguredError";
  }
}
function openCheckoutUrl(url) {
  window.location.assign(url);
}
function launchAlipay(order) {
  const payload = order.checkoutPayload;
  if ((payload == null ? void 0 : payload.type) !== "alipay") {
    throw new PaymentNotConfiguredError("alipay", order.message);
  }
  if (payload.payUrl) {
    openCheckoutUrl(payload.payUrl);
    return Promise.resolve();
  }
  if (payload.orderString) {
    throw new PaymentNotConfiguredError(
      "alipay",
      "已返回 orderString，需在 App / 小程序容器内调起支付宝 SDK"
    );
  }
  throw new PaymentNotConfiguredError("alipay", order.message);
}
function launchWechatPay(order) {
  const payload = order.checkoutPayload;
  if ((payload == null ? void 0 : payload.type) !== "wechat_pay") {
    throw new PaymentNotConfiguredError("wechat_pay", order.message);
  }
  if (payload.h5Url) {
    openCheckoutUrl(payload.h5Url);
    return Promise.resolve();
  }
  const hasJsapi = payload.appId && payload.timeStamp && payload.nonceStr && payload.package && payload.signType && payload.paySign;
  if (hasJsapi) {
    throw new PaymentNotConfiguredError(
      "wechat_pay",
      "已返回 JSAPI 参数，需在微信内置浏览器中调用 WeixinJSBridge"
    );
  }
  throw new PaymentNotConfiguredError("wechat_pay", order.message);
}
function getPaymentGateway(channel) {
  if (channel === "alipay") {
    return { channel, launchCheckout: launchAlipay };
  }
  return { channel, launchCheckout: launchWechatPay };
}
async function launchPaymentCheckout(order) {
  const gateway = getPaymentGateway(order.channel);
  await gateway.launchCheckout(order);
}
const PAYMENT_API = {
  orders: "/payments/orders"
};
function buildDemoPaymentOrder(input) {
  const label = input.channel === "alipay" ? "支付宝" : "微信支付";
  return {
    id: `demo-pay-${Date.now()}`,
    channel: input.channel,
    amountFen: input.amountFen,
    currency: input.currency ?? "CNY",
    title: input.title,
    status: "pending",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    message: `${label} 接口已预留：请配置 VITE_API_BASE_URL 与后端商户参数后创建真实订单`
  };
}
async function createPaymentOrder(input) {
  if (!hasPaymentBackend()) {
    return buildDemoPaymentOrder(input);
  }
  const body = {
    channel: input.channel,
    amountFen: input.amountFen,
    currency: input.currency ?? "CNY",
    title: input.title,
    description: input.description,
    bizType: input.bizType,
    bizId: input.bizId
  };
  const { data } = await http.post(PAYMENT_API.orders, body);
  const parsed = createPaymentOrderResponseSchema.parse(data);
  return parsed.order;
}
const CHANNEL_STYLE = {
  alipay: "border-sky-200 bg-sky-50 text-sky-900 hover:border-sky-300",
  wechat_pay: "border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-300"
};
function PaymentMethodPicker({
  amountFen,
  title,
  description,
  bizType,
  bizId,
  className,
  allowDemo = true,
  onOrderCreated,
  onError
}) {
  const channels = listPaymentChannels();
  const [loadingChannel, setLoadingChannel] = reactExports.useState(null);
  const [statusMessage, setStatusMessage] = reactExports.useState(null);
  const handlePay = reactExports.useCallback(
    async (channel) => {
      const meta = channels.find((item) => item.id === channel);
      if (!(meta == null ? void 0 : meta.reserved)) {
        return;
      }
      if (!meta.available && !allowDemo) {
        onError == null ? void 0 : onError(meta.unavailableReason ?? "支付暂不可用");
        return;
      }
      setLoadingChannel(channel);
      setStatusMessage(null);
      const input = {
        channel,
        amountFen,
        title,
        description,
        bizType,
        bizId
      };
      try {
        const order = await createPaymentOrder(input);
        if (!meta.available) {
          setStatusMessage(order.message ?? `${getPaymentChannelLabel(channel)} 接口已预留`);
          onOrderCreated == null ? void 0 : onOrderCreated(order.id);
          return;
        }
        await launchPaymentCheckout(order);
        onOrderCreated == null ? void 0 : onOrderCreated(order.id);
      } catch (error) {
        const message = error instanceof PaymentNotConfiguredError ? error.message : error instanceof Error ? error.message : "创建支付单失败";
        setStatusMessage(message);
        onError == null ? void 0 : onError(message);
      } finally {
        setLoadingChannel(null);
      }
    },
    [allowDemo, amountFen, bizId, bizType, channels, description, onError, onOrderCreated, title]
  );
  const amountYuan = (amountFen / 100).toFixed(2);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("space-y-3", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-500", children: [
      "应付金额 ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-slate-800", children: [
        "¥",
        amountYuan
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: channels.map((channel) => {
      const disabled = !channel.reserved || !channel.available && !allowDemo;
      const loading = loadingChannel === channel.id;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          disabled: disabled || loading,
          onClick: () => handlePay(channel.id),
          className: cn(
            "inline-flex min-w-[7.5rem] flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
            CHANNEL_STYLE[channel.id]
          ),
          title: channel.unavailableReason,
          children: [
            loading && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin", "aria-hidden": true }),
            channel.label,
            !channel.available && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-normal opacity-70", children: "预留" })
          ]
        },
        channel.id
      );
    }) }),
    statusMessage && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs leading-relaxed text-amber-800", role: "status", children: statusMessage })
  ] });
}
function AboutPaymentSection() {
  if (!isChinaPrimaryMarket()) {
    return null;
  }
  const channels = listPaymentChannels();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    MotionSection,
    {
      className: "rounded-2xl border border-sky-200/90 bg-gradient-to-br from-sky-50/80 via-white to-white p-6 shadow-sm",
      delay: 0.08,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600/10 text-sky-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-5 w-5", "aria-hidden": true }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-semibold text-slate-900", children: copy.about.paymentTitle }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs text-slate-500", children: copy.about.paymentBadge })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm leading-relaxed text-slate-600", children: copy.about.paymentLead }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 space-y-1.5 text-xs text-slate-600", children: copy.about.paymentBullets.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sky-500", "aria-hidden": true, children: "·" }),
          item
        ] }, item)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 rounded-xl border border-sky-100 bg-white/90 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-slate-800", children: copy.about.paymentDemoTitle }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[11px] text-slate-500", children: copy.about.paymentDemoHint }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            PaymentMethodPicker,
            {
              className: "mt-3",
              amountFen: 1,
              title: "hello-roamly 支付接口验证",
              description: "关于页演示单，不会真实扣款",
              bizType: "about_demo",
              allowDemo: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dl", { className: "mt-4 grid grid-cols-2 gap-2 text-[10px] text-slate-500 sm:grid-cols-2", children: channels.map((channel) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-slate-50 px-2 py-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "font-medium text-slate-700", children: channel.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: channel.available ? "可创建订单" : channel.unavailableReason })
        ] }, channel.id)) })
      ]
    }
  );
}
const DECISION_LABEL = {
  pass: "通过",
  reject: "拒绝",
  review: "待复核"
};
function ContentModerationChecker({
  scene = "ai_chat",
  className,
  placeholder = "输入待检测文本…"
}) {
  const [draft, setDraft] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [result, setResult] = reactExports.useState(null);
  const handleCheck = reactExports.useCallback(async () => {
    const text = draft.trim();
    if (!text) {
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const next = await moderateUserContent({ scene, text });
      setResult(next);
    } catch (error) {
      setResult({
        decision: "reject",
        requestId: `client-error-${Date.now()}`,
        message: error instanceof Error ? error.message : "审核请求失败"
      });
    } finally {
      setLoading(false);
    }
  }, [draft, scene]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("space-y-3", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-slate-500", children: [
      "场景：",
      getContentSceneLabel(scene),
      scene === "ai_chat" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-slate-400", children: "（演示拦截词：违规测试，需 VITE_CONTENT_MODERATION_DEMO_BLOCK=1）" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "moderation-check-text", className: "mb-1 block text-xs font-medium text-slate-600", children: "待检测文本" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "textarea",
      {
        id: "moderation-check-text",
        value: draft,
        onChange: (event) => setDraft(event.target.value),
        rows: 3,
        placeholder,
        className: "w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: handleCheck,
        disabled: loading || !draft.trim(),
        className: "inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50",
        children: [
          loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin", "aria-hidden": true }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4", "aria-hidden": true }),
          "检测内容"
        ]
      }
    ),
    result && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: cn(
          "rounded-lg border px-3 py-2 text-xs",
          result.decision === "pass" && "border-emerald-200 bg-emerald-50 text-emerald-900",
          result.decision === "reject" && "border-rose-200 bg-rose-50 text-rose-900",
          result.decision === "review" && "border-amber-200 bg-amber-50 text-amber-900"
        ),
        role: "status",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: DECISION_LABEL[result.decision] }),
          result.message && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 leading-relaxed", children: result.message }),
          result.labels && result.labels.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-[10px] opacity-80", children: [
            "标签：",
            result.labels.join(", ")
          ] })
        ]
      }
    )
  ] });
}
function AboutContentModerationSection() {
  if (!isChinaPrimaryMarket()) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    MotionSection,
    {
      className: "rounded-2xl border border-violet-200/90 bg-gradient-to-br from-violet-50/80 via-white to-white p-6 shadow-sm",
      delay: 0.1,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/10 text-violet-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-5 w-5", "aria-hidden": true }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-semibold text-slate-900", children: copy.about.moderationTitle }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs text-slate-500", children: copy.about.moderationBadge })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm leading-relaxed text-slate-600", children: copy.about.moderationLead }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 space-y-1.5 text-xs text-slate-600", children: copy.about.moderationBullets.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-violet-500", "aria-hidden": true, children: "·" }),
          item
        ] }, item)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 grid gap-2 sm:grid-cols-2", children: CONTENT_MODERATION_SCENES.map((scene) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-violet-100 bg-white/80 px-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-slate-800", children: scene.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-[10px] leading-relaxed text-slate-500", children: scene.description })
        ] }, scene.id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "mt-4 grid grid-cols-2 gap-2 text-[10px] text-slate-500", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-slate-50 px-2 py-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "font-medium text-slate-700", children: "审核开关" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: isContentModerationEnabled() ? "已开启" : "未开启（默认放行）" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-slate-50 px-2 py-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "font-medium text-slate-700", children: "云审后端" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: hasModerationBackend() ? "已配置 API" : "演示 / 本地预检" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-slate-50 px-2 py-1.5 sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "font-medium text-slate-700", children: "演示拦截" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: isModerationDemoBlockEnabled() ? "已开启 DEMO_BLOCK（含「违规测试」）" : "未开启 VITE_CONTENT_MODERATION_DEMO_BLOCK" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 rounded-xl border border-violet-100 bg-white/90 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-slate-800", children: copy.about.moderationDemoTitle }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ContentModerationChecker, { className: "mt-3", scene: "ai_chat" })
        ] })
      ]
    }
  );
}
function AboutCdnSection() {
  if (!isChinaPrimaryMarket()) {
    return null;
  }
  const assetBase = getAssetCdnBase();
  const imageTemplate = getImageCdnTemplate();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    MotionSection,
    {
      className: "rounded-2xl border border-cyan-200/90 bg-gradient-to-br from-cyan-50/80 via-white to-white p-6 shadow-sm",
      delay: 0.12,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-600/10 text-cyan-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Earth, { className: "h-5 w-5", "aria-hidden": true }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-semibold text-slate-900", children: copy.about.cdnTitle }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs text-slate-500", children: copy.about.cdnBadge })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm leading-relaxed text-slate-600", children: copy.about.cdnLead }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 space-y-1.5 text-xs text-slate-600", children: copy.about.cdnBullets.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cyan-600", "aria-hidden": true, children: "·" }),
          item
        ] }, item)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "mt-4 space-y-2 rounded-xl border border-cyan-100 bg-white/90 p-4 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "font-semibold text-slate-800", children: "静态资源 CDN（VITE_CDN_BASE）" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1 break-all font-mono text-[10px] text-slate-600", children: assetBase ?? "未配置（使用站点同源 /assets）" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-0.5 text-slate-500", children: hasAssetCdn() ? "构建时写入 Vite base，JS/CSS 从 CDN 加载" : "可在 OSS/COS 部署 dist 后填写" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "font-semibold text-slate-800", children: "图片加速（VITE_IMAGE_CDN）" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1 break-all font-mono text-[10px] text-slate-600", children: imageTemplate ?? "未配置（直连 Unsplash 等境外源）" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-0.5 text-slate-500", children: hasImageCdn() ? "封面与 OptimizedImage 经 resolveRemoteImageUrl 代理" : "建议配置阿里云 CDN / 腾讯云 CI / 七牛图片处理" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "font-semibold text-slate-800", children: "示例 public 路径" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1 break-all font-mono text-[10px] text-slate-600", children: resolvePublicAssetUrl("/favicon.svg") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "font-semibold text-slate-800", children: "中国版 CDN 策略" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-0.5 text-slate-500", children: preferChinaCdn() ? "已启用（默认关闭境外 wsrv.nl 演示代理）" : "已关闭 VITE_USE_CHINA_CDN" })
          ] })
        ] })
      ]
    }
  );
}
function AboutContactSection() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    MotionSection,
    {
      id: "contact",
      className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-semibold text-slate-900", children: "联系我们" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm leading-relaxed text-slate-600", children: "如发现违法违规或不良信息，请通过下方邮箱举报。我们将在 24 小时内受理，48 小时内核查处理并反馈。" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SiteComplianceBar, { variant: "about", className: "mt-4" })
      ]
    }
  );
}
const PREVIEW_SLANG_IDS = [
  "slime-trail",
  "snail-insights",
  "shell",
  "pitfall-radar",
  "slow-crawl",
  "trail-master"
];
function AboutSnailCultureSection() {
  const previewEntries = PREVIEW_SLANG_IDS.map(
    (id) => SNAIL_SLANG_GLOSSARY.find((entry) => entry.id === id)
  ).filter((entry) => Boolean(entry));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-6 shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-emerald-700", children: SNAIL_COMMUNITY.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-1 text-base font-bold text-slate-900", children: SNAIL_COMMUNITY.glossaryTitle }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-600", children: SNAIL_COMMUNITY.glossarySubtitle })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: paths.snailCulture,
          className: "inline-flex rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700",
          children: "完整手册"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-slate-900", children: SNAIL_COMMUNITY.creedTitle }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-2 space-y-1.5", children: SNAIL_COMMUNITY_CREED.map((line) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-sm leading-relaxed text-slate-700", children: [
        "· ",
        line
      ] }, line)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("dl", { className: "mt-5 grid gap-2 sm:grid-cols-2", children: previewEntries.map((entry) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-emerald-100 bg-white px-3 py-2.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-bold text-slate-900", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SnailSlangTerm, { entry }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-0.5 text-xs leading-relaxed text-slate-600", children: entry.meaning })
    ] }, entry.id)) })
  ] });
}
function AboutInviteSection() {
  const isProduction = isProductionAppMode();
  const { data: summary, isPending, refetch } = useInviteSummary(DEMO_CURRENT_USER_ID);
  const [inputCode, setInputCode] = reactExports.useState("");
  const [feedback, setFeedback] = reactExports.useState(null);
  const [busy, setBusy] = reactExports.useState(false);
  if (!isInviteEnabled()) {
    return null;
  }
  async function handleRedeem() {
    setBusy(true);
    const result = await redeemInviteCode({ code: inputCode, inviteeUserId: DEMO_CURRENT_USER_ID });
    setBusy(false);
    setFeedback(result.message);
    window.setTimeout(() => setFeedback(null), 4e3);
  }
  async function handleSimulateRegister() {
    setBusy(true);
    const result = await simulateInviteRegistration(DEMO_CURRENT_USER_ID);
    setBusy(false);
    setFeedback(result.message);
    void refetch();
    window.setTimeout(() => setFeedback(null), 4e3);
  }
  const pending = getPendingInviteCode();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { id: "invite", className: "scroll-mt-20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    MotionSection,
    {
      className: "rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/80 via-white to-white p-6 shadow-sm",
      delay: 0.17,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600/10 text-amber-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "h-5 w-5", "aria-hidden": true }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-semibold text-slate-900", children: isProduction ? copy.about.inviteTitlePublic : copy.about.inviteTitle }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs text-slate-500", children: copy.about.inviteBadge })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm leading-relaxed text-slate-600", children: isProduction ? copy.about.inviteLeadPublic : copy.about.inviteLead }),
        !isProduction ? /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 space-y-1.5 text-xs text-slate-600", children: copy.about.inviteBullets.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-600", "aria-hidden": true, children: "·" }),
          item
        ] }, item)) }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 rounded-xl border border-amber-100 bg-white/90 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-slate-800", children: isProduction ? copy.about.invitePanelTitlePublic : copy.about.inviteDemoTitle }),
          isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(InviteCodeCardSkeleton, {}),
          summary && /* @__PURE__ */ jsxRuntimeExports.jsx(InviteCodeCard, { className: "mt-3", summary, compact: true })
        ] }),
        !isProduction ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-xl border border-amber-100 bg-white/90 p-4 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-slate-800", children: "受邀演示" }),
          pending && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-amber-800", children: [
            "当前待绑定邀请码：",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-bold", children: pending })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "about-invite-code", className: "sr-only", children: "邀请码" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                id: "about-invite-code",
                type: "text",
                value: inputCode,
                onChange: (event) => setInputCode(normalizeInviteCode(event.target.value)),
                placeholder: "输入邀请码",
                autoComplete: "off",
                className: "min-w-[8rem] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm uppercase",
                maxLength: 12
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                disabled: busy || !inputCode,
                onClick: () => void handleRedeem(),
                className: "rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50",
                children: "绑定邀请码"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              disabled: busy || !pending,
              onClick: () => void handleSimulateRegister(),
              className: "inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4", "aria-hidden": true }),
                "模拟好友完成注册（演示）"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-slate-500", children: [
            "先访问带 ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-slate-100 px-1", children: "?ref=邀请码" }),
            " 的首页链接，再点模拟注册。",
            hasInviteBackend() ? " 正式环境由服务端发奖。" : " 演示数据存于本机。"
          ] })
        ] }) : null,
        feedback && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-center text-xs text-emerald-700", role: "status", children: feedback })
      ]
    }
  ) });
}
function AboutSentrySection() {
  const enabled = isSentryEnabled();
  const dsnConfigured = Boolean(getSentryDsn());
  const sendTestEvent = () => {
    reportError(new Error("Sentry 连通性测试"), {
      tags: { source: "about-test" },
      extra: { page: "about" }
    });
    window.alert("已发送测试事件，请在 Sentry Issues 中查看（可能有 1–2 分钟延迟）");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    MotionSection,
    {
      className: "rounded-2xl border border-violet-200/90 bg-gradient-to-br from-violet-50/70 via-white to-white p-6 shadow-sm",
      delay: 0.18,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/10 text-violet-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bug, { className: "h-5 w-5", "aria-hidden": true }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-semibold text-slate-900", children: copy.about.sentryTitle }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs text-slate-500", children: copy.about.sentryBadge })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "span",
            {
              className: `inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${enabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "h-3 w-3", "aria-hidden": true }),
                enabled ? "已启用" : dsnConfigured ? "已配置未启用" : "未配置"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm leading-relaxed text-slate-600", children: copy.about.sentryLead }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-4 list-inside list-disc space-y-1 text-xs text-slate-600", children: copy.about.sentryBullets.map((line) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: line }, line)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "mt-4 grid gap-2 rounded-xl border border-slate-200/80 bg-white/80 p-3 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-slate-500", children: "环境" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "font-mono text-slate-800", children: getSentryEnvironment() })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-slate-500", children: "DSN" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "truncate font-mono text-slate-800", children: dsnConfigured ? "已配置" : "未配置" })
          ] })
        ] }),
        enabled && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "secondary", size: "sm", className: "mt-4", onClick: sendTestEvent, children: "发送测试事件" })
      ]
    }
  );
}
function AboutShareAnalyticsSection() {
  const [summary, setSummary] = reactExports.useState(() => getShareStatsSummary());
  const refresh = reactExports.useCallback(() => {
    setSummary(getShareStatsSummary());
  }, []);
  const handleClear = reactExports.useCallback(() => {
    if (!window.confirm("确定清空本机分享统计演示数据？")) {
      return;
    }
    clearShareEvents();
    refresh();
  }, [refresh]);
  if (!isChinaPrimaryMarket() || !isShareAnalyticsEnabled()) {
    return null;
  }
  const channelEntries = Object.entries(summary.byChannel).sort((a, b) => b[1] - a[1]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    MotionSection,
    {
      className: "rounded-2xl border border-sky-200/90 bg-gradient-to-br from-sky-50/80 via-white to-white p-6 shadow-sm",
      delay: 0.16,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600/10 text-sky-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-5 w-5", "aria-hidden": true }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-semibold text-slate-900", children: copy.about.shareStatsTitle }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs text-slate-500", children: copy.about.shareStatsBadge })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: refresh,
                className: "inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-50",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5", "aria-hidden": true }),
                  "刷新"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: handleClear,
                className: "inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5", "aria-hidden": true }),
                  "清空"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm leading-relaxed text-slate-600", children: copy.about.shareStatsLead }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 space-y-1.5 text-xs text-slate-600", children: copy.about.shareStatsBullets.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sky-600", "aria-hidden": true, children: "·" }),
          item
        ] }, item)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4", children: [
          { label: "分享行为", value: summary.shareAttempts },
          { label: "海报保存", value: summary.posterDownloads },
          { label: "链接打开", value: summary.landingViews },
          { label: "事件总数", value: summary.totalEvents }
        ].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "rounded-xl border border-sky-100 bg-white/90 px-3 py-3 text-center",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold tabular-nums text-slate-900", children: item.value }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-[11px] text-slate-500", children: item.label })
            ]
          },
          item.label
        )) }),
        channelEntries.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-xl border border-sky-100 bg-white/90 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-slate-800", children: "按渠道" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-2 flex flex-wrap gap-2", children: channelEntries.map(([channel, count]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "li",
            {
              className: "rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-900",
              children: [
                formatShareChannel(channel),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tabular-nums text-sky-700", children: count })
              ]
            },
            channel
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-xl border border-sky-100 bg-white/90 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-slate-800", children: "最近事件" }),
          summary.recent.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-slate-500", children: "暂无数据。去行程/攻略详情点击「分享」或「分享图」后回来刷新。" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-2 max-h-48 space-y-2 overflow-y-auto text-xs", children: summary.recent.map((event) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "li",
            {
              className: "flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 border-b border-slate-100 pb-2 last:border-0 last:pb-0",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-slate-800", children: [
                  formatShareAction(event.action),
                  " · ",
                  formatShareContentKind(event.contentKind)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-slate-500", children: [
                  formatShareChannel(event.channel),
                  " · ",
                  formatRelativeZh(event.timestamp)
                ] })
              ]
            },
            event.id
          )) })
        ] })
      ]
    }
  );
}
const DEMO_GUIDE = demoGuides[0];
function AboutWechatShareSection() {
  const [showDemo, setShowDemo] = reactExports.useState(false);
  if (!isChinaPrimaryMarket()) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    MotionSection,
    {
      className: "rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/80 via-white to-white p-6 shadow-sm",
      delay: 0.14,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-5 w-5", "aria-hidden": true }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-semibold text-slate-900", children: copy.about.wechatShareTitle }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs text-slate-500", children: copy.about.wechatShareBadge })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm leading-relaxed text-slate-600", children: copy.about.wechatShareLead }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 space-y-1.5 text-xs text-slate-600", children: copy.about.wechatShareBullets.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-emerald-600", "aria-hidden": true, children: "·" }),
          item
        ] }, item)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 rounded-xl border border-emerald-100 bg-white/90 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-slate-800", children: copy.about.wechatShareDemoTitle }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-[11px] text-slate-500", children: [
            "示例攻略：",
            DEMO_GUIDE.city,
            " · ",
            DEMO_GUIDE.title
          ] }),
          !showDemo ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowDemo(true),
              className: "mt-3 text-sm font-semibold text-emerald-700 hover:underline",
              children: "打开分享按钮演示"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(GuideShareControls, { className: "mt-3", guide: DEMO_GUIDE, variant: "primary" })
        ] })
      ]
    }
  );
}
function AuthTokenDevPanel() {
  const [value, setValue] = reactExports.useState("");
  const [saved, setSaved] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setValue(getStoredAccessToken() ?? "");
    setSaved(hasAccessToken());
  }, []);
  {
    return null;
  }
}
function getClientEnvSnapshot() {
  return {
    siteUrl: readEnv("VITE_SITE_URL"),
    market: getBuildMarket(),
    hasMapboxToken: Boolean(readEnv("VITE_MAPBOX_TOKEN")),
    hasAmapKey: Boolean(readEnv("VITE_AMAP_KEY")),
    hasAmapSecurityCode: Boolean(readEnv("VITE_AMAP_SECURITY_CODE")),
    mapProviderMode: getMapProviderMode(),
    activeMapProvider: resolveMapProvider(),
    activeCoordinateSystem: getActiveCoordinateSystem(),
    hasApiBaseUrl: Boolean(readEnv("VITE_API_BASE_URL")),
    hasApiToken: Boolean(readEnv("VITE_API_TOKEN")),
    hasDeepseekKey: Boolean(readEnv("VITE_DEEPSEEK_API_KEY")),
    deepseekModel: readEnv("VITE_DEEPSEEK_MODEL"),
    paymentUiEnabled: isPaymentUiEnabled(),
    paymentAlipayEnabled: isAlipayChannelEnabled(),
    paymentWechatEnabled: isWechatPayChannelEnabled(),
    contentModerationEnabled: isContentModerationEnabled(),
    contentModerationStrict: isContentModerationStrict(),
    contentModerationDemoBlock: isModerationDemoBlockEnabled(),
    hasModerationBackend: hasModerationBackend(),
    assetCdnBase: getAssetCdnBase(),
    imageCdnTemplate: getImageCdnTemplate(),
    hasAssetCdn: hasAssetCdn(),
    hasImageCdn: hasImageCdn(),
    preferChinaCdn: preferChinaCdn()
  };
}
function DevPlayground() {
  const reduceMotion = useReducedMotion();
  const tapCount = useUiStore((state) => state.tapCount);
  const incrementTap = useUiStore((state) => state.incrementTap);
  const env = getClientEnvSnapshot();
  const {
    data: zenQuote,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
    dataUpdatedAt
  } = useGithubZen();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-6 space-y-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-slate-800", children: "开发面板 · 状态演示" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-slate-200 bg-white p-4 shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-slate-800", children: "环境与地图（中国版）" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-slate-600", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-slate-400", children: "市场" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: env.market === "CN" ? "中国版 (CN)" : "全球 (GLOBAL)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-slate-400", children: "地图模式" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: env.mapProviderMode }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-slate-400", children: "当前服务商" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: env.activeMapProvider ? getMapProviderLabel(env.activeMapProvider) : "未配置" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-slate-400", children: "坐标系" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: env.activeCoordinateSystem.toUpperCase() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-slate-400", children: "高德 Key" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: env.hasAmapKey ? "已配置" : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-slate-400", children: "高德安全码" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: env.hasAmapSecurityCode ? "已配置" : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-slate-400", children: "Mapbox" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: env.hasMapboxToken ? "已配置" : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-slate-400", children: "支付 UI" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: env.paymentUiEnabled ? "已开启" : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-slate-400", children: "支付宝" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: env.paymentAlipayEnabled ? "已开启" : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-slate-400", children: "微信支付" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: env.paymentWechatEnabled ? "已开启" : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-slate-400", children: "内容审核" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: env.contentModerationEnabled ? "已开启" : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-slate-400", children: "审核严格" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: env.contentModerationStrict ? "是" : "否" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-slate-400", children: "云审后端" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: env.hasModerationBackend ? "已配置" : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-slate-400", children: "静态 CDN" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: env.hasAssetCdn ? env.assetCdnBase : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-slate-400", children: "图片 CDN" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: env.hasImageCdn ? "已配置" : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-slate-400", children: "中国 CDN 策略" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: env.preferChinaCdn ? "是" : "否" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-slate-200 bg-white p-4 shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-slate-800", children: "Zustand 计数" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.button,
        {
          type: "button",
          onClick: incrementTap,
          whileTap: reduceMotion ? void 0 : { scale: 0.98 },
          className: "mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4", "aria-hidden": true }),
            tapCount
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-slate-200 bg-white p-4 shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-slate-800", children: "React Query + axios" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => refetch(),
            disabled: isFetching,
            className: "inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 disabled:opacity-50",
            children: [
              isFetching ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin", "aria-hidden": true }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3 w-3", "aria-hidden": true }),
              "刷新"
            ]
          }
        )
      ] }),
      isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-slate-500", children: "加载中…" }),
      isError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-red-600", children: getHttpErrorMessage(error) }),
      zenQuote && !isPending && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm italic text-slate-600", children: [
        "「",
        zenQuote,
        "」"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-xs text-slate-400", children: [
        "GitHub Zen · ",
        dataUpdatedAt ? formatRelativeZh(dataUpdatedAt) : "—"
      ] })
    ] })
  ] });
}
getRecentTravelPlans(1)[0];
function UiShowcase() {
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  {
    return null;
  }
}
function AboutPage() {
  var _a;
  usePageSeo(aboutPageSeo(copy.about.pageTitle));
  const isProduction = isProductionAppMode();
  const location = useLocation();
  const authRef = reactExports.useRef(null);
  const showAuthFocus = ((_a = location.state) == null ? void 0 : _a.auth) === "login";
  const capsuleContext = location.state ?? null;
  reactExports.useEffect(() => {
    if (showAuthFocus && authRef.current) {
      authRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showAuthFocus]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    (capsuleContext == null ? void 0 : capsuleContext.destination) || (capsuleContext == null ? void 0 : capsuleContext.aiDream) ? /* @__PURE__ */ jsxRuntimeExports.jsx(MotionSection, { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      CapsuleContextBanner,
      {
        destination: capsuleContext.destination ?? capsuleContext.aiDream,
        dream: capsuleContext.aiDream,
        source: capsuleContext.fromCapsule ? "capsule_one" : capsuleContext.source,
        variant: "about"
      }
    ) }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs(MotionSection, { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-base font-semibold text-slate-900", children: [
          copy.about.heading,
          " · ",
          BRAND_LOGO_TEXT
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: currentUserProfilePath(),
            className: "inline-flex rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700",
            children: SNAIL_GLOBAL_COPY.myDen
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-sm leading-relaxed text-slate-600", children: [
        APP_NAME,
        " ",
        isProduction ? copy.about.introPublic : copy.about.intro
      ] }),
      isProduction ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm text-slate-600", children: copy.about.bulletNavPublic }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "mt-4 list-inside list-disc space-y-1 text-sm text-slate-600", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: copy.about.bulletNav }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: copy.about.bulletMap }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: copy.about.bulletDev })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AboutSnailCultureSection, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AboutContactSection, {}),
    isProduction ? null : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AboutMarketChinaSection, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AboutPaymentSection, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AboutContentModerationSection, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AboutCdnSection, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AboutWechatShareSection, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AboutShareAnalyticsSection, {})
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AboutInviteSection, {}),
    isProduction ? null : /* @__PURE__ */ jsxRuntimeExports.jsx(AboutSentrySection, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "section",
      {
        ref: authRef,
        className: "rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-cyan-50 p-6 shadow-sm",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-semibold text-slate-900", children: copy.about.authTitle }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-600", children: copy.about.authDesc }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-col gap-2 sm:flex-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                disabled: true,
                className: "inline-flex flex-1 items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white opacity-60",
                children: copy.about.phoneLogin
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                disabled: true,
                className: "inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 opacity-60",
                children: copy.about.wechatLogin
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-xs text-slate-500", children: [
            copy.about.guestPrefix,
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: paths.home, className: "mx-1 font-medium text-brand-600 hover:underline", children: copy.about.exploreMap }),
            copy.about.guestMid,
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: paths.guides, className: "mx-1 font-medium text-brand-600 hover:underline", children: copy.about.guidesLink })
          ] })
        ]
      }
    ),
    isProduction ? null : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(UiShowcase, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AuthTokenDevPanel, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DevPlayground, {})
    ] })
  ] });
}
export {
  AboutPage as default
};
