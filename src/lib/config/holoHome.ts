import { readEnv } from '@/lib/config/env';

const HOLO_ALIASES = new Set(['holo', 'hologram', '漫游']);

/** 浅米白旧首页：仅 VITE_HOME_LAYOUT=holo 时启用。默认走蜗牛号飞行座舱。 */
export function isHoloHomeEnabled(): boolean {
  const layout = readEnv('VITE_HOME_LAYOUT')?.toLowerCase();
  return Boolean(layout && HOLO_ALIASES.has(layout));
}
