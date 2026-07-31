import type { InviteSummary, RedeemInviteResult } from '@/types/domain/invite';

/** GET /invite/me */
export type InviteSummaryResponse = InviteSummary;

/** POST /invite/redeem */
export type RedeemInviteCodeRequest = {
  code: string;
  inviteeUserId?: string;
};

export type RedeemInviteCodeResponse = RedeemInviteResult;

/** POST /invite/rewards/claim */
export type ClaimInviteRewardRequest = {
  rewardId: string;
};

export type ClaimInviteRewardResponse = RedeemInviteResult;
