import type { UserId } from '@/types/domain/user/userId';

/** 用户拥有的旅行计划引用（生成记录、草稿、发布态） */
export type UserPlanOwnership = {
  planId: string;
  ownerId: UserId;
  visibility: 'private' | 'unlisted' | 'public';
  /** 是否为 AI 生成 */
  source: 'ai_generated' | 'manual' | 'imported';
  /** ISO 8601 */
  createdAt: string;
  updatedAt: string;
};
