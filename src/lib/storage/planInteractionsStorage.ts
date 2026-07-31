const STORAGE_KEY = 'hello-roamly:plan-interactions';

export type StoredPlanInteractions = {
  liked: string[];
  favorited: string[];
};

export function readPlanInteractionsStorage(): StoredPlanInteractions {
  if (typeof window === 'undefined') {
    return { liked: [], favorited: [] };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { liked: [], favorited: [] };
    }
    const parsed = JSON.parse(raw) as Partial<StoredPlanInteractions>;
    return {
      liked: Array.isArray(parsed.liked) ? parsed.liked : [],
      favorited: Array.isArray(parsed.favorited) ? parsed.favorited : [],
    };
  } catch {
    return { liked: [], favorited: [] };
  }
}

export function writePlanInteractionsStorage(liked: string[], favorited: string[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ liked, favorited }));
}
