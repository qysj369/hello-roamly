import { describe, expect, it } from 'vitest';
import {
  canonicalizeMapPlanContent,
  finalizeMapPlanContent,
  isMapPlanContentComplete,
  isMapPlanDeliverable,
  isTextTailTruncated,
  mergeInsightsContinuation,
  needsMapPlanInsightsPhase,
  padMissingMapPlanSections,
  trimTruncatedInsightsTail,
} from '@/lib/plan/mapPlanCompleteness';

const completePlan = `【方案简介】

莆田 3 天穷游，预算约 1500 元。

| 项目 | 金额 |
| **总计** | **¥1280** |

【行程流水账】

Day1 上午从济南乘高铁抵达莆田，出站存行李后逛老城（约 ¥180）。Day2 上午湄洲岛，下午涵江老街（约 ¥120）。Day3 下午返程济南。

【蜗牛提示】

广化寺十元素食很治愈，适合发呆。涵江老街夜市便宜又好吃，本地人常去。

【避坑指南】

别在岛上海鲜排档被宰，价格约为市区两倍。临出发买票会涨价。湄洲岛船班提前查，别信码头「最后一班」。`;

describe('isTextTailTruncated', () => {
  it('detects unclosed bold', () => {
    expect(isTextTailTruncated('另外，**涵江的')).toBe(true);
  });

  it('accepts sentence ending', () => {
    expect(isTextTailTruncated('涵江老街便宜又好吃。')).toBe(false);
  });
});

describe('isMapPlanContentComplete', () => {
  it('accepts four-section plan', () => {
    expect(isMapPlanContentComplete(completePlan)).toBe(true);
  });

  it('rejects missing pitfalls', () => {
    const truncated = completePlan.replace(/【避坑指南】[\s\S]*/, '');
    expect(isMapPlanContentComplete(truncated)).toBe(false);
  });

  it('rejects mid-sentence pitfalls', () => {
    const truncated = `${completePlan.split('【避坑指南】')[0]}【避坑指南】\n别在岛上，**涵江的`;
    expect(isMapPlanContentComplete(truncated)).toBe(false);
  });
});

describe('trimTruncatedInsightsTail', () => {
  it('removes incomplete tail in pitfalls', () => {
    const raw = `${completePlan.replace(/船班提前查。$/, '')}另外，**涵江的`;
    const trimmed = trimTruncatedInsightsTail(raw);
    expect(trimmed).not.toContain('涵江的');
    expect(trimmed).toContain('别在岛上海鲜排档被宰');
  });
});

describe('needsMapPlanInsightsPhase', () => {
  it('detects empty pitfalls with marker present', () => {
    const hollow = `${completePlan.split('【避坑指南】')[0]}【避坑指南】\n`;
    expect(needsMapPlanInsightsPhase(hollow)).toBe(true);
  });
});

describe('canonicalizeMapPlanContent', () => {
  it('adds intro when only itinerary and insights exist', () => {
    const withoutIntro = completePlan.replace(/【方案简介】[\s\S]*?【行程流水账】/, '【行程流水账】');
    const out = canonicalizeMapPlanContent(withoutIntro);
    expect(out).toContain('【方案简介】');
    expect(isMapPlanContentComplete(out)).toBe(true);
  });
});

describe('padMissingMapPlanSections', () => {
  it('fills missing snail and pitfalls', () => {
    const onlyItinerary = `${completePlan.split('【蜗牛提示】')[0]}`;
    const padded = padMissingMapPlanSections(onlyItinerary, '莆田');
    expect(padded).toContain('【蜗牛提示】');
    expect(padded).toContain('【避坑指南】');
    expect(isMapPlanContentComplete(padded)).toBe(true);
  });
});

describe('finalizeMapPlanContent', () => {
  it('delivers usable plan for search flow', () => {
    const onlyItinerary = `${completePlan.split('【蜗牛提示】')[0]}`;
    const out = finalizeMapPlanContent(onlyItinerary, '莆田');
    expect(isMapPlanDeliverable(out)).toBe(true);
    expect(isMapPlanContentComplete(out)).toBe(true);
  });
});

describe('mergeInsightsContinuation', () => {
  it('appends plain-text continuation to incomplete section', () => {
    const base = `${completePlan.split('【避坑指南】')[0]}【避坑指南】\n别在岛上，**涵江的`;
    const merged = mergeInsightsContinuation(base, '老街夜宵便宜。船班提前查。');
    expect(merged).toContain('老街夜宵');
    expect(merged).toContain('【避坑指南】');
    expect(merged).not.toContain('**涵江的');
  });
});
