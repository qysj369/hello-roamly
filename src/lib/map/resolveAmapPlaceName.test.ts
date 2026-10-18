import { describe, expect, it } from 'vitest';
import {
  compactGeocodeLabelForDisplay,
  isCoordinateLikeLocationName,
  resolveAmapPlaceName,
  sanitizeLocationLabelForDisplay,
} from '@/lib/map/resolveAmapPlaceName';

describe('resolveAmapPlaceName', () => {
  it('prefers nearby POI over city-level address', () => {
    const name = resolveAmapPlaceName({
      formatted_address: '山东省济南市历城区华山街道',
      addressComponent: {
        city: '济南市',
        district: '历城区',
        township: '华山街道',
      },
      pois: [
        { name: '华山风景区', distance: '120' },
        { name: '泉城广场', distance: '8500' },
      ],
    });

    expect(name).toBe('华山风景区');
  });

  it('builds township-level name when POI missing', () => {
    const name = resolveAmapPlaceName({
      formatted_address: '山东省济南市历城区华山街道',
      addressComponent: {
        city: '济南市',
        district: '历城区',
        township: '华山街道',
      },
    });

    expect(name).toBe('济南市历城区华山街道');
  });

  it('detects coordinate-like labels', () => {
    expect(isCoordinateLikeLocationName('36.7247, 117.0902')).toBe(true);
    expect(isCoordinateLikeLocationName('华山风景区')).toBe(false);
  });

  it('uses destination when route label has arrow', () => {
    expect(compactGeocodeLabelForDisplay('济南市历下区中林路 → 杭州')).toBe('杭州');
    expect(sanitizeLocationLabelForDisplay('济南市历下区 → 杭州市')).toBe('杭州');
  });
});
