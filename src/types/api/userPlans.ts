import type { PlanChatHistoryItem } from '@/types/api/planContinueChat';

/** 保存到 user_plans.content 的完整方案数据 */
export type SavedUserPlanContent = {
  planId: string;
  locationName: string;
  lng: number;
  lat: number;
  initialQuery?: string;
  fullHistory: PlanChatHistoryItem[];
};

export type SaveUserPlanRequest = {
  title: string;
  isPublic: boolean;
  content: SavedUserPlanContent;
};

export type UserPlanRecord = {
  id: string;
  userId: string;
  title: string;
  content: SavedUserPlanContent;
  isPublic: boolean;
  /** 兼容字段：是否已从 AI 会话保存为正式方案 */
  isSaved?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SaveUserPlanResponse = {
  item: UserPlanRecord;
};

export type SaveUserPlanErrorResponse = {
  error: string;
  code?: 'invalid_params' | 'save_failed' | 'not_found' | 'forbidden' | 'read_failed';
};

export type ListUserPlansParams = {
  /** 仅返回公开方案（发现页用） */
  public?: boolean;
  /** 指定用户的方案（需配合 public 用于他人主页） */
  userId?: string;
};

export type PatchUserPlanRequest = {
  isPublic?: boolean;
  title?: string;
};

export type PatchUserPlanResponse = {
  item: UserPlanRecord;
};

export type DeleteUserPlanResponse = {
  ok: true;
};

export type ListUserPlansResponse = {
  items: UserPlanRecord[];
  total: number;
};

export type GetUserPlanResponse = {
  item: UserPlanRecord;
};

export type ListUserPlansErrorResponse = {
  error: string;
  code?: 'not_found' | 'forbidden';
};
