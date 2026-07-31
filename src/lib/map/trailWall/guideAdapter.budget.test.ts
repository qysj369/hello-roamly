import { describe, expect, it } from 'vitest';
import { guideToTrailWallItem } from '@/lib/map/trailWall/guideAdapter';
import type { Guide } from '@/types/domain/guide';

function baseGuide(overrides: Partial<Guide> = {}): Guide {
  return {
    id: 'g1',
    title: '济南泉水穷游',
    city: '济南',
    days: '3天',
    budget: '约 ¥900',
    tags: ['硬壳穷游'],
    ...overrides,
  } as Guide;
}

describe('guideToTrailWallItem budget source', () => {
  it('marks structured cost breakdown with list icon source', () => {
    const item = guideToTrailWallItem(
      baseGuide({
        structured: {
          costBreakdown: { total: 1280 },
        } as Guide['structured'],
      }),
    );
    expect(item?.budget).toBe('¥1280');
    expect(item?.budgetSource).toBe('cost_breakdown');
    expect(item?.budgetNote).toContain('花费清单合计');
  });

  it('marks plain list budget as list_label', () => {
    const item = guideToTrailWallItem(baseGuide());
    expect(item?.budget).toBe('约 ¥900');
    expect(item?.budgetSource).toBe('list_label');
    expect(item?.budgetNote).toContain('列表标注');
  });
});
