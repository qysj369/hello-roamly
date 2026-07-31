import { j as jsxRuntimeExports, a as reactExports } from "./vendor-react-DtfH6MSw.js";
import { d as StructuredGuideConstitutionCard, c as STRUCTURED_GUIDE_FORM_CARDS, G as GUIDE_PUBLISH_COST_FIELDS, a as GUIDE_PUBLISH_INSIGHT_FIELDS, b as GUIDE_PUBLISH_JOURNAL_FIELDS, S as STRUCTURED_GUIDE_EDITOR_TARGETS, e as StructuredGuideViewer, g as guideDetailQueryKey } from "./StructuredGuideViewer-CtSg4CrD.js";
import { bw as createLucideIcon, bl as cn, e2 as recalculateCostTotal, an as SNAIL_UI_COPY, y as ChevronDown, _ as LoaderCircle, bb as buildStructuredGuideContent, fc as writePublishedGuidesToStorage, bH as ensureCuratedPublishedGuidesSeeded, f0 as useQueryClient, aP as aiSnailGuideToEditorDraft, ez as syncDailyJournalWithDays, f9 as validateGuidePublishDraft, b7 as buildPublishedGuideRecord, L as DEMO_CURRENT_USER_ID, aV as awardGuidePublished, d3 as guideListQueryKey, Z as Link, d2 as guideDetailPath, dS as paths } from "./index-DwV1qlqh.js";
import { S as SnailSlangTerm } from "./SnailSlangTerm-Dp9sc9n7.js";
import { P as Plus } from "./plus-CkCpxI1f.js";
import { T as Trash2 } from "./trash-2-DMzHlprq.js";
import { a as SLIME_TRAIL_PUBLISHER } from "./slimeTrail-CE9U9eJw.js";
import { C as CircleCheck } from "./circle-check-DVB7QD2m.js";
import { P as Pencil } from "./pencil-BlnFE1Bo.js";
import { i as create } from "./vendor-three-Blpl5Qyv.js";
/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }]];
const Circle = createLucideIcon("circle", __iconNode$1);
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
      d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
      key: "1nclc0"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
const Eye = createLucideIcon("eye", __iconNode);
function FieldLabel({ children, htmlFor }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor, className: "mb-1 block text-xs font-semibold text-slate-700", children });
}
function TextInput({
  id,
  value,
  onChange,
  placeholder,
  className,
  type = "text",
  readOnly
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "input",
    {
      id,
      type,
      value,
      readOnly,
      onChange: onChange ? (event) => onChange(event.target.value) : void 0,
      placeholder,
      className: cn(
        "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900",
        "focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25",
        readOnly && "cursor-default bg-slate-50 text-emerald-800",
        className
      )
    }
  );
}
function TextArea({
  id,
  value,
  onChange,
  placeholder,
  rows = 4
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "textarea",
    {
      id,
      value,
      onChange: (event) => onChange(event.target.value),
      placeholder,
      rows,
      className: "w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm leading-relaxed text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
    }
  );
}
const cardMeta$2 = STRUCTURED_GUIDE_FORM_CARDS[0];
function GuidePublishCostCard({ draft, onUpdateCostItem }) {
  const autoTotal = recalculateCostTotal(draft);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    StructuredGuideConstitutionCard,
    {
      cardNumber: cardMeta$2.card,
      id: cardMeta$2.editorId,
      title: cardMeta$2.title,
      subtitle: cardMeta$2.subtitle,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-xl border border-slate-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full min-w-[32rem] text-left text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-slate-50 text-xs uppercase tracking-wide text-slate-500", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 font-semibold", children: "分项" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-28 px-3 py-2.5 font-semibold", children: "金额（元）" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2.5 font-semibold", children: "节省技巧（每行一条）" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-slate-100", children: [
          GUIDE_PUBLISH_COST_FIELDS.map((field) => {
            const item = draft.costBreakdown[field.key];
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "align-top", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 font-medium text-slate-800", children: field.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextInput,
                {
                  id: `cost-${field.key}-amount`,
                  type: "number",
                  value: item.amount,
                  onChange: (value) => onUpdateCostItem(field.key, { amount: value }),
                  placeholder: "0",
                  className: "min-w-[5rem]"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextArea,
                {
                  id: `cost-${field.key}-tips`,
                  value: item.savingTips,
                  onChange: (value) => onUpdateCostItem(field.key, { savingTips: value }),
                  rows: 2,
                  placeholder: "例如：买地铁日票更划算"
                }
              ) })
            ] }, field.key);
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-emerald-50/70 font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-slate-900", children: "总计" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextInput,
              {
                id: "guide-total",
                value: draft.costBreakdown.total || autoTotal,
                readOnly: true,
                className: "font-bold"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-3 text-xs font-normal text-slate-500", children: [
              "根据上方分项自动加总 · 预算档位 ",
              draft.budgetLabel || "—"
            ] })
          ] })
        ] })
      ] }) })
    }
  );
}
const cardMeta$1 = STRUCTURED_GUIDE_FORM_CARDS[2];
const fields$1 = GUIDE_PUBLISH_INSIGHT_FIELDS;
function GuidePublishInsightsCard({
  draft,
  onUpdateSnailInsights
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    StructuredGuideConstitutionCard,
    {
      cardNumber: cardMeta$1.card,
      id: cardMeta$1.editorId,
      title: cardMeta$1.title,
      titleSlangId: cardMeta$1.titleSlangId,
      subtitle: cardMeta$1.subtitle,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-amber-200/80 bg-amber-50/40 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FieldLabel, { htmlFor: "insight-regrets", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SnailSlangTerm, { id: fields$1.regrets.slangId }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextArea,
            {
              id: "insight-regrets",
              value: draft.snailInsights.regrets,
              onChange: (value) => onUpdateSnailInsights({ regrets: value }),
              rows: 6,
              placeholder: SNAIL_UI_COPY.insightRegretsPlaceholder
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FieldLabel, { htmlFor: "insight-recommendations", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SnailSlangTerm, { id: fields$1.recommendations.slangId }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextArea,
            {
              id: "insight-recommendations",
              value: draft.snailInsights.recommendations,
              onChange: (value) => onUpdateSnailInsights({ recommendations: value }),
              rows: 6,
              placeholder: SNAIL_UI_COPY.insightTreasurePlaceholder
            }
          ),
          "        "
        ] })
      ] })
    }
  );
}
const cardMeta = STRUCTURED_GUIDE_FORM_CARDS[1];
const fields = GUIDE_PUBLISH_JOURNAL_FIELDS;
function daySummary(day) {
  if (day.narrative.trim()) {
    return day.narrative.trim().slice(0, 48) + (day.narrative.trim().length > 48 ? "…" : "");
  }
  if (day.expenses.some((expense) => expense.item.trim() || expense.amount.trim())) {
    return "已填开销，待补充行程叙述";
  }
  return "点击展开编辑当天行程";
}
function GuidePublishJournalCard({
  draft,
  onUpdateDailyJournal,
  onUpdateDailyExpense,
  onAddDailyExpense,
  onRemoveDailyExpense
}) {
  const [expandedDays, setExpandedDays] = reactExports.useState(() => /* @__PURE__ */ new Set([1]));
  reactExports.useEffect(() => {
    var _a;
    const firstFilled = (_a = draft.dailyJournal.find(
      (day) => day.narrative.trim() || day.expenses.length > 0
    )) == null ? void 0 : _a.day;
    if (firstFilled) {
      setExpandedDays((current) => /* @__PURE__ */ new Set([...current, firstFilled]));
    }
  }, [draft.dailyJournal]);
  const toggleDay = (day) => {
    setExpandedDays((current) => {
      const next = new Set(current);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    StructuredGuideConstitutionCard,
    {
      cardNumber: cardMeta.card,
      id: cardMeta.editorId,
      title: cardMeta.title,
      subtitle: cardMeta.subtitle,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: draft.dailyJournal.map((day) => {
        const isOpen = expandedDays.has(day.day);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "overflow-hidden rounded-xl border border-slate-200/90 bg-white",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => toggleDay(day.day),
                  className: "flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50",
                  "aria-expanded": isOpen,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-bold uppercase tracking-wide text-emerald-700", children: [
                        "第 ",
                        day.day,
                        " 天"
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 truncate text-sm text-slate-600", children: daySummary(day) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      ChevronDown,
                      {
                        className: cn(
                          "h-4 w-4 shrink-0 text-slate-400 transition",
                          isOpen && "rotate-180"
                        ),
                        "aria-hidden": true
                      }
                    )
                  ]
                }
              ),
              isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 border-t border-slate-100 px-4 py-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FieldLabel, { htmlFor: `journal-${day.day}-narrative`, children: fields.narrative.label }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    TextArea,
                    {
                      id: `journal-${day.day}-narrative`,
                      value: day.narrative,
                      onChange: (value) => onUpdateDailyJournal(day.day, { narrative: value }),
                      rows: 5,
                      placeholder: "亲切口吻描述当天地点、活动、时间安排…"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center justify-between gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FieldLabel, { children: fields.expenses.label }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        type: "button",
                        onClick: () => onAddDailyExpense(day.day),
                        className: "inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3", "aria-hidden": true }),
                          "添加开销"
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                    day.expenses.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-400", children: "暂无开销，点击「添加开销」" }),
                    day.expenses.map((expense, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        className: "grid grid-cols-[1fr_6rem_auto] items-end gap-2",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldLabel, { htmlFor: `journal-${day.day}-expense-item-${index}`, children: fields.expenseItem.label }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              TextInput,
                              {
                                id: `journal-${day.day}-expense-item-${index}`,
                                value: expense.item,
                                onChange: (value) => onUpdateDailyExpense(day.day, index, { item: value }),
                                placeholder: "地铁"
                              }
                            )
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldLabel, { htmlFor: `journal-${day.day}-expense-amount-${index}`, children: fields.expenseAmount.label }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              TextInput,
                              {
                                id: `journal-${day.day}-expense-amount-${index}`,
                                type: "number",
                                value: expense.amount,
                                onChange: (value) => onUpdateDailyExpense(day.day, index, { amount: value }),
                                placeholder: "0"
                              }
                            )
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "button",
                            {
                              type: "button",
                              onClick: () => onRemoveDailyExpense(day.day, index),
                              className: "mb-0.5 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600",
                              "aria-label": "删除开销",
                              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4", "aria-hidden": true })
                            }
                          )
                        ]
                      },
                      `${day.day}-expense-${index}`
                    ))
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FieldLabel, { htmlFor: `journal-${day.day}-tips`, children: fields.tips.label }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    TextArea,
                    {
                      id: `journal-${day.day}-tips`,
                      value: day.tips,
                      onChange: (value) => onUpdateDailyJournal(day.day, { tips: value }),
                      rows: 3,
                      placeholder: "交通方式、耗时、省钱窍门（每行一条）"
                    }
                  )
                ] })
              ] })
            ]
          },
          day.day
        );
      }) })
    }
  );
}
function GuidePublishMetaSection({ draft, onUpdateDraft }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      id: "sg-edit-basic",
      className: "scroll-mt-24 rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 sm:p-5",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold text-slate-900", children: "攻略元信息" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: "标题与目的地会显示在攻略列表中" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldLabel, { htmlFor: "guide-title", children: "攻略标题" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextInput,
              {
                id: "guide-title",
                value: draft.title,
                onChange: (value) => onUpdateDraft({ title: value }),
                placeholder: "例如：济南 3 天穷游攻略"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldLabel, { htmlFor: "guide-destination", children: "目的地" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextInput,
              {
                id: "guide-destination",
                value: draft.destination,
                onChange: (value) => onUpdateDraft({ destination: value })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldLabel, { htmlFor: "guide-days", children: "天数" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextInput,
              {
                id: "guide-days",
                value: draft.days,
                onChange: (value) => onUpdateDraft({ days: value })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldLabel, { htmlFor: "guide-budget", children: "预算档位" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextInput,
              {
                id: "guide-budget",
                value: draft.budgetLabel,
                onChange: (value) => onUpdateDraft({ budgetLabel: value })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldLabel, { htmlFor: "guide-interests", children: "兴趣标签" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              TextInput,
              {
                id: "guide-interests",
                value: draft.interests,
                onChange: (value) => onUpdateDraft({ interests: value }),
                placeholder: "美食、打卡、自然风光（用顿号分隔）"
              }
            )
          ] })
        ] })
      ]
    }
  );
}
function GuidePublishEditor({
  draft,
  isPublishing,
  error,
  filledFromAi = false,
  onUpdateDraft,
  onUpdateCostItem,
  onUpdateDailyJournal,
  onUpdateDailyExpense,
  onAddDailyExpense,
  onRemoveDailyExpense,
  onUpdateSnailInsights,
  onPublish,
  onBack,
  className,
  hideHeader = false,
  hideFooter = false
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("space-y-4", className), children: [
    !hideHeader && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-emerald-200/80 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-900", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: filledFromAi ? `AI 内容已填入 · ${SLIME_TRAIL_PUBLISHER.title}` : SLIME_TRAIL_PUBLISHER.subtitle }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-emerald-800/90", children: filledFromAi ? "三大宪法卡已与 AI 字段一一对应填入，请核对后留下轨迹。" : "请按卡1→卡2→卡3 填写，右侧预览与前台展示完全一致。" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(GuidePublishMetaSection, { draft, onUpdateDraft }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(GuidePublishCostCard, { draft, onUpdateCostItem }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      GuidePublishJournalCard,
      {
        draft,
        onUpdateDailyJournal,
        onUpdateDailyExpense,
        onAddDailyExpense,
        onRemoveDailyExpense
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(GuidePublishInsightsCard, { draft, onUpdateSnailInsights }),
    error && !hideFooter && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700", children: error }),
    !hideFooter && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 sm:flex-row sm:justify-end", children: [
      onBack && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: onBack,
          disabled: isPublishing,
          className: "rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50",
          children: "返回对话"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: onPublish,
          disabled: isPublishing,
          className: "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-105 disabled:opacity-50",
          children: isPublishing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin", "aria-hidden": true }),
            "发布中…"
          ] }) : SLIME_TRAIL_PUBLISHER.publishButton
        }
      )
    ] })
  ] });
}
function StructuredGuideCompletenessBar({
  completeness,
  className,
  onItemClick
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-slate-900", children: SNAIL_UI_COPY.publishChecklist }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-500", children: [
            completeness.requiredDone,
            "/",
            completeness.requiredTotal,
            " 必填项 ·",
            " ",
            completeness.progress,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 h-2 overflow-hidden rounded-full bg-slate-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: cn(
              "h-full rounded-full transition-all",
              completeness.ready ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-emerald-400"
            ),
            style: { width: `${completeness.progress}%` }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 grid gap-1.5 sm:grid-cols-2", children: completeness.items.map((item) => {
          const canJump = Boolean(onItemClick && !item.done);
          const content = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            item.done ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 shrink-0 text-emerald-600", "aria-hidden": true }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-3.5 w-3.5 shrink-0", "aria-hidden": true }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              item.label,
              item.required && !item.done && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-amber-600", children: "（必填）" }),
              canJump && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-emerald-600", children: "→ 去填写" })
            ] })
          ] });
          return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: canJump ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => onItemClick == null ? void 0 : onItemClick(item.id),
              className: cn(
                "flex w-full items-center gap-2 rounded-lg px-1 py-0.5 text-left text-xs transition hover:bg-emerald-50",
                "text-slate-600"
              ),
              children: content
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: cn(
                "flex items-center gap-2 text-xs",
                item.done ? "text-emerald-800" : "text-slate-500"
              ),
              children: content
            }
          ) }, item.id);
        }) })
      ]
    }
  );
}
function hasText(value) {
  return value.trim().length > 0;
}
function getStructuredGuideCompleteness(draft) {
  const filledJournalDays = draft.dailyJournal.filter((day) => hasText(day.narrative)).length;
  const hasCostLine = [
    draft.costBreakdown.transportation.amount,
    draft.costBreakdown.accommodation.amount,
    draft.costBreakdown.food.amount,
    draft.costBreakdown.entertainment.amount
  ].some((value) => Number(value.replace(/[^\d.]/g, "")) > 0);
  const items = [
    { id: "title", label: "攻略标题", done: hasText(draft.title), required: true },
    { id: "destination", label: "目的地", done: hasText(draft.destination), required: true },
    { id: "days", label: "旅行天数", done: hasText(draft.days), required: true },
    { id: "cost", label: "花费清单", done: hasCostLine && hasText(draft.costBreakdown.total), required: true },
    {
      id: "journal",
      label: "行程流水账（至少 1 天）",
      done: filledJournalDays > 0,
      required: true
    },
    {
      id: "insights",
      label: "蜗牛启示（避坑雷达或宝藏点）",
      done: hasText(draft.snailInsights.regrets) || hasText(draft.snailInsights.recommendations),
      required: true
    }
  ];
  const requiredItems = items.filter((item) => item.required);
  const requiredDone = requiredItems.filter((item) => item.done).length;
  const requiredTotal = requiredItems.length;
  return {
    items,
    requiredDone,
    requiredTotal,
    progress: requiredTotal > 0 ? Math.round(requiredDone / requiredTotal * 100) : 0,
    ready: requiredDone === requiredTotal
  };
}
function StructuredGuidePublishStudio({
  draft,
  isPublishing,
  error,
  filledFromAi,
  onUpdateDraft,
  onUpdateCostItem,
  onUpdateDailyJournal,
  onUpdateDailyExpense,
  onAddDailyExpense,
  onRemoveDailyExpense,
  onUpdateSnailInsights,
  onPublish,
  className,
  previewSourceId
}) {
  const [mobilePanel, setMobilePanel] = reactExports.useState("edit");
  const previewGuide = reactExports.useMemo(
    () => buildStructuredGuideContent(draft, previewSourceId),
    [draft, previewSourceId]
  );
  const completeness = reactExports.useMemo(() => getStructuredGuideCompleteness(draft), [draft]);
  const handleJumpToCheckItem = reactExports.useCallback((itemId) => {
    setMobilePanel("edit");
    const targetId = STRUCTURED_GUIDE_EDITOR_TARGETS[itemId];
    if (!targetId) {
      return;
    }
    window.requestAnimationFrame(() => {
      var _a;
      (_a = document.getElementById(targetId)) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("space-y-4", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-emerald-200/80 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-900", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: SLIME_TRAIL_PUBLISHER.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs font-medium text-emerald-800/80", children: SLIME_TRAIL_PUBLISHER.subtitle }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-emerald-800/90", children: filledFromAi ? SLIME_TRAIL_PUBLISHER.taglineAi : SLIME_TRAIL_PUBLISHER.taglineManual })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StructuredGuideCompletenessBar,
      {
        completeness,
        onItemClick: handleJumpToCheckItem
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 lg:hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setMobilePanel("edit"),
          className: cn(
            "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium",
            mobilePanel === "edit" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4", "aria-hidden": true }),
            "编辑"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setMobilePanel("preview"),
          className: cn(
            "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium",
            mobilePanel === "preview" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4", "aria-hidden": true }),
            "预览"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-2 lg:items-start", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(mobilePanel === "preview" && "hidden lg:block"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        GuidePublishEditor,
        {
          draft,
          filledFromAi,
          isPublishing,
          error,
          onUpdateDraft,
          onUpdateCostItem,
          onUpdateDailyJournal,
          onUpdateDailyExpense,
          onAddDailyExpense,
          onRemoveDailyExpense,
          onUpdateSnailInsights,
          onPublish,
          hideHeader: true,
          hideFooter: true
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: cn(
            "lg:sticky lg:top-20",
            mobilePanel === "edit" && "hidden lg:block"
          ),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(StructuredGuideViewer, { guide: previewGuide, variant: "preview" })
        }
      )
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700", children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-2 sm:flex-row sm:justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: onPublish,
        disabled: isPublishing || !completeness.ready,
        title: !completeness.ready ? "请先完成留轨迹清单中的必填项" : void 0,
        className: "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50",
        children: isPublishing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin", "aria-hidden": true }),
          SLIME_TRAIL_PUBLISHER.publishing
        ] }) : SLIME_TRAIL_PUBLISHER.publishButton
      }
    ) })
  ] });
}
const usePublishedGuidesStore = create((set, get) => ({
  items: [],
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) {
      return;
    }
    const items = ensureCuratedPublishedGuidesSeeded();
    set({ items, hydrated: true });
  },
  addGuide: (record) => {
    set((state) => {
      const items = [record, ...state.items.filter((item) => item.id !== record.id)];
      writePublishedGuidesToStorage(items);
      return { items };
    });
  },
  getGuideById: (id) => get().items.find((item) => item.id === id),
  listMeta: () => get().items.map((item) => item.listMeta)
}));
function useGuidePublishEditor({
  initialDraft,
  aiGeneratedContent,
  sourceGuideId,
  onPublished,
  onAiContentFilled
}) {
  const queryClient = useQueryClient();
  const hydrate = usePublishedGuidesStore((state) => state.hydrate);
  const addGuide = usePublishedGuidesStore((state) => state.addGuide);
  const [draft, setDraft] = reactExports.useState(initialDraft);
  const [error, setError] = reactExports.useState(null);
  const [isPublishing, setIsPublishing] = reactExports.useState(false);
  const [filledFromAi, setFilledFromAi] = reactExports.useState(false);
  reactExports.useEffect(() => {
    hydrate();
  }, [hydrate]);
  reactExports.useEffect(() => {
    if (aiGeneratedContent) {
      setDraft(aiSnailGuideToEditorDraft(aiGeneratedContent));
      setFilledFromAi(true);
      setError(null);
      onAiContentFilled == null ? void 0 : onAiContentFilled();
      return;
    }
    setDraft(initialDraft);
    setFilledFromAi(false);
    setError(null);
  }, [initialDraft, aiGeneratedContent, onAiContentFilled]);
  const fillFromAiContent = reactExports.useCallback((content) => {
    const nextDraft = "generatedAt" in content ? aiSnailGuideToEditorDraft(content) : content;
    setDraft(nextDraft);
    setFilledFromAi(true);
    setError(null);
  }, []);
  const updateDraft = reactExports.useCallback((patch) => {
    setDraft((current) => {
      const next = { ...current, ...patch };
      return patch.days !== void 0 ? syncDailyJournalWithDays(next) : next;
    });
  }, []);
  const updateCostItem = reactExports.useCallback(
    (key, patch) => {
      if (key === "total") {
        setDraft((current) => ({
          ...current,
          costBreakdown: { ...current.costBreakdown, total: patch.amount ?? current.costBreakdown.total }
        }));
        return;
      }
      setDraft((current) => {
        const nextBreakdown = {
          ...current.costBreakdown,
          [key]: { ...current.costBreakdown[key], ...patch }
        };
        return {
          ...current,
          costBreakdown: {
            ...nextBreakdown,
            total: recalculateCostTotal({ ...current, costBreakdown: nextBreakdown })
          }
        };
      });
    },
    []
  );
  const updateDailyJournal = reactExports.useCallback(
    (day, patch) => {
      setDraft((current) => ({
        ...current,
        dailyJournal: current.dailyJournal.map(
          (entry) => entry.day === day ? { ...entry, ...patch } : entry
        )
      }));
    },
    []
  );
  const updateDailyExpense = reactExports.useCallback(
    (day, expenseIndex, patch) => {
      setDraft((current) => ({
        ...current,
        dailyJournal: current.dailyJournal.map((entry) => {
          if (entry.day !== day) {
            return entry;
          }
          const expenses = entry.expenses.map(
            (expense, index) => index === expenseIndex ? { ...expense, ...patch } : expense
          );
          return { ...entry, expenses };
        })
      }));
    },
    []
  );
  const addDailyExpense = reactExports.useCallback((day) => {
    setDraft((current) => ({
      ...current,
      dailyJournal: current.dailyJournal.map(
        (entry) => entry.day === day ? { ...entry, expenses: [...entry.expenses, { item: "", amount: "" }] } : entry
      )
    }));
  }, []);
  const removeDailyExpense = reactExports.useCallback((day, expenseIndex) => {
    setDraft((current) => ({
      ...current,
      dailyJournal: current.dailyJournal.map(
        (entry) => entry.day === day ? {
          ...entry,
          expenses: entry.expenses.filter((_, index) => index !== expenseIndex)
        } : entry
      )
    }));
  }, []);
  const updateSnailInsights = reactExports.useCallback(
    (patch) => {
      setDraft((current) => ({
        ...current,
        snailInsights: { ...current.snailInsights, ...patch }
      }));
    },
    []
  );
  const syncCostTotal = reactExports.useCallback(() => {
    setDraft((current) => ({
      ...current,
      costBreakdown: {
        ...current.costBreakdown,
        total: recalculateCostTotal(current)
      }
    }));
  }, []);
  const publish = reactExports.useCallback(async () => {
    const normalized = syncDailyJournalWithDays(draft);
    const validationError = validateGuidePublishDraft(normalized);
    if (validationError) {
      setError(validationError);
      return null;
    }
    setIsPublishing(true);
    setError(null);
    try {
      const record = buildPublishedGuideRecord(normalized, DEMO_CURRENT_USER_ID, sourceGuideId);
      addGuide(record);
      awardGuidePublished(DEMO_CURRENT_USER_ID);
      await queryClient.invalidateQueries({ queryKey: guideListQueryKey() });
      await queryClient.invalidateQueries({ queryKey: guideDetailQueryKey(record.id) });
      onPublished == null ? void 0 : onPublished(record);
      return record;
    } catch {
      setError("发布失败，请稍后再试");
      return null;
    } finally {
      setIsPublishing(false);
    }
  }, [addGuide, draft, onPublished, queryClient, sourceGuideId]);
  return {
    draft,
    setDraft,
    updateDraft,
    updateCostItem,
    updateDailyJournal,
    updateDailyExpense,
    addDailyExpense,
    removeDailyExpense,
    updateSnailInsights,
    syncCostTotal,
    error,
    setError,
    isPublishing,
    publish,
    filledFromAi,
    fillFromAiContent
  };
}
function SlimeTrailPublisher({
  initialDraft,
  aiGeneratedContent,
  sourceGuideId,
  publishedGuideId = null,
  isPublished = false,
  onPublished,
  className
}) {
  const editor = useGuidePublishEditor({
    initialDraft,
    aiGeneratedContent,
    sourceGuideId,
    onPublished
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className, children: [
    isPublished && publishedGuideId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: SLIME_TRAIL_PUBLISHER.publishedTitle }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs", children: [
        SLIME_TRAIL_PUBLISHER.publishedHint,
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: guideDetailPath(publishedGuideId),
            className: "ml-1 font-semibold underline hover:text-emerald-700",
            children: "查看前台展示"
          }
        ),
        " · ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: paths.guides, className: "font-semibold underline hover:text-emerald-700", children: "攻略列表" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StructuredGuidePublishStudio,
      {
        draft: editor.draft,
        filledFromAi: editor.filledFromAi,
        isPublishing: editor.isPublishing,
        error: editor.error,
        previewSourceId: sourceGuideId,
        onUpdateDraft: editor.updateDraft,
        onUpdateCostItem: editor.updateCostItem,
        onUpdateDailyJournal: editor.updateDailyJournal,
        onUpdateDailyExpense: editor.updateDailyExpense,
        onAddDailyExpense: editor.addDailyExpense,
        onRemoveDailyExpense: editor.removeDailyExpense,
        onUpdateSnailInsights: editor.updateSnailInsights,
        onPublish: () => {
          void editor.publish();
        }
      }
    )
  ] });
}
export {
  SlimeTrailPublisher as S
};
