import { Pencil } from 'lucide-react';
import { useCallback, useState } from 'react';
import type { User } from '@/types/domain/user/user';
import SnailContributionTitleBadge from '@/components/features/community/SnailContributionTitleBadge';
import UserProfileEditDialog from '@/components/features/profile/UserProfileEditDialog';
import UserProfileShareControls from '@/components/features/profile/UserProfileShareControls';
import { AvatarImage } from '@/components/ui';
import { useContributionScore } from '@/hooks/user/useContributionScore';
import { useDemoUserProfileStore } from '@/stores/demoUserProfile/store';
import { formatProfileStatCount, getProfileBio, hasCustomBio } from '@/utils/userProfileView';
import { cn } from '@/utils/cn';

export type UserProfileHeaderProps = {
  user: User;
  isOwnProfile: boolean;
  className?: string;
};

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold tabular-nums text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

/** 资料页头部：头像、昵称、个性签名、编辑资料 */
export default function UserProfileHeader({
  user,
  isOwnProfile,
  className,
}: UserProfileHeaderProps) {
  const [editOpen, setEditOpen] = useState(false);
  const updateProfile = useDemoUserProfileStore((state) => state.updateProfile);

  const bio = getProfileBio(user, isOwnProfile);
  const bioIsPlaceholder = isOwnProfile && !hasCustomBio(user);
  const contributionScore = useContributionScore(user.id, user.contributionScore ?? 0);

  const handleEditOpen = useCallback(() => {
    setEditOpen(true);
  }, []);

  const handleEditClose = useCallback(() => {
    setEditOpen(false);
  }, []);

  const handleSave = useCallback(
    (patch: { username: string; bio: string; avatar?: string }) => {
      updateProfile(patch);
    },
    [updateProfile],
  );

  return (
    <>
      <header
        className={cn(
          'overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-violet-50 via-white to-cyan-50 shadow-sm',
          className,
        )}
      >
        <div className="px-5 py-6 sm:px-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-5">
            <div className="relative shrink-0">
              {user.avatar ? (
                <AvatarImage
                  src={user.avatar}
                  displayName={user.username}
                  size={96}
                  priority
                  className="h-24 w-24 rounded-2xl border-2 border-white bg-white shadow-md ring-1 ring-slate-200/80"
                />
              ) : (
                <div
                  className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-white bg-brand-100 text-3xl font-bold text-brand-700 shadow-md"
                  aria-hidden
                >
                  {user.username.slice(0, 1)}
                </div>
              )}
              <SnailContributionTitleBadge
                score={contributionScore}
                className="absolute -bottom-2 left-1/2 z-10 max-w-[9rem] -translate-x-1/2 whitespace-nowrap"
              />
            </div>

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col items-center gap-2 sm:items-start">
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    {user.username}
                  </h1>
                  <p className="text-xs text-slate-500">贡献分 {contributionScore}</p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
                  <UserProfileShareControls user={user} isOwnProfile={isOwnProfile} variant="compact" />
                  {isOwnProfile && (
                    <button
                      type="button"
                      onClick={handleEditOpen}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-brand-200 bg-white px-3.5 py-2 text-sm font-semibold text-brand-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-50"
                    >
                      <Pencil className="h-4 w-4" aria-hidden />
                      编辑资料
                    </button>
                  )}
                </div>
              </div>

              <p
                className={cn(
                  'mt-3 text-sm leading-relaxed',
                  bioIsPlaceholder ? 'text-slate-400 italic' : 'text-slate-600',
                )}
              >
                {bio}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-slate-200/80 border-t border-slate-200/80 bg-white/70">
          <StatItem label="粉丝" value={formatProfileStatCount(user.followersCount)} />
          <StatItem label="关注" value={formatProfileStatCount(user.followingCount)} />
          <StatItem label="动态" value={formatProfileStatCount(user.travelMoments.length)} />
        </div>
      </header>

      {isOwnProfile && (
        <UserProfileEditDialog
          open={editOpen}
          user={user}
          onClose={handleEditClose}
          onSave={handleSave}
        />
      )}
    </>
  );
}
