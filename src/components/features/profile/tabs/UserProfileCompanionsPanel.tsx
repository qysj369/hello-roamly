import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ProfileCompanionSummary } from '@/utils/userProfileContent';
import { userProfilePath } from '@/router/paths';
import { AvatarImage } from '@/components/ui';
import { cn } from '@/utils/cn';

export type UserProfileCompanionsPanelProps = {
  following: ProfileCompanionSummary[];
  followers: ProfileCompanionSummary[];
  isOwnProfile: boolean;
  className?: string;
};

type CompanionSubTab = 'following' | 'followers';

function CompanionRow({ companion }: { companion: ProfileCompanionSummary }) {
  return (
    <Link
      to={userProfilePath(companion.userId)}
      className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/40 p-3 transition hover:border-brand-200 hover:bg-brand-50/30"
    >
      {companion.avatar ? (
        <AvatarImage
          src={companion.avatar}
          displayName={companion.username}
          size={44}
          className="h-11 w-11 shrink-0 ring-2 ring-white"
        />
      ) : (
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700"
          aria-hidden
        >
          {companion.username.slice(0, 1)}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{companion.username}</p>
        {companion.bio && (
          <p className="mt-0.5 line-clamp-1 text-xs text-slate-600">{companion.bio}</p>
        )}
      </div>
    </Link>
  );
}

export default function UserProfileCompanionsPanel({
  following,
  followers,
  isOwnProfile,
  className,
}: UserProfileCompanionsPanelProps) {
  const [subTab, setSubTab] = useState<CompanionSubTab>('following');
  const list = subTab === 'following' ? following : followers;

  let emptyMessage = '暂无数据';
  if (subTab === 'following') {
    emptyMessage = isOwnProfile ? '还没有关注旅伴' : '暂无关注';
  } else {
    emptyMessage = isOwnProfile ? '还没有粉丝' : '暂无粉丝';
  }

  const handleFollowing = useCallback(() => {
    setSubTab('following');
  }, []);

  const handleFollowers = useCallback(() => {
    setSubTab('followers');
  }, []);

  return (
    <div className={cn('space-y-3', className)}>
      <div
        className="inline-flex rounded-lg border border-slate-200 bg-slate-100/80 p-0.5"
        role="tablist"
        aria-label="关注与粉丝"
      >
        <button
          type="button"
          role="tab"
          aria-selected={subTab === 'following'}
          onClick={handleFollowing}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-semibold transition',
            subTab === 'following'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900',
          )}
        >
          关注 {following.length}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={subTab === 'followers'}
          onClick={handleFollowers}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-semibold transition',
            subTab === 'followers'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900',
          )}
        >
          粉丝 {followers.length}
        </button>
      </div>

      {list.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-sm text-slate-500">
          {emptyMessage}
        </p>
      )}

      <ul className="space-y-2">
        {list.map((companion) => (
          <li key={companion.userId}>
            <CompanionRow companion={companion} />
          </li>
        ))}
      </ul>
    </div>
  );
}
