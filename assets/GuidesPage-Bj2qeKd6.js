import { a as reactExports, j as jsxRuntimeExports } from "./vendor-react-DtfH6MSw.js";
import { M as DEMO_USERS, c9 as getCountryLabel, az as TravelPersonalityKind, cv as getPersonalityCompatibilityScore, ck as getInterestLabel, m as AvatarImage, x as CalendarDays, bl as cn, at as Sparkles, y as ChevronDown, a3 as MessageCircle, Z as Link, f8 as userProfilePath, eW as useNavigate, L as DEMO_CURRENT_USER_ID, aF as Users, f1 as useReducedMotion, dG as motion, eq as staggerItem, ep as staggerContainer, D as ChevronRight, b_ as formatRelativeZh, d2 as guideDetailPath, dS as paths, a1 as MapPin, dH as motionTransition, an as SNAIL_UI_COPY, aI as X, E as Compass, s as Bot, eX as usePageSeo, eU as useLocation, eP as useFilteredGuides, f5 as useUiStore, d4 as guidesPageSeo } from "./index-DwV1qlqh.js";
import "./AiChatMessage-Dy98aHtB.js";
import { a as SLIME_TRAIL_PUBLISHER } from "./slimeTrail-CE9U9eJw.js";
import { D as DEMO_TRAVEL_BUDDY_SEEKING } from "./DiscoverMasonryFeedSection-B10gLj3Q.js";
import { E as Earth } from "./earth-uhLNJ2d4.js";
import { u as useUserProfile } from "./useUserProfile-BWk44L_o.js";
import { a as messagesThreadPath } from "./messagesPaths-DTRnqq0a.js";
import { p as peerMetaFromMatchCandidate, e as ensureBuddyConversation, b as buildBuddyWelcomeMessage } from "./siteChat-Ca1zNh94.js";
import { C as CapsuleContextBanner } from "./CapsuleContextBanner-bsCrmr4p.js";
import "./maplibre-gl-H57bTsm_.js";
import "./defaultMapOrigin-DM9zdaEz.js";
import { a as MotionPage, M as MotionBlock } from "./MotionPage-Bc8Pg75O.js";
import "./vendor-three-Blpl5Qyv.js";
import "./moderate-B_EMCIaW.js";
import "./ai-CeNlrO9U.js";
import "./appMode-mvxqt0jz.js";
import "./credentials-BlGlDwm4.js";
import "./useInfiniteScroll-BdqSKKek.js";
import "./map-pinned-CwnGvlJZ.js";
import "./info-DlxnCctM.js";
import "./coordinates-D-_oeTwy.js";
import "./provider-CMJI8edA.js";
import "./knownOriginFallbacks-BTkbXw-0.js";
const TRAVEL_BUDDY_MATCH_FACTOR_LABELS = {
  scheduleDestination: "旅行时间·目的地",
  personality: "旅行人格兼容",
  interests: "兴趣标签重叠",
  budget: "预算范围接近"
};
const TRAVEL_BUDDY_MATCH_WEIGHTS = {
  scheduleDestination: 0.35,
  personality: 0.25,
  interests: 0.25,
  budget: 0.15
};
const DESTINATION_KEYWORDS = {
  /** 演示数据：同一目的地可能写在国家码、瞬间文案或 bio 里，用别名表做模糊命中 */
  杭州: ["CN", "杭州", "西湖"],
  成都: ["CN", "成都", "锦里"],
  厦门: ["CN", "厦门", "鼓浪屿"],
  西安: ["CN", "西安", "回民街"],
  冰岛: ["IS", "冰岛", "维克", "极光"],
  越南: ["VN", "越南", "河内", "胡志明"],
  清迈: ["TH", "清迈", "泰国"],
  日本: ["JP", "日本"],
  泰国: ["TH", "泰国", "清迈"]
};
const MS_PER_DAY = 864e5;
function normalizeText(value) {
  return value.trim().toLowerCase();
}
function getDestinationKeywords(destination) {
  const normalized = normalizeText(destination);
  for (const [key, keywords] of Object.entries(DESTINATION_KEYWORDS)) {
    if (normalized.includes(normalizeText(key))) {
      return keywords;
    }
  }
  return [destination];
}
function userTouchesDestination(user, destination) {
  const keywords = getDestinationKeywords(destination).map(normalizeText);
  const countryHit = user.visitedCountries.some(
    (code) => keywords.includes(normalizeText(code))
  );
  if (countryHit) {
    return true;
  }
  const momentHit = user.travelMoments.some((moment) => {
    const haystack = [moment.location, moment.countryCode, moment.content, moment.title].filter(Boolean).join(" ").toLowerCase();
    return keywords.some((keyword) => haystack.includes(keyword));
  });
  if (momentHit) {
    return true;
  }
  return keywords.some((keyword) => normalizeText(user.bio ?? "").includes(keyword));
}
function parseBudgetNumber(budgetLabel) {
  if (!budgetLabel) {
    return void 0;
  }
  const digits = budgetLabel.replace(/[^\d]/g, "");
  if (!digits) {
    return void 0;
  }
  return Number.parseInt(digits, 10);
}
function getSharedInterests(a, b) {
  return a.filter((interest) => b.includes(interest));
}
function findSeekingIntent(userId) {
  return DEMO_TRAVEL_BUDDY_SEEKING.find(
    (intent) => intent.userId === userId && intent.status === "open"
  );
}
function scoreDestinationMatch(queryDest, intentDest) {
  const query = normalizeText(queryDest);
  const intent = normalizeText(intentDest);
  if (!query || !intent) {
    return 30;
  }
  if (intent.includes(query) || query.includes(intent)) {
    return 100;
  }
  const keywords = getDestinationKeywords(queryDest).map(normalizeText);
  const regionHit = keywords.some(
    (keyword) => intent.includes(keyword) || query.includes(normalizeText(keyword))
  );
  if (regionHit) {
    return 72;
  }
  return 25;
}
function scoreDaysMatch(queryDays, intentDays) {
  if (queryDays == null || queryDays <= 0 || intentDays == null || intentDays <= 0) {
    return 55;
  }
  const delta = Math.abs(intentDays - queryDays);
  if (delta === 0) {
    return 100;
  }
  if (delta === 1) {
    return 88;
  }
  if (delta === 2) {
    return 72;
  }
  if (delta <= 4) {
    return 50;
  }
  return 28;
}
function scoreStartDateMatch(queryStart, intentStart) {
  if (!queryStart || !intentStart) {
    return 60;
  }
  const queryMs = Date.parse(queryStart);
  const intentMs = Date.parse(intentStart);
  if (Number.isNaN(queryMs) || Number.isNaN(intentMs)) {
    return 60;
  }
  const dayDelta = Math.abs(queryMs - intentMs) / MS_PER_DAY;
  if (dayDelta <= 3) {
    return 100;
  }
  if (dayDelta <= 7) {
    return 85;
  }
  if (dayDelta <= 14) {
    return 68;
  }
  if (dayDelta <= 30) {
    return 45;
  }
  return 22;
}
function scoreScheduleDestination(query, intent, candidate) {
  const destinationScore = scoreDestinationMatch(query.destination, intent.destination);
  const daysScore = scoreDaysMatch(query.days, intent.days);
  const dateScore = scoreStartDateMatch(query.startDate, intent.startDate);
  let composite = Math.round(destinationScore * 0.55 + daysScore * 0.25 + dateScore * 0.2);
  const hints = [];
  if (destinationScore >= 90) {
    hints.push(`同样想去${intent.destination}`);
  } else if (destinationScore >= 70) {
    hints.push("目的地在同一区域");
  }
  if (daysScore >= 88 && query.days != null) {
    hints.push(`行程 ${query.days} 天一致`);
  } else if (daysScore >= 70) {
    hints.push("行程天数接近");
  }
  if (dateScore >= 85 && query.startDate && intent.startDate) {
    hints.push("出发时间相近");
  }
  if (userTouchesDestination(candidate, query.destination)) {
    composite = Math.min(100, composite + 8);
    hints.push("对方有当地经验");
  }
  return { score: composite, hints };
}
function scoreInterestOverlap(viewerInterests, candidateInterests) {
  const shared = getSharedInterests(viewerInterests, candidateInterests);
  if (viewerInterests.length === 0 || candidateInterests.length === 0) {
    return { score: 48, shared };
  }
  const union = (/* @__PURE__ */ new Set([...viewerInterests, ...candidateInterests])).size;
  const jaccard = shared.length / union;
  const score = Math.round(jaccard * 100);
  const hint = shared.length > 0 ? `共同兴趣：${shared.map(getInterestLabel).join("、")}` : void 0;
  return { score, shared, hint };
}
function scoreBudgetProximity(queryBudget, intentBudget) {
  if (queryBudget == null || intentBudget == null) {
    return { score: 52 };
  }
  const max = Math.max(queryBudget, intentBudget, 1);
  const ratio = Math.abs(queryBudget - intentBudget) / max;
  if (ratio <= 0.08) {
    return { score: 100, hint: "预算几乎一致" };
  }
  if (ratio <= 0.2) {
    return { score: 88, hint: "预算区间接近" };
  }
  if (ratio <= 0.35) {
    return { score: 70, hint: "预算可协商" };
  }
  if (ratio <= 0.55) {
    return { score: 48 };
  }
  return { score: 25 };
}
function scorePersonality(viewer, candidate) {
  if (!viewer) {
    const base = candidate.travelPersonality.kind === TravelPersonalityKind.SocialButterfly ? 78 : 58;
    return { score: base };
  }
  const score = getPersonalityCompatibilityScore(
    viewer.travelPersonality.kind,
    candidate.travelPersonality.kind
  );
  let hint;
  if (score >= 90) {
    hint = `人格高度兼容（${candidate.travelPersonality.title}）`;
  } else if (score >= 75) {
    hint = "旅行人格互补";
  }
  return { score, hint };
}
function computeWeightedScore(factors) {
  const raw = factors.scheduleDestination * TRAVEL_BUDDY_MATCH_WEIGHTS.scheduleDestination + factors.personality * TRAVEL_BUDDY_MATCH_WEIGHTS.personality + factors.interests * TRAVEL_BUDDY_MATCH_WEIGHTS.interests + factors.budget * TRAVEL_BUDDY_MATCH_WEIGHTS.budget;
  return Math.min(99, Math.max(50, Math.round(raw)));
}
function buildMatchReasons(hints) {
  const unique = [...new Set(hints.filter((item) => Boolean(item)))];
  return unique.slice(0, 4);
}
function scoreCandidate(user, query, viewer, intent) {
  if (!user.privacySettings.allowCompanionRequests) {
    return null;
  }
  const schedule = scoreScheduleDestination(query, intent, user);
  const personality = scorePersonality(viewer, user);
  const interestSource = viewer ?? user;
  const interests = scoreInterestOverlap(interestSource.interests, user.interests);
  const budget = scoreBudgetProximity(
    parseBudgetNumber(query.budgetLabel),
    parseBudgetNumber(intent.budgetLabel)
  );
  const factorScores = {
    scheduleDestination: schedule.score,
    personality: personality.score,
    interests: interests.score,
    budget: budget.score
  };
  const matchScore = computeWeightedScore(factorScores);
  const matchReasons = buildMatchReasons([
    ...schedule.hints,
    personality.hint,
    interests.hint,
    budget.hint
  ]);
  if (matchReasons.length === 0) {
    matchReasons.push("开放结伴中");
  }
  return {
    userId: user.id,
    username: user.username,
    avatar: user.avatar,
    bio: user.bio,
    travelPersonality: user.travelPersonality,
    sharedInterests: interests.shared,
    matchScore,
    factorScores,
    seekingDestination: intent.destination,
    seekingDays: intent.days,
    seekingBudgetLabel: intent.budgetLabel,
    seekingStartDate: intent.startDate,
    seekingMessage: intent.message,
    interests: user.interests,
    visitedCountryCount: user.visitedCountries.length,
    matchReasons
  };
}
function matchTravelBuddies(query, options) {
  const limit = (options == null ? void 0 : options.limit) ?? 6;
  const viewer = options == null ? void 0 : options.viewer;
  const results = DEMO_USERS.filter((user) => user.id !== (options == null ? void 0 : options.excludeUserId)).map((user) => {
    const intent = findSeekingIntent(user.id);
    if (!intent) {
      return null;
    }
    return scoreCandidate(user, query, viewer, intent);
  }).filter((item) => item != null).sort((a, b) => b.matchScore - a.matchScore);
  return results.slice(0, limit);
}
function listOpenTravelBuddies(excludeUserId, viewer) {
  return DEMO_TRAVEL_BUDDY_SEEKING.filter((intent) => intent.userId !== excludeUserId).map((intent) => {
    const user = DEMO_USERS.find((item) => item.id === intent.userId);
    if (!user) {
      return null;
    }
    return scoreCandidate(
      user,
      {
        destination: intent.destination,
        days: intent.days,
        budgetLabel: intent.budgetLabel,
        startDate: intent.startDate,
        planTitle: intent.planTitle
      },
      viewer,
      intent
    );
  }).filter((item) => item != null).sort((a, b) => b.matchScore - a.matchScore);
}
function formatMatchScore(score) {
  return `${Math.round(score)}%`;
}
function describeMatchQuery(query) {
  const parts = [query.destination];
  if (query.days != null && query.days > 0) {
    parts.push(`${query.days} 天`);
  }
  if (query.budgetLabel) {
    parts.push(`预算 ${query.budgetLabel}`);
  }
  if (query.startDate) {
    parts.push(`出发 ${query.startDate.slice(0, 10)}`);
  }
  return parts.join(" · ");
}
function travelBuddyQueryFromRoute(travelBuddy, aiPlan) {
  var _a, _b;
  if ((_a = travelBuddy == null ? void 0 : travelBuddy.destination) == null ? void 0 : _a.trim()) {
    return {
      destination: travelBuddy.destination.trim(),
      days: travelBuddy.days,
      budgetLabel: travelBuddy.budgetLabel,
      planId: travelBuddy.planId,
      planTitle: travelBuddy.planTitle,
      startDate: travelBuddy.startDate
    };
  }
  if ((_b = aiPlan == null ? void 0 : aiPlan.destination) == null ? void 0 : _b.trim()) {
    return {
      destination: aiPlan.destination.trim(),
      days: aiPlan.days,
      budgetLabel: aiPlan.budget ? `¥${aiPlan.budget}` : void 0
    };
  }
  return null;
}
function getCountryHint(destination) {
  const keywords = getDestinationKeywords(destination);
  const code = keywords.find((item) => item.length === 2 && item === item.toUpperCase());
  return code ? getCountryLabel(code) : void 0;
}
function describeMatchAlgorithm() {
  return [
    `旅行时间·目的地 ${TRAVEL_BUDDY_MATCH_WEIGHTS.scheduleDestination * 100}%`,
    `旅行人格兼容 ${TRAVEL_BUDDY_MATCH_WEIGHTS.personality * 100}%`,
    `兴趣标签重叠 ${TRAVEL_BUDDY_MATCH_WEIGHTS.interests * 100}%`,
    `预算范围接近 ${TRAVEL_BUDDY_MATCH_WEIGHTS.budget * 100}%`
  ].join(" · ");
}
const FACTOR_ORDER = [
  "scheduleDestination",
  "personality",
  "interests",
  "budget"
];
function MatchScoreRing({ score }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - score / 100 * circumference;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "relative flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center",
      "aria-label": `匹配度 ${formatMatchScore(score)}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "h-full w-full -rotate-90", viewBox: "0 0 72 72", "aria-hidden": true, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "36", cy: "36", r: radius, fill: "none", strokeWidth: "6", className: "stroke-slate-200" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "circle",
            {
              cx: "36",
              cy: "36",
              r: radius,
              fill: "none",
              strokeWidth: "6",
              strokeLinecap: "round",
              className: "stroke-violet-500",
              strokeDasharray: circumference,
              strokeDashoffset: offset
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-bold tabular-nums leading-none text-violet-700", children: Math.round(score) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-medium text-slate-500", children: "匹配度" })
        ] })
      ]
    }
  );
}
function TravelBuddyMatchCard({
  candidate,
  onStartChat,
  className
}) {
  const [detailsOpen, setDetailsOpen] = reactExports.useState(false);
  const handleChat = reactExports.useCallback(() => {
    onStartChat(candidate);
  }, [candidate, onStartChat]);
  const handleToggleDetails = reactExports.useCallback(() => {
    setDetailsOpen((prev) => !prev);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "article",
    {
      className: cn(
        "flex flex-col rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm",
        className
      ),
      "aria-label": `${candidate.username}，匹配度 ${formatMatchScore(candidate.matchScore)}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MatchScoreRing, { score: candidate.matchScore }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
              candidate.avatar ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                AvatarImage,
                {
                  src: candidate.avatar,
                  displayName: candidate.username,
                  size: 44,
                  className: "h-11 w-11 shrink-0 rounded-xl ring-2 ring-violet-100"
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-base font-bold text-violet-700",
                  "aria-hidden": true,
                  children: candidate.username.slice(0, 1)
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "truncate text-base font-semibold text-slate-900", children: candidate.username }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-violet-700", children: candidate.travelPersonality.title })
              ] })
            ] }),
            candidate.bio && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600", children: candidate.bio }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-500", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Earth, { className: "h-3 w-3", "aria-hidden": true }),
                "去过 ",
                candidate.visitedCountryCount,
                " 国"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "h-3 w-3", "aria-hidden": true }),
                candidate.seekingDestination,
                " · ",
                candidate.seekingDays,
                " 天"
              ] })
            ] }),
            candidate.interests.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-2 flex flex-wrap gap-1", "aria-label": "兴趣标签", children: candidate.interests.map((interest) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "li",
              {
                className: cn(
                  "rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                  candidate.sharedInterests.includes(interest) ? "bg-cyan-100 text-cyan-800" : "bg-slate-100 text-slate-600"
                ),
                children: getInterestLabel(interest)
              },
              interest
            )) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-4 rounded-xl border border-cyan-100 bg-cyan-50/50 p-3", "aria-label": "匹配原因", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-semibold text-cyan-900", children: "匹配原因" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-2 space-y-1.5", children: candidate.matchReasons.map((reason) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-2 text-xs leading-relaxed text-cyan-950", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-600", "aria-hidden": true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: reason })
          ] }, reason)) }),
          candidate.seekingMessage && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 border-t border-cyan-100/80 pt-2 text-xs italic text-cyan-800/90", children: [
            "「",
            candidate.seekingMessage,
            "」"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: handleToggleDetails,
            className: "mt-3 inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 hover:text-slate-700",
            "aria-expanded": detailsOpen,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ChevronDown,
                {
                  className: cn("h-3.5 w-3.5 transition", detailsOpen && "rotate-180"),
                  "aria-hidden": true
                }
              ),
              detailsOpen ? "收起维度得分" : "查看四维得分"
            ]
          }
        ),
        detailsOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("dl", { className: "mt-2 grid grid-cols-2 gap-2 text-[10px]", children: FACTOR_ORDER.map((key) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-slate-50 px-2 py-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-slate-500", children: TRAVEL_BUDDY_MATCH_FACTOR_LABELS[key] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("dd", { className: "font-semibold tabular-nums text-slate-800", children: [
            candidate.factorScores[key],
            "%"
          ] })
        ] }, key)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-col gap-2 sm:flex-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: handleChat,
              className: "inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4", "aria-hidden": true }),
                "发起聊天"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: userProfilePath(candidate.userId),
              className: "inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-brand-200 hover:text-brand-700",
              children: "查看主页"
            }
          )
        ] })
      ]
    }
  );
}
function TravelBuddyMatch({ context, className }) {
  var _a;
  const navigate = useNavigate();
  const { user: viewer } = useUserProfile();
  const candidates = reactExports.useMemo(() => {
    var _a2;
    if ((_a2 = context == null ? void 0 : context.destination) == null ? void 0 : _a2.trim()) {
      return matchTravelBuddies(context, {
        excludeUserId: (viewer == null ? void 0 : viewer.id) ?? DEMO_CURRENT_USER_ID,
        viewer
      });
    }
    return listOpenTravelBuddies((viewer == null ? void 0 : viewer.id) ?? DEMO_CURRENT_USER_ID, viewer);
  }, [context, viewer]);
  const handleStartChat = reactExports.useCallback(
    (candidate) => {
      const peer = peerMetaFromMatchCandidate(candidate);
      ensureBuddyConversation(peer, buildBuddyWelcomeMessage(candidate));
      navigate(messagesThreadPath(candidate.userId));
    },
    [navigate]
  );
  const countryHint = (context == null ? void 0 : context.destination) ? getCountryHint(context.destination) : void 0;
  const hasContext = Boolean((_a = context == null ? void 0 : context.destination) == null ? void 0 : _a.trim());
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      className: cn(
        "rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50 via-white to-cyan-50 p-5 shadow-sm sm:p-6",
        className
      ),
      "aria-labelledby": "travel-buddy-match-title",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-violet-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3.5 w-3.5", "aria-hidden": true }),
              "Buddy Match"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { id: "travel-buddy-match-title", className: "mt-1 text-base font-semibold text-slate-900", children: "匹配结果" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-600", children: "按匹配度排序，发起聊天将在站内消息中继续" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[10px] text-slate-400", children: describeMatchAlgorithm() })
          ] }),
          hasContext && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-violet-200/60 bg-white/80 px-3 py-2 text-right text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-violet-800", children: (context == null ? void 0 : context.planTitle) ?? "当前行程" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-slate-600", children: describeMatchQuery(context) }),
            countryHint && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 text-slate-400", children: [
              "区域：",
              countryHint
            ] })
          ] })
        ] }),
        candidates.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 rounded-xl border border-dashed border-slate-200 bg-white/60 py-10 text-center text-sm text-slate-500", children: "暂无符合条件的旅伴，试试调整目的地或稍后再来" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-4 grid gap-4 sm:grid-cols-2", children: candidates.map((candidate) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TravelBuddyMatchCard, { candidate, onStartChat: handleStartChat }) }, candidate.userId)) }),
        !hasContext && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 flex items-center gap-1.5 text-xs text-slate-500", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-violet-500", "aria-hidden": true }),
          "从旅行计划详情点击「寻找旅伴」可带入目的地与预算，获得更精准推荐"
        ] })
      ]
    }
  );
}
function MotionCard({ children, className = "", as = "article" }) {
  const reduceMotion = useReducedMotion();
  const Component = motion[as];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Component,
    {
      variants: staggerItem,
      whileHover: reduceMotion ? void 0 : {
        y: -4,
        boxShadow: "0 12px 28px -8px rgba(15, 23, 42, 0.18)"
      },
      whileTap: reduceMotion ? void 0 : { scale: 0.99 },
      transition: { type: "spring", stiffness: 400, damping: 28 },
      className: cn(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
        "transition-colors hover:border-brand-200",
        className
      ),
      children
    }
  );
}
function isStructuredGuide(guide) {
  return guide.kind === "structured" || guide.id.startsWith("user-guide-");
}
function GuideCardList({
  guides,
  title = "推荐攻略",
  subtitle
}) {
  const reduceMotion = useReducedMotion();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-slate-900", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-600", children: subtitle ?? `共 ${guides.length} 条，点击卡片查看详情` }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.ul,
      {
        className: "mt-4 grid gap-3",
        variants: staggerContainer,
        initial: "hidden",
        animate: "visible",
        transition: motionTransition(reduceMotion),
        children: guides.map((guide) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(MotionCard, { className: "block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: guideDetailPath(guide.id),
              className: "block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-medium uppercase tracking-wide text-brand-600", children: [
                      guide.city,
                      isStructuredGuide(guide) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold normal-case text-emerald-800", children: SLIME_TRAIL_PUBLISHER.structuredBadge })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-0.5 text-sm font-semibold text-slate-900", children: guide.title })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex shrink-0 items-center gap-0.5 text-brand-600", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600", children: guide.budget }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4", "aria-hidden": true })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: guide.days }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "· 更新 ",
                    formatRelativeZh(guide.updatedAt)
                  ] }),
                  guide.tags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-md bg-brand-50 px-1.5 py-0.5 text-brand-700", children: tag }, tag))
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: paths.home,
              className: "mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5", "aria-hidden": true }),
                "在地图中查看"
              ]
            }
          )
        ] }) }, guide.id))
      },
      guides.map((g) => g.id).join(",")
    ),
    guides.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.p,
      {
        initial: reduceMotion ? false : { opacity: 0 },
        animate: { opacity: 1 },
        className: "mt-4 text-sm text-slate-500",
        children: [
          SNAIL_UI_COPY.guidesListEmpty,
          "        "
        ]
      }
    )
  ] });
}
function GuidesAiBanner({ state }) {
  var _a;
  const [dismissed, setDismissed] = reactExports.useState(false);
  if (dismissed || !state) {
    return null;
  }
  const dream = (_a = state.aiDream) == null ? void 0 : _a.trim();
  const plan = state.aiPlan;
  const buddy = state.travelBuddy;
  if (!dream && !plan && !buddy) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      className: `relative rounded-2xl border p-4 shadow-sm ${state.source === "capsule_one" ? "border-cyan-400/35 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 text-cyan-50" : "border-cyan-400/40 bg-gradient-to-r from-cyan-50 to-violet-50"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setDismissed(true),
            className: "absolute right-3 top-3 rounded-lg p-1 text-slate-400 hover:bg-white/60 hover:text-slate-600",
            "aria-label": "关闭提示",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4", "aria-hidden": true })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "p",
          {
            className: `inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider ${state.source === "capsule_one" ? "text-cyan-300/80" : "text-cyan-700"}`,
            children: buddy ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3.5 w-3.5", "aria-hidden": true }),
              "寻找旅伴"
            ] }) : state.source === "capsule_one" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Compass, { className: "h-3.5 w-3.5", "aria-hidden": true }),
              "Capsule One 注入"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "h-3.5 w-3.5", "aria-hidden": true }),
              "AI 规划上下文"
            ] })
          }
        ),
        buddy && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 pr-8 text-sm text-slate-800", children: [
          "已带入行程",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-violet-700", children: [
            "「",
            buddy.planTitle,
            "」"
          ] }),
          "，正在为你匹配",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-violet-700", children: buddy.destination }),
          "相关攻略与同频出行灵感。"
        ] }),
        buddy && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-slate-600", children: [
          buddy.days,
          " 天 · 预算 ",
          buddy.budgetLabel,
          " · 可在下方关键词继续筛选"
        ] }),
        dream && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 pr-8 text-sm text-slate-800", children: [
          "正在根据你的想法筛选：",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-violet-700", children: [
            "「",
            dream,
            "」"
          ] })
        ] }),
        plan && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-slate-600", children: [
          plan.destination && `目的地：${plan.destination} · `,
          plan.days,
          " 天 · 预算约 ¥",
          plan.budget
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-slate-500", children: buddy ? "下方已根据行程推荐同频旅伴，可发起结伴申请。" : "完整 AI 行程生成即将接入，当前为攻略智能匹配。" })
      ]
    }
  );
}
function GuidesPage() {
  var _a, _b, _c, _d;
  usePageSeo(guidesPageSeo());
  const location = useLocation();
  const routeState = location.state ?? null;
  const buddyQuery = travelBuddyQueryFromRoute(routeState == null ? void 0 : routeState.travelBuddy, routeState == null ? void 0 : routeState.aiPlan);
  const { searchQuery, guides, isDebouncing } = useFilteredGuides();
  const setSearchQuery = useUiStore((state) => state.setSearchQuery);
  reactExports.useEffect(() => {
    var _a2, _b2, _c2, _d2, _e;
    const dream = (_a2 = routeState == null ? void 0 : routeState.aiDream) == null ? void 0 : _a2.trim();
    const destination = ((_c2 = (_b2 = routeState == null ? void 0 : routeState.aiPlan) == null ? void 0 : _b2.destination) == null ? void 0 : _c2.trim()) || ((_e = (_d2 = routeState == null ? void 0 : routeState.travelBuddy) == null ? void 0 : _d2.destination) == null ? void 0 : _e.trim());
    if (dream) {
      setSearchQuery(dream);
    } else if (destination) {
      setSearchQuery(destination);
    }
  }, [
    routeState == null ? void 0 : routeState.aiDream,
    (_a = routeState == null ? void 0 : routeState.aiPlan) == null ? void 0 : _a.destination,
    (_b = routeState == null ? void 0 : routeState.travelBuddy) == null ? void 0 : _b.destination,
    setSearchQuery
  ]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MotionPage, { className: "flex flex-col gap-4", children: [
    (routeState == null ? void 0 : routeState.source) !== "capsule_one" ? /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(GuidesAiBanner, { state: routeState }) }) : null,
    (routeState == null ? void 0 : routeState.source) === "capsule_one" && (((_c = routeState.aiPlan) == null ? void 0 : _c.destination) || routeState.aiDream) ? /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      CapsuleContextBanner,
      {
        destination: ((_d = routeState.aiPlan) == null ? void 0 : _d.destination) ?? routeState.aiDream,
        dream: routeState.aiDream,
        source: "capsule_one",
        variant: "guides"
      }
    ) }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TravelBuddyMatch, { context: buddyQuery }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-base font-semibold text-slate-900", children: SNAIL_UI_COPY.guidesLibraryTitle }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-600", children: SNAIL_UI_COPY.guidesLibrarySubtitle }),
          "            "
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: paths.guidesPublish,
            className: "inline-flex items-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-105",
            children: SLIME_TRAIL_PUBLISHER.title
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { id: "guides-search-label", className: "mt-4 text-sm font-medium text-slate-700", children: [
        "关键词",
        isDebouncing && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-xs font-normal text-slate-400", children: "筛选中…" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "search",
          "aria-labelledby": "guides-search-label",
          value: searchQuery,
          onChange: (event) => setSearchQuery(event.target.value),
          placeholder: SNAIL_UI_COPY.guidesSearchPlaceholder,
          className: "mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      GuideCardList,
      {
        guides,
        title: SNAIL_UI_COPY.guidesListTitle,
        subtitle: "点击卡片查看黏液轨迹详情，或在卡片内打开地图"
      }
    ) })
  ] });
}
export {
  GuidesPage as default
};
