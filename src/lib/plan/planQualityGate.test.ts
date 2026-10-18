import { describe, expect, it } from 'vitest';
import { applyPlanQualityGate, auditPlanQuality } from '@/lib/plan/planQualityGate';

describe('auditPlanQuality', () => {
  it('flags lodging jump and teleport', () => {
    const raw = [
      '【方案简介】',
      '去杭州。',
      '【行程流水账】',
      '### 第2天',
      '从昨晚住宿片区「西溪湿地北站周边」出发',
      '### 第3天',
      '从昨晚住宿片区「鳌山卫镇中心」出发',
      '地铁：3号线青岛站→汇泉广场站',
      '【蜗牛提示】',
      '带好水。',
      '【避坑指南】',
      '别买黄牛票。',
    ].join('\n');
    const issues = auditPlanQuality(raw, '杭州');
    expect(issues.some((i) => i.code === 'lodging_jump')).toBe(true);
    expect(issues.some((i) => i.code === 'teleport')).toBe(true);
  });

  it('flags fake long-haul triad', () => {
    const raw = [
      '【行程流水账】',
      'B. 大交通（杭州东站 → 杭州城站，城际短驳）',
      '说明：同属杭州市域',
      '【蜗牛提示】',
      'ok',
      '【避坑指南】',
      'ok',
    ].join('\n');
    const issues = auditPlanQuality(raw, '杭州');
    expect(issues.some((i) => i.code === 'fake_long_haul')).toBe(true);
  });
});

describe('applyPlanQualityGate', () => {
  it('repairs sticky headers and appends note for residual hard issues', () => {
    const raw = [
      '【方案简介】',
      '杭州三天。',
      '【行程流水账】',
      '今晚住宿片区：西溪湿地北站周边',
      '玩法 # ### 第2天',
      '从昨晚住宿片区「西溪湿地北站周边」出发。',
      'A. 住宿 → 杭州东站',
      '地铁去东站。',
      'B. 大交通（杭州东站 → 杭州城站，城际短驳）',
      '> 说明：同属杭州市域。',
      '杭州东站 → 杭州城站。',
      'C. 抵达·杭州城站 → 少年宫',
      '地铁去少年宫。',
      'D. 玩法',
      '喂鸽子。',
      '【蜗牛提示】',
      '带好水。',
      '【避坑指南】',
      '别买黄牛票。',
    ].join('\n');
    const { content, issues } = applyPlanQualityGate(raw, '杭州');
    expect(content).toMatch(/\n### 第2天/);
    expect(content).not.toMatch(/玩法 # ### 第2天/);
    expect(content).not.toMatch(/B\.\s*大交通/);
    // 校正后伪大交通应被 scrub；标题粘连应被拆开
    expect(issues.some((i) => i.code === 'fake_long_haul')).toBe(false);
    expect(content).toContain('同城直达');
  });

  it('flags intro promising Liangzhu while body writes zoo twice', () => {
    const raw = [
      '【方案简介】',
      '第1天直奔西溪湿地一带，第2天转战良渚古城遗址公园+良渚博物院，第3天良渚文化村轻体验后返程。',
      '【行程流水账】',
      '### 第1天：西溪湿地慢行',
      '今晚住宿片区：西溪湿地北站周边',
      '继续走到「蒋村 # ### 第2天 · 亲子',
      '从昨晚住宿片区「西溪湿地北站周边」出发',
      '杭州动物园看熊猫，再去杭州少年儿童公园玩海盗船。',
      '杭州动物园推车友好。少年儿童公园套票划算。',
      '今晚住宿片区：西溪湿地北站周边',
      '### 第3天',
      '从昨晚住宿片区「西溪湿地北站周边」出发',
      '再去杭州动物园和杭州少年儿童公园，然后返程。',
      '【蜗牛提示】',
      '良渚古城记得预约。',
      '【避坑指南】',
      '良渚观光车别乱买。',
    ].join('\n');
    const { content, issues } = applyPlanQualityGate(raw, '杭州');
    expect(content).not.toMatch(/蒋村 # ###/);
    expect(content).toMatch(/\n### 第2天/);
    expect(issues.some((i) => i.code === 'intro_mismatch')).toBe(true);
    expect(issues.some((i) => i.code === 'day_repeat')).toBe(true);
    expect(content).toContain('【蜗牛质检】');
    expect(content).toContain('简介日程与正文不一致');
    // 质检文案不得再含章节标记，避免二次拆坏
    expect(content).not.toMatch(/质检提醒[\s\S]{0,80}【行程流水账】/);
  });

  it('is idempotent and does not duplicate quality notes', () => {
    const raw = [
      '【方案简介】',
      '第1天西溪湿地，第2天良渚博物院。',
      '【行程流水账】',
      '# ### 第1天 西溪湿地',
      '今晚住宿片区：西溪湿地北站周边',
      '门票 # ### 第2天',
      '从昨晚住宿片区「西溪湿地北站周边」出发',
      '杭州动物园看熊猫。杭州动物园再逛一圈。',
      '【蜗牛提示】',
      'ok',
      '【避坑指南】',
      'ok',
    ].join('\n');
    const once = applyPlanQualityGate(raw, '杭州').content;
    const twice = applyPlanQualityGate(once, '杭州').content;
    expect(once).toMatch(/\n### 第1天/);
    expect(once).toMatch(/\n### 第2天/);
    expect(once).not.toMatch(/# ### 第/);
    expect(twice.match(/【蜗牛质检】/g)?.length ?? 0).toBe(1);
    expect(twice).not.toMatch(/请以\s*【行程流水账】/);
  });

  it('treats 湿地博物馆 as satisfying 自然博物馆 and ignores street false positives', () => {
    const raw = [
      '【方案简介】',
      '第1天西溪湿地，第2—3天自然博物馆+西湖游船。',
      '【行程流水账】',
      '### 第1天',
      '西溪湿地慢行，河渚街，西溪慢生活街。',
      '今晚住宿片区：西溪湿地北站周边',
      '### 第2天',
      '从昨晚住宿片区「西溪湿地北站周边」出发',
      '中国湿地博物馆科普，下午西湖游船。',
      '### 第3天',
      '从昨晚住宿片区「西溪湿地北站周边」出发',
      '西溪天堂轻走后返程。东站西广场上车。',
      '【蜗牛提示】',
      'ok',
      '【避坑指南】',
      'ok',
    ].join('\n');
    const issues = auditPlanQuality(raw, '杭州');
    expect(issues.some((i) => i.code === 'intro_mismatch')).toBe(false);
    expect(issues.some((i) => i.code === 'day_repeat')).toBe(false);
  });

  it('does not treat origin district 历下 as missing destination', () => {
    const raw = [
      '【方案简介】',
      '济南出发去杭州三天，住西溪。',
      '【行程流水账】',
      '### 第1天',
      '高铁到杭州东站，住西溪湿地北站周边。',
      '【蜗牛提示】',
      'ok',
      '【避坑指南】',
      'ok',
    ].join('\n');
    const issues = auditPlanQuality(raw, '济南市历下区中林路');
    expect(issues.some((i) => i.code === 'weak_destination')).toBe(false);
  });

  it('scrubs prompt-leak theme 禁止把慢游', () => {
    const raw = [
      '【方案简介】',
      '主打禁止把慢游 + 亲子撒欢。',
      '【行程流水账】',
      '### 第1天 杭州西溪',
      '玩深度慢游。',
      '【蜗牛提示】',
      'ok',
      '【避坑指南】',
      'ok',
    ].join('\n');
    const { content } = applyPlanQualityGate(raw, '杭州');
    expect(content).not.toContain('禁止把慢游');
    expect(content).toContain('深度慢游');
  });

  it('flags style-as-place and lodging at origin home', () => {
    const raw = [
      '【方案简介】',
      '去杭州亲子。',
      '【行程流水账】',
      '### 第1天 · 亲子出行近郊慢行（济南→近郊慢行目的地）',
      '高铁直达近郊慢行目的地。',
      '今晚住宿片区：济南历下区绿城百合花园周边',
      '### 第2天',
      '从昨晚住宿片区「济南历下区绿城百合花园周边」出发',
      '【蜗牛提示】',
      'ok',
      '【避坑指南】',
      'ok',
    ].join('\n');
    const { content, issues } = applyPlanQualityGate(raw, '杭州', {
      originName: '济南市历下区中林路绿城百合花园',
    });
    expect(issues.map((i) => i.code)).toContain('style_as_place');
    expect(issues.map((i) => i.code)).toContain('lodging_at_origin');
    expect(content).toContain('严重偏差');
    expect(content).not.toContain('近郊慢行目的地');
  });
});
