import { create } from 'zustand';
import type { TravelPlan } from '@/types/domain/travelPlan';

const MAX_PLANS = 8;

type GeneratedPlansState = {
  plans: TravelPlan[];
  addPlan: (plan: TravelPlan) => void;
  clearPlans: () => void;
};

export const useGeneratedPlansStore = create<GeneratedPlansState>((set) => ({
  plans: [],
  addPlan: (plan) =>
    set((state) => ({
      plans: [plan, ...state.plans.filter((item) => item.id !== plan.id)].slice(0, MAX_PLANS),
    })),
  clearPlans: () => set({ plans: [] }),
}));
