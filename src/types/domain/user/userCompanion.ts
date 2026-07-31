import type { UserId } from '@/types/domain/user/userId';

export type CompanionSeekingStatus = 'open' | 'matched' | 'closed' | 'expired';

/** 旅伴匹配意向（对应攻略页 travelBuddy 上下文的服务端形态） */
export type UserCompanionIntent = {
  id: string;
  userId: UserId;
  /** 关联的旅行计划，可选 */
  planId?: string;
  planTitle?: string;
  destination: string;
  days: number;
  /** 展示用预算文案，如 ¥2,500 */
  budgetLabel: string;
  /** 期望出发日期 ISO 8601 */
  startDate?: string;
  /** 补充说明 */
  message?: string;
  status: CompanionSeekingStatus;
  /** ISO 8601 */
  createdAt: string;
  updatedAt: string;
};

/** 旅伴筛选偏好（匹配算法输入） */
export type UserCompanionPreferences = {
  /** 接受的最大预算差（百分比） */
  maxBudgetDeltaPercent?: number;
  /** 可接受的行程天数差 */
  maxDaysDelta?: number;
  /** 必须兴趣重合数量 */
  minSharedInterests?: number;
  /** 仅匹配已验证用户 */
  verifiedOnly?: boolean;
};
