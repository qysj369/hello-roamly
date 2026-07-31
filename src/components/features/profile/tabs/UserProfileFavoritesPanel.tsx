import { Bookmark } from 'lucide-react';
import UserProfilePlanListItem from '@/components/features/profile/UserProfilePlanListItem';
import type { TravelPlan } from '@/types/domain/travelPlan';
import { SNAIL_GLOBAL_COPY } from '@/lib/config/snailCommunity';
import { cn } from '@/utils/cn';
export type UserProfileFavoritesPanelProps = {
  favorites: TravelPlan[];
  isOwnProfile: boolean;
  className?: string;
};

export default function UserProfileFavoritesPanel({
  favorites,
  isOwnProfile,
  className,
}: UserProfileFavoritesPanelProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {favorites.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-sm text-slate-500">
          {SNAIL_GLOBAL_COPY.emptyState}
        </p>
      )}

      {favorites.length > 0 && isOwnProfile && (
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <Bookmark className="h-3.5 w-3.5 text-amber-500" aria-hidden />
          含本地壳里珍藏与演示数据；在计划详情页可继续{SNAIL_GLOBAL_COPY.favorite}        </p>
      )}

      <ul className="space-y-2">
        {favorites.map((plan) => (
          <li key={plan.id}>
            <UserProfilePlanListItem plan={plan} />
          </li>
        ))}
      </ul>
    </div>
  );
}
