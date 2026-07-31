import { useEffect, useState } from 'react';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import {
  GUIDE_PUBLISH_JOURNAL_FIELDS,
  STRUCTURED_GUIDE_FORM_CARDS,
} from '@/lib/guides/structuredGuideFormSchema';
import type { GuidePublishEditorDraft } from '@/types/domain/guidePublish';
import GuidePublishConstitutionCard from '@/components/features/guides/publish/GuidePublishConstitutionCard';
import { FieldLabel, TextArea, TextInput } from '@/components/features/guides/publish/guidePublishFields';
import { cn } from '@/utils/cn';

type GuidePublishJournalCardProps = {
  draft: GuidePublishEditorDraft;
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
};

const cardMeta = STRUCTURED_GUIDE_FORM_CARDS[1];
const fields = GUIDE_PUBLISH_JOURNAL_FIELDS;

function daySummary(day: GuidePublishEditorDraft['dailyJournal'][number]): string {
  if (day.narrative.trim()) {
    return day.narrative.trim().slice(0, 48) + (day.narrative.trim().length > 48 ? '…' : '');
  }
  if (day.expenses.some((expense) => expense.item.trim() || expense.amount.trim())) {
    return '已填开销，待补充行程叙述';
  }
  return '点击展开编辑当天行程';
}

/** 卡2：行程流水账 — 按天折叠，每天独立编辑 */
export default function GuidePublishJournalCard({
  draft,
  onUpdateDailyJournal,
  onUpdateDailyExpense,
  onAddDailyExpense,
  onRemoveDailyExpense,
}: GuidePublishJournalCardProps) {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(() => new Set([1]));

  useEffect(() => {
    const firstFilled = draft.dailyJournal.find(
      (day) => day.narrative.trim() || day.expenses.length > 0,
    )?.day;
    if (firstFilled) {
      setExpandedDays((current) => new Set([...current, firstFilled]));
    }
  }, [draft.dailyJournal]);

  const toggleDay = (day: number) => {
    setExpandedDays((current) => {
      const next = new Set(current);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  };

  return (
    <GuidePublishConstitutionCard
      cardNumber={cardMeta.card}
      id={cardMeta.editorId}
      title={cardMeta.title}
      subtitle={cardMeta.subtitle}
    >
      <div className="space-y-2">
        {draft.dailyJournal.map((day) => {
          const isOpen = expandedDays.has(day.day);
          return (
            <div
              key={day.day}
              className="overflow-hidden rounded-xl border border-slate-200/90 bg-white"
            >
              <button
                type="button"
                onClick={() => toggleDay(day.day)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50"
                aria-expanded={isOpen}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                    第 {day.day} 天
                  </p>
                  <p className="mt-0.5 truncate text-sm text-slate-600">{daySummary(day)}</p>
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 shrink-0 text-slate-400 transition',
                    isOpen && 'rotate-180',
                  )}
                  aria-hidden
                />
              </button>

              {isOpen && (
                <div className="space-y-4 border-t border-slate-100 px-4 py-4">
                  <div>
                    <FieldLabel htmlFor={`journal-${day.day}-narrative`}>
                      {fields.narrative.label}
                    </FieldLabel>
                    <TextArea
                      id={`journal-${day.day}-narrative`}
                      value={day.narrative}
                      onChange={(value) => onUpdateDailyJournal(day.day, { narrative: value })}
                      rows={5}
                      placeholder="亲切口吻描述当天地点、活动、时间安排…"
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <FieldLabel>{fields.expenses.label}</FieldLabel>
                      <button
                        type="button"
                        onClick={() => onAddDailyExpense(day.day)}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        <Plus className="h-3 w-3" aria-hidden />
                        添加开销
                      </button>
                    </div>
                    <div className="space-y-2">
                      {day.expenses.length === 0 && (
                        <p className="rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-400">
                          暂无开销，点击「添加开销」
                        </p>
                      )}
                      {day.expenses.map((expense, index) => (
                        <div
                          key={`${day.day}-expense-${index}`}
                          className="grid grid-cols-[1fr_6rem_auto] items-end gap-2"
                        >
                          <div>
                            <FieldLabel htmlFor={`journal-${day.day}-expense-item-${index}`}>
                              {fields.expenseItem.label}
                            </FieldLabel>
                            <TextInput
                              id={`journal-${day.day}-expense-item-${index}`}
                              value={expense.item}
                              onChange={(value) =>
                                onUpdateDailyExpense(day.day, index, { item: value })
                              }
                              placeholder="地铁"
                            />
                          </div>
                          <div>
                            <FieldLabel htmlFor={`journal-${day.day}-expense-amount-${index}`}>
                              {fields.expenseAmount.label}
                            </FieldLabel>
                            <TextInput
                              id={`journal-${day.day}-expense-amount-${index}`}
                              type="number"
                              value={expense.amount}
                              onChange={(value) =>
                                onUpdateDailyExpense(day.day, index, { amount: value })
                              }
                              placeholder="0"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveDailyExpense(day.day, index)}
                            className="mb-0.5 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            aria-label="删除开销"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <FieldLabel htmlFor={`journal-${day.day}-tips`}>{fields.tips.label}</FieldLabel>
                    <TextArea
                      id={`journal-${day.day}-tips`}
                      value={day.tips}
                      onChange={(value) => onUpdateDailyJournal(day.day, { tips: value })}
                      rows={3}
                      placeholder="交通方式、耗时、省钱窍门（每行一条）"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </GuidePublishConstitutionCard>
  );
}
