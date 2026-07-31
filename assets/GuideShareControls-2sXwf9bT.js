import { a as reactExports, j as jsxRuntimeExports } from "./vendor-react-DtfH6MSw.js";
import { ba as buildShareUrl, d2 as guideDetailPath, eC as trackShareOutcome, fd as xhsInputToCopyText, e5 as renderXhsPosterSlides, e4 as renderSharePoster, cg as getGuideCoverUrl, dB as mapShareInputToXhs, dd as hashtagsFromTags, dl as isChinaPrimaryMarket, bl as cn, aq as Share2, ae as QrCode, ar as SharePosterDialog, bu as createChinaPosterVariants } from "./index-DwV1qlqh.js";
function getGuideShareSummary(guide) {
  const tags = guide.tags.slice(0, 3).join(" · ");
  return `${guide.title} · ${guide.city} · ${guide.budget} · ${guide.days}${tags ? ` · ${tags}` : ""}`;
}
async function shareGuide(guide) {
  if (typeof window === "undefined") {
    return "failed";
  }
  const tracking = { contentKind: "guide", contentId: guide.id };
  const url = buildShareUrl(guideDetailPath(guide.id), tracking);
  const text = getGuideShareSummary(guide);
  try {
    if (navigator.share) {
      await navigator.share({ title: guide.title, text, url });
      const result2 = "shared";
      trackShareOutcome(tracking, result2, { channel: "native", shareUrl: url });
      return result2;
    }
    await navigator.clipboard.writeText(`${text}
${url}`);
    const result = "copied";
    trackShareOutcome(tracking, result, { channel: "link", shareUrl: url });
    return result;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return "cancelled";
    }
    try {
      await navigator.clipboard.writeText(`${text}
${url}`);
      const result = "copied";
      trackShareOutcome(tracking, result, { channel: "link", shareUrl: url });
      return result;
    } catch {
      return "failed";
    }
  }
}
function guideSharePosterInput(guide) {
  return {
    badge: "穷游攻略",
    title: guide.title,
    subtitle: `${guide.city} · ${guide.days} · ${guide.budget}`,
    summary: getGuideShareSummary(guide),
    shareUrl: buildShareUrl(guideDetailPath(guide.id), {
      contentKind: "guide",
      contentId: guide.id
    }),
    coverImageUrl: getGuideCoverUrl(guide, 560),
    qrCaption: "长按识别二维码查看攻略",
    qrFooter: "微信扫码 · 穷游攻略与 AI 行程"
  };
}
function getGuideXhsPosterInput(guide) {
  const base = guideSharePosterInput(guide);
  const cover = getGuideCoverUrl(guide, 720);
  return {
    ...mapShareInputToXhs(base, {
      hashtags: hashtagsFromTags(guide.tags, [guide.city, "穷游攻略", "旅行干货"]),
      locationLabel: guide.city,
      titlePrefix: "✨ "
    }),
    slideImageUrls: cover ? [cover] : [],
    summarySlide: {
      title: `${guide.city}怎么玩？`,
      lines: [
        `🗓 行程：${guide.days}`,
        `💰 预算：${guide.budget}`,
        `🏷 ${guide.tags.slice(0, 4).map((tag) => `#${tag}`).join(" ")}`,
        "更多细节扫码见攻略详情 →"
      ]
    }
  };
}
function getGuideXhsCopyText(guide) {
  return xhsInputToCopyText(getGuideXhsPosterInput(guide));
}
async function buildGuidePosterBlob(guide) {
  return renderSharePoster(guideSharePosterInput(guide));
}
async function buildGuideXhsPosterBlob(guide) {
  const slides = await buildGuideXhsPosterSlides(guide);
  return slides[0];
}
async function buildGuideXhsPosterSlides(guide) {
  return renderXhsPosterSlides(getGuideXhsPosterInput(guide));
}
const FEEDBACK_LABEL = {
  shared: "已分享",
  copied: "已复制",
  failed: "失败"
};
function GuideShareControls({
  guide,
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
    const result = await shareGuide(guide);
    if (result !== "cancelled") {
      setFeedback(result);
    }
  }
  const quickLabel = feedback !== "idle" && feedback !== "cancelled" ? FEEDBACK_LABEL[feedback] : "分享";
  const buttonBase = cn(
    "inline-flex shrink-0 items-center justify-center gap-1.5 font-semibold transition",
    isPrimary ? "rounded-xl px-3.5 py-2 text-sm shadow-sm" : "rounded-lg px-2.5 py-1.5 text-xs"
  );
  const safeName = guide.title.replace(/[\\/:*?"<>|]/g, "_").slice(0, 40);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex flex-wrap items-center gap-2", className), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: handleQuickShare,
          className: cn(
            buttonBase,
            isPrimary ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" : "text-slate-600 hover:bg-slate-100"
          ),
          "aria-label": "分享攻略",
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
          onClick: (event) => {
            event.stopPropagation();
            setPosterOpen(true);
          },
          className: cn(
            buttonBase,
            isPrimary ? "bg-emerald-600 text-white hover:bg-emerald-700" : "text-emerald-700 hover:bg-emerald-50"
          ),
          "aria-label": "生成微信分享海报",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: cn(isPrimary ? "h-4 w-4" : "h-3.5 w-3.5"), "aria-hidden": true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isPrimary ? "分享图" : "海报" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SharePosterDialog,
      {
        open: posterOpen,
        onClose: () => setPosterOpen(false),
        title: "图文分享 · 攻略",
        description: "生成微信海报或小红书风格笔记图",
        shareUrl: buildShareUrl(guideDetailPath(guide.id)),
        downloadFilename: `${safeName || "攻略"}-分享海报.png`,
        posterAlt: `${guide.title} 分享图`,
        posterVariants: createChinaPosterVariants({
          baseFilename: safeName || "攻略",
          buildWechat: () => buildGuidePosterBlob(guide),
          buildXhs: () => buildGuideXhsPosterBlob(guide),
          buildXhsSlides: () => buildGuideXhsPosterSlides(guide),
          getXhsCopyText: () => getGuideXhsCopyText(guide)
        }),
        shareTrackContext: { contentKind: "guide", contentId: guide.id },
        onSystemShare: () => shareGuide(guide)
      }
    )
  ] });
}
export {
  GuideShareControls as G
};
