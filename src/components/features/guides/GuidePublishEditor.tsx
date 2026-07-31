import { Loader2 } from 'lucide-react';
import GuidePublishCostCard from '@/components/features/guides/publish/GuidePublishCostCard';
import GuidePublishInsightsCard from '@/components/features/guides/publish/GuidePublishInsightsCard';
import GuidePublishJournalCard from '@/components/features/guides/publish/GuidePublishJournalCard';
import GuidePublishMetaSection from '@/components/features/guides/publish/GuidePublishMetaSection';
import { SLIME_TRAIL_PUBLISHER } from '@/lib/guides/slimeTrail';
import type { GuidePublishEditorDraft } from '@/types/domain/guidePublish';
import { cn } from '@/utils/cn';

export type GuidePublishEditorProps = {
  draft: GuidePublishEditorDraft;
  isPublishing: boolean;
  error: string | null;
  filledFromAi?: boolean;
  onUpdateDraft: (patch: Partial<GuidePublishEditorDraft>) => void;
  onUpdateCostItem: (
    key: keyof GuidePublishEditorDraft['costBreakdown'],
    patch: Partial<GuidePublishEditorDraft['costBreakdown']['food']>,
  ) => void;
  onUpdateDailyJournal: (
    day: number,
    patch: Partial<GuidePublishEditorDraft['dailyJournal'][number]>,
  ) => void;
  onUpdateDailyExpense: (
    day: number,
    expenseIndex: number,
    patch: Partial<GuidePublishEditorDraft['dailyJournal'][number]['expenses'][number]>,
  ) => void;
  onAddDailyExpense: (day: number) => void;
  onRemoveDailyExpense: (day: number, expenseIndex: number) => void;
  onUpdateSnailInsights: (
    patch: Partial<GuidePublishEditorDraft['snailInsights']>,
  ) => void;
  onPublish: () => void;
  onBack?: () => void;
  className?: string;
  hideHeader?: boolean;
  hideFooter?: boolean;
};

/**
 * 留下黏液轨迹 — 宪法三卡表单
 * 卡1 花费清单 · 卡2 行程流水账 · 卡3 蜗牛启示
 */
export default function GuidePublishEditor({
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
  hideFooter = false,
}: GuidePublishEditorProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {!hideHeader && (
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-900">
          <p className="font-semibold">
            {filledFromAi
              ? `AI 内容已填入 · ${SLIME_TRAIL_PUBLISHER.title}`
              : SLIME_TRAIL_PUBLISHER.subtitle}
          </p>
          <p className="mt-1 text-xs text-emerald-800/90">
            {filledFromAi
              ? '三大宪法卡已与 AI 字段一一对应填入，请核对后留下轨迹。'
              : '请按卡1→卡2→卡3 填写，右侧预览与前台展示完全一致。'}
          </p>
        </div>
      )}

      <GuidePublishMetaSection draft={draft} onUpdateDraft={onUpdateDraft} />

      <GuidePublishCostCard draft={draft} onUpdateCostItem={onUpdateCostItem} />

      <GuidePublishJournalCard
        draft={draft}
        onUpdateDailyJournal={onUpdateDailyJournal}
        onUpdateDailyExpense={onUpdateDailyExpense}
        onAddDailyExpense={onAddDailyExpense}
        onRemoveDailyExpense={onRemoveDailyExpense}
      />

      <GuidePublishInsightsCard draft={draft} onUpdateSnailInsights={onUpdateSnailInsights} />

      {error && !hideFooter && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {!hideFooter && (
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              disabled={isPublishing}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              返回对话
            </button>
          )}
          <button
            type="button"
            onClick={onPublish}
            disabled={isPublishing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-105 disabled:opacity-50"
          >
            {isPublishing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                发布中…
              </>
            ) : (
              SLIME_TRAIL_PUBLISHER.publishButton
            )}
          </button>
        </div>
      )}
    </div>
  );
}
