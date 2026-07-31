import { describe, expect, it } from 'vitest';
import {
  buildCrossCityDoorToDoorHint,
  buildDoorToDoorSegmentInstruction,
  buildDoorToDoorSegmentRules,
  buildMultiStopDoorToDoorChain,
  isLargeCityTransitContext,
} from '@/lib/plan/doorToDoorTransit';

describe('buildDoorToDoorSegmentInstruction', () => {
  it('requires metro bus and taxi blocks', () => {
    const text = buildDoorToDoorSegmentInstruction('测试段', '家门口', '车站');
    expect(text).toContain('地铁');
    expect(text).toContain('公交');
    expect(text).toContain('出租车');
    expect(text).toContain('落地最佳');
  });
});

describe('isLargeCityTransitContext', () => {
  it('detects Jinan Lixia as large city', () => {
    expect(isLargeCityTransitContext('济南市历下区', '莆田')).toBe(true);
  });
});

describe('buildDoorToDoorSegmentRules', () => {
  it('requires bus transfer detail in large cities', () => {
    const rules = buildDoorToDoorSegmentRules(true);
    expect(rules).toContain('换车');
    expect(rules).toContain('换乘站');
    expect(rules).toContain('第二路');
  });
});

describe('buildCrossCityDoorToDoorHint', () => {
  it('covers home to station and station to destination', () => {
    const hint = buildCrossCityDoorToDoorHint('济南市历下区', '莆田');
    expect(hint).toContain('家门口');
    expect(hint).toContain('济南西站');
    expect(hint).toContain('大交通');
    expect(hint).toContain('抵达');
    expect(hint).toContain('地铁');
    expect(hint).toContain('公交');
    expect(hint).toContain('出租车');
    expect(hint).toContain('落地最佳');
    expect(hint).toContain('换车');
    expect(hint).toMatch(/K\d+/);
  });
});

describe('buildMultiStopDoorToDoorChain', () => {
  it('covers every leg from origin through all stops', () => {
    const chain = buildMultiStopDoorToDoorChain(
      ['曲阜', '微山湖', '台儿庄'],
      '济南市历下区',
    );
    expect(chain).toContain('曲阜');
    expect(chain).toContain('微山湖');
    expect(chain).toContain('台儿庄');
    expect(chain).toContain('济南西站');
    expect(chain).toContain('转场');
    expect(chain).toContain('大交通');
    expect(chain).toContain('返程');
  });
});
