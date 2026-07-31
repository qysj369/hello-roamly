import { create } from 'zustand';
import {
  readMomentLikesStorage,
  writeMomentLikesStorage,
} from '@/lib/storage/momentLikesStorage';

type MomentInteractionState = {
  likedMomentIds: string[];
  hydrated: boolean;
  hydrate: () => void;
  toggleLike: (momentId: string) => void;
  isLiked: (momentId: string) => boolean;
};

export const useMomentInteractionStore = create<MomentInteractionState>((set, get) => ({
  likedMomentIds: [],
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) {
      return;
    }
    set({ likedMomentIds: readMomentLikesStorage(), hydrated: true });
  },

  toggleLike: (momentId) => {
    set((state) => {
      const likedMomentIds = state.likedMomentIds.includes(momentId)
        ? state.likedMomentIds.filter((id) => id !== momentId)
        : [...state.likedMomentIds, momentId];
      writeMomentLikesStorage(likedMomentIds);
      return { likedMomentIds };
    });
  },

  isLiked: (momentId) => get().likedMomentIds.includes(momentId),
}));
