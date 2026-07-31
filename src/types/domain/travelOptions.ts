import type { TravelInterest, TravelPace } from '@/types/domain/aiTravelParams';

/** 旅行预算区间（元） */
export type TravelOptionsBudget = {
  min: number;
  max: number;
};

/** 生成旅行计划时的选项 */
export type TravelOptions = {
  /** 目的地（城市/区域） */
  destination?: string;
  /** 旅行天数 */
  days?: number;
  /** 预算区间 */
  budget?: TravelOptionsBudget;
  /** 兴趣偏好 */
  interests?: TravelInterest[];
  /** 行程节奏 */
  pace?: TravelPace;
  /** 关联攻略 id；缺省时按目的地或 prompt 匹配 */
  guideId?: string;
};

export const DEFAULT_TRAVEL_OPTIONS_BUDGET: TravelOptionsBudget = {
  min: 1500,
  max: 3500,
};

export const DEFAULT_TRAVEL_OPTIONS: Required<
  Pick<TravelOptions, 'days' | 'interests' | 'pace'>
> & {
  budget: TravelOptionsBudget;
} = {
  days: 3,
  budget: DEFAULT_TRAVEL_OPTIONS_BUDGET,
  interests: ['food', 'culture'],
  pace: 'balanced',
};

/** 解析预算区间，缺省回退默认值 */
export function resolveTravelOptionsBudget(
  options: TravelOptions,
): TravelOptionsBudget {
  if (options.budget) {
    return options.budget;
  }
  return DEFAULT_TRAVEL_OPTIONS_BUDGET;
}
