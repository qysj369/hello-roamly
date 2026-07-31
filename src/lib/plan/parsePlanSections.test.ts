import { describe, expect, it } from 'vitest';
import { parsePlanSections } from '@/lib/plan/parsePlanSections';

describe('parsePlanSections', () => {
  it('parses new four-block format', () => {
    const content = `【方案简介】\n\n简介正文。\n\n【行程流水账】\n\nDay1 玩。\n\n【蜗牛提示】\n\n推荐 A。\n\n【避坑指南】\n\n避坑 B。`;
    const parsed = parsePlanSections(content);
    expect(parsed.intro).toContain('简介');
    expect(parsed.itinerary).toContain('Day1');
    expect(parsed.snailTips).toContain('推荐');
    expect(parsed.pitfalls).toContain('避坑');
    expect(parsed.isLegacy).toBe(false);
  });

  it('parses legacy format into four parts', () => {
    const content = `【花费清单】\n\n总计 100。\n\n【行程流水账】\n\n上午玩。\n\n【蜗牛启示】\n\n**最后悔的事 / 避坑指南**：别买礼盒。\n\n**最推荐的事 / 宝藏发现**：广化寺好吃。`;
    const parsed = parsePlanSections(content);
    expect(parsed.intro).toContain('总计');
    expect(parsed.pitfalls).toContain('礼盒');
    expect(parsed.snailTips).toContain('广化寺');
    expect(parsed.isLegacy).toBe(true);
  });
});
