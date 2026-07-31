var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { j as jsxRuntimeExports, a as reactExports } from "./vendor-react-DtfH6MSw.js";
import { bw as createLucideIcon, eG as travelPlanDetailPath, Q as Dialog, Z as Link, A as AI_API, bA as demoGuides, bd as buildTravelPlanPresentation, aw as TRAVEL_INTEREST_OPTIONS, b6 as buildPracticalInfoFromOptions, bc as buildSuitableAudienceFromOptions, P as DeepSeekApiError, ay as TRAVEL_PACE_OPTIONS, eQ as useGeneratedPlansStore, eA as toErrorMessage, f1 as useReducedMotion, bl as cn, j as AnimatePresence, dG as motion, ag as RotateCcw, D as ChevronRight, p as BUDGET_RANGE_LIMITS, av as TRAVEL_DAY_OPTIONS, k as AsyncFeedback, _ as LoaderCircle, at as Sparkles, bg as chatMessagesToTurns, dT as persistUserAiSessionSave, dZ as queryClient, bt as createAdvisorSessionId, ex as syncAdvisorSessionCreate, ey as syncAdvisorSessionUpdate, u as CITY_COORDINATES, eW as useNavigate, ac as PlanSaveDialog, eX as usePageSeo, eU as useLocation, f2 as useSearchParams, dk as isCapsuleAiSession, C as CAPSULE_FONT_URL, bP as fetchUserAiSessionById, de as historyItemsToAdvisorMessages, d5 as handoffStateToChatContext, dR as parseTravelSearchIntent, dS as paths, bi as clearCapsuleAiSession, aN as aiChatPageSeo } from "./index-DwV1qlqh.js";
import { a as TravelPlanDetailHeader, c as TravelPlanOverview, b as TravelPlanItineraryTimeline, d as TravelPlanPracticalInfo, T as TravelPlanDetailActions, e as copyTextToClipboardSync, f as formatTravelPlanItineraryText, s as sharePlainText } from "./TravelPlanPracticalInfo-BmJHJlJH.js";
import { a as AI_CHAT_WELCOME_MESSAGE_ID, b as AiChatMessageBubble, S as SlidersHorizontal, c as useAiTravelParams, u as useAiChat, A as AIChatMessageInput } from "./AiChatMessage-Dy98aHtB.js";
import { a as assertAiServiceReady, g as getAiProvider, c as getAiProviderDisplayLabel, b as getAiProviderDisplay } from "./ai-CeNlrO9U.js";
import { A as ArrowRight } from "./arrow-right-Dgfp7Y9Z.js";
import { i as isProductionAppMode } from "./appMode-mvxqt0jz.js";
import { c as createDeepSeekChatCompletion } from "./chat-D9gp93Tu.js";
import { e as extractCityFromPlanText } from "./geocodeTravelPlan-BXQEsjoj.js";
import { a as MotionPage, M as MotionBlock } from "./MotionPage-Bc8Pg75O.js";
import { u as useUserMapOrigin } from "./useUserMapOrigin-BWlu1g6v.js";
import "./vendor-three-Blpl5Qyv.js";
import "./travelPlanCompanionNavigation-DBWwdSWF.js";
import "./info-DlxnCctM.js";
import "./moderate-B_EMCIaW.js";
import "./credentials-BlGlDwm4.js";
import "./provider-CMJI8edA.js";
import "./amapGeocoderClient-CjYlis2t.js";
import "./knownOriginFallbacks-BTkbXw-0.js";
import "./defaultMapOrigin-DM9zdaEz.js";
import "./coordinates-D-_oeTwy.js";
/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }],
  ["circle", { cx: "19", cy: "12", r: "1", key: "1wjl8i" }],
  ["circle", { cx: "5", cy: "12", r: "1", key: "1pcz8c" }]
];
const Ellipsis = createLucideIcon("ellipsis", __iconNode);
function TravelPlanResultDialog({
  open,
  plan,
  onClose,
  onConfirm,
  confirmLabel = "查看完整行程"
}) {
  if (!plan) {
    return null;
  }
  const detailPath = travelPlanDetailPath(plan.id);
  const dayCount = plan.dailyPlans.length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Dialog,
    {
      open,
      onClose,
      title: "旅行计划已生成",
      description: `${plan.title} · 共 ${dayCount} 天。可上下滑动查看完整行程，或进入详情页看地图。`,
      confirmLabel,
      onConfirm: onConfirm ?? onClose,
      cancelLabel: "关闭",
      className: "max-w-md sm:max-w-2xl",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TravelPlanDetailHeader, { plan, className: "border-b-0 pb-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TravelPlanOverview, { plan, className: "mt-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TravelPlanItineraryTimeline,
          {
            plan,
            className: "mt-2",
            expandAllActivities: true
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TravelPlanPracticalInfo, { plan, className: "mt-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TravelPlanDetailActions, { plan, className: "mt-4", variant: "toolbar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: detailPath,
            onClick: onClose,
            className: "mt-4 flex items-center justify-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700",
            children: [
              "打开详情页（地图 + 完整 ",
              dayCount,
              " 天行程）",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4", "aria-hidden": true })
            ]
          }
        )
      ]
    }
  );
}
class GenerateTravelPlanApiError extends Error {
  constructor(message, options) {
    super(message);
    __publicField(this, "status");
    __publicField(this, "code");
    this.name = "GenerateTravelPlanApiError";
    this.status = options == null ? void 0 : options.status;
    this.code = options == null ? void 0 : options.code;
  }
}
async function fetchTravelPlanFromApi(prompt, options = {}) {
  const body = { prompt, options };
  const response = await fetch(AI_API.generateTravelPlan, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body)
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload && "error" in payload && payload.error ? payload.error : `生成行程失败（HTTP ${response.status}）`;
    throw new GenerateTravelPlanApiError(message, {
      status: response.status,
      code: payload && "code" in payload ? payload.code : void 0
    });
  }
  if (!payload || !("plan" in payload) || !payload.plan) {
    throw new GenerateTravelPlanApiError("API 返回格式无效", { status: response.status });
  }
  return payload.plan;
}
function resolveGuideForPlan(options, prompt) {
  var _a;
  if (options.guideId) {
    const byId = demoGuides.find((g) => g.id === options.guideId);
    if (byId) {
      return byId;
    }
  }
  const destination = (_a = options.destination) == null ? void 0 : _a.trim();
  if (destination) {
    const byCity = demoGuides.find((g) => g.city === destination || destination.includes(g.city));
    if (byCity) {
      return byCity;
    }
  }
  const byPrompt = demoGuides.find((g) => prompt.includes(g.city));
  if (byPrompt) {
    return byPrompt;
  }
  const cityHint = extractCityFromPlanText(prompt) || extractCityFromPlanText(options.destination || "");
  if (cityHint) {
    const byHint = demoGuides.find(
      (g) => g.city === cityHint || g.city === cityHint.replace(/市$/, "")
    );
    if (byHint) {
      return byHint;
    }
  }
  return demoGuides.find((g) => g.id === "hangzhou") ?? demoGuides[0];
}
function assembleTravelPlan(parsed, options, prompt, planId) {
  var _a, _b, _c, _d, _e;
  const guide = resolveGuideForPlan(options, prompt);
  const destination = ((_a = options.destination) == null ? void 0 : _a.trim()) || extractCityFromPlanText(prompt) || extractCityFromPlanText(parsed.title) || ((_e = (_d = (_c = (_b = parsed.dailyPlans[0]) == null ? void 0 : _b.activities.find((a) => a.location)) == null ? void 0 : _c.location) == null ? void 0 : _d.split("·")[0]) == null ? void 0 : _e.trim()) || guide.city;
  const id = planId ?? `plan-${guide.id}-${Date.now()}`;
  return {
    id,
    title: parsed.title,
    summary: parsed.summary,
    dailyPlans: parsed.dailyPlans,
    totalCost: parsed.totalCost,
    tags: parsed.tags.length > 0 ? parsed.tags : guide.tags,
    suitableAudience: parsed.suitableAudience,
    practicalInfo: parsed.practicalInfo,
    presentation: buildTravelPlanPresentation(guide, destination)
  };
}
const CITY_DAY_SEEDS = {
  济南: [
    {
      title: "泉城核心 · 趵突泉与老城",
      activities: [
        {
          time: "09:00",
          description: "趵突泉公园晨游：建议 8:30 前到南门，避开旅行团高峰。重点看趵突泉、李清照纪念堂；园内步行约 2 小时。门票约 ¥40，可现场购票。",
          location: "历下区趵突泉南路 · 趵突泉公园",
          costWeight: 0.35
        },
        {
          time: "12:30",
          description: "芙蓉街 / 宽厚里午餐：步行或公交至泉城路商圈。推荐把子肉、甜沫、油旋；人均 ¥35–50，避开 12:00–13:00 排队高峰。",
          location: "历下区芙蓉街 · 小吃街",
          costWeight: 0.25
        },
        {
          time: "15:00",
          description: "泉城广场 → 黑虎泉一线：免费步行游览，黑虎泉可接泉水（带空瓶）。傍晚可看音乐喷泉（季节开放，以现场公告为准）。",
          location: "历下区泉城路 · 泉城广场",
          costWeight: 0.1
        },
        {
          time: "19:30",
          description: "解放阁夜景 + 环城公园散步：沿护城河步行，灯光夜景适合拍照。晚餐可在附近简餐解决。",
          location: "历下区环城公园 · 解放阁",
          costWeight: 0.3
        }
      ]
    },
    {
      title: "大明湖与老城街巷",
      activities: [
        {
          time: "09:00",
          description: "大明湖免费开放区：从西南门进，沿湖步行至北极阁。可租自行车环湖（约 ¥20/小时）。若想登超然楼需另购联票。",
          location: "历下区大明湖路 · 大明湖景区",
          costWeight: 0.2
        },
        {
          time: "12:30",
          description: "曲水亭街 / 百花洲：老济南胡同拍照，咖啡与小馆集中。午餐可选鲁菜小馆，人均 ¥50 左右。",
          location: "历下区曲水亭街 · 历史街区",
          costWeight: 0.3
        },
        {
          time: "15:00",
          description: "山东省博物馆（免费，需预约）：适合雨天备选，看青铜器和汉代文物。地铁 2 号线「二环东路」站步行约 10 分钟。",
          location: "历下区经十路 · 山东省博物馆",
          costWeight: 0.15
        },
        {
          time: "19:30",
          description: "洪家楼天主教堂夜景或回泉城路商圈：教堂外观免费参观；结束可在恒隆广场周边休息。",
          location: "历城区洪家楼 · 天主教堂",
          costWeight: 0.35
        }
      ]
    },
    {
      title: "千佛山与返程整理",
      activities: [
        {
          time: "09:00",
          description: "千佛山公园：索道或步行上山，俯瞰济南全城。门票约 ¥30，周末建议早到。下山后可在山脚下简餐。",
          location: "历下区经十一路 · 千佛山",
          costWeight: 0.4
        },
        {
          time: "12:30",
          description: "英雄山文化市场 / 周边午餐：可淘旧书与小物件；适合作为离开前的轻松一站。",
          location: "市中区英雄山路 · 文化市场",
          costWeight: 0.25
        },
        {
          time: "15:00",
          description: "采购伴手礼：推荐福胶、平阴玫瑰、把子肉真空装等。可在超市或老字号门店集中购买，控制行李重量。",
          location: "历下区泉城路 · 商业区",
          costWeight: 0.35
        }
      ]
    }
  ],
  银川: [
    {
      title: "银川市区文化探索",
      activities: [
        {
          time: "09:00",
          description: "宁夏博物馆（免费，需预约）：重点看西夏历史与回族文化展，建议 2 小时。地铁 1 号线「人民广场」站步行 8 分钟。",
          location: "金凤区人民广场东街 · 宁夏博物馆",
          costWeight: 0.1
        },
        {
          time: "12:00",
          description: "鼓楼 / 玉皇阁老城午餐：推荐羊肉搓面、烩小吃；人均 ¥30–45，老城步行即可串联。",
          location: "兴庆区解放西街 · 鼓楼商圈",
          costWeight: 0.25
        },
        {
          time: "15:00",
          description: "承天寺塔 + 南门广场：免费外观参观，适合拍照；可顺路逛南薰门老街小店。",
          location: "兴庆区南门广场 · 承天寺塔",
          costWeight: 0.15
        },
        {
          time: "19:00",
          description: "怀远夜市：小吃集中，推荐辣糊糊、烤羊肉串、八宝茶；控制人均 ¥40 左右。",
          location: "西夏区怀远路 · 怀远夜市",
          costWeight: 0.5
        }
      ]
    },
    {
      title: "贺兰山岩画 · 镇北堡影城",
      activities: [
        {
          time: "08:30",
          description: "贺兰山岩画：包车或旅游专线约 1 小时；看史前岩画与贺兰口风光，门票约 ¥70，穿防滑鞋。",
          location: "贺兰县贺兰山 · 贺兰山岩画",
          costWeight: 0.45
        },
        {
          time: "13:30",
          description: "镇北堡西部影城：下午光线适合拍照，《大话西游》取景地；门票约 ¥80，园内简餐人均 ¥40。",
          location: "西夏区镇北堡 · 西部影城",
          costWeight: 0.4
        },
        {
          time: "18:30",
          description: "返回市区晚餐：建议兴庆区新华街周边，早回休息为次日留力。",
          location: "兴庆区新华东街 · 商业区",
          costWeight: 0.15
        }
      ]
    },
    {
      title: "沙湖 / 水洞沟（轻松收尾）",
      activities: [
        {
          time: "09:00",
          description: "水洞沟遗址（可选）：史前遗址 + 藏兵洞，适合对历史感兴趣者；距市区约 40 分钟车程。",
          location: "灵武市 · 水洞沟旅游区",
          costWeight: 0.5
        },
        {
          time: "14:00",
          description: "市区伴手礼：枸杞、八宝茶、羊绒小件；超市或老字号集中采购，注意行李重量。",
          location: "金凤区正源北街 · 商业区",
          costWeight: 0.3
        },
        {
          time: "17:00",
          description: "提前到火车站/机场：银川站地铁可达，机场大巴建议预留 2 小时提前量。",
          location: "银川 · 交通枢纽",
          costWeight: 0.2
        }
      ]
    }
  ]
};
function buildGenericDaySeed(destination, day, interestLabel) {
  const dayHints = [
    `抵达 ${destination}：办理入住，熟悉地铁/公交；傍晚逛最近商圈，确认次日交通。`,
    `核心景点日：上午排 1 个必去景点，下午 1 个街区步行，留 1 小时弹性拍照。`,
    `轻松收尾：补漏打卡、伴手礼、提前查返程车次/航班。`
  ];
  const titles = [
    `${destination} · 抵达与初探`,
    `${destination} · 第 ${day} 天深度游`,
    `${destination} · 返程前整理`
  ];
  return {
    title: titles[Math.min(day - 1, titles.length - 1)] ?? `${destination} · 第 ${day} 天`,
    activities: [
      {
        time: "09:00",
        description: `${dayHints[0]} 可在小红书/高德收藏 2–3 个 POI 再出发。`,
        location: `${destination} · 市区`,
        costWeight: 0.3
      },
      {
        time: "12:30",
        description: `本地午餐：优先选 ${interestLabel} 类小店或夜市，人均控制在预算 1/3 以内。`,
        location: `${destination} · ${interestLabel}`,
        costWeight: 0.25
      },
      {
        time: "15:00",
        description: `${dayHints[1]} 地铁/公交一日票通常比多次打车划算。`,
        location: `${destination} · 核心景区`,
        costWeight: 0.25
      },
      {
        time: "19:30",
        description: `${dayHints[2]} 晚间注意安全，贵重物品随身。`,
        location: `${destination} · 夜景/商圈`,
        costWeight: 0.2
      }
    ]
  };
}
function getCityDaySeed(destination, day, interestLabel) {
  const profile = CITY_DAY_SEEDS[destination.trim()];
  if (profile == null ? void 0 : profile[day - 1]) {
    return profile[day - 1];
  }
  if (profile == null ? void 0 : profile.length) {
    return profile[(day - 1) % profile.length];
  }
  return buildGenericDaySeed(destination, day, interestLabel);
}
function seedsToActivities(seeds, perDayBudget) {
  const totalWeight = seeds.reduce((sum, seed) => sum + seed.costWeight, 0) || 1;
  return seeds.map((seed) => ({
    time: seed.time,
    description: seed.description,
    location: seed.location,
    cost: Math.round(perDayBudget * (seed.costWeight / totalWeight) * 10) / 10
  }));
}
const DEFAULT_TRAVEL_OPTIONS_BUDGET = {
  min: 1500,
  max: 3500
};
const DEFAULT_TRAVEL_OPTIONS = {
  days: 3,
  interests: ["food", "culture"],
  pace: "balanced"
};
function resolveTravelOptionsBudget(options) {
  if (options.budget) {
    return options.budget;
  }
  return DEFAULT_TRAVEL_OPTIONS_BUDGET;
}
function activitiesPerDay(pace) {
  if (pace === "intense") {
    return 4;
  }
  if (pace === "relaxed") {
    return 3;
  }
  return 4;
}
function buildMockDailyPlans(destination, options) {
  var _a;
  const days = options.days ?? DEFAULT_TRAVEL_OPTIONS.days;
  const pace = options.pace ?? DEFAULT_TRAVEL_OPTIONS.pace;
  const { min, max } = resolveTravelOptionsBudget(options);
  const totalCost = Math.round((min + max) / 2);
  const perDayBudget = Math.round(totalCost / days);
  const maxSlots = activitiesPerDay(pace);
  const interestLabel = ((_a = options.interests) == null ? void 0 : _a.map((id) => {
    var _a2;
    return (_a2 = TRAVEL_INTEREST_OPTIONS.find((o) => o.id === id)) == null ? void 0 : _a2.label;
  }).filter(Boolean)[0]) ?? "美食";
  const dailyPlans = Array.from({ length: days }, (_, index) => {
    const day = index + 1;
    const daySeed = getCityDaySeed(destination, day, interestLabel);
    const activities = seedsToActivities(daySeed.activities.slice(0, maxSlots), perDayBudget);
    return {
      day,
      title: daySeed.title,
      activities
    };
  });
  return { dailyPlans, totalCost };
}
function generateMockTravelPlan(prompt, options) {
  var _a;
  const guide = resolveGuideForPlan(options, prompt);
  const destination = ((_a = options.destination) == null ? void 0 : _a.trim()) || guide.city;
  const days = options.days ?? DEFAULT_TRAVEL_OPTIONS.days;
  const { dailyPlans, totalCost } = buildMockDailyPlans(destination, options);
  const summary = `基于「${prompt.slice(0, 48)}${prompt.length > 48 ? "…" : ""}」生成的${destination}${days}天穷游方案，总预算约 ¥${totalCost}。`;
  return assembleTravelPlan(
    {
      title: `AI · ${destination}${days}天穷游方案`,
      summary,
      dailyPlans,
      totalCost,
      tags: guide.tags,
      suitableAudience: buildSuitableAudienceFromOptions(options),
      practicalInfo: buildPracticalInfoFromOptions(guide.id, options)
    },
    options,
    prompt
  );
}
function parseTipList(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item) => typeof item === "string" && item.trim().length > 0).map((item) => item.trim());
}
function parseTravelPlanPracticalInfo(value) {
  if (!value || typeof value !== "object") {
    return void 0;
  }
  const record = value;
  const accommodationTips = parseTipList(
    record.accommodationTips ?? record.accommodation ?? record.stay
  );
  const transportationTips = parseTipList(
    record.transportationTips ?? record.transportation ?? record.traffic
  );
  const precautions = parseTipList(record.precautions ?? record.notes ?? record.cautions);
  if (accommodationTips.length === 0 && transportationTips.length === 0 && precautions.length === 0) {
    return void 0;
  }
  return {
    accommodationTips,
    transportationTips,
    precautions
  };
}
function extractJsonString(raw) {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch == null ? void 0 : fenceMatch[1]) {
    return fenceMatch[1].trim();
  }
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }
  return trimmed;
}
function normalizeJsonLikeString(raw) {
  return raw.replace(/[\u201c\u201d]/g, '"').replace(/[\u2018\u2019]/g, "'").replace(/^\s*\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/,\s*([}\]])/g, "$1").trim();
}
function closeTruncatedJson(raw) {
  let base = raw.trim().replace(/,\s*$/, "");
  base = base.replace(/,\s*"[^"\\]*(?:\\.[^"\\]*)*"\s*:\s*("([^"\\]*(?:\\.[^"\\]*)*)?)?$/, "");
  base = base.replace(/:\s*"[^"\\]*(?:\\.[^"\\]*)*$/, ': ""');
  const closers = [];
  let inString = false;
  let escaped = false;
  for (let index = 0; index < base.length; index += 1) {
    const ch = base[index] ?? "";
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{") {
      closers.push("}");
      continue;
    }
    if (ch === "[") {
      closers.push("]");
      continue;
    }
    if (ch === "}" || ch === "]") {
      closers.pop();
    }
  }
  if (inString) {
    base += '"';
  }
  let closed = base;
  while (closers.length > 0) {
    closed += closers.pop() ?? "";
  }
  try {
    JSON.parse(closed);
    return closed;
  } catch {
    return null;
  }
}
function parseJsonFromAiResponse(raw) {
  const candidates = [
    raw.trim(),
    extractJsonString(raw),
    normalizeJsonLikeString(extractJsonString(raw))
  ];
  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }
    try {
      return JSON.parse(candidate);
    } catch {
    }
  }
  const repaired = closeTruncatedJson(normalizeJsonLikeString(extractJsonString(raw)));
  if (repaired) {
    return JSON.parse(repaired);
  }
  throw new Error("invalid json");
}
function parseCoordinates(record) {
  const lng = record.longitude ?? record.lng;
  const lat = record.latitude ?? record.lat;
  if (typeof lng === "number" && typeof lat === "number" && Number.isFinite(lng) && Number.isFinite(lat)) {
    return { longitude: lng, latitude: lat };
  }
  return null;
}
function parseActivityCoordinates(value) {
  if (!value) {
    return null;
  }
  if (Array.isArray(value) && value.length >= 2) {
    const longitude = Number(value[0]);
    const latitude = Number(value[1]);
    if (Number.isFinite(longitude) && Number.isFinite(latitude)) {
      return { longitude, latitude };
    }
    return null;
  }
  if (typeof value === "object") {
    return parseCoordinates(value);
  }
  return null;
}
function parseActivity(value) {
  if (!value || typeof value !== "object") {
    return null;
  }
  const record = value;
  const time = typeof record.time === "string" ? record.time.trim() : "";
  const description = typeof record.description === "string" ? record.description.trim() : "";
  if (!time || !description) {
    return null;
  }
  const activity = { time, description };
  if (typeof record.location === "string" && record.location.trim()) {
    activity.location = record.location.trim();
  }
  if (typeof record.cost === "number" && Number.isFinite(record.cost)) {
    activity.cost = record.cost;
  }
  const coordinates = parseActivityCoordinates(record.coordinates ?? record.coords);
  if (coordinates) {
    activity.coordinates = coordinates;
  }
  return activity;
}
function parseDailyPlan(value) {
  if (!value || typeof value !== "object") {
    return null;
  }
  const record = value;
  const day = typeof record.day === "number" ? record.day : Number(record.day);
  const title = typeof record.title === "string" ? record.title.trim() : "";
  if (!Number.isFinite(day) || day < 1 || !title) {
    return null;
  }
  if (!Array.isArray(record.activities)) {
    return null;
  }
  const activities = record.activities.map(parseActivity).filter((item) => item !== null);
  if (activities.length === 0) {
    return null;
  }
  return { day, title, activities };
}
function parseStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item) => typeof item === "string" && item.trim().length > 0);
}
function sumActivityCosts(dailyPlans) {
  return dailyPlans.reduce(
    (sum, day) => sum + day.activities.reduce((daySum, act) => daySum + (act.cost ?? 0), 0),
    0
  );
}
function parseTravelPlanFromAiResponse(raw) {
  let parsed;
  try {
    parsed = parseJsonFromAiResponse(raw);
  } catch {
    throw new DeepSeekApiError("AI 返回的计划数据不是合法 JSON");
  }
  if (!parsed || typeof parsed !== "object") {
    throw new DeepSeekApiError("AI 返回的计划数据格式无效");
  }
  const record = parsed;
  const title = typeof record.title === "string" ? record.title.trim() : "";
  const summary = typeof record.summary === "string" ? record.summary.trim() : "";
  if (!title || !summary) {
    throw new DeepSeekApiError("AI 返回的计划缺少 title 或 summary");
  }
  if (!Array.isArray(record.dailyPlans)) {
    throw new DeepSeekApiError("AI 返回的计划缺少 dailyPlans");
  }
  const dailyPlans = record.dailyPlans.map(parseDailyPlan).filter((item) => item !== null);
  if (dailyPlans.length === 0) {
    throw new DeepSeekApiError("AI 返回的 dailyPlans 无效或为空");
  }
  const tags = parseStringArray(record.tags);
  const suitableAudience = typeof record.suitableAudience === "string" && record.suitableAudience.trim() ? record.suitableAudience.trim() : void 0;
  let totalCost = typeof record.totalCost === "number" && Number.isFinite(record.totalCost) ? Math.round(record.totalCost) : sumActivityCosts(dailyPlans);
  if (totalCost <= 0) {
    totalCost = sumActivityCosts(dailyPlans) || 1500;
  }
  const practicalInfo = parseTravelPlanPracticalInfo(record.practicalInfo);
  return {
    title,
    summary,
    dailyPlans,
    totalCost,
    tags: tags.length > 0 ? tags : ["穷游", "AI"],
    suitableAudience,
    practicalInfo
  };
}
const JSON_SCHEMA_HINT = `请只输出一个 JSON 对象（不要 Markdown 代码块），字段如下：
{
  "title": "string，计划标题",
  "summary": "string，1–3 句整体概述",
  "dailyPlans": [
    {
      "day": 1,
      "title": "string，当天主题",
      "activities": [
        {
          "time": "09:00",
          "description": "string，活动内容（20–40字）",
          "location": "string，可选具体地点",
          "cost": 0
        }
      ]
    }
  ],
  "totalCost": 1500,
  "tags": ["string", "2–3 个标签"],
  "suitableAudience": "string，如 穷游党、周末出行",
  "practicalInfo": {
    "accommodationTips": ["string，2 条住宿建议"],
    "transportationTips": ["string，2 条交通提示"],
    "precautions": ["string，2 条注意事项"]
  }
}`;
function buildTravelPlanSystemPrompt() {
  return `你是蜗牛旅行的旅行规划引擎，根据用户需求生成穷游向的行程 JSON。
要求：
- 预算敏感、每日 activities 时间合理（09:00–21:00）、totalCost 与各项 cost 大致匹配
- 每一天 3 个 activities 即可，description 简洁具体（怎么去、玩什么、花多少钱）
- location 写真实 POI 或街区名，便于地图标注
- practicalInfo 每类 2 条，可执行即可
- 优先输出完整 JSON，控制篇幅，避免冗长
${JSON_SCHEMA_HINT}`;
}
function buildTravelPlanUserPrompt(prompt, options) {
  var _a, _b;
  const lines = [`用户需求：${prompt.trim()}`];
  if ((_a = options.destination) == null ? void 0 : _a.trim()) {
    lines.push(`指定目的地：${options.destination.trim()}`);
  }
  const days = options.days ?? DEFAULT_TRAVEL_OPTIONS.days;
  const { min, max } = resolveTravelOptionsBudget(options);
  const interests = options.interests ?? DEFAULT_TRAVEL_OPTIONS.interests;
  const pace = options.pace ?? DEFAULT_TRAVEL_OPTIONS.pace;
  lines.push(`天数：${days} 天（dailyPlans 需包含 ${days} 天）`);
  lines.push(`预算范围：¥${min}–${max}（totalCost 落在此区间附近）`);
  const interestLabels = interests.map((id) => {
    var _a2;
    return (_a2 = TRAVEL_INTEREST_OPTIONS.find((o) => o.id === id)) == null ? void 0 : _a2.label;
  }).filter(Boolean);
  if (interestLabels.length > 0) {
    lines.push(`兴趣：${interestLabels.join("、")}`);
  }
  const paceLabel = (_b = TRAVEL_PACE_OPTIONS.find((o) => o.id === pace)) == null ? void 0 : _b.label;
  if (paceLabel) {
    lines.push(`节奏：${paceLabel}`);
  }
  return lines.join("\n");
}
function resolveTravelPlanMaxTokens(days) {
  const safeDays = Math.max(1, Math.min(Math.round(days) || 3, 14));
  return Math.min(2800, 420 + safeDays * 300);
}
function estimateTravelPlanSeconds(days) {
  const safeDays = Math.max(1, Math.min(Math.round(days) || 3, 14));
  return Math.min(55, 10 + safeDays * 7);
}
async function runTravelPlanGeneration(prompt, options, completer) {
  const trimmedPrompt = prompt.trim();
  const days = options.days ?? DEFAULT_TRAVEL_OPTIONS.days;
  const raw = await completer({
    messages: [
      { role: "system", content: buildTravelPlanSystemPrompt() },
      { role: "user", content: buildTravelPlanUserPrompt(trimmedPrompt, options) }
    ],
    temperature: 0.45,
    maxTokens: resolveTravelPlanMaxTokens(days),
    jsonMode: true
  });
  const parsed = parseTravelPlanFromAiResponse(raw);
  return assembleTravelPlan(parsed, options, trimmedPrompt);
}
async function generateViaClientFallback(prompt, options) {
  if (isProductionAppMode()) {
    assertAiServiceReady();
  } else if (getAiProvider() === "mock") {
    return generateMockTravelPlan(prompt, options);
  }
  return runTravelPlanGeneration(prompt, options, createDeepSeekChatCompletion);
}
async function generateTravelPlan(prompt, options = {}) {
  const trimmedPrompt = prompt.trim();
  if (!trimmedPrompt) {
    throw new Error("请提供旅行需求描述");
  }
  try {
    return await fetchTravelPlanFromApi(trimmedPrompt, options);
  } catch (error) {
    const shouldFallback = error instanceof GenerateTravelPlanApiError && (error.status === 403 || error.status === 404 || error.status === 502 || error.status === 503);
    if (!shouldFallback && error instanceof GenerateTravelPlanApiError && error.status && error.status < 500) {
      throw error;
    }
    return generateViaClientFallback(trimmedPrompt, options);
  }
}
function useGenerateTravelPlan() {
  const addPlan = useGeneratedPlansStore((state) => state.addPlan);
  const [status, setStatus] = reactExports.useState("idle");
  const [error, setError] = reactExports.useState(null);
  const [lastPlan, setLastPlan] = reactExports.useState(null);
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const requestIdRef = reactExports.useRef(0);
  const lastRequestRef = reactExports.useRef(null);
  const isGenerating = status === "loading";
  const generate = reactExports.useCallback(async (prompt, options = {}, cfg = {}) => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setStatus("error");
      setError("请填写旅行需求或目的地");
      return null;
    }
    lastRequestRef.current = { prompt: trimmedPrompt, options };
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setStatus("loading");
    setError(null);
    try {
      const plan = await generateTravelPlan(trimmedPrompt, options);
      if (requestIdRef.current !== requestId) {
        return null;
      }
      addPlan(plan);
      setLastPlan(plan);
      if (cfg.openDialog !== false) {
        setDialogOpen(true);
      }
      setStatus("success");
      return plan;
    } catch (err) {
      if (requestIdRef.current !== requestId) {
        return null;
      }
      setStatus("error");
      setError(toErrorMessage(err, "生成计划失败，请稍后再试"));
      return null;
    }
  }, [addPlan]);
  const retry = reactExports.useCallback(async () => {
    const last = lastRequestRef.current;
    if (!last) {
      setError("没有可重试的请求");
      return null;
    }
    return generate(last.prompt, last.options);
  }, [generate]);
  const cancel = reactExports.useCallback(() => {
    requestIdRef.current += 1;
    setStatus("idle");
    setError(null);
  }, []);
  const closeDialog = reactExports.useCallback(() => {
    setDialogOpen(false);
  }, []);
  const clearError = reactExports.useCallback(() => {
    setError(null);
    if (status === "error") {
      setStatus("idle");
    }
  }, [status]);
  const reset = reactExports.useCallback(() => {
    requestIdRef.current += 1;
    setStatus("idle");
    setError(null);
    setLastPlan(null);
    setDialogOpen(false);
    lastRequestRef.current = null;
  }, []);
  return {
    generate,
    retry,
    cancel,
    reset,
    status,
    isGenerating,
    error,
    lastPlan,
    dialogOpen,
    closeDialog,
    clearError
  };
}
function mapAiTravelParamsToOptions(params, overrides = {}) {
  return {
    destination: overrides.destination,
    days: params.days,
    budget: { min: params.budgetMin, max: params.budgetMax },
    interests: [...params.interests],
    pace: params.pace,
    guideId: overrides.guideId
  };
}
function buildTravelPlanPromptFromParams(params, destination) {
  var _a;
  const dest = (destination == null ? void 0 : destination.trim()) || "未指定目的地";
  const interestLabels = params.interests.map((id) => {
    var _a2;
    return (_a2 = TRAVEL_INTEREST_OPTIONS.find((o) => o.id === id)) == null ? void 0 : _a2.label;
  }).filter(Boolean).join("、");
  const paceLabel = ((_a = TRAVEL_PACE_OPTIONS.find((o) => o.id === params.pace)) == null ? void 0 : _a.label) ?? "适中";
  return `请为${dest}规划${params.days}天穷游行程，预算约¥${params.budgetMin}–${params.budgetMax}，节奏${paceLabel}，偏好${interestLabels || "美食与文化"}。`;
}
function AdvisorShareCopyDialog({
  open,
  text,
  onClose
}) {
  const textareaRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!open) {
      return void 0;
    }
    const timer = window.setTimeout(() => {
      const node = textareaRef.current;
      if (!node) {
        return;
      }
      node.focus();
      node.select();
      node.setSelectionRange(0, node.value.length);
      copyTextToClipboardSync(node.value);
    }, 60);
    return () => {
      window.clearTimeout(timer);
    };
  }, [open, text]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Dialog,
    {
      open,
      onClose,
      title: "复制分享内容",
      description: "内容已选中。点「再试复制」，或长按/ Ctrl+A 全选后复制到微信。",
      confirmLabel: "再试复制",
      onConfirm: () => {
        const node = textareaRef.current;
        if (node) {
          node.focus();
          node.select();
          copyTextToClipboardSync(node.value);
        }
      },
      cancelLabel: "关闭",
      className: "sm:max-w-lg",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          ref: textareaRef,
          readOnly: true,
          value: text,
          className: "mt-3 min-h-[12rem] w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-relaxed text-slate-800",
          onFocus: (event) => event.currentTarget.select()
        }
      )
    }
  );
}
function AIChatMessageStream({
  variant = "default",
  scrollRef,
  messages,
  isLoading,
  isStreaming = false,
  isSessionRestoring = false,
  selectedMessageId,
  registerMessageRef,
  onUseExamplePrompt,
  messageActionProps
}) {
  var _a;
  const reduceMotion = useReducedMotion();
  const lastMessage = messages.at(-1);
  const lastActionableAssistantId = (_a = [...messages].reverse().find(
    (message) => message.role === "assistant" && message.id !== AI_CHAT_WELCOME_MESSAGE_ID && message.status !== "streaming" && message.content.trim()
  )) == null ? void 0 : _a.id;
  const showThinkingDots = isLoading && !isStreaming && !((lastMessage == null ? void 0 : lastMessage.status) === "streaming" && lastMessage.content);
  const showEmptyHint = messages.length === 0 && !isLoading && !isSessionRestoring;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref: scrollRef,
      className: "min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-4 [-webkit-overflow-scrolling:touch]",
      role: "log",
      "aria-live": "polite",
      "aria-relevant": "additions",
      children: [
        isSessionRestoring ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: cn(
              "flex min-h-[12rem] flex-col items-center justify-center gap-3 px-4 py-8 text-center",
              variant === "capsule" && "capsule-ai-empty"
            ),
            role: "status",
            "aria-label": "正在恢复会话",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex gap-1", "aria-hidden": true, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 animate-bounce rounded-full bg-brand-400 [animation-delay:0ms]" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 animate-bounce rounded-full bg-brand-400 [animation-delay:120ms]" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 animate-bounce rounded-full bg-brand-400 [animation-delay:240ms]" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500", children: "正在恢复会话…" })
            ]
          }
        ) : null,
        showEmptyHint ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: cn(
              "flex min-h-[12rem] flex-col items-center justify-center px-4 py-8 text-center",
              variant === "capsule" && "capsule-ai-empty"
            ),
            children: variant === "capsule" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "capsule-ai-empty__glyph", "aria-hidden": true, children: "◉" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm font-medium text-slate-800", children: "Capsule 链路已建立" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: "注入时间、心情、预算，我来构建路线" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl", "aria-hidden": true, children: "🐌" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm font-medium text-slate-800", children: "想问什么，直接在下面输入" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: "例如：济南 3 天 1500 · 银川 周末穷游" })
            ] })
          }
        ) : null,
        messages.filter((message) => !message.hidden).map((message) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            ref: (node) => registerMessageRef(message.id, node),
            className: cn(
              "scroll-mt-3 rounded-xl transition-shadow",
              selectedMessageId === message.id && "ring-2 ring-brand-400/40 ring-offset-2"
            ),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              AiChatMessageBubble,
              {
                message,
                onUseExamplePrompt,
                showActions: Boolean(messageActionProps && message.id === lastActionableAssistantId),
                actionProps: messageActionProps
              }
            )
          },
          message.id
        )),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showThinkingDots && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            className: "flex items-center gap-2 pl-10 text-xs text-slate-500",
            initial: reduceMotion ? false : { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex gap-1", "aria-hidden": true, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400 [animation-delay:0ms]" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400 [animation-delay:120ms]" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400 [animation-delay:240ms]" })
              ] }),
              "AI 正在思考…"
            ]
          }
        ) })
      ]
    }
  );
}
function shortenOriginLabel(label) {
  const trimmed = label.trim();
  if (trimmed.length <= 18) {
    return trimmed;
  }
  return `${trimmed.slice(0, 16)}…`;
}
function AIChatToolbar({
  variant = "default",
  provider,
  onToggleParams,
  onReset,
  isBusy,
  originLabel
}) {
  const [menuOpen, setMenuOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "flex items-center justify-between gap-2 border-b border-slate-200/80 bg-white px-3 py-2.5 sm:px-4",
        variant === "capsule" && "capsule-ai-toolbar"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-slate-900", children: variant === "capsule" ? "Capsule 链路" : "旅行顾问" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-slate-400", children: variant === "capsule" ? "信号已注入 · 继续描述偏好与节奏" : (originLabel == null ? void 0 : originLabel.trim()) ? `从 ${shortenOriginLabel(originLabel)} 出发 · 直接输入问题` : "直接输入问题，或点下方示例" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex shrink-0 items-center gap-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setMenuOpen((open) => !open),
              className: "inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100",
              "aria-label": "更多操作",
              "aria-expanded": menuOpen,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "h-4 w-4", "aria-hidden": true })
            }
          ),
          menuOpen ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                className: "fixed inset-0 z-10 cursor-default",
                "aria-label": "关闭菜单",
                onClick: () => setMenuOpen(false)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-0 top-full z-20 mt-1 min-w-[8.5rem] rounded-lg border border-slate-200 bg-white py-1 shadow-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    onToggleParams();
                    setMenuOpen(false);
                  },
                  className: "block w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50",
                  children: "旅行参数"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    onReset();
                    setMenuOpen(false);
                  },
                  disabled: isBusy,
                  className: "flex w-full items-center gap-1.5 px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-3 w-3", "aria-hidden": true }),
                    "新对话"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    setMenuOpen(false);
                    const url = new URL(window.location.href);
                    url.searchParams.set("_", String(Date.now()));
                    url.searchParams.delete("session");
                    window.location.replace(url.toString());
                  },
                  className: "block w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50",
                  children: "刷新页面"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "border-t border-slate-100 px-3 py-1.5 text-[10px] text-slate-400", children: getAiProviderDisplayLabel(provider) })
            ] })
          ] }) : null
        ] }) })
      ]
    }
  );
}
function formatBudget(value) {
  if (value >= 1e4) {
    return `¥${(value / 1e4).toFixed(value % 1e4 === 0 ? 0 : 1)}万`;
  }
  return `¥${value.toLocaleString("zh-CN")}`;
}
function AIChatTravelParamsPanel({
  params,
  isOpen,
  onToggle,
  onBudgetMinChange,
  onBudgetMaxChange,
  onDaysChange,
  onPaceChange,
  onToggleInterest,
  onReset,
  onGeneratePlan,
  isGeneratingPlan = false,
  isChatLoading = false,
  planError,
  onDismissPlanError,
  onRetryPlan,
  className
}) {
  const panelBusy = isGeneratingPlan || isChatLoading;
  const reduceMotion = useReducedMotion();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("relative flex shrink-0", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: onToggle,
        className: cn(
          "absolute -left-3 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-brand-200 hover:text-brand-700 lg:hidden"
        ),
        "aria-expanded": isOpen,
        "aria-controls": "ai-travel-params-panel",
        "aria-label": isOpen ? "收起旅行参数" : "展开旅行参数",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          ChevronRight,
          {
            className: cn("h-4 w-4 transition", isOpen && "rotate-180"),
            "aria-hidden": true
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.aside,
      {
        id: "ai-travel-params-panel",
        className: cn(
          "flex min-h-0 flex-col overflow-hidden border-slate-200/90 bg-white/90",
          "border-t lg:border-l lg:border-t-0",
          isOpen ? "w-full lg:w-72" : "w-0 border-0 lg:w-0"
        ),
        initial: false,
        animate: {
          opacity: isOpen ? 1 : 0
        },
        transition: { duration: reduceMotion ? 0 : 0.22 },
        "aria-hidden": !isOpen,
        children: isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full min-h-0 w-full flex-col lg:w-72", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center justify-between gap-2 border-b border-slate-200/80 px-3 py-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersHorizontal, { className: "h-4 w-4 text-brand-600", "aria-hidden": true }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] uppercase tracking-wider text-slate-500", children: "Params" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-slate-900", children: "旅行参数" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: onToggle,
                className: "hidden rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:inline-flex",
                "aria-label": "收起面板",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4", "aria-hidden": true })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-0 flex-1 space-y-5 overflow-y-auto p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-baseline justify-between gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-slate-800", children: "预算范围" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-[10px] text-brand-700", children: [
                  formatBudget(params.budgetMin),
                  " – ",
                  formatBudget(params.budgetMax)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "group", "aria-labelledby": "budget-min-label", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { id: "budget-min-label", className: "text-[10px] font-medium text-slate-500", children: "最低预算" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "range",
                      "aria-labelledby": "budget-min-label",
                      min: BUDGET_RANGE_LIMITS.min,
                      max: BUDGET_RANGE_LIMITS.max,
                      step: BUDGET_RANGE_LIMITS.step,
                      value: params.budgetMin,
                      onChange: (event) => onBudgetMinChange(Number(event.target.value)),
                      className: "mt-1.5 block h-1.5 w-full cursor-pointer accent-brand-600"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "group", "aria-labelledby": "budget-max-label", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { id: "budget-max-label", className: "text-[10px] font-medium text-slate-500", children: "最高预算" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "range",
                      "aria-labelledby": "budget-max-label",
                      min: BUDGET_RANGE_LIMITS.min,
                      max: BUDGET_RANGE_LIMITS.max,
                      step: BUDGET_RANGE_LIMITS.step,
                      value: params.budgetMax,
                      onChange: (event) => onBudgetMaxChange(Number(event.target.value)),
                      className: "mt-1.5 block h-1.5 w-full cursor-pointer accent-violet-600"
                    }
                  )
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 text-xs font-semibold text-slate-800", children: "旅行天数" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", role: "group", "aria-label": "旅行天数", children: TRAVEL_DAY_OPTIONS.map((day) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => onDaysChange(day),
                  className: cn(
                    "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition",
                    params.days === day ? "border-brand-300 bg-brand-50 text-brand-800" : "border-slate-200 bg-white text-slate-600 hover:border-brand-200"
                  ),
                  "aria-pressed": params.days === day,
                  children: [
                    day,
                    " 天"
                  ]
                },
                day
              )) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 text-xs font-semibold text-slate-800", children: "兴趣标签" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", role: "group", "aria-label": "兴趣标签多选", children: TRAVEL_INTEREST_OPTIONS.map((option) => {
                const selected = params.interests.includes(option.id);
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => onToggleInterest(option.id),
                    className: cn(
                      "rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                      selected ? "border-violet-300 bg-violet-50 text-violet-800" : "border-slate-200 bg-white text-slate-600 hover:border-violet-200"
                    ),
                    "aria-pressed": selected,
                    children: option.label
                  },
                  option.id
                );
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 text-xs font-semibold text-slate-800", children: "旅行节奏" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", role: "radiogroup", "aria-label": "旅行节奏", children: TRAVEL_PACE_OPTIONS.map((option) => {
                const inputId = `travel-pace-${option.id}`;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "label",
                  {
                    htmlFor: inputId,
                    className: cn(
                      "flex cursor-pointer items-start gap-2 rounded-xl border px-2.5 py-2 transition",
                      params.pace === option.id ? "border-brand-300 bg-brand-50/80" : "border-slate-200 bg-white hover:border-brand-200"
                    ),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "input",
                        {
                          id: inputId,
                          type: "radio",
                          name: "travel-pace",
                          value: option.id,
                          checked: params.pace === option.id,
                          onChange: () => onPaceChange(option.id),
                          className: "mt-0.5 border-slate-300 text-brand-600 focus:ring-brand-500"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-xs font-semibold text-slate-800", children: option.label }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-[10px] text-slate-500", children: option.hint })
                      ] })
                    ]
                  },
                  option.id
                );
              }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 space-y-2 border-t border-slate-200/80 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AsyncFeedback,
              {
                isLoading: isGeneratingPlan,
                loadingMessage: "正在生成计划卡片…",
                error: planError,
                onDismissError: onDismissPlanError,
                onRetry: onRetryPlan
              }
            ),
            onGeneratePlan && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: onGeneratePlan,
                disabled: panelBusy,
                className: cn(
                  "inline-flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold text-white",
                  "bg-gradient-to-r from-brand-500 to-violet-600 shadow-sm transition hover:brightness-110",
                  "disabled:cursor-not-allowed disabled:opacity-60"
                ),
                children: [
                  isGeneratingPlan ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin", "aria-hidden": true }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5", "aria-hidden": true }),
                  isGeneratingPlan ? "生成中…" : "生成计划卡片"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: onReset,
                disabled: panelBusy,
                className: "w-full rounded-xl border border-slate-200 bg-white py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50",
                children: "恢复默认参数"
              }
            )
          ] })
        ] })
      }
    )
  ] });
}
function useAdvisorPlanSave({
  messages,
  context,
  getSessionId,
  ensureSessionPersisted,
  defaultTitle
}) {
  const [saveOpen, setSaveOpen] = reactExports.useState(false);
  const [saveLoading, setSaveLoading] = reactExports.useState(false);
  const [saveError, setSaveError] = reactExports.useState(null);
  const [saveSuccess, setSaveSuccess] = reactExports.useState(false);
  const openSaveDialog = reactExports.useCallback(() => {
    setSaveError(null);
    setSaveSuccess(false);
    setSaveOpen(true);
  }, []);
  const closeSaveDialog = reactExports.useCallback(() => {
    if (!saveLoading) {
      setSaveOpen(false);
    }
  }, [saveLoading]);
  const savePlan = reactExports.useCallback(
    async (title, isPublic) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
      setSaveLoading(true);
      setSaveError(null);
      setSaveSuccess(false);
      try {
        await ensureSessionPersisted();
        const sessionId = getSessionId();
        const turns = chatMessagesToTurns(messages);
        const locationName = ((_a = context == null ? void 0 : context.destination) == null ? void 0 : _a.trim()) || ((_c = (_b = context == null ? void 0 : context.origin) == null ? void 0 : _b.name) == null ? void 0 : _c.trim()) || ((_e = (_d = context == null ? void 0 : context.location) == null ? void 0 : _d.name) == null ? void 0 : _e.trim()) || "AI 顾问";
        const lng = ((_f = context == null ? void 0 : context.location) == null ? void 0 : _f.lng) ?? ((_g = context == null ? void 0 : context.origin) == null ? void 0 : _g.lng) ?? 0;
        const lat = ((_h = context == null ? void 0 : context.location) == null ? void 0 : _h.lat) ?? ((_i = context == null ? void 0 : context.origin) == null ? void 0 : _i.lat) ?? 0;
        const initialQuery = ((_j = messages.find((message) => message.role === "user")) == null ? void 0 : _j.content.trim()) || title.trim();
        await persistUserAiSessionSave(sessionId, {
          title: title.trim(),
          isPublic,
          conversationTurns: turns,
          locationName,
          lng,
          lat,
          initialQuery
        });
        setSaveSuccess(true);
        setSaveOpen(false);
        void queryClient.invalidateQueries({ queryKey: ["user-plans"] });
        void queryClient.invalidateQueries({ queryKey: ["user-ai-sessions"] });
      } catch (err) {
        setSaveError(toErrorMessage(err, "保存失败，请稍后再试"));
        throw err;
      } finally {
        setSaveLoading(false);
      }
    },
    [context, ensureSessionPersisted, getSessionId, messages]
  );
  return {
    saveOpen,
    saveLoading,
    saveError,
    saveSuccess,
    defaultTitle,
    openSaveDialog,
    closeSaveDialog,
    savePlan,
    clearSaveError: () => setSaveError(null)
  };
}
function useAdvisorSession({ context, initialSessionId } = {}) {
  const sessionIdRef = reactExports.useRef(initialSessionId ?? (context == null ? void 0 : context.sessionId) ?? null);
  const initialQueryRef = reactExports.useRef(null);
  const createdRef = reactExports.useRef(Boolean(initialSessionId ?? (context == null ? void 0 : context.sessionId)));
  const ensureSessionId = reactExports.useCallback(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = createAdvisorSessionId();
    }
    return sessionIdRef.current;
  }, []);
  const syncAfterTurn = reactExports.useCallback(
    async (messages) => {
      const userMessages = messages.filter(
        (message) => message.role === "user" && message.content.trim()
      );
      if (userMessages.length === 0) {
        return;
      }
      const firstUserText = userMessages[0].content.trim();
      if (!initialQueryRef.current) {
        initialQueryRef.current = firstUserText;
      }
      const sessionId = ensureSessionId();
      try {
        if (!createdRef.current) {
          await syncAdvisorSessionCreate(
            sessionId,
            initialQueryRef.current,
            messages,
            context
          );
          createdRef.current = true;
        } else {
          await syncAdvisorSessionUpdate(
            sessionId,
            initialQueryRef.current,
            messages,
            context
          );
        }
      } catch {
      }
    },
    [context, ensureSessionId]
  );
  const resetSession = reactExports.useCallback(() => {
    sessionIdRef.current = null;
    initialQueryRef.current = null;
    createdRef.current = false;
  }, []);
  const adoptSession = reactExports.useCallback((sessionId, initialQuery) => {
    sessionIdRef.current = sessionId;
    initialQueryRef.current = initialQuery;
    createdRef.current = true;
  }, []);
  const getSessionId = reactExports.useCallback(() => ensureSessionId(), [ensureSessionId]);
  return {
    sessionId: sessionIdRef.current,
    getSessionId,
    syncAfterTurn,
    resetSession,
    adoptSession
  };
}
const KNOWN_CITIES = Object.keys(CITY_COORDINATES);
function extractDestinationFromPrompt(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return void 0;
  }
  for (const city of KNOWN_CITIES) {
    if (trimmed.includes(city)) {
      return city;
    }
  }
  const goMatch = trimmed.match(/去([\u4e00-\u9fa5]{2,6})/);
  if (goMatch == null ? void 0 : goMatch[1]) {
    return goMatch[1];
  }
  const playMatch = trimmed.match(/([\u4e00-\u9fa5]{2,6})(?:玩|旅游|自由行)/);
  return playMatch == null ? void 0 : playMatch[1];
}
function extractDaysFromPrompt(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return void 0;
  }
  const digitMatch = trimmed.match(/(\d+)\s*天/);
  if (digitMatch == null ? void 0 : digitMatch[1]) {
    const days = Number.parseInt(digitMatch[1], 10);
    if (days >= 1 && days <= 30) {
      return days;
    }
  }
  const cnMap = {
    一: 1,
    二: 2,
    两: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
    十: 10
  };
  const cnMatch = trimmed.match(/([一二两三四五六七八九十])\s*天/);
  if (cnMatch == null ? void 0 : cnMatch[1]) {
    return cnMap[cnMatch[1]];
  }
  return void 0;
}
function useAiChatPlanGeneration({
  messages,
  travelParams,
  chatContext
}) {
  var _a;
  const planGeneration = useGenerateTravelPlan();
  const canGenerateFromContext = Boolean(
    messages.some((message) => message.role === "user") || ((_a = chatContext.dream) == null ? void 0 : _a.trim())
  );
  const generateFromContext = reactExports.useCallback((cfg = {}) => {
    var _a2, _b, _c;
    planGeneration.clearError();
    const lastUser = [...messages].reverse().find((message) => message.role === "user");
    const dreamText = (_a2 = chatContext.dream) == null ? void 0 : _a2.trim();
    const destination = ((_b = chatContext.destination) == null ? void 0 : _b.trim()) || (lastUser ? extractDestinationFromPrompt(lastUser.content) : void 0) || (dreamText ? extractDestinationFromPrompt(dreamText) : void 0);
    let prompt = (lastUser == null ? void 0 : lastUser.content.trim()) || dreamText || buildTravelPlanPromptFromParams(travelParams, destination);
    if ((_c = planGeneration.lastPlan) == null ? void 0 : _c.title) {
      prompt = `基于「${planGeneration.lastPlan.title}」调整：${prompt}`;
    }
    const options = mapAiTravelParamsToOptions(travelParams, { destination });
    return planGeneration.generate(prompt, options, cfg);
  }, [chatContext.destination, chatContext.dream, messages, planGeneration, travelParams]);
  return {
    ...planGeneration,
    canGenerateFromContext,
    generateFromContext
  };
}
function useAiChatScrollSync(messages, isLoading) {
  var _a;
  const scrollRef = reactExports.useRef(null);
  const messageRefs = reactExports.useRef(/* @__PURE__ */ new Map());
  const registerMessageRef = reactExports.useCallback((id, node) => {
    if (node) {
      messageRefs.current.set(id, node);
    } else {
      messageRefs.current.delete(id);
    }
  }, []);
  const scrollToMessage = reactExports.useCallback((messageId, reduceMotion) => {
    const node = messageRefs.current.get(messageId);
    const container = scrollRef.current;
    if (!node || !container) {
      return;
    }
    const top = node.offsetTop - container.offsetTop - 8;
    container.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? "auto" : "smooth" });
  }, []);
  const selectedMessageId = ((_a = messages.at(-1)) == null ? void 0 : _a.id) ?? null;
  reactExports.useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    el.scrollTop = el.scrollHeight;
  }, [messages, isLoading]);
  return {
    scrollRef,
    selectedMessageId,
    registerMessageRef,
    scrollToMessage
  };
}
function formatAdvisorConversationForShare(messages) {
  const lines = [];
  for (const message of messages) {
    if (message.role === "assistant" && message.id === AI_CHAT_WELCOME_MESSAGE_ID) {
      continue;
    }
    if (message.status === "streaming" || !message.content.trim()) {
      continue;
    }
    const label = message.role === "user" ? "【我】" : "【蜗牛顾问】";
    lines.push(`${label}
${message.content.trim()}`);
  }
  return lines.join("\n\n");
}
function shareAdvisorConversation(messages, plan) {
  const text = plan ? formatTravelPlanItineraryText(plan) : formatAdvisorConversationForShare(messages);
  return copyTextToClipboardSync(text);
}
async function shareAdvisorContent(messages, plan) {
  var _a;
  const text = plan ? formatTravelPlanItineraryText(plan) : formatAdvisorConversationForShare(messages);
  const trimmed = text.trim();
  if (!trimmed) {
    return "failed";
  }
  if (shareAdvisorConversation(messages, plan) === "copied") {
    return "copied";
  }
  return sharePlainText(trimmed, ((_a = plan == null ? void 0 : plan.title) == null ? void 0 : _a.trim()) || "蜗牛旅行 · 顾问对话");
}
function useAiChatInterfaceController({
  context,
  seedAssistant,
  autoPrompt,
  hideAutoPromptBubble = false,
  initialMessages,
  restoredSessionId,
  restoredInitialQuery,
  paramsOpen: controlledParamsOpen,
  onParamsOpenChange
}) {
  var _a;
  const navigate = useNavigate();
  const autoSentRef = reactExports.useRef(false);
  const [internalParamsOpen, setInternalParamsOpen] = reactExports.useState(false);
  const paramsOpen = controlledParamsOpen ?? internalParamsOpen;
  const setParamsOpen = onParamsOpenChange ?? setInternalParamsOpen;
  const advisorSession = useAdvisorSession({
    context,
    initialSessionId: restoredSessionId ?? (context == null ? void 0 : context.sessionId)
  });
  reactExports.useEffect(() => {
    if (restoredSessionId && restoredInitialQuery) {
      advisorSession.adoptSession(restoredSessionId, restoredInitialQuery);
    }
  }, [advisorSession, restoredInitialQuery, restoredSessionId]);
  const travelParamsState = useAiTravelParams({ initialContext: context });
  const chat = useAiChat({
    context: travelParamsState.chatContext,
    seedAssistant,
    initialMessages,
    onConversationUpdate: (messages) => {
      void advisorSession.syncAfterTurn(messages);
    }
  });
  const scroll = useAiChatScrollSync(chat.messages, chat.isLoading);
  const plan = useAiChatPlanGeneration({
    messages: chat.messages,
    travelParams: travelParamsState.params,
    chatContext: travelParamsState.chatContext
  });
  const isBusy = chat.isLoading || plan.isGenerating;
  const aiBlocked = chat.provider === "unconfigured";
  const [shareFeedback, setShareFeedback] = reactExports.useState("idle");
  const [shareFallbackOpen, setShareFallbackOpen] = reactExports.useState(false);
  const [shareFallbackText, setShareFallbackText] = reactExports.useState("");
  const saveDefaultTitle = reactExports.useMemo(
    () => {
      var _a2, _b, _c;
      return ((_b = (_a2 = plan.lastPlan) == null ? void 0 : _a2.title) == null ? void 0 : _b.trim()) || ((_c = travelParamsState.chatContext.destination) == null ? void 0 : _c.trim()) || "我的穷游方案";
    },
    [(_a = plan.lastPlan) == null ? void 0 : _a.title, travelParamsState.chatContext.destination]
  );
  const ensureSessionPersisted = reactExports.useCallback(async () => {
    await advisorSession.syncAfterTurn(chat.messages);
  }, [advisorSession, chat.messages]);
  const planSave = useAdvisorPlanSave({
    messages: chat.messages,
    context: travelParamsState.chatContext,
    getSessionId: advisorSession.getSessionId,
    ensureSessionPersisted,
    defaultTitle: saveDefaultTitle
  });
  reactExports.useEffect(() => {
    const prompt = autoPrompt == null ? void 0 : autoPrompt.trim();
    if (!prompt || autoSentRef.current) {
      return void 0;
    }
    autoSentRef.current = true;
    const timer = window.setTimeout(() => {
      chat.sendMessage(prompt, hideAutoPromptBubble ? { hideUserBubble: true } : void 0).catch(() => void 0);
    }, 280);
    return () => {
      window.clearTimeout(timer);
    };
  }, [autoPrompt, chat.sendMessage, hideAutoPromptBubble]);
  const handleReset = reactExports.useCallback(() => {
    chat.resetChat();
    travelParamsState.resetParams();
    plan.clearError();
    advisorSession.resetSession();
  }, [advisorSession, chat, plan, travelParamsState]);
  const handleGeneratePlan = reactExports.useCallback(() => {
    plan.generateFromContext().catch(() => void 0);
  }, [plan]);
  const confirmPlanDialog = reactExports.useCallback(() => {
    if (plan.lastPlan) {
      navigate(travelPlanDetailPath(plan.lastPlan.id));
    }
    plan.closeDialog();
  }, [navigate, plan]);
  const handleViewMap = reactExports.useCallback(async () => {
    if (plan.lastPlan) {
      navigate(travelPlanDetailPath(plan.lastPlan.id));
      return;
    }
    const generated = await plan.generateFromContext({ openDialog: false });
    if (generated) {
      navigate(travelPlanDetailPath(generated.id));
    }
  }, [navigate, plan]);
  const handleSharePlan = reactExports.useCallback(() => {
    const text = plan.lastPlan ? formatTravelPlanItineraryText(plan.lastPlan) : formatAdvisorConversationForShare(chat.messages).trim();
    if (!text) {
      setShareFeedback("error");
      window.setTimeout(() => setShareFeedback("idle"), 5e3);
      return;
    }
    void shareAdvisorContent(chat.messages, plan.lastPlan).then((result) => {
      if (result === "copied" || result === "shared") {
        setShareFeedback("success");
        setShareFallbackOpen(false);
        window.setTimeout(() => setShareFeedback("idle"), 5e3);
        return;
      }
      if (result === "cancelled") {
        return;
      }
      setShareFeedback("error");
      setShareFallbackText(text);
      setShareFallbackOpen(true);
    });
  }, [chat.messages, plan.lastPlan]);
  const hasUserTurn = chat.messages.some((message) => message.role === "user");
  const actionAvailability = reactExports.useMemo(
    () => ({
      canSave: hasUserTurn,
      canShare: true,
      hasPlan: Boolean(plan.lastPlan),
      // 查看地图仅在已生成行程后展示，避免与「生成行程」重复
      canViewMap: Boolean(plan.lastPlan)
    }),
    [hasUserTurn, plan.lastPlan]
  );
  return {
    context,
    paramsOpen,
    setParamsOpen,
    travelParams: travelParamsState,
    chat,
    scroll,
    plan,
    isBusy,
    aiBlocked,
    handleReset,
    handleGeneratePlan,
    handleViewMap,
    handleSharePlan,
    shareFeedback,
    shareFallbackOpen,
    shareFallbackText,
    setShareFallbackOpen,
    actionAvailability,
    planSave,
    confirmPlanDialog,
    provider: chat.provider
  };
}
function buildProgressMessage(elapsedSec, days) {
  const estimate = estimateTravelPlanSeconds(days);
  if (elapsedSec < 4) {
    return "正在分析偏好与预算…";
  }
  if (elapsedSec < 12) {
    return "正在编排每日行程…";
  }
  if (elapsedSec < estimate) {
    return `正在生成 ${days} 天行程卡片…`;
  }
  return `行程较长，请稍候…（已等待 ${elapsedSec}s，预计约 ${estimate}s）`;
}
function usePlanGenerationProgress(active, days) {
  const [message, setMessage] = reactExports.useState(null);
  const [estimateSeconds, setEstimateSeconds] = reactExports.useState(estimateTravelPlanSeconds(days));
  reactExports.useEffect(() => {
    if (!active) {
      setMessage(null);
      return;
    }
    const safeDays = Math.max(1, days);
    const estimate = estimateTravelPlanSeconds(safeDays);
    setEstimateSeconds(estimate);
    const startedAt = Date.now();
    setMessage(buildProgressMessage(0, safeDays));
    const timer = window.setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - startedAt) / 1e3);
      setMessage(buildProgressMessage(elapsedSec, safeDays));
    }, 1e3);
    return () => {
      window.clearInterval(timer);
    };
  }, [active, days]);
  return { message, estimateSeconds };
}
function AIChatInterface({
  className,
  variant = "default",
  context,
  seedAssistant,
  autoPrompt,
  hideAutoPromptBubble = false,
  initialMessages,
  restoredSessionId,
  restoredInitialQuery,
  isSessionRestoring = false,
  paramsOpen,
  onParamsOpenChange
}) {
  var _a, _b;
  const ctrl = useAiChatInterfaceController({
    context,
    seedAssistant,
    autoPrompt,
    hideAutoPromptBubble,
    initialMessages,
    restoredSessionId,
    restoredInitialQuery,
    paramsOpen,
    onParamsOpenChange
  });
  const planProgress = usePlanGenerationProgress(
    ctrl.plan.isGenerating,
    ctrl.travelParams.params.days
  );
  const composerRef = reactExports.useRef(null);
  const latestAssistantReply = ((_a = [...ctrl.chat.messages].reverse().find((message) => message.role === "assistant")) == null ? void 0 : _a.content) ?? null;
  const handleUseExamplePrompt = reactExports.useCallback((text) => {
    var _a2;
    (_a2 = composerRef.current) == null ? void 0 : _a2.fillDraft(text);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        variant === "capsule" ? "relative flex h-full min-h-0 max-h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm" : "relative flex h-[min(42rem,calc(100dvh-6rem))] max-h-[calc(100dvh-6rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm",
        variant === "default" && "pb-[env(safe-area-inset-bottom)]",
        className
      ),
      children: [
        variant !== "capsule" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          AIChatToolbar,
          {
            variant,
            provider: ctrl.provider,
            onToggleParams: () => ctrl.setParamsOpen((open) => !open),
            onReset: ctrl.handleReset,
            isBusy: ctrl.isBusy,
            originLabel: (_b = context == null ? void 0 : context.origin) == null ? void 0 : _b.name
          }
        ) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex min-h-0 flex-1 flex-col lg:flex-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-0 min-w-0 flex-1 flex-col", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AIChatMessageStream,
              {
                variant,
                scrollRef: ctrl.scroll.scrollRef,
                messages: ctrl.chat.messages,
                isLoading: ctrl.chat.isLoading,
                isStreaming: ctrl.chat.isStreaming,
                isSessionRestoring,
                selectedMessageId: ctrl.scroll.selectedMessageId,
                registerMessageRef: ctrl.scroll.registerMessageRef,
                onUseExamplePrompt: handleUseExamplePrompt,
                messageActionProps: {
                  canGenerate: ctrl.plan.canGenerateFromContext,
                  canViewMap: ctrl.actionAvailability.canViewMap,
                  canSave: ctrl.actionAvailability.canSave,
                  canShare: ctrl.actionAvailability.canShare,
                  hasPlan: ctrl.actionAvailability.hasPlan,
                  isBusy: ctrl.isBusy,
                  isGeneratingPlan: ctrl.plan.isGenerating,
                  shareFeedback: ctrl.shareFeedback,
                  onGeneratePlan: ctrl.handleGeneratePlan,
                  onViewMap: () => {
                    void ctrl.handleViewMap();
                  },
                  onSavePlan: ctrl.planSave.openSaveDialog,
                  onSharePlan: ctrl.handleSharePlan
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 px-3 pb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                AsyncFeedback,
                {
                  isLoading: false,
                  loadingMessage: "AI 正在回复…",
                  error: ctrl.chat.error,
                  onDismissError: ctrl.chat.clearError,
                  onRetry: () => {
                    ctrl.chat.retryLastMessage().catch(() => void 0);
                  },
                  retryLabel: "重新发送"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                AsyncFeedback,
                {
                  isLoading: ctrl.plan.isGenerating,
                  loadingMessage: "正在生成行程卡片…",
                  error: ctrl.plan.error,
                  onDismissError: ctrl.plan.clearError,
                  onRetry: () => {
                    ctrl.plan.retry().catch(() => void 0);
                  }
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AIChatMessageInput,
              {
                ref: composerRef,
                composerId: ctrl.chat.composerId,
                isLoading: ctrl.chat.isLoading,
                isStreaming: ctrl.chat.isStreaming,
                isBusy: ctrl.isBusy || ctrl.aiBlocked,
                onSend: ctrl.chat.sendMessage,
                onAbortStream: ctrl.chat.abortStream,
                assistantReplyText: latestAssistantReply,
                travelParams: ctrl.travelParams.params,
                context: ctrl.travelParams.chatContext,
                showHotCityPicker: true,
                variant
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            AIChatTravelParamsPanel,
            {
              params: ctrl.travelParams.params,
              isOpen: ctrl.paramsOpen,
              onToggle: () => ctrl.setParamsOpen((open) => !open),
              onBudgetMinChange: ctrl.travelParams.setBudgetMin,
              onBudgetMaxChange: ctrl.travelParams.setBudgetMax,
              onDaysChange: ctrl.travelParams.setDays,
              onPaceChange: ctrl.travelParams.setPace,
              onToggleInterest: ctrl.travelParams.toggleInterest,
              onReset: ctrl.travelParams.resetParams,
              onGeneratePlan: ctrl.handleGeneratePlan,
              isGeneratingPlan: ctrl.plan.isGenerating,
              isChatLoading: ctrl.chat.isLoading,
              planError: ctrl.plan.error,
              onDismissPlanError: ctrl.plan.clearError,
              onRetryPlan: () => {
                ctrl.plan.retry().catch(() => void 0);
              },
              className: "shrink-0"
            }
          ),
          ctrl.plan.isGenerating && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[2px]",
              role: "status",
              "aria-label": "正在生成旅行计划",
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex max-w-[18rem] flex-col items-center gap-1 rounded-2xl border border-brand-200 bg-white px-4 py-3 text-center shadow-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-medium text-brand-800", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin shrink-0", "aria-hidden": true }),
                  planProgress.message ?? "生成行程中…"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-slate-500", children: [
                  ctrl.travelParams.params.days,
                  " 天行程预计约 ",
                  planProgress.estimateSeconds,
                  " 秒"
                ] })
              ] })
            }
          )
        ] }),
        variant !== "capsule" && !ctrl.paramsOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => ctrl.setParamsOpen(true),
            className: "absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-md lg:hidden",
            "aria-label": "旅行参数",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersHorizontal, { className: "h-4 w-4", "aria-hidden": true })
          }
        ) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TravelPlanResultDialog,
          {
            open: ctrl.plan.dialogOpen,
            plan: ctrl.plan.lastPlan,
            onClose: ctrl.plan.closeDialog,
            confirmLabel: "查看完整行程",
            onConfirm: ctrl.confirmPlanDialog
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          PlanSaveDialog,
          {
            open: ctrl.planSave.saveOpen,
            defaultTitle: ctrl.planSave.defaultTitle,
            loading: ctrl.planSave.saveLoading,
            error: ctrl.planSave.saveError,
            onClose: ctrl.planSave.closeSaveDialog,
            onConfirm: (title, isPublic) => ctrl.planSave.savePlan(title, isPublic)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          AdvisorShareCopyDialog,
          {
            open: ctrl.shareFallbackOpen,
            text: ctrl.shareFallbackText,
            onClose: () => ctrl.setShareFallbackOpen(false)
          }
        )
      ]
    }
  );
}
function AiChatPage() {
  var _a, _b, _c;
  usePageSeo(aiChatPageSeo());
  const { origin: userOrigin } = useUserMapOrigin();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const routeState = location.state;
  const sessionIdFromUrl = ((_a = searchParams.get("session")) == null ? void 0 : _a.trim()) || void 0;
  const restoreSessionId = sessionIdFromUrl ?? (routeState == null ? void 0 : routeState.sessionId);
  const [restoredMessages, setRestoredMessages] = reactExports.useState();
  const [restoredInitialQuery, setRestoredInitialQuery] = reactExports.useState();
  const [restoreError, setRestoreError] = reactExports.useState(null);
  const [restoreLoading, setRestoreLoading] = reactExports.useState(Boolean(restoreSessionId));
  const isCapsuleMode = (routeState == null ? void 0 : routeState.source) === "capsule_one" || isCapsuleAiSession();
  reactExports.useEffect(() => {
    if (!isCapsuleMode) {
      return void 0;
    }
    document.documentElement.classList.add("capsule-one-ai-active");
    let link = document.getElementById("capsule-one-fonts");
    if (!link) {
      link = document.createElement("link");
      link.id = "capsule-one-fonts";
      link.rel = "stylesheet";
      link.href = CAPSULE_FONT_URL;
      document.head.appendChild(link);
    }
    return () => {
      document.documentElement.classList.remove("capsule-one-ai-active");
    };
  }, [isCapsuleMode]);
  reactExports.useEffect(() => {
    if (!restoreSessionId) {
      setRestoreLoading(false);
      return void 0;
    }
    let cancelled = false;
    setRestoreLoading(true);
    setRestoreError(null);
    fetchUserAiSessionById(restoreSessionId).then((session) => {
      if (cancelled) {
        return;
      }
      const messages = historyItemsToAdvisorMessages(session.fullHistory);
      setRestoredMessages(messages.length > 0 ? messages : void 0);
      setRestoredInitialQuery(session.initialQuery || void 0);
    }).catch(() => {
      if (cancelled) {
        return;
      }
      setRestoreError("无法加载该会话，将开启新对话");
      setRestoredMessages(void 0);
      setRestoredInitialQuery(void 0);
    }).finally(() => {
      if (!cancelled) {
        setRestoreLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [restoreSessionId]);
  const autoPrompt = reactExports.useMemo(() => {
    var _a2, _b2;
    if (restoreSessionId) {
      return void 0;
    }
    const fromQuery = searchParams.get("q") ?? searchParams.get("ask");
    return (fromQuery == null ? void 0 : fromQuery.trim()) || ((_a2 = routeState == null ? void 0 : routeState.initialPrompt) == null ? void 0 : _a2.trim()) || ((_b2 = routeState == null ? void 0 : routeState.aiDream) == null ? void 0 : _b2.trim()) || void 0;
  }, [restoreSessionId, routeState == null ? void 0 : routeState.aiDream, routeState == null ? void 0 : routeState.initialPrompt, searchParams]);
  const [paramsOpen, setParamsOpen] = reactExports.useState(false);
  const mergedState = reactExports.useMemo(() => {
    return {
      ...routeState,
      sessionId: restoreSessionId ?? (routeState == null ? void 0 : routeState.sessionId)
    };
  }, [restoreSessionId, routeState]);
  const context = reactExports.useMemo(() => {
    var _a2;
    const handoffContext = handoffStateToChatContext(mergedState);
    const dream = handoffContext.dream;
    const intent = dream ? parseTravelSearchIntent(dream) : null;
    const fromDream = dream ? extractDestinationFromPrompt(dream) : void 0;
    const daysFromDream = dream ? extractDaysFromPrompt(dream) : void 0;
    const storedOrigin = ((_a2 = userOrigin == null ? void 0 : userOrigin.label) == null ? void 0 : _a2.trim()) && userOrigin.gcjLng != null && userOrigin.gcjLat != null ? {
      name: userOrigin.label.trim(),
      lng: userOrigin.gcjLng,
      lat: userOrigin.gcjLat
    } : void 0;
    return {
      ...handoffContext,
      origin: handoffContext.origin ?? storedOrigin,
      destination: handoffContext.destination ?? (intent == null ? void 0 : intent.destinationHint) ?? fromDream,
      days: handoffContext.days ?? (intent == null ? void 0 : intent.days) ?? daysFromDream,
      budget: handoffContext.budget ?? ((intent == null ? void 0 : intent.budgetYuan) != null ? String(intent.budgetYuan) : void 0)
    };
  }, [mergedState, userOrigin]);
  const seedAssistant = reactExports.useMemo(() => {
    var _a2;
    if (restoredMessages && restoredMessages.length > 0) {
      return void 0;
    }
    if (isCapsuleMode && autoPrompt) {
      return "";
    }
    if (context.planExcerpt) {
      const bits = [
        context.dream && `已记住你的想法：${context.dream}`,
        context.destination && `目的地 ${context.destination}${context.days ? ` · ${context.days} 天` : ""}${context.budget ? ` · 预算约 ¥${context.budget}` : ""}`,
        "已从地图规划带入方案摘要，你可以直接追问细节、改预算或换节奏。"
      ].filter(Boolean);
      return `已带入地图方案。${bits.join(" · ")} · 直接在下方追问即可。`;
    }
    if (context.destination || context.dream) {
      const bits = [
        context.dream && `想法：${context.dream}`,
        context.destination && `${context.destination}${context.days ? ` · ${context.days}天` : ""}${context.budget ? ` · ¥${context.budget}` : ""}`
      ].filter(Boolean);
      return isCapsuleMode ? `已锁定${bits.length ? ` · ${bits.join(" · ")}` : ""}。说说偏好，我来构建路线。` : `你好，我是旅行顾问。${bits.join(" · ")} · 说说偏好或直接让我出行程。`;
    }
    if ((_a2 = context.origin) == null ? void 0 : _a2.name) {
      return `已从首页读取出发地：${context.origin.name}。直接说想去哪，我会按从你家出发来算交通。`;
    }
    if (isCapsuleMode || (mergedState == null ? void 0 : mergedState.source) === "capsule_one") {
      return "说说偏好与节奏，我来为你构建路线。";
    }
    return "";
  }, [
    context.budget,
    context.days,
    context.destination,
    context.dream,
    (_b = context.origin) == null ? void 0 : _b.name,
    context.planExcerpt,
    isCapsuleMode,
    mergedState == null ? void 0 : mergedState.source,
    restoredMessages,
    autoPrompt
  ]);
  const aiProvider = getAiProviderDisplay();
  const chatBody = /* @__PURE__ */ jsxRuntimeExports.jsx(
    AIChatInterface,
    {
      className: isCapsuleMode ? "capsule-ai-interface" : void 0,
      variant: isCapsuleMode ? "capsule" : "default",
      context,
      seedAssistant,
      autoPrompt,
      hideAutoPromptBubble: isCapsuleMode && Boolean(autoPrompt),
      paramsOpen: isCapsuleMode ? paramsOpen : void 0,
      onParamsOpenChange: isCapsuleMode ? setParamsOpen : void 0,
      initialMessages: restoredMessages,
      restoredSessionId: restoreSessionId,
      restoredInitialQuery,
      isSessionRestoring: restoreLoading
    }
  );
  if (isCapsuleMode) {
    const lockedLabel = ((_c = routeState == null ? void 0 : routeState.location) == null ? void 0 : _c.name) ?? context.destination;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "capsule-ai-page capsule-ai-page--enter", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "capsule-ai-page__stars", "aria-hidden": true }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "capsule-ai-page__hud", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: paths.home,
            className: "capsule-ai-page__back",
            onClick: () => clearCapsuleAiSession(),
            children: "← 返回"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "capsule-ai-page__title", children: lockedLabel ? `构建中 · ${lockedLabel}` : "现实构建中" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: "capsule-ai-page__action",
            onClick: () => setParamsOpen((open) => !open),
            "aria-label": "旅行参数",
            "aria-expanded": paramsOpen,
            "aria-controls": "ai-travel-params-panel",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersHorizontal, { className: "h-3.5 w-3.5", "aria-hidden": true })
          }
        )
      ] }),
      restoreError ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "capsule-ai-page__status capsule-ai-page__status--warn", role: "status", children: restoreError }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "capsule-ai-page__panel", children: chatBody })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(MotionPage, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(MotionBlock, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: paths.home, className: "text-xs font-medium text-brand-600 hover:text-brand-700", children: "← 回首页" }),
      aiProvider !== "deepseek" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-slate-400", children: aiProvider === "unconfigured" ? getAiProviderDisplayLabel(aiProvider) : "演示模式" }) : null
    ] }),
    restoreError ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 text-sm text-amber-700", role: "status", children: restoreError }) : null,
    chatBody
  ] }) });
}
export {
  AiChatPage as default
};
