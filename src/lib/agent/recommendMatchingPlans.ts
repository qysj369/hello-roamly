import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

export type MatchingPlanHint = {
  title: string;
  href: string;
  reason: string;
};

/** 空社区不再导流；下一步改行程 / 分享走管家主动动作 */
export function recommendMatchingPlans(_plan: SearchStructuredPlan): MatchingPlanHint[] {
  return [];
}
