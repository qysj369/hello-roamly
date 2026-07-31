import type { AppLocale } from '@/i18n/messages';

const STORAGE_KEY = 'hello-roamly-locale';
export const LOCALE_CHANGE_EVENT = 'hello-roamly:locale-change';

export function readLocalePreference(): AppLocale | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)?.toLowerCase();
    if (raw === 'zh' || raw === 'en') {
      return raw;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function writeLocalePreference(locale: AppLocale): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(LOCALE_CHANGE_EVENT, { detail: locale }));
}
