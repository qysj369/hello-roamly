import { MapPin, Loader2 } from 'lucide-react';
import SavedUserPlanListItem from '@/components/features/profile/SavedUserPlanListItem';
import { useUserPublicPlans } from '@/hooks/api/useUserPlans';
import { cn } from '@/utils/cn';

export type UserProfilePublicSavedPlansSectionProps = {
  userId: string;
  /** 无公开方案且无 demo 计划时展示空状态 */
  showEmptyState?: boolean;
  className?: string;
};

export default function UserProfilePublicSavedPlansSection({
  userId,
  showEmptyState = false,
  className,
}: UserProfilePublicSavedPlansSectionProps) {
  const { data, isLoading, error } = useUserPublicPlans(userId);
  const items = data?.items ?? [];

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500',
          className,
        )}
      >
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        加载公开方案…
      </div>
    );
  }

  if (error) {
    return showEmptyState ? (
      <p
        className={cn(
          'rounded-xl border border-rose-100 bg-rose-50 px-4 py-8 text-center text-sm text-rose-700',
          className,
        )}
      >
        公开方案加载失败
      </p>
    ) : null;
  }

  if (items.length === 0) {
    if (!showEmptyState) {
      return null;
    }
    return (
      <div
        className={cn(
          'rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center',
          className,
        )}
      >
        <MapPin className="mx-auto h-8 w-8 text-slate-300" aria-hidden />
        <p className="mt-3 text-sm font-medium text-slate-700">暂无公开漫行方案</p>
        <p className="mt-1 text-xs text-slate-500">TA 还没有公开分享的地图 AI 方案</p>
      </div>
    );
  }

  return (
    <section className={cn('space-y-3', className)}>
      <div>
        <h3 className="text-sm font-semibold text-slate-900">公开漫行方案</h3>
        <p className="mt-0.5 text-xs text-slate-500">TA 在地图 AI 生成并公开分享的方案</p>
      </div>
      <ul className="space-y-2">
        {items.map((plan) => (
          <li key={plan.id}>
            <SavedUserPlanListItem plan={plan} />
          </li>
        ))}
      </ul>
    </section>
  );
}
