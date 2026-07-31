import { describe, expect, it } from 'vitest';
import { buildOriginAddressVariants, inferCityFromAddress, isPoiLikeOriginQuery } from '@/lib/map/inferCityFromAddress';

describe('inferCityFromAddress', () => {
  it('infers Jinan from district name', () => {
    expect(inferCityFromAddress('历下区中林路绿城百合花园')).toBe('济南市');
  });

  it('infers Jinan from explicit city', () => {
    expect(inferCityFromAddress('济南历下区中林路绿城百合花园')).toBe('济南市');
  });
});

describe('isPoiLikeOriginQuery', () => {
  it('detects residential complex keywords', () => {
    expect(isPoiLikeOriginQuery('绿城百合花园')).toBe(true);
    expect(isPoiLikeOriginQuery('经十路6777')).toBe(false);
  });
});

describe('buildOriginAddressVariants', () => {
  it('strips letter zone suffix and extracts garden name', () => {
    const variants = buildOriginAddressVariants('济南市历下区中林路绿城百合花园A区');
    expect(variants).toContain('济南市历下区中林路绿城百合花园');
    expect(variants.some((v) => v.includes('绿城百合花园'))).toBe(true);
  });
});
