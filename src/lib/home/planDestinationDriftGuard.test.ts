import { describe, expect, it } from 'vitest';
import {
  appendClarifyDriftNote,
  clipClarifyPlanToLockedDays,
  detectClarifyPlanDrift,
  finalizeClarifyLockedPlan,
  hasClarifyStreamOverflow,
  polishClarifyPlanForDisplay,
  isCriticalClarifyDrift,
  scrubClarifyPlanDrift,
} from '@/lib/home/planDestinationDriftGuard';
import { applyPlanQualityGate } from '@/lib/plan/planQualityGate';
import { isMapPlanDeliverable } from '@/lib/plan/mapPlanCompleteness';

const HANGZHOU_LOCK = {
  city: '杭州',
  days: 3,
  party: '亲子',
  budgetYuan: 2500,
  preference: '近郊轻游',
} as const;

describe('detectClarifyPlanDrift', () => {
  it('flags fake city 约偏 and 3天3城', () => {
    const raw =
      '## 3天3城\n第2天 · 约偏\n大交通：高铁直达近郊轻游站，抵达约偏后入住。';
    const issues = detectClarifyPlanDrift(raw, HANGZHOU_LOCK);
    expect(issues.some((i) => i.code === 'fake_pref_city')).toBe(true);
    expect(issues.some((i) => i.code === 'multi_city_title')).toBe(true);
    expect(isCriticalClarifyDrift(issues)).toBe(true);
  });

  it('passes clean Hangzhou-only content', () => {
    const raw = '第1天 · 西湖慢行\n第2天 · 灵隐近郊\n全部住宿在杭州。';
    expect(detectClarifyPlanDrift(raw, HANGZHOU_LOCK)).toEqual([]);
  });

  it('flags prompt leak, 9天行程 and Wuzhen transfer', () => {
    const raw =
      '9天行程，把“禁止另造城市”“预算小表”这9个站点挨个玩透。\n第3天 · 转场：杭州 → 乌镇';
    const issues = detectClarifyPlanDrift(raw, HANGZHOU_LOCK);
    expect(issues.some((i) => i.code === 'prompt_leak')).toBe(true);
    expect(issues.some((i) => i.code === 'day_count_mismatch')).toBe(true);
    expect(issues.some((i) => i.code === 'extra_city')).toBe(true);
    expect(isCriticalClarifyDrift(issues)).toBe(true);
  });

  it('flags 50天50站 and 锁定/一共 day titles', () => {
    const raw =
      '嘿，你这趟“50天50站”的玩法。\n第2天 · 锁定（济南→杭州）\n第3天 · 一共（其实是杭州）\n第4天 · 西湖';
    const issues = detectClarifyPlanDrift(raw, HANGZHOU_LOCK);
    expect(issues.some((i) => i.code === 'prompt_leak')).toBe(true);
    expect(issues.some((i) => i.code === 'day_count_mismatch')).toBe(true);
    expect(hasClarifyStreamOverflow(raw, HANGZHOU_LOCK)).toBe(true);
  });

  it('does not treat intro mentioning day 2 / Shaoxing as stream overflow', () => {
    const introOnly =
      '【方案简介】第2天可以去绍兴偏门，蜗牛提醒：核心景点大多免费 按心情调节节奏即可';
    expect(hasClarifyStreamOverflow(introOnly, HANGZHOU_LOCK)).toBe(false);
    expect(
      hasClarifyStreamOverflow(
        '第2天 · 转场：杭州 → 绍兴\n探店站即绍兴北站。',
        {
          city: '杭州',
          days: 3,
          party: '单人',
          budgetYuan: 2500,
          preference: '美食探店',
        },
      ),
    ).toBe(false);
  });
});

describe('scrubClarifyPlanDrift', () => {
  it('replaces 约偏 with locked city', () => {
    const raw = '第2天 · 约偏\n高铁直达近郊轻游站，抵达约偏。';
    const out = scrubClarifyPlanDrift(raw, HANGZHOU_LOCK);
    expect(out).not.toContain('约偏');
    expect(out).toContain('杭州');
    expect(detectClarifyPlanDrift(out, HANGZHOU_LOCK)).toEqual([]);
  });

  it('rewrites split preference fake cities like 杭州、约偏、轻游三地', () => {
    const raw =
      '3天串起杭州、约偏、轻游三地，第2天一早高铁去约偏（绍兴柯桥方向）。';
    const out = scrubClarifyPlanDrift(raw, HANGZHOU_LOCK);
    expect(out).not.toContain('约偏');
    expect(out).toContain('杭州');
  });

  it('rewrites 3天3城 title', () => {
    const raw = '## 3天3城\n正文在杭州。';
    const out = scrubClarifyPlanDrift(raw, HANGZHOU_LOCK);
    expect(out).toContain('3天杭州漫行');
    expect(out).not.toMatch(/3\s*天\s*3\s*城/);
  });

  it('rewrites leaked 9天行程', () => {
    const out = scrubClarifyPlanDrift('9天行程，从济南出发去杭州。', HANGZHOU_LOCK);
    expect(out).toContain('3天行程');
    expect(out).not.toContain('9天行程');
  });
});

describe('appendClarifyDriftNote', () => {
  it('appends drift note once', () => {
    const issues = detectClarifyPlanDrift('抵达约偏', HANGZHOU_LOCK);
    const once = appendClarifyDriftNote('正文', issues);
    const twice = appendClarifyDriftNote(once, issues);
    expect(once).toContain('漂移校正');
    expect(twice).toBe(once);
  });
});

describe('finalizeClarifyLockedPlan', () => {
  it('rewrites intro and stubs Shaoxing / 探店 days', () => {
    const raw = [
      '【方案简介】',
      '第2天坐高铁去“杭州”——我猜您说的是绍兴的偏门老街。',
      '【行程流水账】',
      '第1天（杭州·美食主战场）西湖断桥，河坊街吃生煎。',
      '第2天 · 转场：杭州 → 杭州 去绍兴东站，上虞杭州古镇。',
      '第3天 · 探店日 大交通（杭州 → 探店）探店站即绍兴北站。',
    ].join('\n');
    const lock = {
      city: '杭州',
      days: 3,
      party: '单人',
      budgetYuan: 2500,
      preference: '美食探店',
    } as const;
    const out = finalizeClarifyLockedPlan(raw, lock);
    expect(out).toContain('3天都在杭州');
    expect(out).toContain('人均预算约2500元');
    expect(out).toContain('第1天（杭州·美食主战场）');
    expect(out).not.toContain('我猜您说的是绍兴');
    expect(out).not.toContain('绍兴东站');
    expect(out).not.toContain('探店站');
    expect(out).toContain('第2天 · 杭州（美食探店）');
    expect(out).toContain('第3天 · 杭州（美食探店）');
    expect(out).not.toContain('【蜗牛提示】');
    expect(out).not.toContain('【避坑指南】');
    expect(out).not.toContain('见行程正文');
    expect(isMapPlanDeliverable(out)).toBe(true);
  });

  it('pads a truncated intro into a complete four-section plan', () => {
    const raw =
      '【方案简介】第2天坐高铁去“杭州”——我猜您说的是绍兴的偏门老街。蜗牛提醒：核心景点大多免费';
    const lock = {
      city: '杭州',
      days: 3,
      party: '单人',
      budgetYuan: 2500,
      preference: '美食探店',
    } as const;
    const out = finalizeClarifyLockedPlan(raw, lock);
    expect(out).toContain('3天都在杭州');
    expect(out).toContain('【行程流水账】');
    expect(out).toContain('第1天');
    expect(out).toContain('第2天');
    expect(out).toContain('第3天');
    expect(out).not.toContain('我猜您说的是绍兴');
    expect(isMapPlanDeliverable(out)).toBe(true);
    expect(out).not.toContain('【蜗牛提示】');
    expect(out).not.toContain('【避坑指南】');
  });

  it('names itinerary highlights in intro and unifies lodging so quality notes stay off', () => {
    const raw = [
      '【方案简介】',
      '3天都在杭州。同行单人，人均预算约2500元，自然山水。晚上住杭州同一片区，不换城。',
      '【行程流水账】',
      '第1天（济南→杭州·西湖群山初探）首晚住宿选在「青芝坞·浙江大学玉泉校区周边」。下午灵隐寺、西湖，傍晚九溪烟树。灵隐寺另购香花券。再看一眼西湖。九溪慢慢走。',
      '第2天 从昨晚住宿片区「西溪湿地北站周边」出发，今天主战场是西湖群山与九溪烟树。九溪烟树徒步后回西湖边坐一会儿。今晚住宿片区：西溪湿地北站周边',
      '第3天 从昨晚住宿片区「西溪湿地北站周边」出发。上午九溪，傍晚从杭州东站返程回济南。今晚住宿片区：返程回家，无需住宿',
      '【蜗牛提示】',
      '到杭州先按心情走，不必一天打卡所有店。核心景点大多免费或低价。',
      '【避坑指南】',
      '别跟着车站礼盒走。景区门口拉客先问清人均。旺季住宿早点订。',
    ].join('\n');
    const lock = {
      city: '杭州',
      days: 3,
      party: '单人',
      budgetYuan: 2500,
      preference: '自然山水',
    } as const;
    const out = finalizeClarifyLockedPlan(raw, lock);
    expect(out).toContain('3天都在杭州');
    expect(out).toMatch(/行程会走到.*西湖/);
    expect(out).toMatch(/灵隐|九溪/);
    expect(out).not.toMatch(/从昨晚住宿片区「西溪湿地北站周边」/);
    expect(out).toContain('先市内衔接');
    expect(out).toContain('今晚住宿片区：返程回家');
    const gated = applyPlanQualityGate(out, '杭州', {
      originName: '济南市历下区中林路绿城百合花园',
    });
    expect(gated.content).not.toContain('简介日程与正文不一致');
    expect(gated.issues.some((issue) => issue.code === 'intro_mismatch')).toBe(false);
    expect(gated.issues.some((issue) => issue.code === 'teleport')).toBe(false);
  });

  it('strips a plain 质检提醒 line and still names 西湖/九溪', () => {
    const raw = [
      '【方案简介】',
      '3天都在杭州。同行单人，人均预算约2500元，近郊轻游。晚上住杭州同一片区，不换城。',
      '',
      '🐌 质检提醒：简介日程与正文不一致（正文主写简介未承诺：西湖、九溪）。请优先看下方行程正文，或重新生成。',
      '【行程流水账】',
      '第1天 西湖东南线。今晚住宿片区：西湖文化广场站周边（地铁1号线交汇，去西湖方便）。再走白堤看西湖。',
      '第2天 从昨晚住宿片区「西湖文化广场站周边」出发。下午九溪烟树，沿溪走到九溪。从九溪回西湖文化广场。',
      '第3天 从昨晚住宿片区「西湖文化广场站周边」出发。上午西湖东线。',
      '【蜗牛提示】',
      '到杭州先按心情走，不必一天打卡所有店。核心景点大多免费或低价。',
      '【避坑指南】',
      '别跟着车站礼盒走。景区门口拉客先问清人均。旺季住宿早点订。',
    ].join('\n');
    const out = finalizeClarifyLockedPlan(raw, {
      city: '杭州',
      days: 3,
      party: '单人',
      budgetYuan: 2500,
      preference: '近郊轻游',
    });
    expect(out).not.toContain('简介日程与正文不一致');
    expect(out).toContain('行程会走到');
    expect(out).toContain('西湖');
    expect(out).toContain('九溪');
    expect(out).toContain('从昨晚住宿片区「西湖文化广场站」出发，先市内衔接');
  });

  it('adds 西湖/九溪 to a lock-only intro even after the quality gate stamps a warning', () => {
    const raw = [
      '【方案简介】',
      '3天都在杭州。同行单人，人均预算约2500元，近郊轻游。晚上住杭州同一片区，不换城。',
      '【行程流水账】',
      '第1天 西湖东南线轻游。今晚住宿片区：西湖文化广场站周边。从西湖文化广场沿武林路到断桥，再走白堤看西湖。',
      '第2天 从昨晚住宿片区「西湖文化广场站周边」出发。下午·九溪烟树。沿溪走到九溪烟树瀑布。从九溪回西湖文化广场。',
      '第3天 从昨晚住宿片区「西湖文化广场站周边」出发。上午西湖东线，白堤到孤山。',
      '【蜗牛提示】',
      '到杭州先按心情走，不必一天打卡所有店。核心景点大多免费或低价。',
      '【避坑指南】',
      '别跟着车站礼盒走。景区门口拉客先问清人均。旺季住宿早点订。',
    ].join('\n');
    const lock = {
      city: '杭州',
      days: 3,
      party: '单人',
      budgetYuan: 2500,
      preference: '近郊轻游',
    } as const;
    const finalized = finalizeClarifyLockedPlan(raw, lock);
    expect(finalized).toContain('行程会走到');
    expect(finalized).toContain('西湖');
    expect(finalized).toContain('九溪');
    const gated = applyPlanQualityGate(finalized, '杭州', {
      originName: '济南市历下区中林路绿城百合花园',
    });
    const polished = polishClarifyPlanForDisplay(gated.content);
    expect(polished).toContain('西湖');
    expect(polished).toContain('九溪');
    expect(polished).not.toContain('简介日程与正文不一致');
    expect(polished).not.toContain('【蜗牛质检】');
    expect(polished).not.toContain('【蜗牛提示】');
    expect(polished).not.toContain('【避坑指南】');
  });

  it('does not append empty 美食探店 stubs onto a long Qingdao itinerary', () => {
    const raw = [
      '【方案简介】',
      '3天都在青岛。同行情侣，人均预算约4000元，美食探店。',
      '· 项目 · 人均金额 · 平价省钱说明',
      '大交通 · 500元 · 高铁二等',
      '合计 · 4000元 · 卡预算',
      '【行程流水账】',
      '春和楼午饭后去天主教堂和栈桥吹风，晚饭营口路啤酒屋。第3天 从昨晚住宿片区「中山路/栈桥」出发。上午小鱼山，14点前返程，预留2.5小时青岛站进站缓冲。',
    ].join('\n');
    const out = finalizeClarifyLockedPlan(raw, {
      city: '青岛',
      days: 3,
      party: '情侣',
      budgetYuan: 4000,
      preference: '美食探店',
    });
    expect(out).toContain('| 大交通 |');
    expect(out).not.toContain('抵达青岛后安顿住宿');
    expect(out).not.toContain('【蜗牛提示】');
    expect(out.split('【方案简介】')[1]?.split('【行程流水账】')[0]).not.toContain('今晚住宿片区');
  });
});

describe('clipClarifyPlanToLockedDays', () => {
  it('drops day 4+ and 50天50站 without extra prompt words', () => {
    const raw = [
      '嘿，你这趟“50天50站”。',
      '第1天 · 西湖',
      '第2天 · 运河',
      '第3天 · 西溪',
      '第4天 · 只写',
      '第5天 · 继续',
    ].join('\n');
    const clipped = clipClarifyPlanToLockedDays(raw, 3);
    expect(clipped).toContain('第3天 · 西溪');
    expect(clipped).not.toContain('第4天');
    expect(clipped).not.toContain('第5天');
    expect(clipped).not.toContain('50天50站');
    expect(finalizeClarifyLockedPlan(raw, HANGZHOU_LOCK)).not.toContain('第4天');
  });
});
