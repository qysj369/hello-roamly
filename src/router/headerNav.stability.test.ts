import { describe, expect, it } from 'vitest';
import { bottomNavItems, headerNavItems, paths } from '@/router/paths';

/** 顶栏 / 底栏固定入口 — 变更需同步 smoke-header-routes.mjs */
const EXPECTED_PRIMARY_NAV: { label: string; path: string }[] = [
  { label: '首页', path: paths.home },
  { label: '发现', path: paths.discover },
  { label: '查看攻略', path: paths.guides },
  { label: '旅游搭子', path: paths.travelBuddies },
  { label: '消息', path: paths.messages },
  { label: '蜗居', path: paths.profile },
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
  });
});
