import type { PublishedGuideRecord } from '@/types/domain/guidePublish';

const STORAGE_KEY = 'hello-roamly:published-guides';

type StoredPublishedGuides = {
  items: PublishedGuideRecord[];
};

export function readPublishedGuidesFromStorage(): PublishedGuideRecord[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as Partial<StoredPublishedGuides>;
    return Array.isArray(parsed.items) ? parsed.items : [];
  } catch {
    return [];
  }
}

export function writePublishedGuidesToStorage(items: PublishedGuideRecord[]) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }));
}
