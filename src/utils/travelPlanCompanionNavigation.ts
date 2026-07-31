import type { TravelPlan } from '@/types/domain/travelPlan';
import { paths } from '@/router/paths';
import type { GuidesPageState } from '@/types/router-state';
import {
  getPlanDestination,
  getPlanTotalDays,
  getPlanTotalCostLabel,
} from '@/utils/travelPlanView';

export function buildTravelPlanCompanionState(plan: TravelPlan): GuidesPageState {
  return {
    travelBuddy: {
      planId: plan.id,
      planTitle: plan.title,
      destination: getPlanDestination(plan),
      days: getPlanTotalDays(plan),
      budgetLabel: getPlanTotalCostLabel(plan),
    },
  };
}

export function getTravelPlanCompanionPath(): string {
  return paths.guides;
}
