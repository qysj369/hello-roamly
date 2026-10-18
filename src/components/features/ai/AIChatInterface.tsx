import { Loader2, SlidersHorizontal } from 'lucide-react';
import { useCallback, useRef } from 'react';
import AdvisorShareCopyDialog from '@/components/features/ai/AdvisorShareCopyDialog';
import AIChatMessageInput, {
  type AIChatMessageInputHandle,
} from '@/components/features/ai/AIChatMessageInput';
import AIChatMessageStream from '@/components/features/ai/AIChatMessageStream';
import AIChatToolbar from '@/components/features/ai/AIChatToolbar';
import AIChatTravelParamsPanel from '@/components/features/ai/AIChatTravelParamsPanel';
import PlanSaveDialog from '@/components/features/map/PlanSaveDialog';
import TravelPlanResultDialog from '@/components/features/plans/TravelPlanResultDialog';
import { AsyncFeedback } from '@/components/ui';
import { useAiChatInterfaceController } from '@/hooks/ai/useAiChatInterfaceController';
import { usePlanGenerationProgress } from '@/hooks/ai/usePlanGenerationProgress';
import { cn } from '@/utils/cn';

export type AIChatInterfaceProps = {
  className?: string;
  variant?: 'default' | 'capsule';
  context?: import('@/types/domain/aiChat').AiChatContext;
  seedAssistant?: string;
  autoPrompt?: string;
  hideAutoPromptBubble?: boolean;
  initialMessages?: import('@/types/domain/aiChat').AiChatMessage[];
  restoredSessionId?: string;
  restoredInitialQuery?: string;
  isSessionRestoring?: boolean;
  paramsOpen?: boolean;
  onParamsOpenChange?: (open: boolean) => void;
};

/** AI 对话界面：简化为「对话 + 输入」 */
export default function AIChatInterface({
  className,
  variant = 'default',
  context,
  seedAssistant,
  autoPrompt,
  hideAutoPromptBubble = false,
  initialMessages,
  restoredSessionId,
  restoredInitialQuery,
  isSessionRestoring = false,
  paramsOpen,
  onParamsOpenChange,
}: AIChatInterfaceProps) {
  const ctrl = useAiChatInterfaceController({
    context,
    seedAssistant,
    autoPrompt,
    hideAutoPromptBubble,
    initialMessages,
    restoredSessionId,
    restoredInitialQuery,
    paramsOpen,
    onParamsOpenChange,
  });
  const planProgress = usePlanGenerationProgress(
    ctrl.plan.isGenerating,
    ctrl.travelParams.params.days,
  );
  const composerRef = useRef<AIChatMessageInputHandle>(null);
  const latestAssistantReply = [...ctrl.chat.messages]
    .reverse()
    .find((message) => message.role === 'assistant')?.content ?? null;

  const handleUseExamplePrompt = useCallback((text: string) => {
    composerRef.current?.fillDraft(text);
  }, []);

  return (
    <div
      className={cn(
        variant === 'capsule'
          ? 'relative flex h-full min-h-0 max-h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm'
          : 'relative flex h-[min(42rem,calc(100dvh-6rem))] max-h-[calc(100dvh-6rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm',
        variant === 'default' && 'pb-[env(safe-area-inset-bottom)]',
        className,
      )}
    >
      {variant !== 'capsule' ? (
        <AIChatToolbar
          variant={variant}
          provider={ctrl.provider}
          onToggleParams={() => ctrl.setParamsOpen((open) => !open)}
          onReset={ctrl.handleReset}
          isBusy={ctrl.isBusy}
          originLabel={context?.origin?.name}
        />
      ) : null}

      <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <AIChatMessageStream
            variant={variant}
            scrollRef={ctrl.scroll.scrollRef}
            messages={ctrl.chat.messages}
            isLoading={ctrl.chat.isLoading}
            isStreaming={ctrl.chat.isStreaming}
            isSessionRestoring={isSessionRestoring}
            selectedMessageId={ctrl.scroll.selectedMessageId}
            registerMessageRef={ctrl.scroll.registerMessageRef}
            onUseExamplePrompt={handleUseExamplePrompt}
            messageActionProps={{
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
              onSharePlan: ctrl.handleSharePlan,
            }}
          />

          <div className="space-y-2 px-3 pb-1">
            <AsyncFeedback
              isLoading={false}
              loadingMessage="AI 正在回复…"
              error={ctrl.chat.error}
              onDismissError={ctrl.chat.clearError}
              onRetry={() => {
                ctrl.chat.retryLastMessage().catch(() => undefined);
              }}
              retryLabel="重新发送"
            />
            <AsyncFeedback
              isLoading={ctrl.plan.isGenerating}
              loadingMessage="正在生成行程卡片…"
              error={ctrl.plan.error}
              onDismissError={ctrl.plan.clearError}
              onRetry={() => {
                ctrl.plan.retry().catch(() => undefined);
              }}
            />
          </div>

          <AIChatMessageInput
            ref={composerRef}
            composerId={ctrl.chat.composerId}
            isLoading={ctrl.chat.isLoading}
            isStreaming={ctrl.chat.isStreaming}
            isBusy={ctrl.isBusy || ctrl.aiBlocked}
            onSend={ctrl.chat.sendMessage}
            onAbortStream={ctrl.chat.abortStream}
            assistantReplyText={latestAssistantReply}
            travelParams={ctrl.travelParams.params}
            context={ctrl.travelParams.chatContext}
            showHotCityPicker
            variant={variant}
          />
        </div>

        <AIChatTravelParamsPanel
          params={ctrl.travelParams.params}
          isOpen={ctrl.paramsOpen}
          onToggle={() => ctrl.setParamsOpen((open) => !open)}
          onBudgetMinChange={ctrl.travelParams.setBudgetMin}
          onBudgetMaxChange={ctrl.travelParams.setBudgetMax}
          onDaysChange={ctrl.travelParams.setDays}
          onPaceChange={ctrl.travelParams.setPace}
          onToggleInterest={ctrl.travelParams.toggleInterest}
          onReset={ctrl.travelParams.resetParams}
          onGeneratePlan={ctrl.handleGeneratePlan}
          isGeneratingPlan={ctrl.plan.isGenerating}
          isChatLoading={ctrl.chat.isLoading}
          planError={ctrl.plan.error}
          onDismissPlanError={ctrl.plan.clearError}
          onRetryPlan={() => {
            ctrl.plan.retry().catch(() => undefined);
          }}
          className="shrink-0"
        />

        {ctrl.plan.isGenerating && (
          <div
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[2px]"
            role="status"
            aria-label="正在生成旅行计划"
          >
            <div className="flex w-[18rem] max-w-[85vw] flex-col items-center gap-2 rounded-2xl border border-brand-200 bg-white px-4 py-3 text-center shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-brand-800">
                <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                {planProgress.message ?? '生成行程中…'}
              </div>
              <div
                className="h-1.5 w-full overflow-hidden rounded-full bg-brand-100"
                aria-hidden
              >
                <div
                  className="h-full rounded-full bg-brand-600 transition-[width] duration-700 ease-out"
                  style={{ width: `${planProgress.progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                {ctrl.travelParams.params.days} 天行程通常约 {planProgress.estimateSeconds} 秒
              </p>
            </div>
          </div>
        )}
      </div>

      {variant !== 'capsule' && !ctrl.paramsOpen ? (
        <button
          type="button"
          onClick={() => ctrl.setParamsOpen(true)}
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-md lg:hidden"
          aria-label="旅行参数"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
        </button>
      ) : null}

      <TravelPlanResultDialog
        open={ctrl.plan.dialogOpen}
        plan={ctrl.plan.lastPlan}
        onClose={ctrl.plan.closeDialog}
        confirmLabel="查看完整行程"
        onConfirm={ctrl.confirmPlanDialog}
      />

      <PlanSaveDialog
        open={ctrl.planSave.saveOpen}
        defaultTitle={ctrl.planSave.defaultTitle}
        loading={ctrl.planSave.saveLoading}
        error={ctrl.planSave.saveError}
        onClose={ctrl.planSave.closeSaveDialog}
        onConfirm={(title, isPublic) => ctrl.planSave.savePlan(title, isPublic)}
      />

      <AdvisorShareCopyDialog
        open={ctrl.shareFallbackOpen}
        text={ctrl.shareFallbackText}
        onClose={() => ctrl.setShareFallbackOpen(false)}
      />
    </div>
  );
}
