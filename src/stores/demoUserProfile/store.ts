import { create } from 'zustand';
import type { User } from '@/types/domain/user/user';

export type DemoUserProfilePatch = Partial<Pick<User, 'username' | 'bio' | 'avatar'>>;

type DemoUserProfileState = {
  patch: DemoUserProfilePatch;
  updateProfile: (patch: DemoUserProfilePatch) => void;
  resetProfile: () => void;
};

export const useDemoUserProfileStore = create<DemoUserProfileState>((set) => ({
  patch: {},
  updateProfile: (patch) =>
    set((state) => ({
      patch: { ...state.patch, ...patch },
    })),
  resetProfile: () => set({ patch: {} }),
}));
