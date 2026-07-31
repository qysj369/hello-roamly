import { getCityDaySeed, seedsToActivities } from '@/data/cityMockItinerary';
import { TRAVEL_INTEREST_OPTIONS } from '@/types/domain/aiTravelParams';
import type { TravelPlanDay } from '@/types/domain/travelPlan';
import type { TravelOptions } from '@/types/domain/travelOptions';
import { DEFAULT_TRAVEL_OPTIONS, resolveTravelOptionsBudget } from '@/types/domain/travelOptions';

/** 节奏决定每日活动槽位数 */
function activitiesPerDay(pace: TravelOptions['pace']): number {
  if (pace === 'intense') {
    return 4;
  }
  if (pace === 'relaxed') {
    return 3;
  }
  return 4;
}

export function buildMockDailyPlans(
  destination: string,
  options: TravelOptions,
): { dailyPlans: TravelPlanDay[]; totalCost: number } {
  const days = options.days ?? DEFAULT_TRAVEL_OPTIONS.days;
  const pace = options.pace ?? DEFAULT_TRAVEL_OPTIONS.pace;
  const { min, max } = resolveTravelOptionsBudget(options);
  const totalCost = Math.round((min + max) / 2);
  const perDayBudget = Math.round(totalCost / days);
  const maxSlots = activitiesPerDay(pace);

  const interestLabel =
    options.interests
      ?.map((id) => TRAVEL_INTEREST_OPTIONS.find((o) => o.id === id)?.label)
      .filter(Boolean)[0] ?? '美食';

  const dailyPlans: TravelPlanDay[] = Array.from({ length: days }, (_, index) => {
    const day = index + 1;
    const daySeed = getCityDaySeed(destination, day, interestLabel);
    const activities = seedsToActivities(daySeed.activities.slice(0, maxSlots), perDayBudget);

    return {
      day,
      title: daySeed.title,
      activities,
    };
  });

  return { dailyPlans, totalCost };
}
