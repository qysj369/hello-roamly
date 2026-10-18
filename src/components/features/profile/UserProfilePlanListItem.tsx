import { Bot } from 'lucide-react';
import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { TravelPlan } from '@/types/domain/travelPlan';
import { travelPlanDetailPath } from '@/router/paths';
import {
  getPlanBudgetLabel,
  getPlanCoverAlt,
  getPlanCoverUrl,
  getPlanDaysLabel,
  getPlanDestination,
} from '@/utils/travelPlanView';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { cn } from '@/utils/cn';
import { areEqualByPlanRef } from '@/utils/react/memoComparators';

export type UserProfilePlanListItemProps = {
  plan: TravelPlan;
  className?: string;
};

function UserProfilePlanListItem({ plan, className }: UserProfilePlanListItemProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const coverUrl = getPlanCoverUrl(plan);
  const showCover = Boolean(coverUrl) && !imageFailed;
  const destination = getPlanDestination(plan);

  return (
    <Link
      to={travelPlanDetailPath(plan.id)}
      className={cn(
        'flex gap-3 rounded-xl border border-slate-200/80 bg-slate-50/40 p-3 transition',
        'hover:border-brand-200 hover:bg-brand-50/30',
        className,
      )}
    >
      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-emerald-50 to-[#f9f7eb]">
        {showCover ? (
          <OptimizedImage
            src={coverUrl!}
            alt={getPlanCoverAlt(plan)}
            fill
            sizes="80px"
            widths={[80, 160]}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="flex h-full items-center justify-center text-[10px] font-semibold text-brand-700">
            {destination.slice(0, 2)}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">{plan.title}</p>
        <p className="mt-1 text-xs text-slate-600">
          {destination} · {getPlanDaysLabel(plan)} · {getPlanBudgetLabel(plan)}
        </p>
        <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-[#2c6b58]">
          <Bot className="h-3 w-3" aria-hidden />
          AI 生成
        </span>
      </div>
    </Link>
  );
}

export default memo(UserProfilePlanListItem, areEqualByPlanRef);
