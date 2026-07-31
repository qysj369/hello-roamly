import { UserPlus } from 'lucide-react';
import { memo } from 'react';
import DiscoverRecommendBadge from '@/components/features/discover/DiscoverRecommendBadge';
import { AvatarImage } from '@/components/ui';
import { Link } from 'react-router-dom';
import type { User } from '@/types/domain/user/user';
import { userProfilePath } from '@/router/paths';
import { formatProfileStatCount } from '@/utils/userProfileView';
import { cn } from '@/utils/cn';

export type DiscoverPopularUserCardProps = {
  user: User;
  recommendScore?: number;
  recommendReasons?: string[];
  className?: string;
};

function DiscoverPopularUserCard({
  user,
  recommendScore = 0,
  recommendReasons = [],
  className,
}: DiscoverPopularUserCardProps) {
  return (
    <Link
      to={userProfilePath(user.id)}
      className={cn(
        'flex flex-col items-center rounded-2xl border border-slate-200/90 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md',
        className,
      )}
    >
      {user.avatar ? (
        <AvatarImage
          src={user.avatar}
          displayName={user.username}
          size={64}
          className="h-16 w-16 border-2 border-white shadow-md ring-2 ring-violet-100"
        />
      ) : (
        <span
          className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-lg font-bold text-violet-700 ring-2 ring-violet-100"
          aria-hidden
        >
          {user.username.slice(0, 1)}
        </span>
      )}

      <div className="mt-3 flex w-full flex-col items-center gap-1.5">
        <DiscoverRecommendBadge
          score={recommendScore}
          reasons={recommendReasons}
          interactive
        />
        <p className="line-clamp-1 w-full text-sm font-semibold text-slate-900">{user.username}</p>
      </div>
      <p className="mt-0.5 line-clamp-1 text-[11px] text-violet-700">{user.travelPersonality.title}</p>
      <p className="mt-2 line-clamp-2 min-h-[2rem] text-xs leading-snug text-slate-500">
        {user.bio?.trim() || '热爱穷游与分享的旅人'}
      </p>

      <div className="mt-3 flex w-full items-center justify-center gap-3 text-[10px] text-slate-500">
        <span>
          <span className="font-semibold text-slate-800">
            {formatProfileStatCount(user.followersCount)}
          </span>{' '}
          粉丝
        </span>
        <span>
          <span className="font-semibold text-slate-800">
            {formatProfileStatCount(user.stats.publishedPlanCount)}
          </span>{' '}
          计划
        </span>
      </div>

      <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700">
        <UserPlus className="h-3 w-3" aria-hidden />
        查看主页
      </span>
    </Link>
  );
}

export default memo(
  DiscoverPopularUserCard,
  (prev, next) =>
    prev.user === next.user &&
    prev.recommendScore === next.recommendScore &&
    prev.recommendReasons === next.recommendReasons &&
    prev.className === next.className,
);
