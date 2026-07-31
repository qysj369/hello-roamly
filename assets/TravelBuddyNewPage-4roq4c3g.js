import { a as reactExports, j as jsxRuntimeExports } from "./vendor-react-DtfH6MSw.js";
import { a as TRAVEL_BUDDY_BUDGET_OPTIONS, c as TRAVEL_BUDDY_TAG_OPTIONS, T as TRAVEL_BUDDY_BRAND } from "./travelBuddy-D507Vifi.js";
import { n as nonEmptyStringSchema, u as userIdSchema } from "./shared-jn_3pZJw.js";
import { dM as object, et as string, aU as array, aJ as _enum, bl as cn, eW as useNavigate, eU as useLocation, eX as usePageSeo, Z as Link, dS as paths } from "./index-DwV1qlqh.js";
import { d as defaultTravelBuddyStartDate, u as useCreateTravelBuddy } from "./useTravelBuddyList-CsTlqFhT.js";
import { a as MotionPage, M as MotionBlock } from "./MotionPage-Bc8Pg75O.js";
import { A as ArrowLeft } from "./arrow-left-DfGUbiny.js";
import { C as CircleCheck } from "./circle-check-DVB7QD2m.js";
import "./vendor-three-Blpl5Qyv.js";
import "./paths-DVmRdz8n.js";
const budgetRangeSchema = _enum(
  TRAVEL_BUDDY_BUDGET_OPTIONS.map((item) => item.value)
);
const tagSchema = _enum(
  TRAVEL_BUDDY_TAG_OPTIONS.map((item) => item.value)
);
const dateOnlySchema = string().regex(/^\d{4}-\d{2}-\d{2}$/, "请选择有效日期");
_enum(["seeking", "matched", "closed"]);
const createTravelBuddyPostSchema = object({
  destination: nonEmptyStringSchema.min(1).max(120),
  startDate: dateOnlySchema,
  budgetRange: budgetRangeSchema,
  tags: array(tagSchema).min(1, "请至少选择一个结伴需求"),
  description: string().max(500).optional()
});
object({
  buddyPostId: nonEmptyStringSchema.max(128),
  toUserId: userIdSchema,
  content: nonEmptyStringSchema.min(1).max(1e3)
});
function TravelBuddyPublishForm({
  initialDestination = "",
  onSubmit,
  isSubmitting = false
}) {
  const [destination, setDestination] = reactExports.useState(initialDestination);
  const [startDate, setStartDate] = reactExports.useState(defaultTravelBuddyStartDate(3));
  const [budgetRange, setBudgetRange] = reactExports.useState("500_1000");
  const [tags, setTags] = reactExports.useState([]);
  const [description, setDescription] = reactExports.useState("");
  const [error, setError] = reactExports.useState(null);
  const minDate = reactExports.useMemo(() => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), []);
  function toggleTag(value) {
    setTags(
      (prev) => prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  }
  async function handleSubmit(event) {
    var _a;
    event.preventDefault();
    setError(null);
    const payload = {
      destination: destination.trim(),
      startDate,
      budgetRange,
      tags,
      description: description.trim() || void 0
    };
    const parsed = createTravelBuddyPostSchema.safeParse(payload);
    if (!parsed.success) {
      const first = (_a = Object.values(parsed.error.flatten().fieldErrors)[0]) == null ? void 0 : _a[0];
      setError(first ?? "请检查表单");
      return;
    }
    await onSubmit(parsed.data);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "buddy-destination", className: "text-sm font-semibold text-slate-800", children: [
        "目的地 / 路线 ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          id: "buddy-destination",
          type: "text",
          required: true,
          value: destination,
          onChange: (event) => setDestination(event.target.value),
          placeholder: "如：西安三天、大理洱海环线",
          className: "mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "buddy-start-date", className: "text-sm font-semibold text-slate-800", children: [
        "出发日期 ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          id: "buddy-start-date",
          type: "date",
          required: true,
          min: minDate,
          value: startDate,
          onChange: (event) => setStartDate(event.target.value),
          className: "mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("legend", { className: "text-sm font-semibold text-slate-800", children: [
        "大致人均预算 ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4", children: TRAVEL_BUDDY_BUDGET_OPTIONS.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "label",
        {
          className: cn(
            "cursor-pointer rounded-xl border px-3 py-2.5 text-center text-xs font-medium",
            budgetRange === option.value ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "radio",
                name: "budgetRange",
                value: option.value,
                checked: budgetRange === option.value,
                onChange: () => setBudgetRange(option.value),
                className: "sr-only"
              }
            ),
            option.label
          ]
        },
        option.value
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("legend", { className: "text-sm font-semibold text-slate-800", children: [
        "结伴需求 ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex flex-wrap gap-2", children: TRAVEL_BUDDY_TAG_OPTIONS.map((option) => {
        const active = tags.includes(option.value);
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => toggleTag(option.value),
            className: cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium",
              active ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            ),
            children: option.label
          },
          option.value
        );
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "buddy-description", className: "text-sm font-semibold text-slate-800", children: "我的情况 / 要求" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          id: "buddy-description",
          rows: 4,
          value: description,
          onChange: (event) => setDescription(event.target.value),
          placeholder: "如：本人男生，会开车，求拼房分摊",
          className: "mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        }
      )
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700", role: "alert", children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "submit",
        disabled: isSubmitting,
        className: "rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60",
        children: isSubmitting ? "发布中…" : "发布需求"
      }
    )
  ] });
}
function TravelBuddyNewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state ?? null;
  const createMutation = useCreateTravelBuddy();
  const [published, setPublished] = reactExports.useState(false);
  usePageSeo({
    title: `${TRAVEL_BUDDY_BRAND.publishTitle} — 蜗牛旅行`,
    path: paths.travelBuddyNew
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MotionPage, { className: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: () => navigate(-1),
        className: "inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4", "aria-hidden": true }),
          "返回"
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-bold text-slate-900", children: TRAVEL_BUDDY_BRAND.publishTitle }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-600", children: TRAVEL_BUDDY_BRAND.tagline })
    ] }) }),
    published ? /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "mx-auto h-10 w-10 text-emerald-600", "aria-hidden": true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-base font-semibold text-slate-900", children: "需求已发布，状态：寻找中" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-600", children: "感兴趣的蜗友会通过站内信联系你" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: paths.travelBuddies,
          className: "mt-4 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700",
          children: "查看伸出触角信息流"
        }
      )
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      TravelBuddyPublishForm,
      {
        initialDestination: (routeState == null ? void 0 : routeState.destination) ?? "",
        isSubmitting: createMutation.isPending,
        onSubmit: async (payload) => {
          await createMutation.mutateAsync(payload);
          setPublished(true);
        }
      }
    ) }) })
  ] });
}
export {
  TravelBuddyNewPage as default
};
