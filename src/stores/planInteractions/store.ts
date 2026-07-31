import { create } from 'zustand';
import {
  readPlanInteractionsStorage,
  writePlanInteractionsStorage,
} from '@/lib/storage/planInteractionsStorage';

type PlanInteractionState = {
  likedPlanIds: string[];
  favoritedPlanIds: string[];
  hydrated: boolean;
  hydrate: () => void;
  toggleLike: (planId: string) => void;
  toggleFavorite: (planId: string) => void;
  isLiked: (planId: string) => boolean;
  isFavorited: (planId: string) => boolean;
};

export const usePlanInteractionStore = create<PlanInteractionState>((set, get) => ({
  likedPlanIds: [],
  favoritedPlanIds: [],
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) {
      return;
    }
    const { liked, favorited } = readPlanInteractionsStorage();
    set({ likedPlanIds: liked, favoritedPlanIds: favorited, hydrated: true });
  },
  toggleLike: (planId) => {
    set((state) => {
      const liked = state.likedPlanIds.includes(planId)
        ? state.likedPlanIds.filter((id) => id !== planId)
        : [...state.likedPlanIds, planId];
      writePlanInteractionsStorage(liked, state.favoritedPlanIds);
      return { likedPlanIds: liked };
    });
  },
  toggleFavorite: (planId) => {
    set((state) => {
      const favorited = state.favoritedPlanIds.includes(planId)
        ? state.favoritedPlanIds.filter((id) => id !== planId)
        : [...state.favoritedPlanIds, planId];
      writePlanInteractionsStorage(state.likedPlanIds, favorited);
      return { favoritedPlanIds: favorited };
    });
  },
  isLiked: (planId) => get().likedPlanIds.includes(planId),
  isFavorited: (planId) => get().favoritedPlanIds.includes(planId),
}));
