/**
 * 邀请好友 API（奖励由服务端发放，防刷规则在后端）。
 *
 * - GET  /invites/me           当前用户邀请码与统计
 * - POST /invites/redeem       使用邀请码（注册/登录后）
 * - POST /invites/claim        领取已达成的奖励
 */
export const INVITE_API = {
  me: '/invites/me',
  redeem: '/invites/redeem',
  claim: '/invites/claim',
} as const;
