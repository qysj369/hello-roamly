import { AI_SNAIL_COST_ROWS, type AiSnailCostBreakdown } from '@/types/domain/aiSnailGuide';
import { cn } from '@/utils/cn';

type StructuredGuideCostSummaryProps = {
  breakdown: AiSnailCostBreakdown;
  budgetLabel: string;
  className?: string;
};

export default function StructuredGuideCostSummary({
  breakdown,
  budgetLabel,
  className,
}: StructuredGuideCostSummaryProps) {
  const segments = AI_SNAIL_COST_ROWS.map((row) => ({
    key: row.key,
    label: row.label,
    amount: breakdown[row.key].amount,
  }));
  const maxAmount = Math.max(...segments.map((segment) => segment.amount), 1);

  return (
    <div className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {segments.map((segment) => (
        <div
          key={segment.key}
          className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3"
        >
          <p className="text-xs text-slate-500">{segment.label}</p>
          <p className="mt-1 text-lg font-bold text-emerald-700">¥{segment.amount}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
              style={{ width: `${Math.max(8, (segment.amount / maxAmount) * 100)}%` }}
            />
          </div>
        </div>
      ))}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 sm:col-span-2 lg:col-span-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-semibold text-emerald-900">人均总计</p>
          <p className="text-2xl font-bold text-emerald-800">¥{breakdown.total}</p>
        </div>
        <p className="mt-1 text-xs text-emerald-800/80">预算档位：{budgetLabel}</p>
      </div>
    </div>
  );
}
