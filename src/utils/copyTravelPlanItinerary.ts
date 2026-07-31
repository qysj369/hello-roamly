import type { TravelPlan } from '@/types/domain/travelPlan';
import { copyTextToClipboard } from '@/utils/copyTextToClipboard';
import { formatTravelPlanItineraryText } from '@/utils/formatTravelPlanItineraryText';

export type CopyTravelPlanResult = 'copied' | 'failed';

export async function copyTravelPlanItinerary(plan: TravelPlan): Promise<CopyTravelPlanResult> {
  return copyTextToClipboard(formatTravelPlanItineraryText(plan));
}
