import { describe, expect, it } from 'vitest';
import {
  planDisplayHasCodeMarkup,
  scrubPlanDisplayMarkup,
} from '@/lib/home/scrubPlanDisplayMarkup';

describe('scrubPlanDisplayMarkup', () => {
  it('strips heading hashes, bold, and leftover stars', () => {
    const raw = [
      '【方案简介】',
      '### 开篇 **青岛** 红瓦',
      '***未闭合加粗',
      '## 小标题',
      '# 残标',
      '【行程流水账】',
      '#### 第1天 栈桥',
      '- 中山路壹号吃鲅鱼水饺',
      '-',
      '---',
      '车程约1.5-2小时',
    ].join('\n');
    const out = scrubPlanDisplayMarkup(raw);
    expect(out).toContain('【方案简介】');
    expect(out).toContain('开篇 青岛 红瓦');
    expect(out).toContain('第1天 栈桥');
    expect(out).toContain('- 中山路壹号吃鲅鱼水饺');
    expect(out).toContain('1.5-2小时');
    expect(out).toContain('未闭合加粗');
    expect(planDisplayHasCodeMarkup(out)).toBe(false);
  });

  it('drops 落地最佳 lines, transit emojis, and stray 周边）', () => {
    const raw = [
      '从昨晚住宿片区「中山路/栈桥地铁站周边）」出发',
      '🚇 地铁+公交：中山路站换乘',
      '🐌落地最佳：如果娃还小直接打车',
      '下午去太平角散步',
    ].join('\n');
    const out = scrubPlanDisplayMarkup(raw);
    expect(out).toContain('中山路/栈桥地铁站周边');
    expect(out).not.toContain('周边）');
    expect(out).toContain('地铁+公交：中山路站换乘');
    expect(out).not.toContain('落地最佳');
    expect(out).not.toContain('🚇');
    expect(out).toContain('下午去太平角散步');
  });

  it('rewrites unofficial R3/R2 metro names to 3号线/2号线', () => {
    const out = scrubPlanDisplayMarkup('济南地铁R3号线花园东路站换乘R2线到腊山。');
    expect(out).toContain('地铁3号线');
    expect(out).toContain('2号线');
    expect(out).not.toMatch(/R\s*3|R\s*2/);
  });

  it('drops leaked quality-gate 严重偏差 callouts', () => {
    const raw = [
      '【方案简介】',
      '> 🐌 严重偏差：主住宿写成了出发地小区，未在目的地城市选基址。本方案参考价值低，请重新生成。',
      '青岛红瓦绿树，连住中山路。',
    ].join('\n');
    const out = scrubPlanDisplayMarkup(raw);
    expect(out).toContain('青岛红瓦绿树');
    expect(out).not.toContain('严重偏差');
  });

  it('strips assembler 【蜗牛提示】【避坑指南】 blocks', () => {
    const raw = [
      '【方案简介】',
      '青岛红瓦。',
      '【行程流水账】',
      '第1天 栈桥。',
      '【蜗牛提示】',
      '见行程正文，贴士已写入各天。',
      '【避坑指南】',
      '见行程正文，避坑已写在对应日。',
    ].join('\n');
    const out = scrubPlanDisplayMarkup(raw);
    expect(out).toContain('第1天 栈桥');
    expect(out).not.toContain('【蜗牛提示】');
    expect(out).not.toContain('【避坑指南】');
    expect(out).not.toContain('见行程正文');
  });

  it('drops bold 质检提醒 glued to a budget table row', () => {
    const raw = [
      '| 总计 | 2200元 | 控制在2500元预算内 | > 🐌 **质检提醒**：简介日程与正文不一致（简介承诺未写入正文：灵隐寺）。请优先看下方行程正文，或重新生成。',
      '【行程流水账】',
      '第1天 九溪。',
    ].join('\n');
    const out = scrubPlanDisplayMarkup(raw);
    expect(out).toContain('| 总计 | 2200元 | 控制在2500元预算内');
    expect(out).toContain('第1天 九溪');
    expect(out).not.toContain('质检提醒');
    expect(out).not.toContain('灵隐寺');
    expect(out).not.toContain('重新生成');
  });

  it('drops 质检提醒 callouts', () => {
    const raw = [
      '【方案简介】',
      '青岛红瓦。',
      '> 🐌 质检提醒：简介日程与正文不一致（正文主写简介未承诺：游船）。请优先看下方行程正文，或重新生成。',
      '【行程流水账】',
      '第1天 栈桥。',
    ].join('\n');
    const out = scrubPlanDisplayMarkup(raw);
    expect(out).toContain('第1天 栈桥');
    expect(out).not.toContain('质检提醒');
    expect(out).not.toContain('未承诺');
  });

  it('drops trailing 【蜗牛质检】 notes', () => {
    const raw = [
      '今晚住宿片区：中山路',
      '【蜗牛质检】本方案已自动校正',
      '- 主住宿写成了出发地小区',
    ].join('\n');
    const out = scrubPlanDisplayMarkup(raw);
    expect(out).toContain('今晚住宿片区：中山路');
    expect(out).not.toContain('蜗牛质检');
    expect(out).not.toContain('出发地小区');
  });

  it('keeps budget table separators and still removes stars in cells', () => {
    const raw = [
      '| 项目 | 金额 |',
      '| --- | --- |',
      '| **总计** | **1100** |',
    ].join('\n');
    const out = scrubPlanDisplayMarkup(raw);
    expect(out).toContain('| 项目 | 金额 |');
    expect(out).toContain('| --- | --- |');
    expect(out).toContain('| 总计 | 1100 |');
    expect(planDisplayHasCodeMarkup(out)).toBe(false);
  });
});
