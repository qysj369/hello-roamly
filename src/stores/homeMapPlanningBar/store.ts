import { create } from 'zustand';

import type { AiChatPageState } from '@/types/router-state';

export type HomeMapPlanningBarProps = {
  searchQuery: string;
  generating: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (query: string) => Promise<string | null>;
  onRetrySearch?: () => void;
  advisorHandoff?: AiChatPageState;
};

type HomeMapPlanningBarState = {
  bar: HomeMapPlanningBarProps | null;
  setBar: (bar: HomeMapPlanningBarProps | null) => void;
};

export const useHomeMapPlanningBarStore = create<HomeMapPlanningBarState>((set) => ({
  bar: null,
  setBar: (bar) => set({ bar }),
}));
