import { Sparkles } from 'lucide-react';
import NicheExperienceReferenceSlot from '@/components/business/NicheExperienceReferenceSlot';
import SnailCultureHint from '@/components/features/community/SnailCultureHint';
import SnailSlangTerm from '@/components/features/community/SnailSlangTerm';
import StructuredGuideConstitutionCard from '@/components/features/guides/structured/StructuredGuideConstitutionCard';
import StructuredGuideCopyButton from '@/components/features/guides/structured/StructuredGuideCopyButton';
import StructuredGuideCostSummary from '@/components/features/guides/structured/StructuredGuideCostSummary';
import StructuredGuideSectionNav from '@/components/features/guides/structured/StructuredGuideSectionNav';
import { useStructuredGuideSectionSpy } from '@/hooks/guides/useStructuredGuideSectionSpy';
import {
  GUIDE_PUBLISH_INSIGHT_FIELDS,
  STRUCTURED_GUIDE_FORM_CARDS,
} from '@/lib/guides/structuredGuideFormSchema';
import { SLIME_TRAIL_PUBLISHER } from '@/lib/guides/slimeTrail';
import { SNAIL_UI_COPY } from '@/lib/config/snailCommunity';
import { AI_SNAIL_COST_ROWS, type AiSnailGuideResult } from '@/types/domain/aiSnailGuide';
import { formatStructuredGuideCoreTag } from '@/utils/structuredGuideDisplay';
import { cn } from '@/utils/cn';

export type StructuredGuideViewerProps = {
  guide: AiSnailGuideResult;
  /** default 详情页；preview 发布器右侧预览；compact 卡片摘要 */
  variant?: 'default' | 'preview' | 'compact';
  className?: string;
};

const insightFields = GUIDE_PUBLISH_INSIGHT_FIELDS;

export default function StructuredGuideViewer({
  guide,
  variant = 'default',
  className,
}: StructuredGuideViewerProps) {
  const isCompact = variant === 'compact';
  const isDetail = variant === 'default';
  const useConstitutionCards = isDetail || variant === 'preview';
  const enableSectionSpy = isDetail;
  const activeSectionId = useStructuredGuideSectionSpy(enableSectionSpy);
  const coreTag = formatStructuredGuideCoreTag(guide);

  const costCard = STRUCTURED_GUIDE_FORM_CARDS[0];
  const journalCard = STRUCTURED_GUIDE_FORM_CARDS[1];
  const insightsCard = STRUCTURED_GUIDE_FORM_CARDS[2];

  const costTable = (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[20rem] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-3 py-2.5 font-semibold">分项</th>
            <th className="px-3 py-2.5 font-semibold">金额（元）</th>
            <th className="px-3 py-2.5 font-semibold">节省技巧</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {AI_SNAIL_COST_ROWS.map((row) => {
            const item = guide.costBreakdown[row.key];
            return (
              <tr key={row.key}>
                <td className="px-3 py-3 font-medium text-slate-800">{row.label}</td>
                <td className="px-3 py-3 whitespace-nowrap text-emerald-700">¥{item.amount}</td>
                <td className="px-3 py-3 text-slate-600">
                  {item.savingTips.length > 0 ? (
                    <ul className="list-disc space-y-1 pl-4">
                      {item.savingTips.map((tip) => (
                        <li key={tip}>{tip}</li>
                      ))}
                    </ul>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            );
          })}
          <tr className="bg-emerald-50/60 font-semibold">
            <td className="px-3 py-3 text-slate-900">{SNAIL_UI_COPY.costTotalHint}</td>            <td className="px-3 py-3 text-emerald-800">¥{guide.costBreakdown.total}</td>
            <td className="px-3 py-3 text-xs font-normal text-slate-500">
              预算档位 {guide.budgetLabel}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const journalTimeline = (
    <ol className="relative space-y-4 border-l-2 border-emerald-200/80 pl-4 sm:pl-6">
      {guide.dailyJournal.map((day) => (
        <li key={day.day} className="relative">
          <span
            className="absolute -left-[1.35rem] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white sm:-left-[1.6rem]"
            aria-hidden
          >
            {day.day}
          </span>
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              第 {day.day} 天
            </p>
            <p className="mt-2 leading-relaxed text-slate-800">
              {day.narrative || '（待填写当天行程）'}
            </p>
            {day.expenses.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {day.expenses.map((expense, index) => (
                  <span
                    key={`${expense.item}-${index}`}
                    className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700"
                  >
                    {expense.item} ¥{expense.amount}
                  </span>
                ))}
              </div>
            )}
            {day.tips.length > 0 && (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-600">
                {day.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  );

  const insightsGrid = (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-4">
        <p className="text-xs font-semibold text-amber-800">
          <SnailSlangTerm id={insightFields.regrets.slangId} />
        </p>        <p className="mt-2 leading-relaxed text-slate-800">
          {guide.snailInsights.regrets || '—'}
        </p>
      </div>
      <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4">
        <p className="text-xs font-semibold text-emerald-800">
          <SnailSlangTerm id={insightFields.recommendations.slangId} />
        </p>        <p className="mt-2 leading-relaxed text-slate-800">
          {guide.snailInsights.recommendations || '—'}
        </p>
      </div>
    </div>
  );

  return (
    <article
      className={cn(
        'structured-guide-viewer',
        variant === 'preview' && 'rounded-2xl border border-slate-200 bg-slate-50/50 p-4',
        className,
      )}
    >
      <header className="space-y-3 border-b border-slate-100 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
            <Sparkles className="h-3 w-3" aria-hidden />
            {SLIME_TRAIL_PUBLISHER.structuredBadge}
          </span>
          {variant === 'preview' && (
            <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-medium text-slate-600">
              {SLIME_TRAIL_PUBLISHER.previewBadge}
            </span>
          )}
          {isDetail && <StructuredGuideCopyButton guide={guide} />}
        </div>
        <div>
          <h3
            className={cn(
              'font-bold text-slate-900',
              isCompact ? 'text-base' : 'text-lg sm:text-xl',
            )}
          >
            {guide.title || SNAIL_UI_COPY.guideUnnamed}          </h3>
          <p
            className={cn(
              'mt-2 font-semibold text-emerald-800',
              isCompact ? 'text-sm' : 'text-base sm:text-lg',
            )}
          >
            {coreTag}
          </p>
          {guide.interests.length > 0 && (
            <p className="mt-1 text-xs text-slate-500">{guide.interests.join(' · ')}</p>
          )}
        </div>
        {!isCompact && (
          <StructuredGuideCostSummary
            breakdown={guide.costBreakdown}
            budgetLabel={guide.budgetLabel}
          />
        )}
      </header>

      {!isCompact && (
        <StructuredGuideSectionNav className="my-4" activeSectionId={activeSectionId} />
      )}

      {!isCompact && useConstitutionCards && (
        <div className="space-y-6">
          <StructuredGuideConstitutionCard
            cardNumber={costCard.card}
            id={costCard.sectionId}
            title={costCard.title}
            subtitle={costCard.subtitle}
          >
            {costTable}
          </StructuredGuideConstitutionCard>

          <StructuredGuideConstitutionCard
            cardNumber={journalCard.card}
            id={journalCard.sectionId}
            title={journalCard.title}
            subtitle={journalCard.subtitle}
          >
            {journalTimeline}
          </StructuredGuideConstitutionCard>

          <StructuredGuideConstitutionCard
            cardNumber={insightsCard.card}
            id={insightsCard.sectionId}
            title={insightsCard.title}
            titleSlangId={insightsCard.titleSlangId}
            subtitle={insightsCard.subtitle}
          >
            {insightsGrid}
          </StructuredGuideConstitutionCard>
        </div>
      )}

      {isDetail && <SnailCultureHint className="mt-6" />}

      {isDetail ? <NicheExperienceReferenceSlot className="mt-6" /> : null}

      {isCompact && (
        <p className="mt-2 text-xs text-slate-500">{coreTag}</p>
      )}
    </article>
  );
}
