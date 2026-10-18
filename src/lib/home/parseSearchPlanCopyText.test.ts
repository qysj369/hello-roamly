import { describe, expect, it } from 'vitest';
import { formatSearchPlanCopyText } from '@/lib/home/formatSearchPlanCopyText';
import { parseSearchPlanCopyText } from '@/lib/home/parseSearchPlanCopyText';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

const shanghaiCopy = `上海 · 4天 · 情侣 · 未设置预算
出发：待定
主题：城市漫步与滨江慢游

【预算明细】
往返大交通  人均800元  按国内中程高铁二等座往返估算
市内交通  人均120元  地铁为主
餐饮  人均600元
门票  人均150元
住宿  人均600元  按3晚计，情侣分摊一间
机动备用金  人均200元
合计  人均2470元

【第1天 抵达上海·梧桐区街巷慢逛】
住宿片区：徐家汇/陕西南路片区
交通：
- 地铁10号线至陕西南路站
景点：
- 武康路-安福路街区 · 必体验：梧桐树下的老洋房
- 徐家汇源景区 · 时间充裕可选
美食：
- 老盛昌汤包（徐汇店） · 鲜肉汤包+小馄饨 · 人均30元
当日贴士：第一天以安顿和闲逛为主

【第2天 外滩源·苏州河·滨江慢行】
住宿片区：徐家汇/陕西南路片区
景点：
- 外滩源 · 必体验
- 苏州河河滨步道 · 必体验

【第3天 近郊轻游·朱家角古镇慢逛】
景点：
- 朱家角古镇 · 必体验

【第4天 市区闲逛·返程】
住宿片区：徐家汇/陕西南路片区（退房寄存行李，不再计住宿）
景点：
- 新天地-田子坊街区 · 必体验

【出行贴士】
- 雨天替代：改为室内场馆
- 节假日人流大替代：清晨前往

蜗牛旅行｜路慢，方能读懂山河
HelloRoamly · helloroamly.com`;

const compact: SearchStructuredPlan = {
  baseInfo: {
    startCity: '济南',
    targetCity: '杭州',
    days: 1,
    peopleType: '好友结伴',
    budget: null,
    theme: '山水徒步',
  },
  budgetList: [{ item: '合计', perPerson: 2600, tip: '总预算约2600元' }],
  globalTips: ['地铁可扫支付宝'],
  dayList: [
    {
      day: 1,
      title: '抵达杭州，漫步西湖',
      hotelArea: '西湖湖滨商圈',
      tips: '穿舒适鞋',
      traffic: [{ desc: '济南西高铁至杭州东' }],
      spots: [{ name: '西湖', intro: '沿苏堤慢走' }],
      foods: [{ shop: '楼外楼', dish: '西湖醋鱼', perCost: 150 }],
    },
  ],
};

describe('parseSearchPlanCopyText', () => {
  it('rebuilds budget, days, foods and tips from an old share copy', () => {
    const plan = parseSearchPlanCopyText(shanghaiCopy);
    expect(plan?.baseInfo).toMatchObject({
      startCity: '待定',
      targetCity: '上海',
      days: 4,
      peopleType: '情侣',
      theme: '城市漫步与滨江慢游',
    });
    expect(plan?.budgetList.find((item) => item.item === '合计')?.perPerson).toBe(2470);
    expect(plan?.dayList).toHaveLength(4);
    expect(plan?.dayList[0]?.spots[0]?.name).toBe('武康路-安福路街区');
    expect(plan?.dayList[0]?.foods[0]?.shop).toContain('老盛昌');
    expect(plan?.dayList[2]?.spots[0]?.name).toBe('朱家角古镇');
    expect(plan?.globalTips[0]).toContain('雨天替代');
    expect(plan?.dayList[0]?.tips).toContain('安顿和闲逛');
  });

  it('round-trips formatSearchPlanCopyText', () => {
    const parsed = parseSearchPlanCopyText(formatSearchPlanCopyText(compact));
    expect(parsed?.baseInfo.targetCity).toBe('杭州');
    expect(parsed?.dayList[0]?.spots[0]?.name).toBe('西湖');
    expect(parsed?.dayList[0]?.foods[0]?.perCost).toBe(150);
    expect(parsed?.dayList[0]?.tips).toBe('穿舒适鞋');
    expect(parsed?.globalTips).toContain('地铁可扫支付宝');
  });

  it('returns null for unrelated markdown', () => {
    expect(parseSearchPlanCopyText('## 方案简介\n去杭州玩三天')).toBeNull();
  });
});
