import { describe, expect, it } from 'vitest';
import {
  buildSoftItineraryView,
  enrichHomeKitIntroDisplay,
  enrichShenzhenIntroDisplay,
  ensureSpotPlayHighlight,
  extractBudgetFromIntro,
  softenPlanDisplayCopy,
  splitTipLines,
  toCleanPlanCopyText,
} from '@/utils/planResultDisplay';

describe('planResultDisplay soft transforms', () => {
  it('keeps markdown budget pipes when copying', () => {
    const raw = [
      '青岛三日。',
      '| 项目 | 人均金额 | 平价省钱说明 |',
      '| ---- | ---- | ---- |',
      '| 大交通 | 500元 | 高铁二等 |',
      '| 合计 | 4000元 | 卡预算 |',
    ].join('\n');
    const copied = toCleanPlanCopyText(raw);
    expect(copied).toContain('| 大交通 | 500元 | 高铁二等 |');
    expect(copied).toContain('| 合计 | 4000元 |');
    expect(copied).not.toMatch(/大交通\s*·/);
  });

  it('replaces 穷游 in display copy', () => {
    expect(softenPlanDisplayCopy('三日穷游攻略与轻穷游节奏')).toBe('三日漫行攻略与轻漫行节奏');
    expect(softenPlanDisplayCopy('### 第1天 **栈桥**')).toBe('第1天 栈桥');
  });

  it('extracts budget table and leaves prose', () => {
    const intro = `缓步古城，遇见不期而遇的风景。

| 项目 | 金额 |
| --- | --- |
| 交通 | ¥320 |
| 住宿 | ¥400 |
| **总计** | **¥1280** |
`;
    const result = extractBudgetFromIntro(intro);
    expect(result.totalYuan).toBe(1280);
    expect(result.items.map((i) => i.label)).toEqual(['交通', '住宿']);
    expect(result.proseMarkdown).toContain('缓步古城');
    expect(result.proseMarkdown).not.toContain('|');
  });

  it('splits itinerary into morning/afternoon/evening scenes', () => {
    const itinerary = `Day1 古城漫行
上午去宽窄巷子慢慢逛，推荐地铁出行。
下午再去锦里吃串串。
晚上看江景夜灯，注意保暖。`;
    const view = buildSoftItineraryView(itinerary);
    expect(view.days.length).toBeGreaterThan(0);
    expect(view.days[0]!.dayLabel).toBe('D1');
    const labels = view.days[0]!.scenes.map((s) => s.label);
    expect(labels).toContain('晨起');
    expect(labels).toContain('午后');
    expect(labels).toContain('傍晚');
  });

  it('uses D1/D2/D3 module titles and drops 漫行小站 fallbacks', () => {
    const itinerary = `### 第1天
下午留空档闲逛，当晚仍回同一住宿。

### 第2天
**漫行小站7**
继续慢慢走，当晚回同一住宿。

### 第3天
去夫子庙慢慢走。`;
    const view = buildSoftItineraryView(itinerary);
    expect(view.days.map((day) => day.dayLabel)).toEqual(['D1', 'D2', 'D3']);
    const titles = view.days.flatMap((day) => day.scenes.flatMap((scene) => scene.spots.map((spot) => spot.title)));
    expect(titles.every((title) => !/漫行小站/.test(title))).toBe(true);
    expect(titles).toContain('D1');
    expect(titles).toContain('D2');
    expect(titles.some((title) => title.includes('夫子庙'))).toBe(true);
  });

  it('attaches a play highlight instead of listing bare place names', () => {
    const itinerary = `### 第1天
夫子庙、老门东、总统府`;
    const view = buildSoftItineraryView(itinerary);
    const feels = view.days.flatMap((day) =>
      day.scenes.flatMap((scene) => scene.spots.map((spot) => spot.feel)),
    );
    expect(feels.some((feel) => /、/.test(feel) && !/值得慢慢逛/.test(feel))).toBe(false);
    expect(feels.some((feel) => /值得慢慢逛/.test(feel))).toBe(true);
    expect(ensureSpotPlayHighlight('西湖', '')).toContain('西湖值得慢慢逛');
    expect(ensureSpotPlayHighlight('上海博物馆', '必体验：上午看馆藏，避开主街人流')).toBe(
      '必体验：上午看馆藏，避开主街人流',
    );
    expect(ensureSpotPlayHighlight('苏堤', '苏堤白堤可以慢慢走，把时间留给湖风。')).toContain(
      '可以慢慢走',
    );
    expect(
      ensureSpotPlayHighlight(
        '宽窄巷子',
        '上午去宽窄巷子慢慢逛，茶馆坐一坐，把时间留给街巷里的老味道。下午再去锦里吃串串。',
      ),
    ).toContain('下午再去锦里吃串串');
  });

  it('splits tips into short lines without numeric prefixes', () => {
    const tips = `1. 早出门避开人潮。\n2. 带好充电宝。`;
    expect(splitTipLines(tips)).toEqual(['早出门避开人潮。', '带好充电宝。']);
  });

  it('enriches Shenzhen intro with fixed QA card titles in order', () => {
    const intro =
      '济南奔赴深圳两日轻漫行，节奏松弛不赶行程。打卡华强北数码市井、海岸城商圈、深圳湾滨海栈道。可以品尝花胶鸡煲、粤式简餐。城内优先地铁出行，支付宝乘车码可直接刷码。';
    const enriched = enrichShenzhenIntroDisplay({
      proseMarkdown: '济南奔赴深圳两日轻漫行，节奏松弛不赶行程。',
      intro,
      itinerary: 'Day1 南山科技园与海岸城；Day2 华强北与深圳湾',
      initialQuery: '济南到深圳两日',
    });
    expect(enriched.isShenzhen).toBe(true);
    expect(enriched.cards.map((c) => c.title)).toEqual([
      '润色后的方案简介中添加一些景点推荐',
      '润色后的方案简介中添加一些美食推荐',
      '润色后的方案简介中添加一些交通指南',
    ]);
    expect(enriched.cards[0]?.body).toContain('华强北');
    expect(enriched.cards[1]?.body).toContain('花胶鸡');
    expect(enriched.cards[2]?.body).toMatch(/地铁|乘车码/);
  });

  it('does not weave Jinan streets into a Qingdao intro', () => {
    const intro =
      '3天都在青岛。同行情侣，人均预算约1500元，自然山水。晚上住青岛同一片区，不换城。';
    const enriched = enrichHomeKitIntroDisplay({
      proseMarkdown: intro,
      intro,
      itinerary:
        '第1天 从济南市历下区中林路绿城百合花园出发，地铁到济南西站，高铁去青岛站。',
      initialQuery: '去青岛玩3天，同行情侣，人均预算约1500元，自然山水',
    });
    expect(enriched.cityName).toBe('青岛');
    expect(enriched.leadProse).toContain('青岛');
    expect(enriched.leadProse).not.toContain('芙蓉街');
    expect(enriched.leadProse).not.toContain('大明湖');
    expect(enriched.leadProse).not.toContain('油旋');
  });
});
