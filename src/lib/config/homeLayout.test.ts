import { describe, expect, it, vi } from 'vitest';
import { getHomeLayoutMode, isLaunchHomeLayout } from '@/lib/config/homeLayout';

describe('homeLayout', () => {
  it('uses launch when VITE_HOME_LAYOUT=launch', () => {
    vi.stubEnv('VITE_HOME_LAYOUT', 'launch');
    expect(getHomeLayoutMode()).toBe('launch');
    expect(isLaunchHomeLayout()).toBe(true);
  });

  it('uses plan-a when VITE_HOME_LAYOUT=plan-a', () => {
    vi.stubEnv('VITE_HOME_LAYOUT', 'plan-a');
    expect(getHomeLayoutMode()).toBe('plan-a');
    expect(isLaunchHomeLayout()).toBe(false);
  });
});
