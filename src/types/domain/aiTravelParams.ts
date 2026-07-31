export type TravelPace = 'relaxed' | 'balanced' | 'intense';

export type TravelInterest = 'food' | 'culture' | 'adventure' | 'shopping' | 'nature';

export type AiTravelParams = {
  budgetMin: number;
  budgetMax: number;
  days: number;
  interests: TravelInterest[];
  pace: TravelPace;
};

export const TRAVEL_INTEREST_OPTIONS: { id: TravelInterest; label: string }[] = [
  { id: 'food', label: '美食' },
  { id: 'culture', label: '文化' },
  { id: 'adventure', label: '冒险' },
  { id: 'shopping', label: '购物' },
  { id: 'nature', label: '自然' },
];

export const TRAVEL_PACE_OPTIONS: { id: TravelPace; label: string; hint: string }[] = [
  { id: 'relaxed', label: '悠闲', hint: '每天 1–2 个点' },
  { id: 'balanced', label: '适中', hint: '经典必去 + 留白' },
  { id: 'intense', label: '紧凑', hint: '高效串点' },
];

export const TRAVEL_DAY_OPTIONS = [1, 2, 3, 5, 7, 10, 14] as const;

export const BUDGET_RANGE_LIMITS = {
  min: 500,
  max: 20000,
  step: 100,
} as const;
