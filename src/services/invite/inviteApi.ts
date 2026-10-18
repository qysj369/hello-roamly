import { http } from '@/lib/api/http';
import { getUserFacingErrorMessage } from '@/lib/errors/userFacingMessage';
import { CITY_INSPIRATION_PACK_REWARD_ID } from '@/lib/invite/cityInspirationPack';
import {
  DEFAULT_DEMO_REFERRALS,
  DEFAULT_INVITE_REWARDS,
  getDemoInviteCodeForUser,
  getInviterUserIdByCode,
} from '@/data/demoInvite';
import { isProductionAppMode } from '@/lib/config/appMode';
import { hasInviteBackend } from '@/lib/invite/config';
import { buildInviteLink, normalizeInviteCode } from '@/lib/invite/inviteLink';
import {
  appendDemoGrantedReward,
  appendDemoReferral,
  clearPendingInviteCode,
  getPendingInviteCode,
  listDemoGrantedRewards,
  listDemoReferrals,
  setPendingInviteCode,
} from '@/lib/invite/store';
import { INVITE_API } from '@/services/invite/paths';
import type {
  ClaimInviteRewardRequest,
  ClaimInviteRewardResponse,
  InviteSummaryResponse,
  RedeemInviteCodeRequest,
  RedeemInviteCodeResponse,
} from '@/types/api/invite';
import type { InviteSummary, RedeemInviteResult } from '@/types/domain/invite';

/** 演示：合并静态 seed、localStorage 邀请记录与已领取奖励，供 About/个人页展示 */
function buildDemoInviteSummary(userId: string): InviteSummary {
  const inviteCode = getDemoInviteCodeForUser(userId);
  const referrals = [...listDemoReferrals(userId), ...DEFAULT_DEMO_REFERRALS];
  const grantedExtra = listDemoGrantedRewards(userId);
  const invitedCount = referrals.length;
  const seededRewards = DEFAULT_INVITE_REWARDS.map((reward) => {
    if (reward.id === CITY_INSPIRATION_PACK_REWARD_ID && invitedCount >= 1) {
      return {
        ...reward,
        status: 'granted' as const,
        earnedAt: reward.earnedAt ?? new Date(Date.now() - 4 * 86_400_000).toISOString(),
      };
    }
    return reward;
  });
  const rewards = [...seededRewards, ...grantedExtra];
  const activeCount = referrals.filter((row) => row.status !== 'registered').length;
  const pendingRewardCount = rewards.filter((row) => row.status === 'pending').length;
  const totalPointsEarned = rewards
    .filter((row) => row.kind === 'points' && row.status === 'granted')
    .reduce((sum, row) => sum + (row.amount ?? 0), 0);

  return {
    inviteCode,
    inviteLink: buildInviteLink(inviteCode),
    invitedCount,
    activeCount,
    pendingRewardCount,
    totalPointsEarned,
    rewards,
    referrals: referrals.slice(0, 20),
    message: hasInviteBackend() || isProductionAppMode()
      ? undefined
      : '邀请接口已预留：配置 VITE_API_BASE_URL 后由服务端发码与发奖',
  };
}

export async function fetchInviteSummary(userId: string): Promise<InviteSummary> {
  if (!hasInviteBackend()) {
    // TODO: 统一走 INVITE_API.me，移除 buildDemoInviteSummary 与 localStorage 模拟
    return buildDemoInviteSummary(userId);
  }

  const { data } = await http.get<InviteSummaryResponse>(INVITE_API.me);
  return data;
}

export async function redeemInviteCode(
  input: RedeemInviteCodeRequest,
): Promise<RedeemInviteCodeResponse> {
  const code = normalizeInviteCode(input.code);
  if (!code) {
    return { ok: false, message: '邀请码无效' };
  }

  if (!hasInviteBackend()) {
    // 演示无登录态：先记 ref，等「模拟注册」再绑定邀请人
    setPendingInviteCode(code);
    return {
      ok: true,
      message: `演示：已记录邀请码 ${code}，登录后将模拟发放奖励`,
      reward: {
        id: `demo-redeem-${Date.now()}`,
        kind: 'points',
        label: '新用户礼包',
        amount: 30,
        status: 'pending',
        condition: '完成注册后到账',
      },
    };
  }

  try {
    const body: RedeemInviteCodeRequest = {
      code,
      inviteeUserId: input.inviteeUserId,
    };
    const { data } = await http.post<RedeemInviteCodeResponse>(INVITE_API.redeem, body);
    return data;
  } catch (error) {
    return { ok: false, message: getUserFacingErrorMessage(error, 'invite') };
  }
}

export async function claimInviteReward(input: {
  userId: string;
  rewardId: string;
}): Promise<ClaimInviteRewardResponse> {
  const { userId, rewardId } = input;

  if (!hasInviteBackend()) {
    const summary = buildDemoInviteSummary(userId);
    const reward = summary.rewards.find((item) => item.id === rewardId);
    if (!reward) {
      return { ok: false, message: '奖励不存在' };
    }
    if (reward.status === 'granted') {
      return { ok: false, message: '该奖励已领取' };
    }

    const granted = {
      ...reward,
      status: 'granted' as const,
      earnedAt: new Date().toISOString(),
    };
    appendDemoGrantedReward(userId, granted);

    // 演示里程碑「邀请 3 人」：领奖时追加一条 referral，方便 UI 展示进度变化
    if (rewardId === 'reward-invite-3') {
      appendDemoReferral(userId, {
        id: `ref-${Date.now()}`,
        inviteeLabel: '新邀请好友',
        status: 'rewarded',
        joinedAt: new Date().toISOString(),
        rewardLabel: '+200 积分',
      });
    }

    return {
      ok: true,
      message: `演示：已领取「${reward.label}」`,
      reward: granted,
    };
  }

  try {
    const body: ClaimInviteRewardRequest = { rewardId };
    const { data } = await http.post<ClaimInviteRewardResponse>(INVITE_API.claim, body);
    return data;
  } catch (error) {
    return { ok: false, message: getUserFacingErrorMessage(error, 'invite') };
  }
}

/** 演示：受邀人完成注册，给邀请人记一条邀请记录 */
export async function simulateInviteRegistration(inviteeUserId: string): Promise<RedeemInviteResult> {
  const pending = getPendingInviteCode();
  if (!pending) {
    return { ok: false, message: '没有待绑定的邀请码，请先通过邀请链接访问' };
  }

  const ownCode = getDemoInviteCodeForUser(inviteeUserId);
  if (normalizeInviteCode(pending) === normalizeInviteCode(ownCode)) {
    return { ok: false, message: '不能使用自己的邀请码' };
  }

  const inviterId = getInviterUserIdByCode(pending);
  if (!inviterId) {
    return { ok: false, message: '演示环境未配置该邀请码对应的用户' };
  }

  appendDemoReferral(inviterId, {
    id: `ref-bound-${Date.now()}`,
    inviteeLabel: '新好友（演示）',
    status: 'active',
    joinedAt: new Date().toISOString(),
    rewardLabel: '+50 积分待发放',
  });

  clearPendingInviteCode();

  return {
    ok: true,
    message: `演示：好友已通过 ${pending} 注册，邀请人已获得记录`,
    reward: {
      id: `demo-welcome-${Date.now()}`,
      kind: 'points',
      label: '受邀新人礼包',
      amount: 30,
      status: 'granted',
      condition: '注册成功',
      earnedAt: new Date().toISOString(),
    },
  };
}
