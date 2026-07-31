/** 贡献分计分规则（提示词5 · 积分与称号框架） */
export const CONTRIBUTION_SCORE_RULES = {
  /** 发布一条攻略（黏液轨迹） */
  publishGuide: 50,
  /** 收到一次撒盐（点赞） */
  receiveSalt: 5,
  /** 被收进壳里（收藏） */
  receiveShellKeep: 10,
} as const;

export type ContributionTitleTier = {
  id: string;
  min: number;
  max: number;
  emoji: string;
  title: string;
};

/** 贡献分称号档位 */
export const CONTRIBUTION_TITLE_TIERS: readonly ContributionTitleTier[] = [
  { id: 'tier-little', min: 0, max: 100, emoji: '🐌', title: '小蜗牛' },
  { id: 'tier-traveler', min: 101, max: 500, emoji: '🐌🐌', title: '旅行蜗牛' },
  { id: 'tier-boss', min: 501, max: Number.POSITIVE_INFINITY, emoji: '🐌🐌🐌', title: '蜗牛大佬' },
] as const;
