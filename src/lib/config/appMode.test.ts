import { describe, expect, it, vi } from 'vitest';
import { getAppRuntimeMode, isProductionAppMode } from '@/lib/config/appMode';

describe('appMode', () => {
  it('treats VITE_APP_MODE=production as production', () => {
    vi.stubEnv('VITE_APP_MODE', 'production');
    expect(getAppRuntimeMode()).toBe('production');
    expect(isProductionAppMode()).toBe(true);
    vi.unstubAllEnvs();
  });
});
