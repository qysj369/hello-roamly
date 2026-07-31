/** 需审核的用户内容场景 */
export type ContentModerationScene =
  | 'ai_chat'
  | 'site_chat'
  | 'travel_moment'
  | 'profile_bio'
  | 'comment';

export type ModerationDecision = 'pass' | 'reject' | 'review';

export type ModerateContentInput = {
  scene: ContentModerationScene;
  text: string;
  /** 可选业务 ID（帖子、会话等） */
  bizId?: string;
  userId?: string;
};

export type ModerationResult = {
  decision: ModerationDecision;
  requestId: string;
  /** 风险标签（如 spam、porn、politics） */
  labels?: string[];
  /** 面向用户的说明 */
  message?: string;
  /** 是否仅经过本地预检（未调用云审） */
  localOnly?: boolean;
};
