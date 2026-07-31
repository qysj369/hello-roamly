import { describe, expect, it } from 'vitest';
import { isCoordinateLikeLocationName, resolveAmapPlaceName } from '@/lib/map/resolveAmapPlaceName';

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
});
