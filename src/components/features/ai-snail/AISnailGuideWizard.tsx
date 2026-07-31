import { useEffect, useRef } from 'react';
import { Loader2, RotateCcw } from 'lucide-react';
import AiSnailGuideMessage from '@/components/features/ai-snail/AiSnailGuideMessage';
import AiSnailGuidePublishSection from '@/components/features/ai-snail/AiSnailGuidePublishSection';
import AiSnailGuideStepPanel from '@/components/features/ai-snail/AiSnailGuideStepPanel';
import ProductionModeNotice from '@/components/features/app/ProductionModeNotice';
import { AsyncFeedback } from '@/components/ui';
import { useAISnailGuideWizard, useAiSnailScrollToBottom } from '@/hooks/ai/useAISnailGuideWizard';
import { getAiProviderDisplay, getAiProviderDisplayLabel } from '@/lib/config/ai';
import { isProductionAppMode } from '@/lib/config/appMode';
import { AI_SNAIL_ASSISTANT_NAME } from '@/types/domain/aiSnailGuide';
import type { AiSnailGuideResult } from '@/types/domain/aiSnailGuide';
import type { GuidePublishEditorDraft } from '@/types/domain/guidePublish';
import { cn } from '@/utils/cn';

export type AISnailGuideWizardProps = {
  className?: string;
  initialDestination?: string;
  /** AI 生成完成、草稿填入发布器前触发 */
  onGuideGenerated?: (payload: {
    guide: AiSnailGuideResult;
    editorDraft: GuidePublishEditorDraft;
  }) => void;
};

/**
 * AI蜗牛多轮引导向导：对话状态机 → 调用 /api/ai/generate-guide → 填入攻略发布编辑器
 */
export default function AISnailGuideWizard({
  className,
  initialDestination,
  onGuideGenerated,
}: AISnailGuideWizardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const wizard = useAISnailGuideWizard({ onGuideGenerated });
  const aiProvider = getAiProviderDisplay();
  const seededRef = useRef(false);
  const { submitDestination, step } = wizard;

  const inEditorPhase = step === 'editor' || step === 'published';

  useAiSnailScrollToBottom(scrollRef, wizard.scrollTick);

  useEffect(() => {
    const destination = initialDestination?.trim();
    if (!destination || seededRef.current || step !== 'destination') {
      return;
    }
    seededRef.current = true;
    submitDestination(destination);
  }, [initialDestination, step, submitDestination]);

  return (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn(
          'flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-50/50 shadow-sm',
          inEditorPhase
            ? 'max-h-[14rem]'
            : 'h-[min(36rem,calc(100dvh-10rem))] max-h-[calc(100dvh-10rem)]',
        )}
      >
        <header className="flex items-center justify-between gap-3 border-b border-slate-200/80 bg-white px-4 py-3">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <span aria-hidden>🐌</span>
              {AI_SNAIL_ASSISTANT_NAME}
              {inEditorPhase && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                  草稿已生成
                </span>
              )}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {aiProvider === 'deepseek'
                ? '已连接 DeepSeek · 经 /api/ai/generate-guide 生成'
                : aiProvider === 'unconfigured'
                  ? `上线模式 · ${getAiProviderDisplayLabel(aiProvider)}`
                  : isProductionAppMode()
                    ? '请配置 DEEPSEEK_API_KEY 或 VITE_DEEPSEEK_API_KEY'
                    : '演示模式 · 配置 API Key 后启用真实生成'}
            </p>
          </div>
          <button
            type="button"
            onClick={wizard.reset}
            disabled={wizard.isGenerating}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            重新开始
          </button>
        </header>

        <div className="px-3 pt-2">
          <ProductionModeNotice />
        </div>

        <div
          ref={scrollRef}
          className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-3"
          role="log"
          aria-live="polite"
        >
          {wizard.messages.map((message) => (
            <AiSnailGuideMessage key={message.id} message={message} />
          ))}
          {wizard.isGenerating && (
            <div className="flex items-center gap-2 pl-10 text-xs text-slate-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" aria-hidden />
              正在通过 API 生成攻略…
            </div>
          )}
        </div>

        {!inEditorPhase && (
          <>
            <div className="space-y-2 px-3 pb-2">
              <AsyncFeedback
                error={wizard.error}
                onDismissError={wizard.clearError}
                onRetry={() => wizard.generateGuide(wizard.preferences)}
                retryLabel="重新生成"
              />
            </div>

            <AiSnailGuideStepPanel
              step={wizard.step}
              preferences={wizard.preferences}
              isGenerating={wizard.isGenerating}
              onSubmitDestination={wizard.submitDestination}
              onSubmitDays={wizard.submitDays}
              onSubmitBudget={wizard.submitBudget}
              onTogglePreference={wizard.togglePreference}
              onGenerate={wizard.generateGuide}
              onReset={wizard.reset}
              onOpenEditor={wizard.openEditor}
              hasDraft={Boolean(wizard.editorDraft)}
            />
          </>
        )}
      </div>

      {wizard.editorDraft && inEditorPhase && (
        <AiSnailGuidePublishSection
          initialDraft={wizard.editorDraft}
          aiGeneratedContent={wizard.lastGuide}
          sourceGuideId={wizard.lastGuide?.id}
          publishedGuideId={wizard.publishedGuideId}
          isPublished={step === 'published'}
          onPublished={wizard.markPublished}
        />
      )}
    </div>
  );
}
