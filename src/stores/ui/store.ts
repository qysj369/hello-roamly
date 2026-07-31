import { create } from 'zustand';

type UiState = {
  /** 首页 / 攻略页共享的搜索关键词 */
  searchQuery: string;
  /** 关于页 DevPlayground 演示用计数 */
  tapCount: number;
  setSearchQuery: (query: string) => void;
  incrementTap: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  searchQuery: '',
  tapCount: 0,
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  incrementTap: () => set((state) => ({ tapCount: state.tapCount + 1 })),
}));
