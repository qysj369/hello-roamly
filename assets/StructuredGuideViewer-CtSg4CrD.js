import { e0 as readEnv, bH as ensureCuratedPublishedGuidesSeeded, dY as publishedRecordToGuide, bA as demoGuides, dh as http, S as GUIDES_API, e$ as useQuery, d_ as queryKeys, c as AI_SNAIL_COST_ROWS, bl as cn, an as SNAIL_UI_COPY, Z as Link, ah as SNAIL_COMMUNITY, dS as paths, G as Copy, at as Sparkles } from "./index-DwV1qlqh.js";
import { j as jsxRuntimeExports, a as reactExports } from "./vendor-react-DtfH6MSw.js";
import { S as SnailSlangTerm } from "./SnailSlangTerm-Dp9sc9n7.js";
import { C as Check } from "./check-fuogZiuU.js";
import { a as SLIME_TRAIL_PUBLISHER } from "./slimeTrail-CE9U9eJw.js";
async function fetchGuideDetail(id) {
  const trimmedId = id.trim();
  if (!trimmedId) {
    throw new Error("攻略 id 不能为空");
  }
  if (!readEnv("VITE_API_BASE_URL")) {
    const published = ensureCuratedPublishedGuidesSeeded().find((item) => item.id === trimmedId);
    if (published) {
      return publishedRecordToGuide(published);
    }
    const guide = demoGuides.find((item) => item.id === trimmedId);
    if (!guide) {
      throw new Error(`攻略不存在：${trimmedId}`);
    }
    return { ...guide, kind: "template" };
  }
  const { data } = await http.get(GUIDES_API.detail(trimmedId));
  return data;
}
const guideDetailQueryKey = (id) => queryKeys.guides.detail(id);
function useGuideDetail(id) {
  return useQuery({
    queryKey: guideDetailQueryKey(id ?? ""),
    queryFn: () => fetchGuideDetail(id),
    enabled: Boolean(id == null ? void 0 : id.trim())
  });
}
const STRUCTURED_GUIDE_SECTIONS = [
  { id: "sg-cost", label: "花费清单" },
  { id: "sg-journal", label: "行程流水账" },
  { id: "sg-insights", label: "蜗牛启示", slangId: "snail-insights" }
];
const STRUCTURED_GUIDE_EDITOR_TARGETS = {
  title: "guide-title",
  destination: "guide-destination",
  days: "guide-days",
  cost: "sg-edit-cost",
  journal: "sg-edit-journal",
  insights: "sg-edit-insights"
};
const STRUCTURED_GUIDE_FORM_CARDS = [
  {
    card: 1,
    sectionId: STRUCTURED_GUIDE_SECTIONS[0].id,
    editorId: "sg-edit-cost",
    title: "【花费清单】",
    subtitle: "交通 · 住宿 · 餐饮 · 门票/娱乐 · 自动加总",
    aiField: "costBreakdown"
  },
  {
    card: 2,
    sectionId: STRUCTURED_GUIDE_SECTIONS[1].id,
    editorId: "sg-edit-journal",
    title: "【行程流水账】",
    subtitle: "按天叙述 · 开销明细 · 实用贴士",
    aiField: "dailyJournal"
  },
  {
    card: 3,
    sectionId: STRUCTURED_GUIDE_SECTIONS[2].id,
    editorId: "sg-edit-insights",
    title: "【蜗牛启示】",
    titleSlangId: "snail-insights",
    subtitle: "避坑雷达 · 宝藏点",
    aiField: "snailInsights"
  }
];
const GUIDE_PUBLISH_COST_FIELDS = AI_SNAIL_COST_ROWS.map((row) => ({
  key: row.key,
  label: row.label,
  aiPath: `costBreakdown.${row.key}`,
  amountField: "amount",
  tipsField: "savingTips"
}));
const GUIDE_PUBLISH_JOURNAL_FIELDS = {
  narrative: { label: "当天行程" },
  expenses: { label: "开销明细" },
  expenseItem: { label: "项目" },
  expenseAmount: { label: "金额" },
  tips: { label: "实用贴士" }
};
const GUIDE_PUBLISH_INSIGHT_FIELDS = {
  regrets: { slangId: "pitfall-radar" },
  recommendations: {
    slangId: "treasure-spot"
  }
};
function StructuredGuideConstitutionCard({
  cardNumber,
  title,
  titleSlangId,
  subtitle,
  id,
  children,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      id,
      className: cn(
        "scroll-mt-24 overflow-hidden rounded-2xl border-2 border-slate-200/90 bg-white shadow-sm",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "border-b border-slate-100 bg-gradient-to-r from-slate-50 to-emerald-50/40 px-4 py-3 sm:px-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex h-6 min-w-[2.5rem] items-center justify-center rounded-md bg-emerald-600 px-2 text-[10px] font-bold uppercase tracking-wide text-white", children: [
              "卡",
              cardNumber
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-bold text-slate-900", children: titleSlangId ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              "【",
              /* @__PURE__ */ jsxRuntimeExports.jsx(SnailSlangTerm, { id: titleSlangId }),
              "】"
            ] }) : title })
          ] }),
          subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: subtitle })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 sm:p-5", children })
      ]
    }
  );
}
function SnailCultureHint({
  message = SNAIL_UI_COPY.guideDetailGlossaryHint,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: cn("text-center text-xs text-slate-500", className), children: [
    message,
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: paths.snailCulture,
        className: "ml-1 font-medium text-emerald-700 underline-offset-2 hover:underline",
        children: SNAIL_COMMUNITY.glossaryTitle
      }
    )
  ] });
}
function formatStructuredGuidePlainText(guide) {
  const lines = [
    guide.title,
    `${guide.destination} · ${guide.days} 天 · 预算 ${guide.budgetLabel} · ${guide.interests.join("、")}`,
    "",
    "【花费清单】"
  ];
  for (const row of AI_SNAIL_COST_ROWS) {
    const item = guide.costBreakdown[row.key];
    lines.push(`- ${row.label}：¥${item.amount}`);
    for (const tip of item.savingTips) {
      lines.push(`  · ${tip}`);
    }
  }
  lines.push(`- 总计：¥${guide.costBreakdown.total}`);
  lines.push("");
  lines.push("【行程流水账】");
  for (const day of guide.dailyJournal) {
    lines.push(`第 ${day.day} 天`);
    lines.push(day.narrative);
    if (day.expenses.length > 0) {
      lines.push(
        `开销：${day.expenses.map((expense) => `${expense.item} ¥${expense.amount}`).join("、")}`
      );
    }
    for (const tip of day.tips) {
      lines.push(`贴士：${tip}`);
    }
    lines.push("");
  }
  lines.push("【蜗牛启示】");
  lines.push(`最后悔的事/避坑：${guide.snailInsights.regrets}`);
  lines.push(`最推荐的事/宝藏：${guide.snailInsights.recommendations}`);
  return lines.join("\n");
}
async function copyStructuredGuidePlainText(guide) {
  var _a;
  if (typeof navigator === "undefined" || !((_a = navigator.clipboard) == null ? void 0 : _a.writeText)) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(formatStructuredGuidePlainText(guide));
    return true;
  } catch {
    return false;
  }
}
function StructuredGuideCopyButton({
  guide,
  className
}) {
  const [copied, setCopied] = reactExports.useState(false);
  const handleCopy = reactExports.useCallback(async () => {
    const ok = await copyStructuredGuidePlainText(guide);
    if (!ok) {
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2e3);
  }, [guide]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      type: "button",
      onClick: () => {
        void handleCopy();
      },
      className: cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50",
        className
      ),
      children: copied ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5 text-emerald-600", "aria-hidden": true }),
        "已复制"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3.5 w-3.5", "aria-hidden": true }),
        "复制攻略全文"
      ] })
    }
  );
}
function StructuredGuideCostSummary({
  breakdown,
  budgetLabel,
  className
}) {
  const segments = AI_SNAIL_COST_ROWS.map((row) => ({
    key: row.key,
    label: row.label,
    amount: breakdown[row.key].amount
  }));
  const maxAmount = Math.max(...segments.map((segment) => segment.amount), 1);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className), children: [
    segments.map((segment) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "rounded-xl border border-slate-200/80 bg-slate-50/80 p-3",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: segment.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-lg font-bold text-emerald-700", children: [
            "¥",
            segment.amount
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500",
              style: { width: `${Math.max(8, segment.amount / maxAmount * 100)}%` }
            }
          ) })
        ]
      },
      segment.key
    )),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 sm:col-span-2 lg:col-span-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-baseline justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-emerald-900", children: "人均总计" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-emerald-800", children: [
          "¥",
          breakdown.total
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-emerald-800/80", children: [
        "预算档位：",
        budgetLabel
      ] })
    ] })
  ] });
}
function StructuredGuideSectionNav({
  className,
  sticky = true,
  activeSectionId
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "nav",
    {
      className: cn(
        "flex flex-wrap gap-2 rounded-xl border border-slate-200/90 bg-white/95 p-2 shadow-sm backdrop-blur-sm",
        sticky && "lg:sticky lg:top-20 lg:z-10",
        className
      ),
      "aria-label": "攻略板块导航",
      children: STRUCTURED_GUIDE_SECTIONS.map((section) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          href: `#${section.id}`,
          "aria-current": activeSectionId === section.id ? "location" : void 0,
          className: cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
            activeSectionId === section.id ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
          ),
          children: [
            "slangId" in section && section.slangId ? /* @__PURE__ */ jsxRuntimeExports.jsx(SnailSlangTerm, { id: section.slangId }) : section.label,
            "        "
          ]
        },
        section.id
      ))
    }
  );
}
function useStructuredGuideSectionSpy(enabled = true) {
  var _a;
  const [activeSectionId, setActiveSectionId] = reactExports.useState(
    ((_a = STRUCTURED_GUIDE_SECTIONS[0]) == null ? void 0 : _a.id) ?? null
  );
  reactExports.useEffect(() => {
    if (!enabled || typeof IntersectionObserver === "undefined") {
      return void 0;
    }
    const sectionIds = STRUCTURED_GUIDE_SECTIONS.map((section) => section.id);
    const elements = sectionIds.map((id) => document.getElementById(id)).filter((element) => element !== null);
    if (elements.length === 0) {
      return void 0;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        var _a2;
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const nextId = (_a2 = visible[0]) == null ? void 0 : _a2.target.id;
        if (nextId && sectionIds.includes(nextId)) {
          setActiveSectionId(nextId);
        }
      },
      { rootMargin: "-15% 0px -55% 0px", threshold: [0, 0.2, 0.5, 0.8] }
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [enabled]);
  return activeSectionId;
}
function formatStructuredGuideCoreTag(guide) {
  const destination = guide.destination.trim() || "—";
  const days = Math.max(1, guide.days);
  const total = guide.costBreakdown.total;
  return `${destination} · ${days}天 · 人均¥${total}`;
}
const insightFields = GUIDE_PUBLISH_INSIGHT_FIELDS;
function StructuredGuideViewer({
  guide,
  variant = "default",
  className
}) {
  const isCompact = variant === "compact";
  const isDetail = variant === "default";
  const useConstitutionCards = isDetail || variant === "preview";
  const enableSectionSpy = isDetail;
  const activeSectionId = useStructuredGuideSectionSpy(enableSectionSpy);
  const coreTag = formatStructuredGuideCoreTag(guide);
  const costCard = STRUCTURED_GUIDE_FORM_CARDS[0];
  const journalCard = STRUCTURED_GUIDE_FORM_CARDS[1];
  const insightsCard = STRUCTURED_GUIDE_FORM_CARDS[2];
  const costTable = /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-xl border border-slate-200 bg-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full min-w-[20rem] text-left text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-slate-50 text-xs uppercase tracking-wide text-slate-500", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 font-semibold", children: "分项" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 font-semibold", children: "金额（元）" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 font-semibold", children: "节省技巧" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-slate-100", children: [
      AI_SNAIL_COST_ROWS.map((row) => {
        const item = guide.costBreakdown[row.key];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 font-medium text-slate-800", children: row.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-3 whitespace-nowrap text-emerald-700", children: [
            "¥",
            item.amount
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-slate-600", children: item.savingTips.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "list-disc space-y-1 pl-4", children: item.savingTips.map((tip) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: tip }, tip)) }) : "—" })
        ] }, row.key);
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-emerald-50/60 font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-slate-900", children: SNAIL_UI_COPY.costTotalHint }),
        "            ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-3 text-emerald-800", children: [
          "¥",
          guide.costBreakdown.total
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-3 text-xs font-normal text-slate-500", children: [
          "预算档位 ",
          guide.budgetLabel
        ] })
      ] })
    ] })
  ] }) });
  const journalTimeline = /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "relative space-y-4 border-l-2 border-emerald-200/80 pl-4 sm:pl-6", children: guide.dailyJournal.map((day) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: "absolute -left-[1.35rem] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white sm:-left-[1.6rem]",
        "aria-hidden": true,
        children: day.day
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold uppercase tracking-wide text-emerald-700", children: [
        "第 ",
        day.day,
        " 天"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 leading-relaxed text-slate-800", children: day.narrative || "（待填写当天行程）" }),
      day.expenses.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex flex-wrap gap-2", children: day.expenses.map((expense, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "span",
        {
          className: "rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700",
          children: [
            expense.item,
            " ¥",
            expense.amount
          ]
        },
        `${expense.item}-${index}`
      )) }),
      day.tips.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 list-disc space-y-1 pl-5 text-xs text-slate-600", children: day.tips.map((tip) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: tip }, tip)) })
    ] })
  ] }, day.day)) });
  const insightsGrid = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-amber-200/80 bg-amber-50/50 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-amber-800", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SnailSlangTerm, { id: insightFields.regrets.slangId }) }),
      "        ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 leading-relaxed text-slate-800", children: guide.snailInsights.regrets || "—" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-emerald-800", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SnailSlangTerm, { id: insightFields.recommendations.slangId }) }),
      "        ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 leading-relaxed text-slate-800", children: guide.snailInsights.recommendations || "—" })
    ] })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "article",
    {
      className: cn(
        "structured-guide-viewer",
        variant === "preview" && "rounded-2xl border border-slate-200 bg-slate-50/50 p-4",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "space-y-3 border-b border-slate-100 pb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3", "aria-hidden": true }),
              SLIME_TRAIL_PUBLISHER.structuredBadge
            ] }),
            variant === "preview" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-medium text-slate-600", children: SLIME_TRAIL_PUBLISHER.previewBadge }),
            isDetail && /* @__PURE__ */ jsxRuntimeExports.jsx(StructuredGuideCopyButton, { guide })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "h3",
              {
                className: cn(
                  "font-bold text-slate-900",
                  isCompact ? "text-base" : "text-lg sm:text-xl"
                ),
                children: [
                  guide.title || SNAIL_UI_COPY.guideUnnamed,
                  "          "
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: cn(
                  "mt-2 font-semibold text-emerald-800",
                  isCompact ? "text-sm" : "text-base sm:text-lg"
                ),
                children: coreTag
              }
            ),
            guide.interests.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: guide.interests.join(" · ") })
          ] }),
          !isCompact && /* @__PURE__ */ jsxRuntimeExports.jsx(
            StructuredGuideCostSummary,
            {
              breakdown: guide.costBreakdown,
              budgetLabel: guide.budgetLabel
            }
          )
        ] }),
        !isCompact && /* @__PURE__ */ jsxRuntimeExports.jsx(StructuredGuideSectionNav, { className: "my-4", activeSectionId }),
        !isCompact && useConstitutionCards && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            StructuredGuideConstitutionCard,
            {
              cardNumber: costCard.card,
              id: costCard.sectionId,
              title: costCard.title,
              subtitle: costCard.subtitle,
              children: costTable
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            StructuredGuideConstitutionCard,
            {
              cardNumber: journalCard.card,
              id: journalCard.sectionId,
              title: journalCard.title,
              subtitle: journalCard.subtitle,
              children: journalTimeline
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            StructuredGuideConstitutionCard,
            {
              cardNumber: insightsCard.card,
              id: insightsCard.sectionId,
              title: insightsCard.title,
              titleSlangId: insightsCard.titleSlangId,
              subtitle: insightsCard.subtitle,
              children: insightsGrid
            }
          )
        ] }),
        isDetail && /* @__PURE__ */ jsxRuntimeExports.jsx(SnailCultureHint, { className: "mt-6" }),
        isCompact && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-slate-500", children: coreTag })
      ]
    }
  );
}
export {
  GUIDE_PUBLISH_COST_FIELDS as G,
  STRUCTURED_GUIDE_EDITOR_TARGETS as S,
  GUIDE_PUBLISH_INSIGHT_FIELDS as a,
  GUIDE_PUBLISH_JOURNAL_FIELDS as b,
  STRUCTURED_GUIDE_FORM_CARDS as c,
  StructuredGuideConstitutionCard as d,
  StructuredGuideViewer as e,
  guideDetailQueryKey as g,
  useGuideDetail as u
};
