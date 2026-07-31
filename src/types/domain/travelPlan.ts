export type {
  EnrichedTravelPlan,
  MapCoordinates,
  TravelPlan,
  TravelPlanActivity,
  TravelPlanCreator,
  TravelPlanDay,
  TravelPlanPresentation,
} from '@/types/interfaces/travelPlan';

import type { EnrichedTravelPlan, TravelPlan } from '@/types/interfaces/travelPlan';

export function isEnrichedTravelPlan(plan: TravelPlan): plan is EnrichedTravelPlan {
  return 'presentation' in plan && (plan as EnrichedTravelPlan).presentation != null;
}
