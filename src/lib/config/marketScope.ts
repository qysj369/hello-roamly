import { readEnv } from './env';

/** ISO 3166-1 alpha-2：当前先行市场 */
export const PRIMARY_MARKET_CODE = 'CN';

/**
 * 构建目标市场（默认中国版）。
 * VITE_MARKET=CN | GLOBAL
 */
export function getBuildMarket(): 'CN' | 'GLOBAL' {
  const raw = readEnv('VITE_MARKET')?.toUpperCase();
  if (raw === 'GLOBAL') {
    return 'GLOBAL';
  }
  return 'CN';
}

export function isChinaPrimaryMarket(): boolean {
  return getBuildMarket() === 'CN';
}
