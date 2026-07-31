import { Sparkles } from 'lucide-react';
import { memo } from 'react';
import { Link } from 'react-router-dom';
import UserProfilePlanListItem from '@/components/features/profile/UserProfilePlanListItem';
import UserProfileSavedPlansSection from '@/components/features/profile/UserProfileSavedPlansSection';
import UserProfilePublicSavedPlansSection from '@/components/features/profile/UserProfilePublicSavedPlansSection';
import { useUserPlans } from '@/hooks/api/useUserPlans';
import type { TravelPlan } from '@/types/domain/travelPlan';
import { SNAIL_GLOBAL_COPY } from '@/lib/config/snailCommunity';
import { paths } from '@/router/paths';
import { cn } from '@/utils/cn';

export type UserProfilePlansPanelProps = {
  plans: TravelPlan[];
  isOwnProfile: boolean;
  userId: string;
  className?: string;
};

function UserProfilePlansPanel({
  plans,
  isOwnProfile,
  userId,
  className,
}: UserProfilePlansPanelProps) {
  const { data: savedPlansData, isLoading: savedPlansLoading } = useUserPlans();
  const hasSavedPlans = (savedPlansData?.items.length ?? 0) > 0;

  return (
    <div className={cn('space-y-3', className)}>
      {isOwnProfile ? <UserProfileSavedPlansSection /> : null}
      {!isOwnProfile ? (
        <UserProfilePublicSavedPlansSection userId={userId} showEmptyState={plans.length === 0} />
      ) : null}

      {isOwnProfile && plans.length > 0 && (
        <p className="text-xs text-slate-500">以下为 AI 生成的穷游计划，含你本地新生成的方案</p>
      )}

      {plans.length === 0 && isOwnProfile && !savedPlansLoading && !hasSavedPlans && (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-sm text-slate-500">
          {SNAIL_GLOBAL_COPY.emptyState}
        </p>
      )}

      <ul className="space-y-2">
        {plans.map((plan) => (
          <li key={plan.id}>
            <UserProfilePlanListItem plan={plan} />
          </li>
        ))}
      </ul>

      {isOwnProfile && (
        <Link
          to={paths.home}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          去首页生成新计划
        </Link>
      )}
    </div>
  );
}

export default memo(
  UserProfilePlansPanel,
  (prev, next) =>
    prev.plans === next.plans &&
    prev.isOwnProfile === next.isOwnProfile &&
    prev.userId === next.userId &&
    prev.className === next.className,
);
