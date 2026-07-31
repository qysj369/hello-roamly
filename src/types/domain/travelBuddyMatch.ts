import type { TravelInterest } from '@/types/domain/aiTravelParams';
import type { TravelPersonality } from '@/types/domain/user/userTravel';
import type { UserId } from '@/types/domain/user/userId';

/** 匹配算法四维得分（各项 0–100） */
export type TravelBuddyMatchFactorScores = {
  /** 旅行时间 + 目的地 */
  scheduleDestination: number;
  /** 旅行人格兼容性 */
  personality: number;
  /** 兴趣标签重叠度 */
  interests: number;
  /** 预算范围接近度 */
  budget: number;
};

export const TRAVEL_BUDDY_MATCH_FACTOR_LABELS: Record<keyof TravelBuddyMatchFactorScores, string> =
  {
    scheduleDestination: '旅行时间·目的地',
    personality: '旅行人格兼容',
    interests: '兴趣标签重叠',
    budget: '预算范围接近',
  };

/** 各维度权重（合计 1） */
export const TRAVEL_BUDDY_MATCH_WEIGHTS: Record<keyof TravelBuddyMatchFactorScores, number> = {
  scheduleDestination: 0.35,
  personality: 0.25,
  interests: 0.25,
  budget: 0.15,
};

/** 旅伴匹配查询（来自计划详情或攻略页上下文） */
export type TravelBuddyMatchQuery = {
  destination: string;
  days?: number;
  budgetLabel?: string;
  /** 期望出发日期 ISO 8601 */
  startDate?: string;
  planId?: string;
  planTitle?: string;
};

/** 单条匹配结果 */
export type TravelBuddyMatchCandidate = {
  userId: UserId;
  username: string;
  avatar?: string;
  bio?: string;
  travelPersonality: TravelPersonality;
  /** 与当前查询方重合的兴趣 */
  sharedInterests: TravelInterest[];
  /** 加权综合分 0–100 */
  matchScore: number;
  factorScores: TravelBuddyMatchFactorScores;
  seekingDestination: string;
  seekingDays: number;
  seekingBudgetLabel: string;
  /** 对方期望出发日期 */
  seekingStartDate?: string;
  /** 对方结伴说明 */
  seekingMessage?: string;
  /** 对方兴趣标签 */
  interests: TravelInterest[];
  /** 去过国家/地区数量 */
  visitedCountryCount: number;
  matchReasons: string[];
};
