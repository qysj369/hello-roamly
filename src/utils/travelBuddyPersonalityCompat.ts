import { TravelPersonalityKind } from '@/types/domain/user/userTravel';

/**
 * 旅行人格兼容性（0–1）
 * 基于互补/相似出行风格，对称查询
 */
const PERSONALITY_COMPAT_MATRIX: Record<
  TravelPersonalityKind,
  Partial<Record<TravelPersonalityKind, number>>
> = {
  [TravelPersonalityKind.Adventurer]: {
    [TravelPersonalityKind.Adventurer]: 1,
    [TravelPersonalityKind.Photographer]: 0.92,
    [TravelPersonalityKind.SocialButterfly]: 0.88,
    [TravelPersonalityKind.BudgetNomad]: 0.82,
    [TravelPersonalityKind.CultureExplorer]: 0.78,
    [TravelPersonalityKind.Foodie]: 0.72,
    [TravelPersonalityKind.Relaxer]: 0.58,
  },
  [TravelPersonalityKind.Foodie]: {
    [TravelPersonalityKind.Foodie]: 1,
    [TravelPersonalityKind.CultureExplorer]: 0.9,
    [TravelPersonalityKind.SocialButterfly]: 0.86,
    [TravelPersonalityKind.BudgetNomad]: 0.8,
    [TravelPersonalityKind.Relaxer]: 0.76,
    [TravelPersonalityKind.Photographer]: 0.7,
    [TravelPersonalityKind.Adventurer]: 0.72,
  },
  [TravelPersonalityKind.CultureExplorer]: {
    [TravelPersonalityKind.CultureExplorer]: 1,
    [TravelPersonalityKind.Foodie]: 0.9,
    [TravelPersonalityKind.Photographer]: 0.84,
    [TravelPersonalityKind.Relaxer]: 0.8,
    [TravelPersonalityKind.BudgetNomad]: 0.78,
    [TravelPersonalityKind.SocialButterfly]: 0.75,
    [TravelPersonalityKind.Adventurer]: 0.78,
  },
  [TravelPersonalityKind.Relaxer]: {
    [TravelPersonalityKind.Relaxer]: 1,
    [TravelPersonalityKind.CultureExplorer]: 0.8,
    [TravelPersonalityKind.Foodie]: 0.76,
    [TravelPersonalityKind.Photographer]: 0.72,
    [TravelPersonalityKind.BudgetNomad]: 0.68,
    [TravelPersonalityKind.SocialButterfly]: 0.7,
    [TravelPersonalityKind.Adventurer]: 0.58,
  },
  [TravelPersonalityKind.Photographer]: {
    [TravelPersonalityKind.Photographer]: 1,
    [TravelPersonalityKind.Adventurer]: 0.92,
    [TravelPersonalityKind.CultureExplorer]: 0.84,
    [TravelPersonalityKind.SocialButterfly]: 0.8,
    [TravelPersonalityKind.BudgetNomad]: 0.74,
    [TravelPersonalityKind.Foodie]: 0.7,
    [TravelPersonalityKind.Relaxer]: 0.72,
  },
  [TravelPersonalityKind.BudgetNomad]: {
    [TravelPersonalityKind.BudgetNomad]: 1,
    [TravelPersonalityKind.Adventurer]: 0.82,
    [TravelPersonalityKind.Foodie]: 0.8,
    [TravelPersonalityKind.SocialButterfly]: 0.85,
    [TravelPersonalityKind.CultureExplorer]: 0.78,
    [TravelPersonalityKind.Photographer]: 0.74,
    [TravelPersonalityKind.Relaxer]: 0.68,
  },
  [TravelPersonalityKind.SocialButterfly]: {
    [TravelPersonalityKind.SocialButterfly]: 1,
    [TravelPersonalityKind.Adventurer]: 0.88,
    [TravelPersonalityKind.Foodie]: 0.86,
    [TravelPersonalityKind.BudgetNomad]: 0.85,
    [TravelPersonalityKind.Photographer]: 0.8,
    [TravelPersonalityKind.CultureExplorer]: 0.75,
    [TravelPersonalityKind.Relaxer]: 0.7,
  },
};

const DEFAULT_COMPAT = 0.55;

/** 两种旅行人格的兼容性，0–100 */
export function getPersonalityCompatibilityScore(
  a: TravelPersonalityKind,
  b: TravelPersonalityKind,
): number {
  if (a === b) {
    return 100;
  }
  const direct = PERSONALITY_COMPAT_MATRIX[a]?.[b];
  const reverse = PERSONALITY_COMPAT_MATRIX[b]?.[a];
  const value = direct ?? reverse ?? DEFAULT_COMPAT;
  return Math.round(value * 100);
}
