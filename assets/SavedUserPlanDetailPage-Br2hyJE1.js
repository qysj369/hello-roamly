var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { a as reactExports, j as jsxRuntimeExports } from "./vendor-react-DtfH6MSw.js";
import { aC as USER_API, be as buildUserApiHeaders, f0 as useQueryClient, eV as useMutation, d_ as queryKeys, eW as useNavigate, _ as LoaderCircle, dX as profileSavedPlansPath, bl as cn, fd as xhsInputToCopyText, e5 as renderXhsPosterSlides, e4 as renderSharePoster, cO as getSavedUserPlanCoverUrl, cQ as getSavedUserPlanSummary, b$ as formatSavedUserPlanMeta, dB as mapShareInputToXhs, dd as hashtagsFromTags, ba as buildShareUrl, eg as savedUserPlanDetailPath, cP as getSavedUserPlanRoundsLabel, eC as trackShareOutcome, ar as SharePosterDialog, bu as createChinaPosterVariants, dl as isChinaPrimaryMarket, aq as Share2, ae as QrCode, a3 as MessageCircle, eY as useParams, f6 as userPlanToConversationTurns, L as DEMO_CURRENT_USER_ID, eX as usePageSeo, Z as Link, dS as paths, at as Sparkles, a1 as MapPin, aD as User, i as AiChatMarkdown } from "./index-DwV1qlqh.js";
import { T as Trash2 } from "./trash-2-DMzHlprq.js";
import { m as messagesInboxPath } from "./messagesPaths-DTRnqq0a.js";
import { s as stashSiteChatDraft } from "./siteChatDraft-DGMj78fI.js";
import { a as MotionPage, M as MotionBlock } from "./MotionPage-Bc8Pg75O.js";
import { u as useUserPlanDetail, G as Globe, L as Lock } from "./useUserPlans-BzrRig6S.js";
import { u as useShareLandingTracking } from "./useShareLandingTracking-DSPHg4qR.js";
import { A as ArrowLeft } from "./arrow-left-DfGUbiny.js";
import "./vendor-three-Blpl5Qyv.js";
class PatchUserPlanApiError extends Error {
  constructor(message, options) {
    super(message);
    __publicField(this, "status");
    __publicField(this, "code");
    this.name = "PatchUserPlanApiError";
    this.status = options == null ? void 0 : options.status;
    this.code = options == null ? void 0 : options.code;
  }
}
async function patchUserPlan(planId, body) {
  const response = await fetch(`${USER_API.plans}/${encodeURIComponent(planId)}`, {
    method: "PATCH",
    headers: buildUserApiHeaders(),
    body: JSON.stringify(body)
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload && "error" in payload && payload.error ? payload.error : `更新失败（HTTP ${response.status}）`;
    throw new PatchUserPlanApiError(message, {
      status: response.status,
      code: payload && "code" in payload ? payload.code : void 0
    });
  }
  if (!payload || !("item" in payload) || !payload.item) {
    throw new PatchUserPlanApiError("API 返回格式无效", { status: response.status });
  }
  return payload;
}
function usePatchUserPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, body }) => patchUserPlan(planId, body),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["user-plans"] });
      void queryClient.invalidateQueries({ queryKey: ["user-ai-sessions"] });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.userPlans.detail(variables.planId)
      });
      void queryClient.invalidateQueries({ queryKey: ["discover", "feed"] });
    }
  });
}
class DeleteUserPlanApiError extends Error {
  constructor(message, options) {
    super(message);
    __publicField(this, "status");
    __publicField(this, "code");
    this.name = "DeleteUserPlanApiError";
    this.status = options == null ? void 0 : options.status;
    this.code = options == null ? void 0 : options.code;
  }
}
async function deleteUserPlan(planId) {
  const response = await fetch(`${USER_API.plans}/${encodeURIComponent(planId)}`, {
    method: "DELETE",
    headers: buildUserApiHeaders()
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload && "error" in payload && payload.error ? payload.error : `删除失败（HTTP ${response.status}）`;
    throw new DeleteUserPlanApiError(message, {
      status: response.status,
      code: payload && "code" in payload ? payload.code : void 0
    });
  }
  if (!payload || !("ok" in payload)) {
    throw new DeleteUserPlanApiError("API 返回格式无效", { status: response.status });
  }
  return payload;
}
function useDeleteUserPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId) => deleteUserPlan(planId),
    onSuccess: (_data, planId) => {
      void queryClient.invalidateQueries({ queryKey: ["user-plans"] });
      void queryClient.invalidateQueries({ queryKey: ["user-ai-sessions"] });
      queryClient.removeQueries({ queryKey: queryKeys.userPlans.detail(planId) });
      void queryClient.invalidateQueries({ queryKey: ["discover", "feed"] });
    }
  });
}
function SavedUserPlanManagePanel({ plan, className }) {
  const navigate = useNavigate();
  const patchPlan = usePatchUserPlan();
  const deletePlan = useDeleteUserPlan();
  const [confirmDelete, setConfirmDelete] = reactExports.useState(false);
  const [titleDraft, setTitleDraft] = reactExports.useState(plan.title);
  const [titleSaved, setTitleSaved] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setTitleDraft(plan.title);
  }, [plan.title]);
  const isBusy = patchPlan.isPending || deletePlan.isPending;
  const titleChanged = titleDraft.trim() !== plan.title && titleDraft.trim().length > 0;
  const handleSaveTitle = () => {
    const nextTitle = titleDraft.trim();
    if (!nextTitle || nextTitle === plan.title) {
      return;
    }
    patchPlan.mutate(
      { planId: plan.id, body: { title: nextTitle } },
      {
        onSuccess: () => {
          setTitleSaved(true);
          window.setTimeout(() => setTitleSaved(false), 2e3);
        }
      }
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      className: cn(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-slate-900", children: "方案管理" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-slate-500", children: "仅你可见的管理选项" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "mt-4 block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-1 block text-xs font-medium text-slate-600", children: "方案名称" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: titleDraft,
                disabled: isBusy,
                onChange: (event) => setTitleDraft(event.target.value),
                onKeyDown: (event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSaveTitle();
                  }
                },
                placeholder: "例如：成都3日美食之旅",
                className: "min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                disabled: isBusy || !titleChanged,
                onClick: handleSaveTitle,
                className: "shrink-0 rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500",
                children: patchPlan.isPending ? "保存中…" : titleSaved ? "已保存" : "重命名"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: plan.isPublic,
              disabled: isBusy,
              onChange: (event) => {
                patchPlan.mutate({
                  planId: plan.id,
                  body: { isPublic: event.target.checked }
                });
              },
              className: "mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-slate-700", children: [
            "公开方案",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 block text-xs text-slate-500", children: "勾选后其他蜗友可在发现页与你的蜗居看到" })
          ] })
        ] }),
        patchPlan.isError ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-rose-600", role: "alert", children: "更新失败，请稍后再试" }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 border-t border-slate-100 pt-4", children: [
          !confirmDelete ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              disabled: isBusy,
              onClick: () => setConfirmDelete(true),
              className: "inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4", "aria-hidden": true }),
                "删除方案"
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-slate-700", children: [
              "确定删除「",
              plan.title,
              "」？此操作不可恢复。"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  disabled: isBusy,
                  onClick: () => setConfirmDelete(false),
                  className: "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50",
                  children: "取消"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  disabled: isBusy,
                  onClick: () => {
                    deletePlan.mutate(plan.id, {
                      onSuccess: () => {
                        navigate(profileSavedPlansPath(), { replace: true });
                      }
                    });
                  },
                  className: "inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60",
                  children: [
                    deletePlan.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin", "aria-hidden": true }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4", "aria-hidden": true }),
                    "确认删除"
                  ]
                }
              )
            ] })
          ] }),
          deletePlan.isError ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-rose-600", role: "alert", children: "删除失败，请稍后再试" }) : null
        ] })
      ]
    }
  );
}
function savedPlanSharePosterInput(plan) {
  const destination = plan.content.locationName;
  return {
    input: {
      badge: "穷游方案",
      title: plan.title,
      subtitle: `${destination} · ${getSavedUserPlanRoundsLabel(plan)}`,
      summary: getSavedUserPlanSummary(plan),
      shareUrl: buildShareUrl(savedUserPlanDetailPath(plan.id), {
        contentKind: "saved_user_plan",
        contentId: plan.id
      }),
      coverImageUrl: getSavedUserPlanCoverUrl(plan.id, destination),
      qrCaption: "长按识别二维码查看方案",
      qrFooter: "微信扫码 · 蜗牛旅行穷游方案"
    },
    destination
  };
}
function getSavedUserPlanXhsPosterInput(plan) {
  const { input, destination } = savedPlanSharePosterInput(plan);
  const cover = getSavedUserPlanCoverUrl(plan.id, destination);
  const summaryText = getSavedUserPlanSummary(plan);
  return {
    ...mapShareInputToXhs(input, {
      hashtags: hashtagsFromTags([], [destination, "穷游", "AI行程", "蜗牛旅行"]),
      locationLabel: destination,
      titlePrefix: "🐌 "
    }),
    slideImageUrls: cover ? [cover] : [],
    summarySlide: {
      title: `${destination}穷游方案`,
      lines: [
        formatSavedUserPlanMeta(plan),
        summaryText.slice(0, 120),
        "完整对话与行程扫码查看 →"
      ].filter(Boolean)
    }
  };
}
function getSavedUserPlanXhsCopyText(plan) {
  return xhsInputToCopyText(getSavedUserPlanXhsPosterInput(plan));
}
async function buildSavedUserPlanPosterBlob(plan) {
  return renderSharePoster(savedPlanSharePosterInput(plan).input);
}
async function buildSavedUserPlanXhsPosterBlob(plan) {
  const slides = await buildSavedUserPlanXhsPosterSlides(plan);
  return slides[0];
}
async function buildSavedUserPlanXhsPosterSlides(plan) {
  return renderXhsPosterSlides(getSavedUserPlanXhsPosterInput(plan));
}
function buildSavedUserPlanShareText(plan) {
  return `${plan.title} · ${formatSavedUserPlanMeta(plan)}
${getSavedUserPlanSummary(plan).slice(0, 80)}`;
}
async function shareSavedUserPlan(plan) {
  if (typeof window === "undefined") {
    return "failed";
  }
  const tracking = { contentKind: "saved_user_plan", contentId: plan.id };
  const url = buildShareUrl(savedUserPlanDetailPath(plan.id), tracking);
  const text = buildSavedUserPlanShareText(plan);
  try {
    if (navigator.share) {
      await navigator.share({ title: plan.title, text, url });
      trackShareOutcome(tracking, "shared", { channel: "native", shareUrl: url });
      return "shared";
    }
    await navigator.clipboard.writeText(`${text}
${url}`);
    trackShareOutcome(tracking, "copied", { channel: "link", shareUrl: url });
    return "copied";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return "cancelled";
    }
    try {
      await navigator.clipboard.writeText(`${text}
${url}`);
      trackShareOutcome(tracking, "copied", { channel: "link", shareUrl: url });
      return "copied";
    } catch {
      return "failed";
    }
  }
}
function buildSavedUserPlanChatDraft(plan) {
  const tracking = { contentKind: "saved_user_plan", contentId: plan.id };
  const url = buildShareUrl(savedUserPlanDetailPath(plan.id), tracking);
  return `分享穷游方案：${plan.title}
${plan.content.locationName}
${url}`;
}
function SavedUserPlanWechatSharePosterDialog({
  plan,
  open,
  onClose
}) {
  const safeName = plan.title.replace(/[\\/:*?"<>|]/g, "_").slice(0, 40);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    SharePosterDialog,
    {
      open,
      onClose,
      title: "图文分享 · 穷游方案",
      description: "生成微信海报或小红书风格笔记图，保存后发布到社交平台",
      shareUrl: buildShareUrl(savedUserPlanDetailPath(plan.id), {
        contentKind: "saved_user_plan",
        contentId: plan.id
      }),
      downloadFilename: `${safeName || "穷游方案"}-分享海报.png`,
      posterAlt: `${plan.title} 分享图`,
      posterVariants: createChinaPosterVariants({
        baseFilename: safeName || "穷游方案",
        buildWechat: () => buildSavedUserPlanPosterBlob(plan),
        buildXhs: () => buildSavedUserPlanXhsPosterBlob(plan),
        buildXhsSlides: () => buildSavedUserPlanXhsPosterSlides(plan),
        getXhsCopyText: () => getSavedUserPlanXhsCopyText(plan)
      }),
      shareTrackContext: { contentKind: "saved_user_plan", contentId: plan.id },
      onSystemShare: () => shareSavedUserPlan(plan)
    }
  );
}
const FEEDBACK_LABEL = {
  shared: "已分享",
  copied: "已复制",
  failed: "失败"
};
function SavedUserPlanShareControls({
  plan,
  className,
  variant = "primary"
}) {
  const navigate = useNavigate();
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
    const result = await shareSavedUserPlan(plan);
    if (result !== "cancelled") {
      setFeedback(result);
    }
  }
  function handleShareToMessages(event) {
    event.stopPropagation();
    const draft = buildSavedUserPlanChatDraft(plan);
    stashSiteChatDraft(draft);
    navigate(messagesInboxPath(), { state: { draftMessage: draft } });
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
          "aria-label": "分享穷游方案",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: cn(isPrimary ? "h-4 w-4" : "h-3.5 w-3.5"), "aria-hidden": true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: quickLabel })
          ]
        }
      ),
      chinaShare ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
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
      ) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: handleShareToMessages,
          className: cn(
            buttonBase,
            isPrimary ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" : "text-violet-700 hover:bg-violet-50"
          ),
          "aria-label": "分享到消息",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: cn(isPrimary ? "h-4 w-4" : "h-3.5 w-3.5"), "aria-hidden": true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isPrimary ? "发到消息" : "消息" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SavedUserPlanWechatSharePosterDialog,
      {
        plan,
        open: posterOpen,
        onClose: () => setPosterOpen(false)
      }
    )
  ] });
}
function SavedUserPlanDetailPage() {
  const { planId = "" } = useParams();
  const { data, isLoading, error } = useUserPlanDetail(planId);
  const plan = data == null ? void 0 : data.item;
  const turns = plan ? userPlanToConversationTurns(plan) : [];
  const isOwner = (plan == null ? void 0 : plan.userId) === DEMO_CURRENT_USER_ID;
  usePageSeo({
    title: plan ? `${plan.title} — 穷游方案` : "穷游方案",
    path: planId ? `${paths.savedPlans}/${planId}` : paths.savedPlans
  });
  useShareLandingTracking({
    contentKind: "saved_user_plan",
    contentId: planId
  });
  const backHref = isOwner ? profileSavedPlansPath() : paths.discover;
  const backLabel = isOwner ? "返回我的方案" : "返回发现";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MotionPage, { className: "mx-auto flex w-full max-w-3xl flex-col gap-4 pb-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to: backHref,
        className: "inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4", "aria-hidden": true }),
          backLabel
        ]
      }
    ) }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-sm text-slate-500", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin", "aria-hidden": true }),
      "加载方案中…"
    ] }) }) : null,
    error || !isLoading && !plan ? /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-2xl border border-rose-100 bg-rose-50 px-4 py-10 text-center text-sm text-rose-700", children: "方案不存在或无权查看" }) }) : null,
    plan ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "rounded-2xl border border-slate-200 bg-gradient-to-r from-brand-50/80 to-violet-50/60 p-5 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-brand-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 shrink-0", "aria-hidden": true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold uppercase tracking-wide", children: "穷游方案" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 text-xl font-bold text-slate-900", children: plan.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 flex items-center gap-1.5 text-sm text-slate-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5 shrink-0 text-brand-500", "aria-hidden": true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: plan.content.locationName })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-start gap-3 sm:items-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                plan.isPublic ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
              ),
              children: plan.isPublic ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-3.5 w-3.5", "aria-hidden": true }),
                "公开"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3.5 w-3.5", "aria-hidden": true }),
                "私密"
              ] })
            }
          ),
          (isOwner || plan.isPublic) && /* @__PURE__ */ jsxRuntimeExports.jsx(SavedUserPlanShareControls, { plan, variant: "compact" })
        ] })
      ] }) }) }),
      isOwner ? /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SavedUserPlanManagePanel, { plan }) }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx(MotionBlock, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: turns.map((turn, index) => {
        const isUser = turn.role === "user";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "section",
          {
            className: cn(
              "rounded-2xl border px-4 py-3 sm:px-5",
              isUser ? "border-slate-200 bg-slate-50" : "border-brand-100 bg-white shadow-sm"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  className: cn(
                    "mb-2 flex items-center gap-1.5 text-xs font-semibold",
                    isUser ? "text-slate-600" : "text-brand-700"
                  ),
                  children: isUser ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3.5 w-3.5", "aria-hidden": true }),
                    "追问"
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5", "aria-hidden": true }),
                    index === 0 ? "初版方案" : "AI 更新方案"
                  ] })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AiChatMarkdown, { content: turn.content, className: "text-[15px] leading-relaxed" })
            ]
          },
          turn.id
        );
      }) }) })
    ] }) : null
  ] });
}
export {
  SavedUserPlanDetailPage as default
};
