import { Globe, Lock, MapPin } from 'lucide-react';
import { memo } from 'react';
import { Link } from 'react-router-dom';
import type { UserPlanRecord } from '@/types/api/userPlans';
import { savedUserPlanDetailPath } from '@/router/paths';
import { formatRelativeZh } from '@/utils/date';
import { formatSavedUserPlanMeta } from '@/utils/userPlanView';
import { cn } from '@/utils/cn';

export type SavedUserPlanListItemProps = {
  plan: UserPlanRecord;
  className?: string;
};

function SavedUserPlanListItem({ plan, className }: SavedUserPlanListItemProps) {
  return (
    <Link
      to={savedUserPlanDetailPath(plan.id)}
      className={cn(
        'block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-200 hover:shadow-sm',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900">{plan.title}</h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-500" aria-hidden />
            <span className="truncate">{formatSavedUserPlanMeta(plan)}</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            保存于 {formatRelativeZh(plan.createdAt)}
          </p>
        </div>
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
            plan.isPublic ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600',
          )}
        >
          {plan.isPublic ? (
            <>
              <Globe className="h-3 w-3" aria-hidden />
              公开
            </>
          ) : (
            <>
              <Lock className="h-3 w-3" aria-hidden />
              私密
            </>
          )}
        </span>
      </div>
    </Link>
  );
}

export default memo(SavedUserPlanListItem);
