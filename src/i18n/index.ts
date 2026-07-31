import { readEnv } from '@/lib/config/env';
import {
  enMessages,
  messagesByLocale,
  zhMessages,
  type AppLocale,
  type HoloHomeMessages,
} from '@/i18n/messages';

export type { AppLocale, HoloHomeMessages };
export { zhMessages, enMessages, messagesByLocale };

/** 国内默认 zh；国际站打包 VITE_MARKET=GLOBAL 或 VITE_LOCALE=en */
export function getAppLocale(): AppLocale {
  const locale = readEnv('VITE_LOCALE')?.toLowerCase();
  if (locale === 'en') {
    return 'en';
  }
  if (locale === 'zh') {
    return 'zh';
  }
  const market = readEnv('VITE_MARKET')?.toUpperCase();
  return market === 'GLOBAL' ? 'en' : 'zh';
}

export function getMessages(locale: AppLocale = getAppLocale()): HoloHomeMessages {
  return messagesByLocale[locale];
}

/** 国际站街景 API 预留位（国内百度 / 海外全球街景） */
export function getStreetViewProvider(): 'baidu' | 'global' {
  return getAppLocale() === 'en' ? 'global' : 'baidu';
}
