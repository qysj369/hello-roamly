import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Bot, Copy, Loader2, MapPin, Save, Sparkles, Volume2, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PlanResultFollowUpBar from '@/components/features/map/PlanResultFollowUpBar';
import PlanResultStructuredContent from '@/components/features/map/PlanResultStructuredContent';
import PlanSaveDialog from '@/components/features/map/PlanSaveDialog';
import NicheExperienceReferenceSlot from '@/components/business/NicheExperienceReferenceSlot';
import {
  BRAND_AI_TIP_CLOSE,
  BRAND_AI_TIP_OPEN,
} from '@/lib/config/brandMindshare';
import {
  buildPlanResultSpeakText,
  consumeAutoNarrateNextPlan,
  speakPlanVoiceNarration,
  stopPlanVoiceNarration,
} from '@/lib/browser/planVoiceNarration';
import { showGlobalApiError } from '@/stores/apiErrorStore';
import { polishClarifyPlanForDisplay } from '@/lib/home/planDestinationDriftGuard';
import { formatPlanDemandForDisplay } from '@/lib/home/launchHomeMapQiongYouPlan';
import { sanitizeLocationLabelForDisplay } from '@/lib/map/resolveAmapPlaceName';
import {
  finalizeMapPlanContent,
  isMapPlanDeliverable,
} from '@/lib/plan/mapPlanCompleteness';
import {
  buildBudgetAlignFollowUpMessage,
  validatePlanBudget,
} from '@/lib/plan/planBudgetValidator';
import { fetchPlanTools } from '@/services/ai/api/fetchPlanTools';
import type { PlanAdvisorToolsReport } from '@/types/api/planTools';
import {
  modalPanelVariants,
  motionTransition,
  overlayVariants,
} from '@/lib/motion';
import { buildAdvisorHandoffState } from '@/lib/ai/buildAdvisorHandoff';
import { usePlanFirstTokenWatch } from '@/hooks/map/usePlanFirstTokenWatch';
import { paths, profileSavedPlansPath } from '@/router/paths';
import { usePlanHistoryUiStore } from '@/stores/planHistory/uiStore';
import { useGlobalMapPlanningStore } from '@/stores/globalMapPlanning/store';
import { toCleanPlanCopyText } from '@/utils/planResultDisplay';

export type PlanResultViewProps = {
  open: boolean;
  planStreaming?: boolean;
  locationName: string | null;
  content: string | null;
  /** 用户原始搜索/需求，仅展示在标题区 */
  initialQuery?: string | null;
  saveLoading?: boolean;
  saveError?: string | null;
  saveSuccess?: boolean;
  followUpLoading?: boolean;
  followUpError?: string | null;
  onFollowUp?: (message: string) => void;
  onSavePlan?: (title: string, isPublic: boolean) => Promise<void>;
  onClose: () => void;
};

function stripPlanToolFootnote(markdown: string): string {
  return markdown
    .split('\n')
    .map((line) => line.replace(/^>\s*/, '').replace(/\*\*/g, ''))
    .join('\n')
    .trim();
}

function defaultTitleFromLocation(locationName: string | null): string {
  if (!locationName?.trim()) {
    return '我的漫行方案';
  }
  return `${locationName.trim()}漫行方案`;
}

export default function PlanResultView({
  open,
  planStreaming = false,
  locationName,
  content,
  initialQuery = null,
  saveLoading = false,
  saveError = null,
  saveSuccess = false,
  followUpLoading = false,
  followUpError = null,
  onFollowUp,
  onSavePlan,
  onClose,
}: PlanResultViewProps) {
  const reduceMotion = useReducedMotion();
  const openHistory = usePlanHistoryUiStore((state) => state.openHistory);
  const planStreamStatus = useGlobalMapPlanningStore((state) => state.planStreamStatus);
  const planSessionId = useGlobalMapPlanningStore((state) => state.planSessionId);
  const planCoords = useGlobalMapPlanningStore((state) => state.coords);

  const [copied, setCopied] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [toolsReport, setToolsReport] = useState<PlanAdvisorToolsReport | null>(null);
  const [toolsLoading, setToolsLoading] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  /** 手机无法后台自动播报：方案就绪后展示「点这里听」 */
  const [showListenPrompt, setShowListenPrompt] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const autoNarratedSessionRef = useRef<string | null>(null);

  const displayLocation = sanitizeLocationLabelForDisplay(locationName);
  const displayDemand = formatPlanDemandForDisplay(initialQuery);
  const displayContent = content?.trim() ?? '';
  const planUsable = displayContent.length > 0 && isMapPlanDeliverable(displayContent);
  const planComplete = !planStreaming && planUsable;
  const budgetCheck = planComplete ? validatePlanBudget(displayContent) : null;
  const { waitingTooLong } = usePlanFirstTokenWatch({
    active: open && planStreaming,
    hasContent: displayContent.length > 0,
  });
  const exportableContent = planUsable
    ? polishClarifyPlanForDisplay(
        finalizeMapPlanContent(
          displayContent,
          displayLocation || '所选地点',
          null,
          displayDemand || initialQuery,
        ),
      )
    : displayContent;

  /** 语音开麦后：方案可听时弹出「点这里听」（手机禁止无手势自动播报） */
  const wasStreamingRef = useRef(false);
  useEffect(() => {
    if (planStreaming) {
      wasStreamingRef.current = true;
      return;
    }
    if (!open || !wasStreamingRef.current || !planUsable) {
      return;
    }
    wasStreamingRef.current = false;
    const sessionKey = `${planSessionId ?? ''}:${displayLocation}:${exportableContent.slice(0, 40)}`;
    if (autoNarratedSessionRef.current === sessionKey) {
      return;
    }
    if (!consumeAutoNarrateNextPlan()) {
      return;
    }
    autoNarratedSessionRef.current = sessionKey;
    setShowListenPrompt(true);
  }, [open, planStreaming, planUsable, exportableContent, displayLocation, planSessionId]);

  const handleToggleNarration = useCallback(() => {
    if (isNarrating) {
      stopPlanVoiceNarration();
      setIsNarrating(false);
      return;
    }
    const speakText = buildPlanResultSpeakText(exportableContent, displayLocation);
    if (!speakText.trim()) {
      showGlobalApiError('暂无可朗读内容，请等方案再完整一点');
      return;
    }
    setShowListenPrompt(false);
    setIsNarrating(true);
    // 必须在点击回调内同步 speak，不可 await
    speakPlanVoiceNarration(speakText, {
      immediate: true,
      onEnd: () => setIsNarrating(false),
      onError: (message) => {
        setIsNarrating(false);
        showGlobalApiError(message);
      },
    });
  }, [displayLocation, exportableContent, isNarrating]);

  const advisorHandoff = buildAdvisorHandoffState({
    initialPrompt: initialQuery ?? undefined,
    source: 'plan_result',
    locationName: locationName,
    lng: planCoords.lng,
    lat: planCoords.lat,
    planSessionId,
    planContent: exportableContent || content,
  });

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [onClose, open]);

  useEffect(() => {
    if (!open) {
      setSaveDialogOpen(false);
      setToolsReport(null);
      setIsNarrating(false);
      setShowListenPrompt(false);
      stopPlanVoiceNarration();
    }
  }, [open]);

  useEffect(() => {
    if (!open || planStreaming || !planComplete || !displayContent || !displayLocation) {
      return undefined;
    }

    const controller = new AbortController();
    setToolsLoading(true);
    void fetchPlanTools(
      { content: displayContent, locationName: displayLocation },
      { signal: controller.signal },
    )
      .then((response) => {
        setToolsReport(response.report);
      })
      .catch(() => {
        setToolsReport(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setToolsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [open, planStreaming, planComplete, displayContent, displayLocation]);

  useEffect(() => {
    if (!open) {
      stickToBottomRef.current = true;
    }
  }, [open]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !open) {
      return undefined;
    }
    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      stickToBottomRef.current = distance < 96;
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [open]);

  useEffect(() => {
    if (!open || !planStreaming || !scrollRef.current || !stickToBottomRef.current) {
      return;
    }
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [open, planStreaming, displayContent]);

  const handleCopy = useCallback(async () => {
    if (!exportableContent) {
      return;
    }
    try {
      await navigator.clipboard.writeText(toCleanPlanCopyText(exportableContent));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [exportableContent]);

  const handleSaveConfirm = useCallback(
    async (title: string, isPublic: boolean) => {
      if (!onSavePlan) {
        return;
      }
      try {
        await onSavePlan(title, isPublic);
        setSaveDialogOpen(false);
      } catch {
        /* saveError is surfaced via props */
      }
    },
    [onSavePlan],
  );

  if (!open) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/55 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={motionTransition(reduceMotion)}
            role="dialog"
            aria-modal="true"
            aria-label="AI 漫行方案"
            onClick={onClose}
          >
            <motion.div
              className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 sm:max-h-[88vh] sm:rounded-3xl"
              variants={modalPanelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={motionTransition(reduceMotion)}
              onClick={(event) => event.stopPropagation()}
            >
              <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-brand-50/80 to-violet-50/60 px-5 py-4 sm:px-6">
                <div className="min-w-0 flex-1 break-words">
                  <div className="flex items-center gap-2 text-brand-700">
                    {planStreaming ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                    ) : (
                      <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
                    )}
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      {planStreaming
                        ? planUsable
                          ? (planStreamStatus ?? '行程已出，正在收尾…')
                          : (planStreamStatus ?? '正在生成漫行方案…')
                        : '漫行方案已生成'}
                    </span>
                  </div>
                  <h2 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">AI 规划结果</h2>
                  {displayLocation && displayLocation !== '所选地点' ? (
                    <p className="mt-1 flex items-start gap-1.5 text-sm leading-relaxed text-slate-600">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" aria-hidden />
                      <span className="min-w-0 break-words whitespace-normal">{displayLocation}</span>
                    </p>
                  ) : null}
                  {displayDemand ? (
                    <p className="mt-1 min-w-0 break-words whitespace-normal text-xs leading-relaxed text-slate-500">
                      需求：{displayDemand}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-slate-500">
                    {planStreaming
                      ? planUsable
                        ? '行程已可阅读，其余段落仍在补全'
                        : '文字边生成边出现，可先浏览'
                      : '简介 · 行程流水账'}
                  </p>
                  {!saveSuccess ? (
                    <p className="mt-1 text-xs text-slate-500">
                      本次规划已自动加入{' '}
                      <button
                        type="button"
                        onClick={openHistory}
                        className="font-medium text-brand-600 underline hover:text-brand-700"
                      >
                        规划历史
                      </button>
                    </p>
                  ) : null}
                  {saveSuccess ? (
                    <p className="mt-1 text-xs font-medium text-emerald-600">
                      方案已保存 ·{' '}
                      <Link to={profileSavedPlansPath()} className="underline hover:text-emerald-700">
                        查看我的方案
                      </Link>
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {planUsable ? (
                    <button
                      type="button"
                      onClick={handleToggleNarration}
                      className="inline-flex items-center gap-1 rounded-xl border border-violet-200 bg-violet-50 px-2.5 py-2 text-xs font-semibold text-violet-800 transition hover:bg-violet-100 sm:px-3 sm:text-sm"
                      aria-label={isNarrating ? '停止朗读' : '朗读方案摘要'}
                      aria-pressed={isNarrating}
                    >
                      <Volume2 className="h-4 w-4" aria-hidden />
                      {isNarrating ? '停止' : '朗读'}
                    </button>
                  ) : null}
                  {onSavePlan ? (
                    <button
                      type="button"
                      disabled={saveLoading || !planUsable}
                      onClick={() => setSaveDialogOpen(true)}
                      className="inline-flex items-center gap-1 rounded-xl border border-brand-200 bg-white px-2.5 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-50 disabled:opacity-60 sm:px-3 sm:text-sm"
                      title={
                        planStreaming && planUsable
                          ? '行程已可保存，未完成段落会自动补齐'
                          : undefined
                      }
                    >
                      {saveLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      ) : (
                        <Save className="h-4 w-4" aria-hidden />
                      )}
                      {planStreaming && planUsable ? '保存行程' : '保存方案'}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50"
                    aria-label="关闭"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </header>

              {showListenPrompt && planUsable ? (
                <div className="shrink-0 border-b border-violet-100 bg-violet-50 px-5 py-3 sm:px-6">
                  <button
                    type="button"
                    onClick={handleToggleNarration}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
                  >
                    <Volume2 className="h-5 w-5" aria-hidden />
                    {isNarrating ? '正在朗读…点此停止' : '点这里听方案摘要'}
                  </button>
                </div>
              ) : null}

              <div
                ref={scrollRef}
                className="plan-result-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-5 py-4 sm:px-6 [-webkit-overflow-scrolling:touch] [overflow-anchor:none] [contain:layout_paint]"
              >
                {planStreaming && !planUsable ? (
                  <div className="min-h-[min(52vh,28rem)] rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3.5">
                    {displayContent ? (
                      <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-slate-800">
                        {displayContent}
                        <span
                          className="ml-0.5 inline-block h-[1em] w-0.5 animate-pulse bg-brand-500 align-text-bottom"
                          aria-hidden
                        />
                      </pre>
                    ) : waitingTooLong ? (
                      <div role="status" className="space-y-3">
                        <p className="text-sm font-medium text-amber-900">
                          等待偏久，可能是网络不稳或 AI 繁忙
                        </p>
                        <p className="text-xs leading-relaxed text-slate-600">
                          可继续等待，或关闭后重新点「一键规划」。若多次如此，请检查网络后再试。
                        </p>
                        <button
                          type="button"
                          onClick={onClose}
                          className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-950 hover:bg-amber-100"
                        >
                          关闭并稍后重试
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">
                        {planStreamStatus ?? '正在连接 AI，首字即将出现…'}
                      </p>
                    )}
                  </div>
                ) : planStreaming && planUsable ? (
                  <div className="min-h-[min(52vh,28rem)]">
                    <p className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                      {planStreamStatus ?? '行程已就绪，正在写完各天细节…'}
                      {onSavePlan ? ' · 现在就可以点右上角「保存行程」' : ''}
                    </p>
                    <PlanResultStructuredContent
                      content={polishClarifyPlanForDisplay(displayContent)}
                      planStreaming
                      initialQuery={initialQuery}
                    />
                  </div>
                ) : (
                  <>
                    <p className="mb-3 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-xs leading-relaxed text-emerald-900/90">
                      {BRAND_AI_TIP_OPEN}
                    </p>
                    {budgetCheck && !budgetCheck.withinTolerance && budgetCheck.issues.length > 0 ? (
                      <div
                        className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
                        role="status"
                      >
                        <p>{budgetCheck.issues.join('；')}。可用下方「降低预算」或自己输入追问，让 AI 对齐花费表。</p>
                        {onFollowUp ? (
                          <button
                            type="button"
                            disabled={followUpLoading}
                            onClick={() => onFollowUp(buildBudgetAlignFollowUpMessage(budgetCheck))}
                            className="mt-2 inline-flex rounded-lg border border-amber-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-60"
                          >
                            一键对齐预算
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                    {toolsLoading ? (
                      <p className="mb-3 text-xs text-slate-500">正在校验预算、地点与天气…</p>
                    ) : null}
                    {toolsReport?.combinedFootnote ? (
                      <div
                        className="mb-3 rounded-xl border border-[color-mix(in_srgb,var(--theme-line)_85%,transparent)] bg-[color-mix(in_srgb,var(--color-main)_5%,var(--bg-card,#fffef8))] px-3 py-2 text-xs text-slate-800 whitespace-pre-wrap"
                        role="status"
                      >
                        {stripPlanToolFootnote(toolsReport.combinedFootnote)}
                      </div>
                    ) : null}
                    <PlanResultStructuredContent
                      content={exportableContent || displayContent}
                      initialQuery={initialQuery}
                    />
                    <p className="mt-4 mb-1 px-0.5 text-xs leading-relaxed text-slate-500">
                      {BRAND_AI_TIP_CLOSE}
                    </p>
                  </>
                )}
                <div ref={bottomRef} className="h-1 shrink-0" aria-hidden />
              </div>

              {!planStreaming && planUsable && onFollowUp ? (
                <PlanResultFollowUpBar
                  disabled={planStreaming}
                  loading={followUpLoading}
                  error={followUpError}
                  onSend={onFollowUp}
                />
              ) : null}

              {!planStreaming && planUsable ? (
                <NicheExperienceReferenceSlot className="mx-5 mb-3 sm:mx-6" />
              ) : null}

              <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-100 bg-white px-5 py-3 sm:px-6">
                <Link
                  to={paths.ai}
                  state={advisorHandoff}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-800 transition hover:bg-violet-100 disabled:pointer-events-none disabled:opacity-60"
                  aria-disabled={!planUsable}
                  tabIndex={planUsable ? 0 : -1}
                  onClick={(event) => {
                    if (!planUsable) {
                      event.preventDefault();
                    }
                  }}
                >
                  <Bot className="h-4 w-4" aria-hidden />
                  在顾问中继续
                </Link>
                <div className="flex items-center gap-2">
                {planUsable ? (
                  <button
                    type="button"
                    onClick={handleToggleNarration}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    aria-label={isNarrating ? '停止朗读' : '朗读方案摘要'}
                    aria-pressed={isNarrating}
                  >
                    <Volume2 className="h-4 w-4" aria-hidden />
                    {isNarrating ? '停止' : '朗读'}
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={!planUsable}
                  onClick={() => {
                    void handleCopy();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  <Copy className="h-4 w-4" aria-hidden />
                  {copied ? '已复制' : planStreaming && planUsable ? '复制行程' : '复制全部'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  完成
                </button>
                </div>
              </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PlanSaveDialog
        open={saveDialogOpen}
        defaultTitle={defaultTitleFromLocation(displayLocation)}
        loading={saveLoading}
        error={saveError}
        onClose={() => setSaveDialogOpen(false)}
        onConfirm={handleSaveConfirm}
      />
    </>
  );
}
