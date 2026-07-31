import { describe, expect, it } from 'vitest';
import {
  segmentGluedPlaceText,
  segmentTravelPlaces,
  stripTravelIntentNoise,
} from '@/lib/map/segmentTravelPlaces';

describe('stripTravelIntentNoise', () => {
  it('removes days budget and self-drive markers', () => {
    expect(stripTravelIntentNoise('周村古城青州潍坊四天游自驾')).toBe('周村古城青州潍坊');
    expect(stripTravelIntentNoise('曲阜微山湖台儿庄三日游预算1500')).toBe('曲阜微山湖台儿庄');
  });
});

describe('segmentGluedPlaceText', () => {
  it('segments glued Shandong loop without city table maintenance', () => {
    expect(segmentGluedPlaceText('周村古城青州潍坊')).toEqual(['周村古城', '青州', '潍坊']);
    expect(segmentGluedPlaceText('曲阜微山湖台儿庄')).toEqual(['曲阜', '微山湖', '台儿庄']);
  });

  it('segments unknown provinces by scenic suffix heuristics', () => {
    expect(segmentGluedPlaceText('丽江大理泸沽湖')).toEqual(['丽江', '大理', '泸沽湖']);
  });

  it('expands colloquial aliases', () => {
    expect(segmentTravelPlaces('苏杭三日游预算2000')).toEqual(['苏州', '杭州']);
  });
});

describe('segmentTravelPlaces', () => {
  it('parses multi-stop queries with origin prefix', () => {
    expect(segmentTravelPlaces('从济南历下区去曲阜微山湖台儿庄三天1500')).toEqual([
      '曲阜',
      '微山湖',
      '台儿庄',
    ]);
  });

  it('ignores admin geocode labels', () => {
    expect(segmentTravelPlaces('山东省济宁市曲阜市')).toEqual([]);
    expect(segmentTravelPlaces('济宁市曲阜市')).toEqual([]);
  });

  it('returns empty for single destination', () => {
    expect(segmentTravelPlaces('济南三天1500')).toEqual([]);
  });
});
