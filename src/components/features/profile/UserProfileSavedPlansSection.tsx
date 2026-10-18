import { ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import SavedUserPlanListItem from '@/components/features/profile/SavedUserPlanListItem';
import { useUserPlans } from '@/hooks/api/useUserPlans';
import { profileSavedPlansPath } from '@/router/paths';
import { cn } from '@/utils/cn';

export type UserProfileSavedPlansSectionProps = {
  className?: string;
  previewLimit?: number;
};

export default function UserProfileSavedPlansSection({
  className,
  previewLimit = 3,
}: UserProfileSavedPlansSectionProps) {
  const { data, isLoading, error } = useUserPlans();
  const items = data?.items ?? [];
  const preview = items.slice(0, previewLimit);

  return (
    <section className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">我的方案</h3>
          <p className="mt-0.5 text-xs text-slate-500">地图 AI 生成并保存的完整对话方案</p>
        </div>
        {items.length > 0 ? (
          <Link
            to={profileSavedPlansPath()}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            全部
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        ) : null}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          加载方案中…
        </div>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          方案加载失败，请稍后再试
        </p>
      ) : null}

      {!isLoading && !error && items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500">
          还没有保存的方案。在地图生成漫行方案后，点击「保存方案」即可收录。
        </p>
      ) : null}

      {preview.length > 0 ? (
        <ul className="space-y-2">
          {preview.map((plan) => (
            <li key={plan.id}>
              <SavedUserPlanListItem plan={plan} />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
