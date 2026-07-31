import type { PlanHistoryEntry } from '@/types/domain/planHistory';

const STORAGE_KEY = 'hello-roamly:plan-history';
const MAX_ENTRIES = 30;

type BrowserStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

function getBrowserStorage(): BrowserStorage | null {
  if (typeof globalThis === 'undefined') {
    return null;
  }
  const storage = (globalThis as { localStorage?: BrowserStorage }).localStorage;
  return storage ?? null;
}

function isValidEntry(value: unknown): value is PlanHistoryEntry {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.sessionId === 'string' &&
    typeof record.trigger === 'string' &&
    typeof record.locationName === 'string' &&
    typeof record.summary === 'string' &&
    typeof record.initialQuery === 'string' &&
    typeof record.lng === 'number' &&
    typeof record.lat === 'number' &&
    Array.isArray(record.conversationTurns) &&
    typeof record.createdAt === 'string' &&
    typeof record.updatedAt === 'string'
  );
}

export function buildPlanHistorySummary(locationName: string, initialQuery: string): string {
  const place = locationName.trim() || '未知地点';
  const query = initialQuery.trim();
  if (!query) {
    return place;
  }
  const shortQuery = query.length > 28 ? `${query.slice(0, 28)}…` : query;
  return `${place} | ${shortQuery}`;
}

/** 从 localStorage 读取规划历史（按更新时间倒序） */
export function readPlanHistoryFromStorage(): PlanHistoryEntry[] {
  const storage = getBrowserStorage();
  if (!storage) {
    return [];
  }
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter(isValidEntry)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch {
    return [];
  }
}

/** 写入 localStorage */
export function writePlanHistoryToStorage(entries: PlanHistoryEntry[]): void {
  const storage = getBrowserStorage();
  if (!storage) {
    return;
  }
  const trimmed = [...entries]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, MAX_ENTRIES);
  storage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

/** 新增或更新一条历史（同 sessionId 覆盖） */
export function upsertPlanHistoryInStorage(entry: PlanHistoryEntry): PlanHistoryEntry[] {
  const existing = readPlanHistoryFromStorage().filter((item) => item.sessionId !== entry.sessionId);
  const next = [entry, ...existing].slice(0, MAX_ENTRIES);
  writePlanHistoryToStorage(next);
  return next;
}

export function clearPlanHistoryInStorage(): void {
  const storage = getBrowserStorage();
  if (!storage) {
    return;
  }
  storage.removeItem(STORAGE_KEY);
}
