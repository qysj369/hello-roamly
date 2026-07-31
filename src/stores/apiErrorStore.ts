import { create } from 'zustand';

type ApiErrorStoreState = {
  message: string | null;
  show: (message: string) => void;
  dismiss: () => void;
};

export const useApiErrorStore = create<ApiErrorStoreState>((set) => ({
  message: null,
  show: (message) => set({ message: message.trim() || '网络请求失败' }),
  dismiss: () => set({ message: null }),
}));

export function showGlobalApiError(message: string): void {
  useApiErrorStore.getState().show(message);
}
