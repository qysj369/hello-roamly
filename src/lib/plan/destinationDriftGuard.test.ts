import { describe, expect, it } from 'vitest';
import {
  detectDestinationCityHijack,
  detectStyleAsPlace,
  scrubDestinationDriftInPlan,
  scrubStyleAsPlacePhrases,
} from '@/lib/plan/destinationDriftGuard';

describe('scrubDestinationDriftInPlan', () => {
  it('replaces Kunming/Milei mentions when destination is Putian', () => {
    const raw = '大交通：济南西乘高铁抵达昆明南，再转弥勒。';
    const out = scrubDestinationDriftInPlan(raw, '莆田');
    expect(out).not.toContain('昆明南');
    expect(out).not.toContain('弥勒');
    expect(out).toContain('莆田');
  });

  it('leaves content unchanged when destination matches', () => {
    const raw = '抵达莆田站后步行至酒店。';
    expect(scrubDestinationDriftInPlan(raw, '莆田')).toBe(raw);
  });

  it('scrubs style tags used as place names', () => {
    const raw =
      '第1天 · 亲子出行近郊慢行（济南→近郊慢行目的地）高铁直达近郊慢行目的地，去近郊慢行亲子公园。';
    const out = scrubStyleAsPlacePhrases(raw, '杭州');
    expect(detectStyleAsPlace(raw)).toBe(true);
    expect(out).not.toContain('近郊慢行目的地');
    expect(out).toContain('杭州');
    expect(out).toContain('近郊亲子慢行');
  });

  it('detects city hijack when locked Hangzhou but body is Jinan', () => {
    const raw = '济南济南济南济南济南南部山区，九如山红叶谷，不住杭州。';
    expect(detectDestinationCityHijack(raw, '杭州')).toBe('济南');
  });
});
