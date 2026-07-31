import type { TravelInterest, TravelPace } from '@/types/domain/aiTravelParams';
import type { User } from '@/types/domain/user/user';

/**
 * AI 规划默认参数（与 User.interests 分离，用于生成行程时的预算/天数等）
 * 登录用户可将 User 画像同步到此结构作为生成默认值
 */
export type UserTravelPreferences = {
  defaultBudget: {
    min: number;
    max: number;
  };
  defaultDays: number;
  interests: TravelInterest[];
  pace: TravelPace;
  preferredDestinations?: string[];
  budgetSensitivity?: 1 | 2 | 3 | 4 | 5;
  openToShareCost?: boolean;
  locale?: 'zh-CN' | 'en';
};

export const DEFAULT_USER_TRAVEL_PREFERENCES: UserTravelPreferences = {
  defaultBudget: { min: 500, max: 3000 },
  defaultDays: 3,
  interests: ['food', 'culture'],
  pace: 'balanced',
  budgetSensitivity: 4,
  openToShareCost: true,
  locale: 'zh-CN',
};

/** 从 User 旅行字段推导 AI 规划默认项 */
export function travelPreferencesFromUser(
  user: Pick<User, 'interests' | 'visitedCountries'>,
): UserTravelPreferences {
  return {
    ...DEFAULT_USER_TRAVEL_PREFERENCES,
    interests: user.interests.length > 0 ? user.interests : DEFAULT_USER_TRAVEL_PREFERENCES.interests,
    preferredDestinations: user.visitedCountries?.length ? user.visitedCountries : undefined,
  };
}
