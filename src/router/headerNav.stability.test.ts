import { describe, expect, it } from 'vitest';
import { bottomNavItems, headerNavItems, paths } from '@/router/paths';

/** 顶栏 / 底栏固定入口 — 变更需同步 smoke-header-routes.mjs */
const EXPECTED_PRIMARY_NAV: { label: string; path: string }[] = [
  { label: '首页', path: paths.home },
  { label: '管家', path: paths.ai },
  { label: '我的', path: paths.profile },
];

describe('header nav contract', () => {
  it('keeps header aligned with bottom nav primary items', () => {
    expect(headerNavItems.map((item) => ({ label: item.label, path: item.to }))).toEqual(
      EXPECTED_PRIMARY_NAV,
    );
    expect(bottomNavItems.map((item) => ({ label: item.label, path: item.to }))).toEqual(
      EXPECTED_PRIMARY_NAV,
    );
    expect(headerNavItems.some((item) => item.to === paths.aiSnail)).toBe(false);
    expect(headerNavItems.some((item) => item.to === paths.discover)).toBe(false);
    expect(headerNavItems.some((item) => item.to === paths.travelBuddies)).toBe(false);
  });
});
