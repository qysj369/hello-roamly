import { create } from 'zustand';

type PlanHistoryUiState = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openHistory: () => void;
};

export const usePlanHistoryUiStore = create<PlanHistoryUiState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  openHistory: () => set({ open: true }),
}));
