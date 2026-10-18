import type { PlanSummaryCards } from '@/utils/planResultDisplay';
import { cn } from '@/utils/cn';

type PlanResultSummaryCardsProps = {
  summary: PlanSummaryCards;
  className?: string;
};

const SOFT = ['▫️', '🌿'] as const;

function SoftSymbolList({ items }: { items: string[] }) {
  return (
    <div className="mt-1.5 space-y-1.5">
      {items.map((item, index) => (
        <p key={`${item}-${index}`} className="text-[13px] leading-relaxed text-slate-700">
          <span aria-hidden className="mr-1.5">
            {SOFT[index % SOFT.length]}
          </span>
          {item}
        </p>
      ))}
    </div>
  );
}

/**
 * 景/食摘要：柔和符号短句，弱化「清单卡片」模板感。
 * 总预算由 PlanResultBudgetSoftCard 承载，此处不重复。
 */
export default function PlanResultSummaryCards({
  summary,
  className,
}: PlanResultSummaryCardsProps) {
  const hasLists = summary.mustEat.length > 0 || summary.mustVisit.length > 0;
  if (!hasLists) {
    return null;
  }

  return (
    <div className={cn('grid gap-3 sm:grid-cols-2', className)}>
      {summary.mustVisit.length > 0 ? (
        <div className="px-1 py-1">
          <p className="text-[12px] tracking-wide text-slate-500">可以这样逛</p>
          <SoftSymbolList items={summary.mustVisit} />
        </div>
      ) : null}

      {summary.mustEat.length > 0 ? (
        <div className="px-1 py-1">
          <p className="text-[12px] tracking-wide text-slate-500">想吃点什么</p>
          <SoftSymbolList items={summary.mustEat} />
        </div>
      ) : null}
    </div>
  );
}
