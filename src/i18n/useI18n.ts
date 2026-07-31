import { useEffect, useMemo, useState } from 'react';
import { getAppLocale, getMessages } from '@/i18n/index';
import {
  LOCALE_CHANGE_EVENT,
  readLocalePreference,
  writeLocalePreference,
} from '@/i18n/localePreference';
import type { AppLocale } from '@/i18n/messages';

export function useI18n() {
  const [locale, setLocale] = useState<AppLocale>(() => readLocalePreference() ?? getAppLocale());

  useEffect(() => {
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<AppLocale>).detail;
      if (detail === 'zh' || detail === 'en') {
        setLocale(detail);
      }
    };
    window.addEventListener(LOCALE_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(LOCALE_CHANGE_EVENT, onChange);
  }, []);

  const messages = useMemo(() => getMessages(locale), [locale]);

  const setPreferredLocale = (next: AppLocale) => {
    writeLocalePreference(next);
    setLocale(next);
  };

  return { locale, messages, setPreferredLocale };
}
