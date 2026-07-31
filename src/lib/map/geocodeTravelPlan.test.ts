import { describe, expect, it } from 'vitest';

import { buildTravelPlanFromGuide } from '@/data/buildTravelPlan';
import { demoGuides } from '@/data/demoGuides';
import {
  buildPlanLocationGeocodeQuery,
  buildPlanLocationGeocodeVariants,
  extractCityFromPlanText,
  resolvePlanGeocodeCity,
} from '@/lib/map/geocodeTravelPlan';
import { filterMapViewportPoints, isWithinPlanRegion } from '@/lib/map/planGeoBounds';
import { getPlanBaseCenter } from '@/lib/map/planMapPoints';

describe('geocodeTravelPlan helpers', () => {
  it('extracts city from plan title', () => {
    expect(extractCityFromPlanText('成都五日穷游')).toBe('成都');
    expect(extractCityFromPlanText('南京三天预算一千五')).toBe('南京');
    expect(extractCityFromPlanText('聊城市区两日游')).toBe('聊城');
    expect(extractCityFromPlanText('临清运河古城两日游')).toBe('临清');
  });

  it('builds city-prefixed POI query', () => {
    expect(buildPlanLocationGeocodeQuery('锦城湖', '成都市')).toBe('成都锦城湖');
    expect(buildPlanLocationGeocodeQuery('成都锦城湖', '成都市')).toBe('成都锦城湖');
  });

  it('builds geocode variants from verbose AI location strings', () => {
    const variants = buildPlanLocationGeocodeVariants('宽窄巷子 · 游玩2小时', '成都市');
    expect(variants).toContain('宽窄巷子');
    expect(variants).toContain('成都宽窄巷子');
  });

  it('resolves geocode city from plan metadata', () => {
    const guide = demoGuides.find((item) => item.id === 'chengdu');
    expect(guide).toBeDefined();
    const plan = buildTravelPlanFromGuide(guide!);
    expect(resolvePlanGeocodeCity(plan)).toBe('成都市');
  });

  it('anchors 临清 trips in Shandong instead of default Chengdu guide city', () => {
    const plan = buildTravelPlanFromGuide(demoGuides[0]!);
    plan.title = '临清运河古城两日游';
    plan.presentation = {
      ...plan.presentation!,
      destination: '临清',
      guideId: 'chengdu',
    };

    const center = getPlanBaseCenter(plan);
    expect(center.longitude).toBeGreaterThan(115);
    expect(center.longitude).toBeLessThan(116);
    expect(center.latitude).toBeGreaterThan(36);
    expect(center.latitude).toBeLessThan(37);
    expect(resolvePlanGeocodeCity(plan)).toBe('临清市');
  });
});

describe('planGeoBounds', () => {
  it('rejects coordinates far from plan anchor', () => {
    const anchor = { longitude: 115.985, latitude: 36.456 };
    const nearby = { longitude: 116.0, latitude: 36.5 };
    const far = { longitude: 102.8, latitude: 24.9 };

    expect(isWithinPlanRegion(nearby, anchor)).toBe(true);
    expect(isWithinPlanRegion(far, anchor)).toBe(false);
  });

  it('filters viewport points to destination region', () => {
    const anchor = getPlanBaseCenter({
      ...buildTravelPlanFromGuide(demoGuides[0]!),
      title: '聊城两日游',
      presentation: {
        guideId: 'hangzhou',
        destination: '聊城',
        coverImageUrl: '',
        coverImageAlt: '',
        styleTags: [],
        generatedAt: '',
        creator: { id: 'x', name: 'x', avatarUrl: '' },
        stats: { likeCount: 0 },
      },
    });

    const points = [
      {
        id: 'a',
        name: 'A',
        description: '',
        time: '09:00',
        day: 1,
        dayTitle: '',
        order: 0,
        longitude: 116.0,
        latitude: 36.5,
        geocoded: true,
      },
      {
        id: 'b',
        name: 'B',
        description: '',
        time: '12:00',
        day: 1,
        dayTitle: '',
        order: 1,
        longitude: 102.8,
        latitude: 24.9,
        geocoded: true,
      },
    ];

    const viewport = filterMapViewportPoints(points, anchor);
    expect(viewport).toHaveLength(1);
    expect(viewport[0]?.id).toBe('a');
  });
});
