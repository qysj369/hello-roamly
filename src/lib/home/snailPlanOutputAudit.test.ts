import { describe, expect, it } from 'vitest';
import {
  auditSnailPlanOutput,
  resolveSnailPlanAuditLock,
} from '@/lib/home/snailPlanOutputAudit';

const LOCK_HANGZHOU = {
  city: '杭州',
  days: 3,
  originName: '济南',
  preference: '自然山水',
  lodgingStayPut: true,
};

function wrapDays(body: string): string {
  return [
    '【方案简介】',
    '杭州三日慢行，西湖与茶山都留给腿和胃。',
    '| 项目 | 金额 | 平价省钱方案 |',
    '| 交通 | 200 | 普快 |',
    '| 餐饮 | 400 | 小吃 |',
    '| 门票 | 90 | 核心点 |',
    '| 住宿 | 400 | 连住 |',
    '| 机动 | 200 | 应急 |',
    '| 总计 | 2400 | 卡预算 |',
    '【行程流水账】',
    body,
    '【蜗牛提示】',
    '灵隐早点去，九溪傍晚更松。',
    '【避坑指南】',
    '别在车站买礼盒。',
  ].join('\n');
}

describe('resolveSnailPlanAuditLock', () => {
  it('parses fact query city / days / preference', () => {
    const lock = resolveSnailPlanAuditLock(
      '杭州',
      '从济南出发，去杭州玩3天，同行单人，人均预算约2500元，自然山水',
      '济南',
    );
    expect(lock.city).toBe('杭州');
    expect(lock.days).toBe(3);
    expect(lock.preference).toBe('自然山水');
    expect(lock.party).toBe('单人');
    expect(lock.lodgingStayPut).toBe(true);
    expect(lock.budgetYuan).toBe(2500);
  });
});

describe('auditSnailPlanOutput', () => {
  it('rejects fictional split places 去北 / 京玩 / 自然山', () => {
    const content = wrapDays(
      [
        '第1天 先去北看看城墙，晚上住京玩景区附近。',
        '第2天 从昨晚住宿片区「京玩」出发，徒步自然山。',
        '第3天 返程。',
      ].join('\n'),
    );
    const result = auditSnailPlanOutput(content, {
      city: '北京',
      days: 3,
      preference: '自然山水',
      lodgingStayPut: true,
    });
    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'fictional_place')).toBe(true);
  });

  it('rejects lodging jump when stay-put is required', () => {
    const content = wrapDays(
      [
        '第1天 西湖。今晚住宿片区：青芝坞',
        '第2天 从昨晚住宿片区「西溪湿地北站周边」出发。今晚住宿片区：西溪湿地北站周边',
        '第3天 从昨晚住宿片区「良渚」出发。',
      ].join('\n'),
    );
    const result = auditSnailPlanOutput(content, LOCK_HANGZHOU);
    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'constraint_violation')).toBe(true);
  });

  it('rejects extra-city transfer after day 1', () => {
    const content = wrapDays(
      [
        '第1天 从济南到杭州，安顿西湖边。',
        '第2天 转场去绍兴柯桥。',
        '第3天 再去苏州。',
      ].join('\n'),
    );
    const result = auditSnailPlanOutput(content, LOCK_HANGZHOU);
    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => /跨城中转/.test(issue.message))).toBe(true);
  });

  it('rejects repeating metro/bus/taxi templates', () => {
    const block = [
      '**地铁**：1号线转2号线',
      '**公交**：K1 换 K2',
      '**出租车/网约车**：约20分钟',
      '🐌落地最佳：地铁',
    ].join('\n');
    const content = wrapDays(`第1天\n${block}\n第2天\n${block}\n第3天\n${block}`);
    const result = auditSnailPlanOutput(content, LOCK_HANGZHOU);
    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'mechanical_template')).toBe(true);
  });

  it('rejects plain-list metro/bus/taxi triples and 落地最佳 without bold', () => {
    const block = [
      '- 地铁：1号线转2号线',
      '- 公交：K1 换 K2',
      '- 出租车/网约车：约20分钟',
      '落地最佳：地铁',
    ].join('\n');
    const content = wrapDays(`第1天\n${block}\n第2天\n${block}`);
    const result = auditSnailPlanOutput(content, LOCK_HANGZHOU);
    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'mechanical_template')).toBe(true);
  });

  it('rejects 高铁 as the counted long-haul baseline', () => {
    const content = wrapDays(
      [
        '第1天高铁直达青岛站。今晚住宿片区：中山路',
        '第2天 从昨晚住宿片区「中山路」出发。今晚住宿片区：中山路',
        '第3天 从昨晚住宿片区「中山路」出发。返程。',
      ].join('\n'),
    ).replace(
      '杭州三日慢行，西湖与茶山都留给腿和胃。',
      '3天都在青岛。第1天高铁直达青岛站。大交通（济南西⇌青岛站高铁二等座往返约300元）。',
    );
    const result = auditSnailPlanOutput(content, {
      city: '青岛',
      days: 3,
      originName: '济南',
      preference: '自然山水',
      lodgingStayPut: true,
      budgetYuan: 1500,
    });
    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => /高铁/.test(issue.message))).toBe(true);
  });

  it('rejects 三方案 labels even without 落地最佳', () => {
    const content = wrapDays(
      [
        '第1天 到青岛。三方案如下。今晚住宿片区：中山路',
        '第2天 从昨晚住宿片区「中山路」出发。今晚住宿片区：中山路',
        '第3天 从昨晚住宿片区「中山路」出发。返程。',
      ].join('\n'),
    );
    const result = auditSnailPlanOutput(content, {
      city: '青岛',
      days: 3,
      originName: '济南',
      preference: '自然山水',
      lodgingStayPut: true,
      budgetYuan: 1500,
    });
    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'mechanical_template')).toBe(true);
  });

  it('rejects a 亲子 lock written as a couple trip without 崂山', () => {
    const content = wrapDays(
      [
        '第1天 情侣出行，栈桥喝咖啡。今晚住宿片区：中山路',
        '第2天 从昨晚住宿片区「中山路」出发。咱俩这趟去信号山公园。今晚住宿片区：中山路',
        '第3天 从昨晚住宿片区「中山路」出发。今日首站：信号山公园。',
      ].join('\n'),
    ).replace('杭州三日慢行，西湖与茶山都留给腿和胃。', '3天都在青岛。人均4000。');
    const result = auditSnailPlanOutput(content, {
      city: '青岛',
      days: 3,
      originName: '济南',
      preference: '自然山水',
      party: '亲子',
      lodgingStayPut: true,
      budgetYuan: 1500,
    });
    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => /亲子|情侣/.test(issue.message))).toBe(true);
    expect(result.issues.some((issue) => /仰口|崂山/.test(issue.message))).toBe(true);
    expect(result.issues.some((issue) => /信号山/.test(issue.message))).toBe(true);
  });

  it('rejects repeating 仰口 as the main battlefield on day 2 and day 3', () => {
    const content = wrapDays(
      [
        '第1天 栈桥喂海鸥。今晚住宿片区：中山路',
        '第2天 从昨晚住宿片区「中山路」出发。主攻仰口游览区，坐索道上天苑。今晚住宿片区：中山路',
        '第3天 从昨晚住宿片区「中山路」出发。今日首站：崂山仰口游览区，再走一遍仰口沙滩。',
      ].join('\n'),
    );
    const result = auditSnailPlanOutput(content, {
      city: '青岛',
      days: 3,
      originName: '济南',
      preference: '自然山水',
      lodgingStayPut: true,
      budgetYuan: 1500,
    });
    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => /仰口/.test(issue.message))).toBe(true);
  });

  it('accepts a natural Hangzhou stay with origin mentioned only on day 1', () => {
    const content = wrapDays(
      [
        '第1天 从济南坐高铁到杭州东站，安顿在西湖文化广场附近，下午沿白堤慢慢走到断桥，晚饭去高银街找本地面馆。今晚住宿片区：西湖文化广场',
        '第2天 从昨晚住宿片区「西湖文化广场」出发，先市内衔接去九溪，沿溪走到烟树，中午龙井村里吃一碗茶油面。今晚住宿片区：西湖文化广场',
        '第3天 从昨晚住宿片区「西湖文化广场」出发，上午灵隐走一圈，下午返程。今晚住宿片区：返程回家，无需住宿',
      ].join('\n'),
    );
    const result = auditSnailPlanOutput(content, LOCK_HANGZHOU);
    expect(result.ok).toBe(true);
  });

  it('rejects listed total far above locked per-person budget', () => {
    const content = wrapDays(
      [
        '第1天 西湖。今晚住宿片区：南山路',
        '第2天 从昨晚住宿片区「南山路」出发。今晚住宿片区：南山路',
        '第3天 从昨晚住宿片区「南山路」出发。返程。',
      ].join('\n'),
    ).replace('| 总计 | 2400 | 卡预算 |', '| 总计 | 2550 | 超支 |');
    const result = auditSnailPlanOutput(content, { ...LOCK_HANGZHOU, budgetYuan: 1500 });
    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => /超出锁定预算/.test(issue.message))).toBe(true);
  });

  it('rejects Qingdao last day without a 2.5-hour station buffer', () => {
    const content = wrapDays(
      [
        '第1天 栈桥。今晚住宿片区：中山路',
        '第2天 从昨晚住宿片区「中山路」出发。今晚住宿片区：中山路',
        '第3天 从昨晚住宿片区「中山路」出发。上午八大关，午饭后直接去车站。',
      ].join('\n'),
    ).replace('杭州三日慢行，西湖与茶山都留给腿和胃。', '3天都在青岛。');
    const result = auditSnailPlanOutput(content, {
      city: '青岛',
      days: 3,
      originName: '济南',
      preference: '美食探店',
      party: '情侣',
      lodgingStayPut: true,
      budgetYuan: 4000,
    });
    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => /2\.5/.test(issue.message))).toBe(true);
  });

  it('rejects Qingdao couple lodging that leaves 中山路/栈桥', () => {
    const content = wrapDays(
      [
        '第1天 栈桥。今晚住宿片区：五四广场/浮山所',
        '第2天 从昨晚住宿片区「五四广场/浮山所」出发。今晚住宿片区：五四广场/浮山所',
        '第3天 从昨晚住宿片区「五四广场/浮山所」出发。返程。',
      ].join('\n'),
    ).replace('杭州三日慢行，西湖与茶山都留给腿和胃。', '3天都在青岛。');
    const result = auditSnailPlanOutput(content, {
      city: '青岛',
      days: 3,
      originName: '济南',
      preference: '美食探店',
      party: '情侣',
      lodgingStayPut: true,
      budgetYuan: 4000,
    });
    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => /中山路/.test(issue.message))).toBe(true);
  });

  it('accepts a high-budget couple table that uses 高铁 as the counted haul', () => {
    const content = [
      '【方案简介】',
      '3天都在青岛。同行情侣。',
      '| 项目 | 人均总金额 | 平价省钱说明 |',
      '| 大交通 | 320 | 济南高铁二等往返；普快可省100 |',
      '| 市内交通 | 150 | 地铁公交 |',
      '| 餐饮 | 1200 | 老城馆子 |',
      '| 门票 | 200 | 信号山小青岛游船博物馆 |',
      '| 住宿 | 800 | 中山路两晚 |',
      '| 机动备用 | 0 | 余量伴手礼 |',
      '| 合计 | 2670 | 低于4000 |',
      '【行程流水账】',
      '第1天 栈桥（红嘴鸥仅冬春季节大量出没，其余时段仅可观赏海岸礁石，涨潮栈道湿滑注意安全）。今晚住宿片区：中山路',
      '第2天 从昨晚住宿片区「中山路」出发。傍晚奥帆游船仅可在官方售票窗口购票，切勿轻信路边黄牛。今晚住宿片区：中山路',
      '第3天 从昨晚住宿片区「中山路」出发。登州路56号青岛啤酒博物馆需公众号预约，16点停止检票。下午14:00前动身取回行李前往青岛站，预留2.5小时青岛站进站缓冲。',
      '【蜗牛提示】',
      '见行程正文，贴士已写入各天。',
      '【避坑指南】',
      '见行程正文，避坑已写在对应日。',
    ].join('\n');
    const result = auditSnailPlanOutput(content, {
      city: '青岛',
      days: 3,
      originName: '济南',
      preference: '美食探店',
      party: '情侣',
      lodgingStayPut: true,
      budgetYuan: 4000,
    });
    expect(result.ok).toBe(true);
  });

  it('rejects a prose budget list without the five-row table', () => {
    const content = [
      '【方案简介】',
      '3天都在青岛。',
      '交通 · 约420元 · 普快硬座',
      '总计 · 约1500元',
      '【行程流水账】',
      '第1天 栈桥。今晚住宿片区：中山路',
      '第2天 从昨晚住宿片区「中山路」出发。今晚住宿片区：中山路',
      '第3天 从昨晚住宿片区「中山路」出发。返程。',
      '【蜗牛提示】',
      '见行程正文，贴士已写入各天。',
      '【避坑指南】',
      '见行程正文，避坑已写在对应日。',
    ].join('\n');
    const result = auditSnailPlanOutput(content, {
      city: '青岛',
      days: 3,
      originName: '济南',
      preference: '自然山水',
      lodgingStayPut: true,
      budgetYuan: 1500,
    });
    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => /表格/.test(issue.message))).toBe(true);
  });

  it('rejects a 普快 traffic line padded to 420', () => {
    const content = wrapDays(
      [
        '第1天 栈桥。今晚住宿片区：中山路',
        '第2天 从昨晚住宿片区「中山路」出发。今晚住宿片区：中山路',
        '第3天 从昨晚住宿片区「中山路」出发。返程。',
      ].join('\n'),
    )
      .replace('杭州三日慢行，西湖与茶山都留给腿和胃。', '3天都在青岛。')
      .replace('| 交通 | 200 | 普快 |', '| 交通 | 420 | 普快硬座往返约110 |');
    const result = auditSnailPlanOutput(content, {
      city: '青岛',
      days: 3,
      originName: '济南',
      preference: '自然山水',
      lodgingStayPut: true,
      budgetYuan: 1500,
    });
    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => /交通分项/.test(issue.message))).toBe(true);
  });

  it('accepts a total inside the 1500 lock', () => {
    const content = wrapDays(
      [
        '第1天 西湖。今晚住宿片区：南山路',
        '第2天 从昨晚住宿片区「南山路」出发。今晚住宿片区：南山路',
        '第3天 从昨晚住宿片区「南山路」出发。返程。',
      ].join('\n'),
    ).replace('| 总计 | 2400 | 卡预算 |', '| 总计 | 1480 | 卡预算 |');
    const result = auditSnailPlanOutput(content, { ...LOCK_HANGZHOU, budgetYuan: 1500 });
    expect(result.ok).toBe(true);
  });
});
