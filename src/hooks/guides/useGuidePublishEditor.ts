import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { guideListQueryKey } from '@/hooks/api/useGuideList';
import { guideDetailQueryKey } from '@/hooks/api/useGuideDetail';
import { usePublishedGuidesStore } from '@/stores/publishedGuides/store';
import type { AiSnailGuideResult } from '@/types/domain/aiSnailGuide';
import type { GuidePublishEditorDraft, PublishedGuideRecord } from '@/types/domain/guidePublish';
import { DEMO_CURRENT_USER_ID } from '@/data/demoUsers';
import { awardGuidePublished } from '@/services/contribution/awardContribution';
import {
  aiSnailGuideToEditorDraft,
  buildPublishedGuideRecord,
  recalculateCostTotal,
  syncDailyJournalWithDays,
  validateGuidePublishDraft,
} from '@/utils/guidePublishDraft';

export type UseGuidePublishEditorOptions = {
  initialDraft: GuidePublishEditorDraft;
  /** AI 生成的攻略；变化时自动填入表单 */
  aiGeneratedContent?: AiSnailGuideResult | null;
  sourceGuideId?: string;
  onPublished?: (record: PublishedGuideRecord) => void;
  onAiContentFilled?: () => void;
};

export function useGuidePublishEditor({
  initialDraft,
  aiGeneratedContent,
  sourceGuideId,
  onPublished,
  onAiContentFilled,
}: UseGuidePublishEditorOptions) {
  const queryClient = useQueryClient();
  const hydrate = usePublishedGuidesStore((state) => state.hydrate);
  const addGuide = usePublishedGuidesStore((state) => state.addGuide);

  const [draft, setDraft] = useState<GuidePublishEditorDraft>(initialDraft);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [filledFromAi, setFilledFromAi] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (aiGeneratedContent) {
      setDraft(aiSnailGuideToEditorDraft(aiGeneratedContent));
      setFilledFromAi(true);
      setError(null);
      onAiContentFilled?.();
      return;
    }
    setDraft(initialDraft);
    setFilledFromAi(false);
    setError(null);
  }, [initialDraft, aiGeneratedContent, onAiContentFilled]);

  const fillFromAiContent = useCallback((content: AiSnailGuideResult | GuidePublishEditorDraft) => {
    const nextDraft =
      'generatedAt' in content ? aiSnailGuideToEditorDraft(content) : content;
    setDraft(nextDraft);
    setFilledFromAi(true);
    setError(null);
  }, []);

  const updateDraft = useCallback((patch: Partial<GuidePublishEditorDraft>) => {
    setDraft((current) => {
      const next = { ...current, ...patch };
      return patch.days !== undefined ? syncDailyJournalWithDays(next) : next;
    });
  }, []);

  const updateCostItem = useCallback(
    (
      key: keyof GuidePublishEditorDraft['costBreakdown'],
      patch: Partial<GuidePublishEditorDraft['costBreakdown']['food']>,
    ) => {
      if (key === 'total') {
        setDraft((current) => ({
          ...current,
          costBreakdown: { ...current.costBreakdown, total: patch.amount ?? current.costBreakdown.total },
        }));
        return;
      }
      setDraft((current) => {
        const nextBreakdown = {
          ...current.costBreakdown,
          [key]: { ...current.costBreakdown[key], ...patch },
        };
        return {
          ...current,
          costBreakdown: {
            ...nextBreakdown,
            total: recalculateCostTotal({ ...current, costBreakdown: nextBreakdown }),
          },
        };
      });
    },
    [],
  );

  const updateDailyJournal = useCallback(
    (day: number, patch: Partial<GuidePublishEditorDraft['dailyJournal'][number]>) => {
      setDraft((current) => ({
        ...current,
        dailyJournal: current.dailyJournal.map((entry) =>
          entry.day === day ? { ...entry, ...patch } : entry,
        ),
      }));
    },
    [],
  );

  const updateDailyExpense = useCallback(
    (
      day: number,
      expenseIndex: number,
      patch: Partial<GuidePublishEditorDraft['dailyJournal'][number]['expenses'][number]>,
    ) => {
      setDraft((current) => ({
        ...current,
        dailyJournal: current.dailyJournal.map((entry) => {
          if (entry.day !== day) {
            return entry;
          }
          const expenses = entry.expenses.map((expense, index) =>
            index === expenseIndex ? { ...expense, ...patch } : expense,
          );
          return { ...entry, expenses };
        }),
      }));
    },
    [],
  );

  const addDailyExpense = useCallback((day: number) => {
    setDraft((current) => ({
      ...current,
      dailyJournal: current.dailyJournal.map((entry) =>
        entry.day === day
          ? { ...entry, expenses: [...entry.expenses, { item: '', amount: '' }] }
          : entry,
      ),
    }));
  }, []);

  const removeDailyExpense = useCallback((day: number, expenseIndex: number) => {
    setDraft((current) => ({
      ...current,
      dailyJournal: current.dailyJournal.map((entry) =>
        entry.day === day
          ? {
              ...entry,
              expenses: entry.expenses.filter((_, index) => index !== expenseIndex),
            }
          : entry,
      ),
    }));
  }, []);

  const updateSnailInsights = useCallback(
    (patch: Partial<GuidePublishEditorDraft['snailInsights']>) => {
      setDraft((current) => ({
        ...current,
        snailInsights: { ...current.snailInsights, ...patch },
      }));
    },
    [],
  );

  const syncCostTotal = useCallback(() => {
    setDraft((current) => ({
      ...current,
      costBreakdown: {
        ...current.costBreakdown,
        total: recalculateCostTotal(current),
      },
    }));
  }, []);

  const publish = useCallback(async () => {
    const normalized = syncDailyJournalWithDays(draft);
    const validationError = validateGuidePublishDraft(normalized);
    if (validationError) {
      setError(validationError);
      return null;
    }

    setIsPublishing(true);
    setError(null);

    try {
      const record = buildPublishedGuideRecord(normalized, DEMO_CURRENT_USER_ID, sourceGuideId);
      addGuide(record);
      awardGuidePublished(DEMO_CURRENT_USER_ID);
      await queryClient.invalidateQueries({ queryKey: guideListQueryKey() });
      await queryClient.invalidateQueries({ queryKey: guideDetailQueryKey(record.id) });
      onPublished?.(record);
      return record;
    } catch {
      setError('发布失败，请稍后再试');
      return null;
    } finally {
      setIsPublishing(false);
    }
  }, [addGuide, draft, onPublished, queryClient, sourceGuideId]);

  return {
    draft,
    setDraft,
    updateDraft,
    updateCostItem,
    updateDailyJournal,
    updateDailyExpense,
    addDailyExpense,
    removeDailyExpense,
    updateSnailInsights,
    syncCostTotal,
    error,
    setError,
    isPublishing,
    publish,
    filledFromAi,
    fillFromAiContent,
  };
}
