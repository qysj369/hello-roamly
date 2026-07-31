import { j as jsxRuntimeExports } from "./vendor-react-DtfH6MSw.js";
import { ah as SNAIL_COMMUNITY, ai as SNAIL_COMMUNITY_CREED, al as SNAIL_SLANG_CATEGORY_LABELS, ak as SNAIL_RANKS, bl as cn, am as SNAIL_SLANG_GLOSSARY, eX as usePageSeo, em as snailCulturePageSeo } from "./index-DwV1qlqh.js";
import { S as SnailSlangTerm } from "./SnailSlangTerm-Dp9sc9n7.js";
import "./vendor-three-Blpl5Qyv.js";
const CATEGORY_ORDER = ["guide", "budget", "social", "action"];
function groupGlossaryByCategory() {
  const groups = /* @__PURE__ */ new Map();
  for (const category of CATEGORY_ORDER) {
    groups.set(
      category,
      SNAIL_SLANG_GLOSSARY.filter((entry) => entry.category === category)
    );
  }
  return groups;
}
function SnailGlossaryPanel({
  showCreed = true,
  showRanks = true,
  className
}) {
  const grouped = groupGlossaryByCategory();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("space-y-8", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-emerald-700", children: SNAIL_COMMUNITY.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-1 text-xl font-bold text-slate-900", children: SNAIL_COMMUNITY.glossaryTitle }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-slate-600", children: SNAIL_COMMUNITY.glossarySubtitle })
    ] }),
    showCreed && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "aria-labelledby": "snail-creed-title", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { id: "snail-creed-title", className: "text-base font-bold text-slate-900", children: SNAIL_COMMUNITY.creedTitle }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 space-y-2", children: SNAIL_COMMUNITY_CREED.map((line) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "li",
        {
          className: "rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-relaxed text-slate-700",
          children: line
        },
        line
      )) })
    ] }),
    CATEGORY_ORDER.map((category) => {
      const entries = grouped.get(category) ?? [];
      if (entries.length === 0) {
        return null;
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "aria-labelledby": `snail-glossary-${category}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "h3",
          {
            id: `snail-glossary-${category}`,
            className: "text-sm font-bold text-slate-900",
            children: SNAIL_SLANG_CATEGORY_LABELS[category]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dl", { className: "mt-3 grid gap-2 sm:grid-cols-2", children: entries.map((entry) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "rounded-xl border border-slate-200 bg-white px-4 py-3",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-bold text-slate-900", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SnailSlangTerm, { entry }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1 text-sm leading-relaxed text-slate-600", children: entry.meaning }),
              entry.example && /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-1.5 text-xs text-slate-400", children: entry.example })
            ]
          },
          entry.id
        )) })
      ] }, category);
    }),
    showRanks && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "aria-labelledby": "snail-ranks-title", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { id: "snail-ranks-title", className: "text-sm font-bold text-slate-900", children: "蜗阶称号" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: "按发布计划数粗略划分，正式版可接入轨迹点统计。" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "mt-3 space-y-2", children: SNAIL_RANKS.map((rank) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "li",
        {
          className: "flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", "aria-hidden": true, children: rank.emoji }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-slate-900", children: rank.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs text-slate-600", children: rank.description }),
              rank.minPublishedPlans > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-[10px] text-slate-400", children: [
                "约 ",
                rank.minPublishedPlans,
                "+ 条计划"
              ] })
            ] })
          ]
        },
        rank.id
      )) })
    ] })
  ] });
}
function SnailCulturePage() {
  usePageSeo(snailCulturePageSeo());
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SnailGlossaryPanel, {}) });
}
export {
  SnailCulturePage as default
};
