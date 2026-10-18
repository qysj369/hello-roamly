import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  SEARCH_PLAN_SHARE_CTA,
  SEARCH_PLAN_SHARE_REF,
  buildSearchPlanChannelCopy,
  sanitizeShareExportText,
} from '@/lib/home/searchPlanShareChannels';
import { matchSearchPlanGoldExample } from '@/lib/home/searchPlanGoldExamples';
import { isLikelyMobileShareDevice } from '@/lib/share/openSocialApp';

const friends = matchSearchPlanGoldExample({
  startCity: '济南',
  targetCity: '上海',
  days: 3,
  peopleType: '好友结伴',
  budget: null,
  theme: null,
})!;

const SHARE_SHEET = readFileSync(
  resolve(process.cwd(), 'src/components/home/holo/HoloSearchPlanShareSheet.tsx'),
  'utf8',
);

describe('阶段1+2验收：微信/抖音保留，小红书三图追加', () => {
  it('share sheet keeps WeChat and Douyin, then adds Xiaohongshu without extra apps', () => {
    expect(SHARE_SHEET).toContain("id: 'wechat'");
    expect(SHARE_SHEET).toContain("id: 'douyin'");
    expect(SHARE_SHEET).toContain("id: 'xhs'");
    expect(SHARE_SHEET).toContain('扫码打开这趟行程');
    expect(SHARE_SHEET).toContain('tryMobileShare');
    expect(SHARE_SHEET).toContain('复制文案');
    expect(SHARE_SHEET).toContain('下载海报');
    expect(SHARE_SHEET).toContain('renderItinerarySummaryPoster');
    expect(SHARE_SHEET).not.toContain('复制口播');
    expect(SHARE_SHEET.indexOf("id: 'wechat'")).toBeLessThan(SHARE_SHEET.indexOf("id: 'douyin'"));
    expect(SHARE_SHEET.indexOf("id: 'douyin'")).toBeLessThan(SHARE_SHEET.indexOf("id: 'xhs'"));
    expect(SHARE_SHEET).not.toContain('openSocialApp(');
    expect(SHARE_SHEET).not.toContain('weixin://');
    expect(SHARE_SHEET).not.toContain('snssdk1128');
    expect(SHARE_SHEET).not.toContain('复制全文');
    expect(SHARE_SHEET).not.toContain('知乎');
    expect(SHARE_SHEET).not.toContain('B站');
    expect(SHARE_SHEET).not.toContain('快手');
    expect(SHARE_SHEET).not.toContain('<details');
  });

  it('public copies drop full-day lists, budget, urls and marketing CTA', () => {
    const dirty = [
      'Day 1 外滩 Day 2 豫园 Day 3 武康路',
      '人均1210-1800元',
      '完整行程路线在蜗牛旅行 helloroamly.com，AI一键定制你的专属旅行方案',
      'https://helloroamly.com/saved-plans/x',
    ].join('\n');
    const clean = sanitizeShareExportText(dirty);
    expect(clean).toContain(SEARCH_PLAN_SHARE_REF);
    expect(clean).not.toContain('Day 1');
    expect(clean).not.toContain('1210');
    expect(clean).not.toContain(SEARCH_PLAN_SHARE_CTA);
    expect(clean).not.toContain('helloroamly.com');
  });

  it('WeChat / Douyin notes stay public-safe and refresh from the plan', () => {
    const url = 'https://helloroamly.com/saved-plans/plan-test?from=share';
    for (const id of ['wechat', 'douyin'] as const) {
      const copy = buildSearchPlanChannelCopy(id, friends, url);
      expect(copy).toContain(SEARCH_PLAN_SHARE_REF);
      expect(copy).not.toContain(SEARCH_PLAN_SHARE_CTA);
      expect(copy).not.toContain('Day 1');
      expect(copy).not.toContain(url);
    }
  });

  it('desktop UA never counts as a mobile share device', () => {
    expect(isLikelyMobileShareDevice()).toBe(false);
  });
});
