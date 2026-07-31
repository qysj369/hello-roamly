import { create } from 'zustand';
import type { TravelMoment } from '@/types/domain/user/userSocial';
import type { UserId } from '@/types/domain/user/userId';
import { normalizeTravelMoment } from '@/utils/travelMomentDisplay';

const STORAGE_KEY = 'hello-roamly:travel-moments';

type StoredTravelMoments = {
  byUser: Record<UserId, TravelMoment[]>;
};

function readStorage(): StoredTravelMoments {
  if (typeof window === 'undefined') {
    return { byUser: {} };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { byUser: {} };
    }
    const parsed = JSON.parse(raw) as Partial<StoredTravelMoments>;
    const byUser: Record<UserId, TravelMoment[]> = {};
    for (const [userId, moments] of Object.entries(parsed.byUser ?? {})) {
      if (Array.isArray(moments)) {
        byUser[userId] = moments.map((moment) => normalizeTravelMoment(moment as TravelMoment));
      }
    }
    return { byUser };
  } catch {
    return { byUser: {} };
  }
}

export function readTravelMomentsFromStorage(): StoredTravelMoments {
  return readStorage();
}

function writeStorage(byUser: Record<UserId, TravelMoment[]>) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ byUser }));
}

type TravelMomentsState = {
  byUser: Record<UserId, TravelMoment[]>;
  hydrated: boolean;
  hydrate: () => void;
  addMoment: (authorId: UserId, moment: TravelMoment) => void;
  removeMoment: (authorId: UserId, momentId: string) => void;
  getMomentsForUser: (authorId: UserId) => TravelMoment[];
  hasMoment: (authorId: UserId, momentId: string) => boolean;
};

export const useTravelMomentsStore = create<TravelMomentsState>((set, get) => ({
  byUser: {},
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) {
      return;
    }
    const stored = readStorage();
    set({ byUser: stored.byUser, hydrated: true });
  },

  addMoment: (authorId, moment) => {
    const normalized = normalizeTravelMoment(moment);
    set((state) => {
      const prev = state.byUser[authorId] ?? [];
      const byUser = {
        ...state.byUser,
        [authorId]: [normalized, ...prev.filter((item) => item.id !== normalized.id)],
      };
      writeStorage(byUser);
      return { byUser };
    });
  },

  removeMoment: (authorId, momentId) => {
    set((state) => {
      const prev = state.byUser[authorId] ?? [];
      const next = prev.filter((item) => item.id !== momentId);
      if (next.length === prev.length) {
        return state;
      }
      const byUser = { ...state.byUser, [authorId]: next };
      writeStorage(byUser);
      return { byUser };
    });
  },

  getMomentsForUser: (authorId) => get().byUser[authorId] ?? [],

  hasMoment: (authorId, momentId) =>
    (get().byUser[authorId] ?? []).some((item) => item.id === momentId),
}));
