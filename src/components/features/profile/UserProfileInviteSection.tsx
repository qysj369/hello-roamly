import { Gift } from 'lucide-react';
import InviteCodeCard, { InviteCodeCardSkeleton } from '@/components/features/invite/InviteCodeCard';
import InviteRewardsPanel from '@/components/features/invite/InviteRewardsPanel';
import UserFacingErrorAlert from '@/components/error/UserFacingErrorAlert';
import { useInviteSummary } from '@/hooks/invite/useInviteSummary';
import { isInviteEnabled } from '@/lib/invite/config';
import { cn } from '@/utils/cn';

export type UserProfileInviteSectionProps = {
  userId: string;
  className?: string;
};

/** 个人主页：邀请好友得奖励 */
export default function UserProfileInviteSection({ userId, className }: UserProfileInviteSectionProps) {
  const { data: summary, isPending, isError, error, refetch } = useInviteSummary(userId);

  if (!isInviteEnabled()) {
    return null;
  }

  return (
    <section
      className={cn(
        'rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/70 via-white to-white p-5 shadow-sm',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700">
          <Gift className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">邀请好友得奖励</h2>
          <p className="mt-0.5 text-xs text-slate-500">分享邀请码，好友注册后双方可获积分与徽章</p>
        </div>
      </div>

      <div className="mt-4">
        {isPending && <InviteCodeCardSkeleton />}
        {isError && (
          <UserFacingErrorAlert
            error={error}
            context="invite"
            onRetry={() => {
              void refetch();
            }}
          />
        )}
        {summary && (
          <>
            <InviteCodeCard summary={summary} />
            <InviteRewardsPanel className="mt-4" userId={userId} summary={summary} />
          </>
        )}
      </div>
    </section>
  );
}
