import { describe, expect, it } from 'vitest';
import {
  QINGDAO_COUPLE_FOOD_DAYS,
  isQingdaoCoupleFoodCardPlan,
} from '@/lib/home/qingdaoCoupleFoodCards';

describe('qingdaoCoupleFoodCards', () => {
  it('matches Qingdao couple food queries and ignores other trips', () => {
    expect(
      isQingdaoCoupleFoodCardPlan(
        '从济南出发，去青岛玩3天，同行情侣，人均预算约4000元，美食探店',
        '',
      ),
    ).toBe(true);
    expect(
      isQingdaoCoupleFoodCardPlan(
        '从济南出发，去青岛玩3天，同行亲子，人均预算约1500元，自然山水',
        '',
      ),
    ).toBe(false);
    expect(isQingdaoCoupleFoodCardPlan('去杭州玩3天，同行情侣，美食探店', '')).toBe(false);
  });

  it('locks three days, 中山路 lodging, and return buffer', () => {
    expect(QINGDAO_COUPLE_FOOD_DAYS).toHaveLength(3);
    expect(QINGDAO_COUPLE_FOOD_DAYS[0]?.lodging).toContain('中山路/栈桥');
    expect(QINGDAO_COUPLE_FOOD_DAYS[2]?.lodging).toContain('返程回家');
    const blob = QINGDAO_COUPLE_FOOD_DAYS.map((day) =>
      day.blocks.flatMap((block) => [block.body, ...(block.tips ?? [])]).join('\n'),
    ).join('\n');
    expect(blob).toContain('冬春');
    expect(blob).toContain('黄牛');
    expect(blob).toContain('登州路56号');
    expect(blob).toContain('16点');
    expect(blob).toContain('2.5小时');
    expect(blob).toContain('14:00');
  });
});
