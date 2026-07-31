import { useMemo, useState, useCallback } from 'react';
import { Eye, Loader2, Pencil } from 'lucide-react';
import GuidePublishEditor from '@/components/features/guides/GuidePublishEditor';
import StructuredGuideCompletenessBar from '@/components/features/guides/structured/StructuredGuideCompletenessBar';
import StructuredGuideViewer from '@/components/features/guides/structured/StructuredGuideViewer';
import type { GuidePublishEditorProps } from '@/components/features/guides/GuidePublishEditor';
import { SLIME_TRAIL_PUBLISHER } from '@/lib/guides/slimeTrail';
import { STRUCTURED_GUIDE_EDITOR_TARGETS } from '@/lib/guides/structuredGuideSections';
import { buildStructuredGuideContent } from '@/utils/guidePublishDraft';
import { getStructuredGuideCompleteness } from '@/utils/structuredGuideCompleteness';
import { cn } from '@/utils/cn';

type StructuredGuidePublishStudioProps = Omit<
  GuidePublishEditorProps,
  'onBack' | 'className'
> & {
  className?: string;
  /** 预览与发布时沿用 AI 源 id，保证与生成器一致 */
  previewSourceId?: string;
};

/**
 * 结构化攻略发布工作室：编辑表单 + 实时预览 + 发布清单
 */
export default function StructuredGuidePublishStudio({
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
  previewSourceId,
}: StructuredGuidePublishStudioProps) {
  const [mobilePanel, setMobilePanel] = useState<'edit' | 'preview'>('edit');

  const previewGuide = useMemo(
    () => buildStructuredGuideContent(draft, previewSourceId),
    [draft, previewSourceId],
  );
  const completeness = useMemo(() => getStructuredGuideCompleteness(draft), [draft]);

  const handleJumpToCheckItem = useCallback((itemId: string) => {
    setMobilePanel('edit');
    const targetId = STRUCTURED_GUIDE_EDITOR_TARGETS[itemId];
    if (!targetId) {
      return;
    }
    window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-900">
        <p className="font-semibold">{SLIME_TRAIL_PUBLISHER.title}</p>
        <p className="mt-0.5 text-xs font-medium text-emerald-800/80">
          {SLIME_TRAIL_PUBLISHER.subtitle}
        </p>
        <p className="mt-1 text-xs text-emerald-800/90">
          {filledFromAi ? SLIME_TRAIL_PUBLISHER.taglineAi : SLIME_TRAIL_PUBLISHER.taglineManual}
        </p>
      </div>

      <StructuredGuideCompletenessBar
        completeness={completeness}
        onItemClick={handleJumpToCheckItem}
      />

      <div className="flex gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setMobilePanel('edit')}
          className={cn(
            'inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium',
            mobilePanel === 'edit'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 text-slate-700',
          )}
        >
          <Pencil className="h-4 w-4" aria-hidden />
          编辑
        </button>
        <button
          type="button"
          onClick={() => setMobilePanel('preview')}
          className={cn(
            'inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium',
            mobilePanel === 'preview'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 text-slate-700',
          )}
        >
          <Eye className="h-4 w-4" aria-hidden />
          预览
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <div className={cn(mobilePanel === 'preview' && 'hidden lg:block')}>
          <GuidePublishEditor
            draft={draft}
            filledFromAi={filledFromAi}
            isPublishing={isPublishing}
            error={error}
            onUpdateDraft={onUpdateDraft}
            onUpdateCostItem={onUpdateCostItem}
            onUpdateDailyJournal={onUpdateDailyJournal}
            onUpdateDailyExpense={onUpdateDailyExpense}
            onAddDailyExpense={onAddDailyExpense}
            onRemoveDailyExpense={onRemoveDailyExpense}
            onUpdateSnailInsights={onUpdateSnailInsights}
            onPublish={onPublish}
            hideHeader
            hideFooter
          />
        </div>

        <div
          className={cn(
            'lg:sticky lg:top-20',
            mobilePanel === 'edit' && 'hidden lg:block',
          )}
        >
          <StructuredGuideViewer guide={previewGuide} variant="preview" />
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onPublish}
          disabled={isPublishing || !completeness.ready}
          title={!completeness.ready ? '请先完成留轨迹清单中的必填项' : undefined}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPublishing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {SLIME_TRAIL_PUBLISHER.publishing}
            </>
          ) : (
            SLIME_TRAIL_PUBLISHER.publishButton
          )}
        </button>
      </div>
    </div>
  );
}
