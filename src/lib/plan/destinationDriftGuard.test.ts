import { describe, expect, it } from 'vitest';
import { scrubDestinationDriftInPlan } from '@/lib/plan/destinationDriftGuard';

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
});
