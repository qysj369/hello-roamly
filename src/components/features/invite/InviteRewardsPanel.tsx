import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { InviteSummary } from '@/types/domain/invite';
import { claimInviteReward } from '@/services/invite/inviteApi';
import { useInvalidateInviteSummary } from '@/hooks/invite/useInviteSummary';
import {
  CITY_INSPIRATION_PACK_REWARD_ID,
  downloadCityInspirationPack,
  isCityInspirationPackUnlocked,
} from '@/lib/invite/cityInspirationPack';
import { formatRelativeZh } from '@/utils/date';
import { cn } from '@/utils/cn';

export type InviteRewardsPanelProps = {
  userId: string;
  summary: InviteSummary;
  className?: string;
};

function statusLabel(status: InviteSummary['referrals'][0]['status']): string {
  const map = {
    registered: '已注册',
    active: '已活跃',
    rewarded: '已发奖',
  } as const;
  return map[status];
}

export default function InviteRewardsPanel({ userId, summary, className }: InviteRewardsPanelProps) {
  const invalidate = useInvalidateInviteSummary();
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [packBusy, setPackBusy] = useState(false);
  const packUnlocked = isCityInspirationPackUnlocked(summary);

  async function handleDownloadPack() {
    setPackBusy(true);
    setFeedback(null);
    try {
      await downloadCityInspirationPack();
      setFeedback('高清城市灵感素材包已开始下载。');
    } catch {
      setFeedback('素材包暂时下不下来，请稍后再试。');
    } finally {
      setPackBusy(false);
      window.setTimeout(() => setFeedback(null), 3000);
    }
  }

  async function handleClaim(rewardId: string) {
    setClaimingId(rewardId);
    setFeedback(null);
    const result = await claimInviteReward({ userId, rewardId });
    setClaimingId(null);
    setFeedback(result.message);
    if (result.ok) {
      invalidate(userId);
    }
    window.setTimeout(() => setFeedback(null), 3000);
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: '已邀请', value: summary.invitedCount },
          { label: '有效好友', value: summary.activeCount },
          { label: '待领奖励', value: summary.pendingRewardCount },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200 bg-white px-2 py-2.5 text-center"
          >
            <p className="text-lg font-bold tabular-nums text-slate-900">{item.value}</p>
            <p className="text-[10px] text-slate-500">{item.label}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-600">
        累计获得积分 <span className="font-semibold text-amber-700">{summary.totalPointsEarned}</span>
      </p>

      <div>
        <h4 className="text-xs font-semibold text-slate-800">奖励进度</h4>
        <ul className="mt-2 space-y-2">
          {summary.rewards.map((reward) => (
            <li
              key={reward.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">{reward.label}</p>
                <p className="text-[11px] text-slate-500">{reward.condition}</p>
              </div>
              {reward.id === CITY_INSPIRATION_PACK_REWARD_ID && reward.status === 'pending' ? (
                <span className="text-xs font-medium text-slate-500">邀请后解锁</span>
              ) : reward.status === 'pending' ? (
                <button
                  type="button"
                  disabled={claimingId === reward.id}
                  onClick={() => void handleClaim(reward.id)}
                  className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  {claimingId === reward.id && (
                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                  )}
                  领取
                </button>
              ) : reward.id === CITY_INSPIRATION_PACK_REWARD_ID ? (
                <button
                  type="button"
                  disabled={packBusy}
                  onClick={() => void handleDownloadPack()}
                  className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-white px-2.5 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-50 disabled:opacity-50"
                >
                  {packBusy && <Loader2 className="h-3 w-3 animate-spin" aria-hidden />}
                  下载素材包
                </button>
              ) : (
                <span className="text-xs font-medium text-emerald-700">
                  已领{reward.amount ? ` +${reward.amount}` : ''}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {summary.referrals.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-800">邀请记录</h4>
          <ul className="mt-2 max-h-40 space-y-1.5 overflow-y-auto text-xs">
            {summary.referrals.map((row) => (
              <li
                key={row.id}
                className="flex justify-between gap-2 border-b border-slate-100 pb-1.5 last:border-0"
              >
                <span className="font-medium text-slate-800">{row.inviteeLabel}</span>
                <span className="text-slate-500">
                  {statusLabel(row.status)} · {formatRelativeZh(row.joinedAt)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {packUnlocked ? (
        <p className="text-[11px] text-slate-500">
          已解锁高清城市灵感素材包：本城街巷与美食实拍，用于笔记配图，不含外链与报价。
        </p>
      ) : (
        <p className="text-[11px] text-slate-500">邀请 1 位好友完成注册后，可下载高清城市灵感素材包。</p>
      )}
      {feedback ? (
        <p className="text-center text-xs text-emerald-700" role="status">
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
