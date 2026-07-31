import { a as reactExports, j as jsxRuntimeExports } from "./vendor-react-DtfH6MSw.js";
import { bw as createLucideIcon, cC as getPlanDestination, cI as getPlanTotalCostLabel, cB as getPlanDaysLabel, cH as getPlanSuitableAudience, bW as formatDateZh, cD as getPlanGeneratedAt, cF as getPlanPracticalInfo, eG as travelPlanDetailPath, g as APP_NAME, eW as useNavigate, G as Copy, aF as Users, bl as cn, dl as isChinaPrimaryMarket, aq as Share2, ae as QrCode, aH as WechatSharePosterDialog, el as shareTravelPlan, b_ as formatRelativeZh, f1 as useReducedMotion, y as ChevronDown, j as AnimatePresence, dG as motion, a1 as MapPin, aG as Wallet, x as CalendarDays, aB as TriangleAlert } from "./index-DwV1qlqh.js";
import { g as getTravelPlanCompanionPath, b as buildTravelPlanCompanionState } from "./travelPlanCompanionNavigation-DBWwdSWF.js";
import { I as Info } from "./info-DlxnCctM.js";
/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["path", { d: "M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8", key: "1k78r4" }],
  ["path", { d: "M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4", key: "fb3tl2" }],
  ["path", { d: "M12 4v6", key: "1dcgq2" }],
  ["path", { d: "M2 18h20", key: "ajqnye" }]
];
const BedDouble = createLucideIcon("bed-double", __iconNode$3);
/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "M8 6v6", key: "18i7km" }],
  ["path", { d: "M15 6v6", key: "1sg6z9" }],
  ["path", { d: "M2 12h19.6", key: "de5uta" }],
  [
    "path",
    {
      d: "M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3",
      key: "1wwztk"
    }
  ],
  ["circle", { cx: "7", cy: "18", r: "2", key: "19iecd" }],
  ["path", { d: "M9 18h5", key: "lrx6i" }],
  ["circle", { cx: "16", cy: "18", r: "2", key: "1v4tcr" }]
];
const Bus = createLucideIcon("bus", __iconNode$2);
/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["path", { d: "M3 10h18", key: "8toen8" }],
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M17 14h-6", key: "bkmgh3" }],
  ["path", { d: "M13 18H7", key: "bb0bb7" }],
  ["path", { d: "M7 14h.01", key: "1qa3f1" }],
  ["path", { d: "M17 18h.01", key: "1bdyru" }]
];
const CalendarRange = createLucideIcon("calendar-range", __iconNode$1);
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
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      key: "1oefj6"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
  ["path", { d: "M12 18v-6", key: "17g6i2" }],
  ["path", { d: "m9 15 3 3 3-3", key: "1npd3o" }]
];
const FileDown = createLucideIcon("file-down", __iconNode);
function shouldUseNativeShare() {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return false;
  }
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}
function copyTextToClipboardSync(text) {
  const trimmed = text.trim();
  if (!trimmed || typeof window === "undefined") {
    return "failed";
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = trimmed;
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.width = "2px";
    textarea.style.height = "2px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, trimmed.length);
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    if (copied) {
      return "copied";
    }
  } catch {
  }
  return "failed";
}
async function copyTextToClipboard(text) {
  var _a;
  const trimmed = text.trim();
  if (!trimmed || typeof window === "undefined") {
    return "failed";
  }
  const syncResult = copyTextToClipboardSync(trimmed);
  if (syncResult === "copied") {
    return "copied";
  }
  try {
    if ((_a = navigator.clipboard) == null ? void 0 : _a.writeText) {
      await navigator.clipboard.writeText(trimmed);
      return "copied";
    }
  } catch {
  }
  return "failed";
}
async function sharePlainText(text, title) {
  const trimmed = text.trim();
  if (!trimmed) {
    return "failed";
  }
  if (shouldUseNativeShare()) {
    try {
      await navigator.share({ title, text: trimmed });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled";
      }
    }
  }
  const copied = await copyTextToClipboard(trimmed);
  return copied === "copied" ? "copied" : "failed";
}
function appendPracticalSection(lines, title, tips) {
  if (tips.length === 0) {
    return;
  }
  lines.push("", title);
  tips.forEach((tip) => {
    lines.push(`  · ${tip}`);
  });
}
function formatTravelPlanItineraryText(plan) {
  const lines = [
    plan.title,
    "═".repeat(Math.min(plan.title.length, 40)),
    "",
    plan.summary,
    "",
    `目的地：${getPlanDestination(plan)}`,
    `总预算：${getPlanTotalCostLabel(plan)}`,
    `总天数：${getPlanDaysLabel(plan)}`,
    `适合人群：${getPlanSuitableAudience(plan)}`,
    `创建时间：${formatDateZh(getPlanGeneratedAt(plan))}`
  ];
  if (plan.tags.length > 0) {
    lines.push(`标签：${plan.tags.join("、")}`);
  }
  lines.push("", "【每日行程】");
  plan.dailyPlans.forEach((day) => {
    lines.push("", `第 ${day.day} 天 · ${day.title}`);
    day.activities.forEach((activity) => {
      const parts = [`  ${activity.time}`, activity.description];
      if (activity.location) {
        parts.push(`@ ${activity.location}`);
      }
      if (activity.cost != null && activity.cost > 0) {
        parts.push(`¥${activity.cost}`);
      }
      lines.push(parts.join(" · "));
    });
  });
  const practical = getPlanPracticalInfo(plan);
  appendPracticalSection(lines, "【住宿建议】", practical.accommodationTips);
  appendPracticalSection(lines, "【交通提示】", practical.transportationTips);
  appendPracticalSection(lines, "【注意事项】", practical.precautions);
  if (typeof window !== "undefined") {
    lines.push("", `详情链接：${window.location.origin}${travelPlanDetailPath(plan.id)}`);
  }
  lines.push("", `— 由 Hello Roamly 生成`);
  return lines.join("\n");
}
async function copyTravelPlanItinerary(plan) {
  return copyTextToClipboard(formatTravelPlanItineraryText(plan));
}
function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function buildDaySections(plan) {
  return plan.dailyPlans.map((day) => {
    const activities = day.activities.map((activity) => {
      const meta = [
        activity.location ? escapeHtml(activity.location) : "",
        activity.cost != null && activity.cost > 0 ? `¥${activity.cost}` : ""
      ].filter(Boolean).join(" · ");
      return `<li>
            <time>${escapeHtml(activity.time)}</time>
            <span>${escapeHtml(activity.description)}</span>
            ${meta ? `<small>${meta}</small>` : ""}
          </li>`;
    }).join("");
    return `<section class="day">
        <h3>第 ${day.day} 天 · ${escapeHtml(day.title)}</h3>
        <ul>${activities}</ul>
      </section>`;
  }).join("");
}
function buildTravelPlanPrintHtml(plan) {
  const plainFallback = escapeHtml(formatTravelPlanItineraryText(plan));
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(plan.title)} — ${APP_NAME}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
      color: #0f172a;
      line-height: 1.55;
      margin: 0;
      padding: 24px 28px 32px;
      font-size: 13px;
    }
    h1 { font-size: 22px; margin: 0 0 8px; }
    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 20px;
      color: #475569;
      font-size: 12px;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    .summary { color: #334155; margin: 0 0 20px; }
    .day { margin-bottom: 18px; page-break-inside: avoid; }
    .day h3 { font-size: 14px; margin: 0 0 8px; color: #1e40af; }
    ul { list-style: none; margin: 0; padding: 0; }
    li {
      display: grid;
      grid-template-columns: 52px 1fr;
      gap: 4px 10px;
      padding: 6px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    time { font-weight: 600; color: #64748b; font-variant-numeric: tabular-nums; }
    small { grid-column: 2; color: #94a3b8; font-size: 11px; }
    .footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #94a3b8;
    }
    pre.fallback { display: none; white-space: pre-wrap; font-size: 11px; }
    @media print {
      body { padding: 12mm 14mm; }
      @page { margin: 12mm; }
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(plan.title)}</h1>
  <div class="meta">
    <span>目的地：${escapeHtml(getPlanDestination(plan))}</span>
    <span>总预算：${escapeHtml(getPlanTotalCostLabel(plan))}</span>
    <span>总天数：${escapeHtml(getPlanDaysLabel(plan))}</span>
    <span>适合：${escapeHtml(getPlanSuitableAudience(plan))}</span>
  </div>
  <p class="summary">${escapeHtml(plan.summary)}</p>
  ${buildDaySections(plan)}
  <p class="footer">${APP_NAME} · 在打印对话框中选择「另存为 PDF」即可保存</p>
  <pre class="fallback">${plainFallback}</pre>
</body>
</html>`;
}
function exportTravelPlanPdf(plan) {
  if (typeof window === "undefined") {
    return "failed";
  }
  const printWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!printWindow) {
    return "blocked";
  }
  try {
    printWindow.document.open();
    printWindow.document.write(buildTravelPlanPrintHtml(plan));
    printWindow.document.close();
    const triggerPrint = () => {
      printWindow.focus();
      printWindow.print();
    };
    if (printWindow.document.readyState === "complete") {
      triggerPrint();
    } else {
      printWindow.addEventListener("load", triggerPrint, { once: true });
    }
    return "opened";
  } catch {
    printWindow.close();
    return "failed";
  }
}
const COPY_LABEL = {
  idle: "复制此行程",
  success: "已复制",
  error: "复制失败"
};
const PDF_LABEL = {
  idle: "导出 PDF",
  success: "已打开打印",
  error: "导出失败"
};
const COPY_SHORT = {
  idle: "复制",
  success: "已复制",
  error: "失败"
};
const PDF_SHORT = {
  idle: "PDF",
  success: "已打开",
  error: "失败"
};
function useFeedbackReset(feedback, onReset) {
  reactExports.useEffect(() => {
    if (feedback === "idle") {
      return void 0;
    }
    const timer = window.setTimeout(onReset, 2500);
    return () => {
      window.clearTimeout(timer);
    };
  }, [feedback, onReset]);
}
function useTravelPlanDetailActions(plan) {
  const navigate = useNavigate();
  const [copyFeedback, setCopyFeedback] = reactExports.useState("idle");
  const [pdfFeedback, setPdfFeedback] = reactExports.useState("idle");
  const resetCopyFeedback = reactExports.useCallback(() => setCopyFeedback("idle"), []);
  const resetPdfFeedback = reactExports.useCallback(() => setPdfFeedback("idle"), []);
  useFeedbackReset(copyFeedback, resetCopyFeedback);
  useFeedbackReset(pdfFeedback, resetPdfFeedback);
  const handleCopy = reactExports.useCallback(async () => {
    const result = await copyTravelPlanItinerary(plan);
    setCopyFeedback(result === "copied" ? "success" : "error");
  }, [plan]);
  const handleCopyClick = reactExports.useCallback(() => {
    handleCopy().catch(() => {
      setCopyFeedback("error");
    });
  }, [handleCopy]);
  const handlePdf = reactExports.useCallback(() => {
    const result = exportTravelPlanPdf(plan);
    if (result === "opened") {
      setPdfFeedback("success");
      return;
    }
    setPdfFeedback("error");
  }, [plan]);
  const handleCompanion = reactExports.useCallback(() => {
    navigate(getTravelPlanCompanionPath(), {
      state: buildTravelPlanCompanionState(plan)
    });
  }, [navigate, plan]);
  return {
    copyFeedback,
    pdfFeedback,
    copyLabel: COPY_LABEL[copyFeedback],
    pdfLabel: PDF_LABEL[pdfFeedback],
    copyShortLabel: COPY_SHORT[copyFeedback],
    pdfShortLabel: PDF_SHORT[pdfFeedback],
    handleCopyClick,
    handlePdf,
    handleCompanion
  };
}
function PanelActionButton({
  label,
  hint,
  icon: Icon,
  variant,
  feedback = "idle",
  onClick
}) {
  const isSuccess = feedback === "success";
  const isError = feedback === "error";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick,
      className: cn(
        "group flex flex-col items-start gap-2 rounded-xl border px-4 py-3.5 text-left transition",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        variant === "primary" && "border-brand-200 bg-brand-600 text-white shadow-sm hover:bg-brand-700",
        variant === "secondary" && "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50",
        variant === "accent" && "border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 text-slate-900 hover:from-violet-100 hover:to-fuchsia-100",
        isSuccess && variant === "primary" && "border-emerald-300 bg-emerald-600 hover:bg-emerald-700",
        isSuccess && variant === "secondary" && "border-emerald-200 bg-emerald-50",
        isError && variant === "primary" && "border-red-300 bg-red-600 hover:bg-red-700",
        isError && variant === "secondary" && "border-red-200 bg-red-50"
      ),
      "aria-label": hint,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "span",
          {
            className: cn(
              "inline-flex items-center gap-2 text-sm font-semibold",
              variant === "primary" && !isError && "text-white",
              variant === "secondary" && isError && "text-red-700",
              variant === "secondary" && isSuccess && "text-emerald-800"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Icon,
                {
                  className: cn(
                    "h-4 w-4 shrink-0",
                    variant === "primary" ? "text-white/90" : "text-slate-600",
                    variant === "accent" && "text-violet-600"
                  ),
                  "aria-hidden": true
                }
              ),
              label
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: cn(
              "text-xs leading-relaxed",
              variant === "primary" ? "text-white/85" : "text-slate-500"
            ),
            children: hint
          }
        )
      ]
    }
  );
}
function ToolbarActionButton({
  label,
  hint,
  icon: Icon,
  tone,
  feedback = "idle",
  onClick
}) {
  const isSuccess = feedback === "success";
  const isError = feedback === "error";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick,
      className: cn(
        "flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 text-[11px] font-semibold transition",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-500",
        tone === "brand" && "border-brand-200 bg-brand-50 text-brand-800 hover:bg-brand-100",
        tone === "slate" && "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        tone === "violet" && "border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100",
        isSuccess && "border-emerald-200 bg-emerald-50 text-emerald-800",
        isError && "border-red-200 bg-red-50 text-red-700"
      ),
      "aria-label": hint,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 shrink-0", "aria-hidden": true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label })
      ]
    }
  );
}
function TravelPlanDetailActions({
  plan,
  className,
  variant = "panel"
}) {
  const {
    copyFeedback,
    pdfFeedback,
    copyLabel,
    pdfLabel,
    copyShortLabel,
    pdfShortLabel,
    handleCopyClick,
    handlePdf,
    handleCompanion
  } = useTravelPlanDetailActions(plan);
  if (variant === "toolbar") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("space-y-2", className), role: "group", "aria-label": "计划行动", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ToolbarActionButton,
          {
            label: copyShortLabel,
            hint: "复制完整行程文本",
            icon: Copy,
            tone: "brand",
            feedback: copyFeedback,
            onClick: handleCopyClick
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ToolbarActionButton,
          {
            label: pdfShortLabel,
            hint: "导出 PDF（浏览器打印）",
            icon: FileDown,
            tone: "slate",
            feedback: pdfFeedback,
            onClick: handlePdf
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ToolbarActionButton,
          {
            label: "旅伴",
            hint: "寻找同频旅伴",
            icon: Users,
            tone: "violet",
            onClick: handleCompanion
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-[10px] text-slate-400", children: "导出 PDF 需允许弹窗" })
    ] });
  }
  const destination = getPlanDestination(plan);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      className: cn(
        "mt-8 overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50 to-white shadow-sm",
        className
      ),
      "aria-labelledby": "travel-plan-actions-title",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-slate-200/80 bg-white/80 px-5 py-4 sm:px-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] font-semibold uppercase tracking-wider text-brand-600", children: "Next step" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { id: "travel-plan-actions-title", className: "mt-1 text-base font-semibold text-slate-900", children: "行动" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-slate-500", children: [
            destination,
            " · ",
            getPlanDaysLabel(plan),
            " · ",
            getPlanTotalCostLabel(plan)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 sm:p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            PanelActionButton,
            {
              label: copyLabel,
              hint: "完整文本，可粘贴到备忘录或聊天",
              icon: Copy,
              variant: "primary",
              feedback: copyFeedback,
              onClick: handleCopyClick
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            PanelActionButton,
            {
              label: pdfLabel,
              hint: "打开打印页，选择「另存为 PDF」",
              icon: FileDown,
              variant: "secondary",
              feedback: pdfFeedback,
              onClick: handlePdf
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            PanelActionButton,
            {
              label: "寻找旅伴",
              hint: "按目的地匹配攻略与同频出行",
              icon: Users,
              variant: "accent",
              onClick: handleCompanion
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "border-t border-slate-100 px-5 py-3 text-center text-xs text-slate-400 sm:px-6", children: "导出 PDF 需允许浏览器弹窗；若被拦截，请在地址栏开启后重试" })
      ]
    }
  );
}
const FEEDBACK_LABEL = {
  shared: "已分享",
  copied: "已复制",
  failed: "失败"
};
function TravelPlanShareControls({
  plan,
  className,
  variant = "primary"
}) {
  const [feedback, setFeedback] = reactExports.useState("idle");
  const [posterOpen, setPosterOpen] = reactExports.useState(false);
  const chinaShare = isChinaPrimaryMarket();
  const isPrimary = variant === "primary";
  reactExports.useEffect(() => {
    if (feedback === "idle" || feedback === "cancelled") {
      return void 0;
    }
    const timer = window.setTimeout(() => setFeedback("idle"), 2e3);
    return () => {
      window.clearTimeout(timer);
    };
  }, [feedback]);
  async function handleQuickShare(event) {
    event.stopPropagation();
    const result = await shareTravelPlan(plan);
    if (result !== "cancelled") {
      setFeedback(result);
    }
  }
  function handleWechatPoster(event) {
    event.stopPropagation();
    setPosterOpen(true);
  }
  const quickLabel = feedback !== "idle" && feedback !== "cancelled" ? FEEDBACK_LABEL[feedback] : "分享";
  const buttonBase = cn(
    "inline-flex shrink-0 items-center justify-center gap-1.5 font-semibold transition",
    isPrimary ? "rounded-xl px-3.5 py-2 text-sm shadow-sm" : "rounded-lg px-2.5 py-1.5 text-xs"
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex flex-wrap items-center gap-2", className), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: handleQuickShare,
          className: cn(
            buttonBase,
            isPrimary ? "bg-brand-600 text-white hover:bg-brand-700" : "text-slate-600 hover:bg-slate-100",
            (feedback === "shared" || feedback === "copied") && isPrimary && "bg-emerald-600 hover:bg-emerald-700"
          ),
          "aria-label": "分享旅行计划",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: cn(isPrimary ? "h-4 w-4" : "h-3.5 w-3.5"), "aria-hidden": true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: quickLabel })
          ]
        }
      ),
      chinaShare && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: handleWechatPoster,
          className: cn(
            buttonBase,
            isPrimary ? "border border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100" : "text-violet-700 hover:bg-violet-50"
          ),
          "aria-label": "生成微信分享海报",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: cn(isPrimary ? "h-4 w-4" : "h-3.5 w-3.5"), "aria-hidden": true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isPrimary ? "分享图" : "海报" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WechatSharePosterDialog, { plan, open: posterOpen, onClose: () => setPosterOpen(false) })
  ] });
}
function TravelPlanShareButton(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TravelPlanShareControls, { ...props });
}
function TravelPlanDetailHeader({ plan, className }) {
  const generatedAt = getPlanGeneratedAt(plan);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "header",
    {
      className: cn(
        "flex items-start justify-between gap-3 border-b border-slate-200/90 pb-4",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold leading-snug tracking-tight text-slate-900 sm:text-2xl", children: plan.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1.5 flex flex-wrap items-center gap-x-1.5 text-sm text-slate-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400", children: "创建时间" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("time", { dateTime: generatedAt, title: generatedAt, children: formatDateZh(generatedAt) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-300", "aria-hidden": true, children: "·" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatRelativeZh(generatedAt) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TravelPlanShareButton, { plan, variant: "primary" })
      ]
    }
  );
}
function formatActivityCost(cost) {
  if (cost == null) {
    return null;
  }
  return `¥${cost.toLocaleString("zh-CN")}`;
}
function TravelPlanActivityTimelineItem({
  activity,
  dayNumber,
  activityIndex,
  isLast,
  defaultExpanded = false
}) {
  const [expanded, setExpanded] = reactExports.useState(defaultExpanded);
  const reduceMotion = useReducedMotion();
  const panelId = reactExports.useId();
  const costLabel = formatActivityCost(activity.cost);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "li",
    {
      className: cn("relative", !isLast && "pb-5"),
      style: { listStyle: "none" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute -left-[1.625rem] top-3.5 z-10 h-3 w-3 rounded-full border-2 border-brand-500 bg-white shadow-sm",
            "aria-hidden": true
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              className: "flex w-full items-start gap-3 px-3 py-3 text-left transition hover:bg-slate-50/80",
              "aria-expanded": expanded,
              "aria-controls": panelId,
              onClick: () => setExpanded((open) => !open),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 rounded-lg bg-brand-50 px-2 py-1 font-mono text-xs font-semibold text-brand-700", children: activity.time }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-2 text-sm font-medium text-slate-900", children: activity.description }),
                  !expanded && activity.location && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 block truncate text-xs text-slate-500", children: activity.location })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ChevronDown,
                  {
                    className: cn(
                      "mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-transform",
                      expanded && "rotate-180"
                    ),
                    "aria-hidden": true
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { initial: false, children: expanded && /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              id: panelId,
              role: "region",
              "aria-label": `第 ${dayNumber} 天第 ${activityIndex + 1} 项活动详情`,
              initial: reduceMotion ? false : { height: 0, opacity: 0 },
              animate: { height: "auto", opacity: 1 },
              exit: reduceMotion ? void 0 : { height: 0, opacity: 0 },
              transition: { duration: reduceMotion ? 0 : 0.2 },
              className: "overflow-hidden border-t border-slate-100",
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 bg-slate-50/60 px-3 py-3 text-sm text-slate-600", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "leading-relaxed text-slate-700", children: activity.description }),
                activity.location && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-start gap-1.5 text-xs", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600", "aria-hidden": true }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: activity.location })
                ] }),
                costLabel && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-1.5 text-xs font-medium text-slate-800", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-3.5 w-3.5 shrink-0 text-emerald-600", "aria-hidden": true }),
                  "预估花费 ",
                  costLabel
                ] })
              ] })
            }
          ) })
        ] })
      ]
    }
  );
}
function sumDayCost(day) {
  return day.activities.reduce((sum, activity) => sum + (activity.cost ?? 0), 0);
}
function TravelPlanItineraryTimeline({
  plan,
  className,
  maxDays,
  expandFirstActivity = false,
  expandAllActivities = false
}) {
  const days = maxDays != null ? plan.dailyPlans.slice(0, maxDays) : plan.dailyPlans;
  if (days.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("text-sm text-slate-500", className), children: "暂无每日行程安排。" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      className: cn("mt-6 border-t border-slate-200/90 pt-6", className),
      "aria-labelledby": "travel-plan-itinerary-title",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarRange, { className: "h-4 w-4 text-brand-600", "aria-hidden": true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "h2",
            {
              id: "travel-plan-itinerary-title",
              className: "text-sm font-semibold text-slate-900",
              children: "每日行程"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600", children: [
            "共 ",
            plan.dailyPlans.length,
            " 天"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-8", children: days.map((day, dayIndex) => {
          const dayCost = sumDayCost(day);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-4 flex flex-wrap items-end justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-[10px] font-semibold uppercase tracking-wider text-brand-600", children: [
                  "Day ",
                  day.day
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-0.5 text-base font-semibold text-slate-900", children: day.title })
              ] }),
              dayCost > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-500", children: [
                "当日花费约 ¥",
                dayCost.toLocaleString("zh-CN")
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "relative ml-4 border-l-2 border-brand-200/80 pl-6", children: day.activities.map((activity, activityIndex) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              TravelPlanActivityTimelineItem,
              {
                activity,
                dayNumber: day.day,
                activityIndex,
                isLast: activityIndex === day.activities.length - 1,
                defaultExpanded: expandAllActivities || expandFirstActivity && dayIndex === 0 && activityIndex === 0
              },
              `${day.day}-${activity.time}-${activity.description}`
            )) })
          ] }, `day-${day.day}-${day.title}`);
        }) }),
        maxDays != null && plan.dailyPlans.length > maxDays && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 text-center text-xs text-slate-500", children: [
          "还有 ",
          plan.dailyPlans.length - maxDays,
          " 天行程，请进入计划详情查看完整时间轴。"
        ] })
      ]
    }
  );
}
function buildOverviewItems(plan) {
  return [
    {
      key: "budget",
      label: "总预算",
      value: getPlanTotalCostLabel(plan),
      icon: Wallet,
      accent: "from-brand-500/15 to-brand-600/5 text-brand-700"
    },
    {
      key: "days",
      label: "总天数",
      value: getPlanDaysLabel(plan),
      icon: CalendarDays,
      accent: "from-violet-500/15 to-violet-600/5 text-violet-700"
    },
    {
      key: "audience",
      label: "适合人群",
      value: getPlanSuitableAudience(plan),
      icon: Users,
      accent: "from-emerald-500/15 to-emerald-600/5 text-emerald-700"
    }
  ];
}
function TravelPlanOverview({ plan, className }) {
  const items = buildOverviewItems(plan);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      className: cn("mt-5", className),
      "aria-labelledby": "travel-plan-overview-title",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "h2",
          {
            id: "travel-plan-overview-title",
            className: "mb-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500",
            children: "行程概览"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dl", { className: "grid grid-cols-1 gap-3 sm:grid-cols-3", children: items.map(({ key, label, value, icon: Icon, accent }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: cn(
              "rounded-xl border border-slate-200/80 bg-gradient-to-br p-4",
              accent
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("dt", { className: "flex items-center gap-1.5 text-xs font-medium text-slate-600", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 shrink-0 opacity-80", strokeWidth: 2, "aria-hidden": true }),
                label
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "dd",
                {
                  className: cn(
                    "mt-2 font-semibold leading-snug text-slate-900",
                    key === "audience" ? "text-sm line-clamp-3" : "text-lg"
                  ),
                  children: value
                }
              )
            ]
          },
          key
        )) })
      ]
    }
  );
}
function buildSections(info, compact) {
  const limit = compact ? 2 : void 0;
  const slice = (items) => limit != null ? items.slice(0, limit) : items;
  const sections = [
    {
      key: "accommodationTips",
      title: "住宿建议",
      icon: BedDouble,
      accent: "border-amber-200/80 bg-amber-50/80",
      items: slice(info.accommodationTips)
    },
    {
      key: "transportationTips",
      title: "交通提示",
      icon: Bus,
      accent: "border-sky-200/80 bg-sky-50/80",
      items: slice(info.transportationTips)
    },
    {
      key: "precautions",
      title: "注意事项",
      icon: TriangleAlert,
      accent: "border-rose-200/80 bg-rose-50/80",
      items: slice(info.precautions)
    }
  ];
  return sections.filter((section) => section.items.length > 0);
}
function TravelPlanPracticalInfo({
  plan,
  className,
  compact = false
}) {
  const info = getPlanPracticalInfo(plan);
  const sections = buildSections(info, compact);
  if (sections.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      className: cn("mt-6 border-t border-slate-200/90 pt-6", className),
      "aria-labelledby": "travel-plan-practical-title",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-4 w-4 text-brand-600", "aria-hidden": true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { id: "travel-plan-practical-title", className: "text-sm font-semibold text-slate-900", children: "实用信息" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-3", children: sections.map(({ key, title, icon: Icon, accent, items }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "article",
          {
            className: cn("rounded-xl border p-4", accent),
            "aria-labelledby": `practical-${key}-title`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "h3",
                {
                  id: `practical-${key}-title`,
                  className: "flex items-center gap-2 text-sm font-semibold text-slate-900",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 shrink-0 opacity-80", "aria-hidden": true }),
                    title
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 space-y-2 text-sm leading-relaxed text-slate-600", children: items.map((tip) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400", "aria-hidden": true }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: tip })
              ] }, tip)) })
            ]
          },
          key
        )) })
      ]
    }
  );
}
export {
  TravelPlanDetailActions as T,
  TravelPlanDetailHeader as a,
  TravelPlanItineraryTimeline as b,
  TravelPlanOverview as c,
  TravelPlanPracticalInfo as d,
  copyTextToClipboardSync as e,
  formatTravelPlanItineraryText as f,
  sharePlainText as s
};
