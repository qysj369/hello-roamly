import { describe, expect, it } from 'vitest';
import { applySnailPlanAuditRepairs, collapseTripleTransitBlocks } from '@/lib/home/snailPlanAuditRepair';
import { auditSnailPlanOutput } from '@/lib/home/snailPlanOutputAudit';

describe('applySnailPlanAuditRepairs', () => {
  it('flattens leftover bus/taxi bullets after collapsing triples', () => {
    const raw = [
      '【行程流水账】',
      '- 地铁：3号线花园东路。',
      '- 公交：K169。',
      '- 打车：25元。',
      '- 贴士：早高峰人多。',
    ].join('\n');
    const out = collapseTripleTransitBlocks(raw);
    expect(out).toContain('地铁：');
    expect(out).not.toMatch(/公交：/);
    expect(out).not.toMatch(/打车：/);
    expect(out).toContain('贴士：早高峰人多');
    expect(out).not.toMatch(/^- /m);
  });

  it('drops orphan taxi tails and fake 老城漫步 park', () => {
    const raw = [
      '【方案简介】',
      '3天都在青岛。同行情侣，人均预算约4000元，美食探店。',
      '【行程流水账】',
      '第1天 栈桥。地铁：3号线中山路。',
      '：起步价10元，约5分钟。',
      '第2天 从昨晚住宿片区「中山路」出发。信号山公园。',
      '|------|------|------|',
      '| 午餐 | 江宁会馆 | 约120元 |',
      '第3天 从昨晚住宿片区「中山路」出发。下午去老城漫步北门，再去信号山。14点返程。',
    ].join('\n');
    const out = applySnailPlanAuditRepairs(raw, {
      city: '青岛',
      days: 3,
      originName: '济南',
      preference: '美食探店',
      party: '情侣',
      lodgingStayPut: true,
      budgetYuan: 4000,
    });
    expect(out).not.toContain('起步价10元');
    expect(out).not.toContain('老城漫步');
    expect(out.split('【行程流水账】')[1] ?? '').not.toMatch(/\|[^\n]+\|/);
    expect(out.split('第3天')[1] ?? '').not.toContain('信号山');
  });

  it('does not split a leftover 第2天分项花费 title into a second day-2', () => {
    const raw = [
      '【方案简介】',
      '3天都在青岛。同行情侣，人均预算约4000元，美食探店。花费要点（人均约4000元）：高铁往返约350元。',
      '【行程流水账】',
      '第1天 栈桥吹风。今晚住宿片区：中山路/栈桥周边',
      '第2天 从昨晚住宿片区「中山路」出发。信号山。今晚住宿片区：中山路/栈桥周边',
      '第2天分项花费（两人合计） | 项目 | 明细 | 金额 |',
      '第3天 从昨晚住宿片区「中山路」出发。14点返程。',
    ].join('\n');
    const out = applySnailPlanAuditRepairs(raw, {
      city: '青岛',
      days: 3,
      originName: '济南',
      preference: '美食探店',
      party: '情侣',
      lodgingStayPut: true,
      budgetYuan: 4000,
    });
    const intro = out.split('【行程流水账】')[0] ?? '';
    expect(intro).not.toContain('花费要点');
    expect(out).not.toContain('第2天分项花费');
    expect(out.match(/今晚住宿片区：中山路\/栈桥周边/g)?.length).toBe(2);
    expect(out).toContain('雨天备选');
  });

  it('keeps only the first hop in a metro/bus/taxi cluster', () => {
    const raw = [
      '地铁：3号线花园东路到八涧堡，约5元。',
      '公交：K169 到解放桥，约4元。',
      '打车：约25元。',
    ].join('\n');
    const out = collapseTripleTransitBlocks(raw);
    expect(out).toContain('地铁：');
    expect(out).not.toMatch(/公交：/);
    expect(out).not.toMatch(/打车：/);
  });

  it('repairs a Qingdao couple draft so audit can pass', () => {
    const raw = [
      '【方案简介】',
      '以下行程按你的预算与天数整理，花费见简介表与流水账分项。',
      '【行程流水账】',
      '第1天 到青岛看栈桥。地铁：3号线。公交：2路。打车：8元。今晚住宿片区：五四广场/浮山所',
      '第2天 从昨晚住宿片区「五四广场/浮山所」出发。去八大关散步，再上信号山。今晚住宿片区：五四广场/浮山所',
      '第3天 从昨晚住宿片区「五四广场/浮山所」出发。今日首站：八大关，下午再去信号山。午饭后去车站。今晚住宿片区：返程回家，无需住宿',
    ].join('\n');
    const lock = {
      city: '青岛',
      days: 3,
      originName: '济南',
      preference: '美食探店',
      party: '情侣',
      lodgingStayPut: true,
      budgetYuan: 4000,
    };
    const out = applySnailPlanAuditRepairs(raw, lock);
    expect(out).toContain('| 大交通 |');
    expect(out).toContain('| 合计 | 4000元 |');
    expect(out).not.toContain('【蜗牛提示】');
    expect(out).toContain('冬春');
    expect(out).toMatch(/官方售票|黄牛/);
    expect(out).toMatch(/预约/);
    expect(out).toMatch(/2\.5\s*小时/);
    expect(out).toContain('中山路/栈桥');
    expect(out).not.toContain('五四广场');
    expect(out).toContain('湿滑');
    expect(out).toContain('雨天备选');
    expect(out).toContain('14:00前动身取回行李');
    expect(out).toContain('当日双人消费：济南地铁约8元');
    expect(out).not.toContain('按上文明细');
    const audit = auditSnailPlanOutput(out, lock);
    expect(audit.ok).toBe(true);
  });

  it('turns a dotted Qingdao budget into a pipe table and keeps lodging out of the intro', () => {
    const raw = [
      '【方案简介】',
      '3天都在青岛。同行情侣，人均预算约4000元，美食探店。🐌 第一天下午到，先摸清周边；',
      '今晚住宿片区：中山路/栈桥',
      '当日双人消费：市内交通、餐食与门票按上文明细，两人分摊。 第二天步行逛老城+栈桥；',
      '花费要点（人均）：大交通高铁往返约330元，总计约1910元。',
      '· 项目 · 人均金额 · 平价省钱说明',
      '大交通 · 500元 · 济南⇌青岛高铁二等往返；普快硬座可省70元，耗时增加3小时',
      '市内交通 · 300元 · 地铁公交为主，预留部分打车额度',
      '餐饮 · 1200元 · 老城家常菜、团岛市场、营口路啤酒屋，主打美食探店',
      '门票 · 200元 · 信号山、啤酒博物馆、奥帆游船，其余景点步道免费',
      '住宿 · 1500元 · 中山路栈桥民宿两晚，双人分摊人均',
      '机动备用 · 300元 · 加餐、伴手礼、临时打车',
      '合计 · 4000元 · 严格控制在人均4000元预算上限',
      '【行程流水账】',
      '春和楼午饭后去栈桥。第3天 从昨晚住宿片区「中山路/栈桥」出发。上午小鱼山，14点前返程。',
    ].join('\n');
    const lock = {
      city: '青岛',
      days: 3,
      originName: '济南',
      preference: '美食探店',
      party: '情侣',
      lodgingStayPut: true,
      budgetYuan: 4000,
    };
    const out = applySnailPlanAuditRepairs(raw, lock);
    const intro = out.split('【行程流水账】')[0] ?? '';
    expect(intro).toContain('| 大交通 |');
    expect(intro).toContain('| 合计 | 4000元 |');
    expect(intro).not.toMatch(/大交通\s*·/);
    expect(intro).not.toContain('花费要点');
    expect(intro).not.toContain('今晚住宿片区');
    expect(intro).not.toContain('当日双人消费');
    expect(out).not.toContain('【蜗牛提示】');
  });
});
