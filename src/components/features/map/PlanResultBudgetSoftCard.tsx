import { ChevronDown, Wallet } from 'lucide-react';
import { useState } from 'react';
import type { BudgetLineItem, PlanSummaryCards } from '@/utils/planResultDisplay';
import { cn } from '@/utils/cn';

type PlanResultBudgetSoftCardProps = {
  summary: PlanSummaryCards;
  items: BudgetLineItem[];
  className?: string;
};

function formatSurplus(surplusYuan: number | null): string | null {
  if (surplusYuan == null) return null;
  if (surplusYuan >= 0) return `结余 ¥${surplusYuan}`;
  return `超支 ¥${Math.abs(surplusYuan)}`;
}

/** 轻量预算卡：默认只展示总预算，明细折叠（配色跟米白品牌绿，不用天空蓝描边） */
export default function PlanResultBudgetSoftCard({
  summary,
  items,
  className,
}: PlanResultBudgetSoftCardProps) {
  const [open, setOpen] = useState(false);
  const hasBudget = summary.totalBudgetYuan != null;
  if (!hasBudget && items.length === 0) return null;

  const surplusLabel = formatSurplus(summary.surplusYuan);
  const canExpand = items.length > 0;

  return (
    <section
      className={cn(
        'rounded-2xl border border-[color-mix(in_srgb,var(--theme-line)_85%,transparent)] bg-gradient-to-br from-[color-mix(in_srgb,var(--color-main)_5%,var(--bg-card,#fffef8))] to-white px-4 py-3.5 sm:px-5',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-brand-800">
            <Wallet className="h-3.5 w-3.5" aria-hidden />
            ▫️ 轻量预算
            <svg
              className="ml-1 h-3.5 w-8 text-[color-mix(in_srgb,var(--color-assist)_70%,transparent)]"
              viewBox="0 0 32 12"
              fill="none"
              aria-hidden
            >
              <path
                d="M1 9 C6 2, 10 2, 15 7 S24 12, 31 4"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </p>
          <p className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight text-slate-900">
            {summary.totalBudgetYuan != null ? `¥${summary.totalBudgetYuan}` : '—'}
          </p>
          {summary.userBudgetYuan != null ? (
            <p className="mt-1 text-xs text-slate-500">
              对照 ¥{summary.userBudgetYuan}
              {surplusLabel ? ` · ${surplusLabel}` : ''}
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-500">总花费参考，明细可展开</p>
          )}
        </div>

        {canExpand ? (
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[color-mix(in_srgb,var(--theme-line)_90%,transparent)] bg-white/80 px-2.5 py-1 text-[11px] font-medium text-brand-800 outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? '收起明细' : '展开明细'}
            <ChevronDown
              className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')}
              aria-hidden
            />
          </button>
        ) : null}
      </div>

      {open && canExpand ? (
        <ul className="mt-3 space-y-2 border-t border-[color-mix(in_srgb,var(--theme-line)_80%,transparent)] pt-3">
          {items.map((item) => (
            <li
              key={`${item.label}-${item.amountYuan ?? 'x'}`}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="text-slate-600">▫️ {item.label}</span>
              <span className="font-semibold tabular-nums text-slate-800">
                {item.amountYuan != null ? `¥${item.amountYuan}` : '—'}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
