import { describe, expect, it } from 'vitest';
import { sanitizePlanContentForDisplay } from '@/lib/plan/sanitizePlanContent';

describe('sanitizePlanContentForDisplay', () => {
  it('removes parenthetical lng/lat in Chinese', () => {
    const input =
      '坐标锁定济南历下区核心 (经度117.126628, 纬度36.652330)，放心，我不会把你拐到泉城广场。';
    expect(sanitizePlanContentForDisplay(input)).toBe(
      '路线围绕济南历下区核心，放心，我不会把你拐到泉城广场。',
    );
  });

  it('removes standalone 经度/纬度 pair', () => {
    expect(sanitizePlanContentForDisplay('经度117.12，纬度36.65附近')).toBe('附近');
  });

  it('removes 坐标（lng, lat） pattern', () => {
    expect(sanitizePlanContentForDisplay('一查，坐标（108.94, 34.34），好地方')).toBe(
      '一查，好地方',
    );
  });

  it('preserves cost amounts in tables', () => {
    const input = '| 交通 | ¥20 | 公交 |';
    expect(sanitizePlanContentForDisplay(input)).toBe(input);
  });
});
