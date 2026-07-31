import { CalendarDays, Users, Wallet } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { TravelPlan } from '@/types/domain/travelPlan';
import {
  getPlanDaysLabel,
  getPlanSuitableAudience,
  getPlanTotalCostLabel,
} from '@/utils/travelPlanView';
import { cn } from '@/utils/cn';

export type TravelPlanOverviewProps = {
  plan: TravelPlan;
  className?: string;
};

type OverviewItem = {
  key: string;
  label: string;
  value: string;
  icon: LucideIcon;
  accent: string;
};

function buildOverviewItems(plan: TravelPlan): OverviewItem[] {
  return [
    {
      key: 'budget',
      label: '总预算',
      value: getPlanTotalCostLabel(plan),
      icon: Wallet,
      accent: 'from-brand-500/15 to-brand-600/5 text-brand-700',
    },
    {
      key: 'days',
      label: '总天数',
      value: getPlanDaysLabel(plan),
      icon: CalendarDays,
      accent: 'from-violet-500/15 to-violet-600/5 text-violet-700',
    },
    {
      key: 'audience',
      label: '适合人群',
      value: getPlanSuitableAudience(plan),
      icon: Users,
      accent: 'from-emerald-500/15 to-emerald-600/5 text-emerald-700',
    },
  ];
}

/** 计划概览：总预算、总天数、适合人群 */
export default function TravelPlanOverview({ plan, className }: TravelPlanOverviewProps) {
  const items = buildOverviewItems(plan);

  return (
    <section
      className={cn('mt-5', className)}
      aria-labelledby="travel-plan-overview-title"
    >
      <h2
        id="travel-plan-overview-title"
        className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500"
      >
        行程概览
      </h2>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {items.map(({ key, label, value, icon: Icon, accent }) => (
          <div
            key={key}
            className={cn(
              'rounded-xl border border-slate-200/80 bg-gradient-to-br p-4',
              accent,
            )}
          >
            <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <Icon className="h-4 w-4 shrink-0 opacity-80" strokeWidth={2} aria-hidden />
              {label}
            </dt>
            <dd
              className={cn(
                'mt-2 font-semibold leading-snug text-slate-900',
                key === 'audience' ? 'text-sm line-clamp-3' : 'text-lg',
              )}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
