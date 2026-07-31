import { dS as paths, cI as getPlanTotalCostLabel, cJ as getPlanTotalDays, cC as getPlanDestination } from "./index-DwV1qlqh.js";
function buildTravelPlanCompanionState(plan) {
  return {
    travelBuddy: {
      planId: plan.id,
      planTitle: plan.title,
      destination: getPlanDestination(plan),
      days: getPlanTotalDays(plan),
      budgetLabel: getPlanTotalCostLabel(plan)
    }
  };
}
function getTravelPlanCompanionPath() {
  return paths.guides;
}
export {
  buildTravelPlanCompanionState as b,
  getTravelPlanCompanionPath as g
};
