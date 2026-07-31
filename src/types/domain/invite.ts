/** 邀请奖励类型 */
export type InviteRewardKind = 'points' | 'badge' | 'coupon';

export type InviteRewardStatus = 'pending' | 'granted' | 'expired';

export type InviteReward = {
  id: string;
  kind: InviteRewardKind;
  label: string;
  amount?: number;
  status: InviteRewardStatus;
  /** 触发条件说明 */
  condition: string;
  earnedAt?: string;
};

export type InviteReferralRow = {
  id: string;
  inviteeLabel: string;
  status: 'registered' | 'active' | 'rewarded';
  joinedAt: string;
  rewardLabel?: string;
};

export type InviteSummary = {
  inviteCode: string;
  inviteLink: string;
  invitedCount: number;
  activeCount: number;
  pendingRewardCount: number;
  totalPointsEarned: number;
  rewards: InviteReward[];
  referrals: InviteReferralRow[];
  /** 演示 / 后端说明 */
  message?: string;
};

export type RedeemInviteResult = {
  ok: boolean;
  message: string;
  reward?: InviteReward;
};
