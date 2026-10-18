import { describe, expect, it } from 'vitest';
import {
  localizePlanBudgetDisplay,
  localizePlanBudgetTip,
} from '@/lib/home/localizePlanBudgetTip';

describe('localizePlanBudgetTip', () => {
  it('uses Hangzhou local ranges for a 3-day trip', () => {
    expect(localizePlanBudgetTip('杭州', 3, '往返大交通')).toBe(
      '根据你的出发地核算高铁/机票往返费用，提前购票可享折扣',
    );
    expect(localizePlanBudgetDisplay('杭州', 3, '往返大交通')).toEqual({
      amount: '按出发地核算',
      detail: '根据你的出发地核算高铁/机票往返费用，提前购票可享折扣',
    });
    expect(localizePlanBudgetDisplay('杭州', 3, '市内交通')).toEqual({
      amount: '3天人均80‑120元',
      detail: '杭州地铁公交为主，西湖沿线优先步行或骑行，远一点再打车',
    });
    expect(localizePlanBudgetDisplay('杭州', 3, '餐饮')?.amount).toBe('3天人均450‑550元');
    expect(localizePlanBudgetDisplay('杭州', 3, '门票')?.detail).toContain('西湖大多免费');
    expect(localizePlanBudgetDisplay('杭州', 3, '住宿')?.amount).toBe('2晚人均330‑470元');
    expect(localizePlanBudgetDisplay('杭州', 3, '住宿')?.detail).toContain('双人分摊');
    expect(localizePlanBudgetDisplay('上海', 4, '住宿', '单人')?.amount).toBe('3晚人均600‑900元');
    expect(localizePlanBudgetDisplay('上海', 4, '住宿', '单人')?.detail).toContain('按单人整间计');
    expect(localizePlanBudgetDisplay('上海', 4, '住宿', '单人')?.detail).not.toContain('双人分摊');
  });

  it('does not reuse Hangzhou copy for Beijing', () => {
    const tip = localizePlanBudgetTip('北京', 3, '市内交通');
    expect(tip).toContain('北京');
    expect(tip).not.toContain('杭州地铁');
    expect(localizePlanBudgetTip('北京', 3, '餐饮')).toContain('炸酱面');
    expect(localizePlanBudgetDisplay('苏州', 3, '餐饮')?.detail).toContain('苏式面');
    expect(localizePlanBudgetDisplay('苏州', 3, '市内交通')?.detail).toContain('苏州');
  });

  it('localizes reserve and total instead of leftover template rows', () => {
    expect(localizePlanBudgetDisplay('杭州', 3, '机动备用金')?.detail).toContain('预留');
    expect(localizePlanBudgetDisplay('杭州', 3, '合计')?.amount).toContain('约');
    expect(localizePlanBudgetDisplay('杭州', 3, '合计')?.detail).toContain('不含往返');
    expect(localizePlanBudgetDisplay('上海', 3, '合计', '好友结伴')?.amount).toBe('约1210‑1800元');
    const familyTotal = localizePlanBudgetDisplay('上海', 3, '合计', '亲子')?.amount;
    const familyTicket = localizePlanBudgetDisplay('上海', 3, '门票', '亲子');
    const coupleTotal = localizePlanBudgetDisplay('上海', 3, '合计', '情侣')?.amount;
    expect(familyTotal).not.toBe('约1210‑1800元');
    expect(familyTotal).toMatch(/^约1\d{3}‑/);
    expect(familyTicket?.detail).toContain('科技馆');
    expect(localizePlanBudgetDisplay('上海', 3, '门票', '好友结伴')?.amount).toBe('3天人均120‑220元');
    expect(familyTicket?.amount).not.toBe('3天人均120‑220元');
    expect(coupleTotal).not.toBe('约1210‑1800元');
    expect(Number(familyTotal?.match(/约(\d+)/)?.[1] ?? 0)).toBeGreaterThan(1210);
  });
});
