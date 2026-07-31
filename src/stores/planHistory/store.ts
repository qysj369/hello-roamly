import { create } from 'zustand';
import {
  clearPlanHistoryInStorage,
  readPlanHistoryFromStorage,
  upsertPlanHistoryInStorage,
  writePlanHistoryToStorage,
} from '@/lib/plan/planHistoryStorage';
import type { PlanHistoryEntry } from '@/types/domain/planHistory';

type PlanHistoryState = {
  entries: PlanHistoryEntry[];
  hydrated: boolean;
  hydrate: () => void;
  upsert: (entry: PlanHistoryEntry) => void;
  clear: () => void;
};

export const usePlanHistoryStore = create<PlanHistoryState>((set) => ({
  entries: [],
  hydrated: false,
  hydrate: () => {
    const entries = readPlanHistoryFromStorage();
    set({ entries, hydrated: true });
  },
  upsert: (entry) => {
    const entries = upsertPlanHistoryInStorage(entry);
    set({ entries, hydrated: true });
  },
  clear: () => {
    clearPlanHistoryInStorage();
    set({ entries: [], hydrated: true });
  },
}));

/** 供非 React 模块同步历史列表 */
export function replacePlanHistoryEntries(entries: PlanHistoryEntry[]): void {
  writePlanHistoryToStorage(entries);
  usePlanHistoryStore.setState({ entries: readPlanHistoryFromStorage(), hydrated: true });
}
