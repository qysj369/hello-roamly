import type { TravelPlan } from '@/types/domain/travelPlan';
import TravelPlanShareButton from '@/components/features/plans/TravelPlanShareButton';
import { formatDateZh, formatRelativeZh } from '@/utils/date';
import { getPlanGeneratedAt } from '@/utils/travelPlanView';
import { cn } from '@/utils/cn';

export type TravelPlanDetailHeaderProps = {
  plan: TravelPlan;
  className?: string;
};

/** 计划详情顶栏：标题、创建时间、分享 */
export default function TravelPlanDetailHeader({ plan, className }: TravelPlanDetailHeaderProps) {
  const generatedAt = getPlanGeneratedAt(plan);

  return (
    <header
      className={cn(
        'flex items-start justify-between gap-3 border-b border-slate-200/90 pb-4',
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-bold leading-snug tracking-tight text-slate-900 sm:text-2xl">
          {plan.title}
        </h1>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-sm text-slate-500">
          <span className="text-slate-400">创建时间</span>
          <time dateTime={generatedAt} title={generatedAt}>
            {formatDateZh(generatedAt)}
          </time>
          <span className="text-slate-300" aria-hidden>
            ·
          </span>
          <span>{formatRelativeZh(generatedAt)}</span>
        </p>
      </div>
      <TravelPlanShareButton plan={plan} variant="primary" />
    </header>
  );
}
