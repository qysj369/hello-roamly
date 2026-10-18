import { DEMO_CURRENT_USER_ID } from '@/data/demoUsers';
import type { InviteReferralRow, InviteReward } from '@/types/domain/invite';

export const DEMO_INVITE_CODE_BY_USER: Record<string, string> = {
  [DEMO_CURRENT_USER_ID]: 'ROAM2026',
  'user-maple': 'MAPLE88',
  'user-polar': 'POLAR66',
};

export const DEFAULT_INVITE_REWARDS: InviteReward[] = [
  {
    id: 'reward-invite-1',
    kind: 'points',
    label: '邀请 1 位好友',
    amount: 50,
    status: 'granted',
    condition: '好友完成注册',
    earnedAt: new Date(Date.now() - 5 * 86_400_000).toISOString(),
  },
  {
    id: 'reward-invite-3',
    kind: 'points',
    label: '累计邀请 3 位',
    amount: 200,
    status: 'pending',
    condition: '还差 1 位有效好友',
  },
  {
    id: 'reward-invite-badge',
    kind: 'badge',
    label: '邀请达人徽章',
    status: 'pending',
    condition: '累计邀请 5 位且至少 2 位发布动态',
  },
  {
    id: 'reward-invite-city-pack',
    kind: 'coupon',
    label: '高清城市灵感素材包',
    status: 'pending',
    condition: '邀请 1 位好友完成注册后解锁',
  },
];

export const DEFAULT_DEMO_REFERRALS: InviteReferralRow[] = [
  {
    id: 'ref-1',
    inviteeLabel: '旅友小枫',
    status: 'rewarded',
    joinedAt: new Date(Date.now() - 12 * 86_400_000).toISOString(),
    rewardLabel: '+50 积分',
  },
  {
    id: 'ref-2',
    inviteeLabel: '背包客阿宁',
    status: 'active',
    joinedAt: new Date(Date.now() - 4 * 86_400_000).toISOString(),
    rewardLabel: '待发布首条动态',
  },
];

export function getDemoInviteCodeForUser(userId: string): string {
  return DEMO_INVITE_CODE_BY_USER[userId] ?? `R${userId.replace(/[^a-z0-9]/gi, '').slice(-6).toUpperCase()}`;
}

export function getInviterUserIdByCode(code: string): string | null {
  const normalized = code.trim().toUpperCase();
  for (const [userId, inviteCode] of Object.entries(DEMO_INVITE_CODE_BY_USER)) {
    if (inviteCode === normalized) {
      return userId;
    }
  }
  return null;
}
