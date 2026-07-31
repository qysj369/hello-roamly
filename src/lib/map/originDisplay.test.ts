import { describe, expect, it } from 'vitest';
import { normalizeOriginDisplayLabel } from '@/lib/map/originDisplay';

describe('normalizeOriginDisplayLabel', () => {
  it('strips Shandong province prefix from geocode', () => {
    expect(normalizeOriginDisplayLabel('山东省济南市历下区')).toBe('济南市历下区');
  });

  it('keeps user input when more specific', () => {
    expect(
      normalizeOriginDisplayLabel('山东省济南市历下区', '济南市历下区中林路绿城百合花园'),
    ).toBe('济南市历下区中林路绿城百合花园');
  });
});
