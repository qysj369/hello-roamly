import type { BuddyMessage } from '@/types/domain/travelBuddy';

const STORAGE_KEY = 'hello-roamly:buddy-messages';

export function readBuddyMessagesFromStorage(): BuddyMessage[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as BuddyMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeBuddyMessagesToStorage(items: BuddyMessage[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export { STORAGE_KEY as BUDDY_MESSAGES_STORAGE_KEY };
