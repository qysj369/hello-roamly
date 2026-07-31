import { describe, expect, it } from 'vitest';

import { blindBoxCities } from '@/data/blindBoxCities';
import {
  blindBoxJourneyEyebrow,
  blindBoxJourneyRoute,
} from '@/components/capsule-one/capsulePrompts';
import {
  blindBoxCityToCapsulePoint,
  blindBoxDistanceKm,
  drawBlindBoxCity,
  findNearestBlindBoxCity,
  getBlindBoxRarityLabel,
  handleEarthClick,
  planRegionalBlindBoxJourney,
  resolveBlindBoxDepartureLabel,
} from '@/lib/capsule/blindBox';

/** 济南 — 用于出发地→目的地距离校验 */
const JINAN_LAT = 36.65;
const JINAN_LNG = 117.12;

describe('blindBox', () => {
  it('keeps unique city names', () => {
    const names = blindBoxCities.map((city) => city.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('draws legendary tier below 1% threshold', () => {
    const city = drawBlindBoxCity(0.005);
    expect(city.rarity).toBe(1);
  });

  it('draws epic tier between 1% and 20%', () => {
    const city = drawBlindBoxCity(0.15);
    expect(city.rarity).toBe(2);
  });

  it('draws classic tier at 20% and above', () => {
    const city = drawBlindBoxCity(0.25);
    expect(city.rarity).toBe(3);
  });

  it('maps blind box city to capsule lock point', () => {
    const city = blindBoxCities[0]!;
    expect(blindBoxCityToCapsulePoint(city)).toEqual({
      id: `blind-${city.name}`,
      label: city.name,
      lat: city.lat,
      lng: city.lng,
    });
  });

  it('labels rarity tiers', () => {
    expect(getBlindBoxRarityLabel(1)).toBe('传说目的地');
    expect(getBlindBoxRarityLabel(2)).toBe('精选目的地');
    expect(getBlindBoxRarityLabel(3)).toBe('经典目的地');
  });

  it('handleEarthClick requires raycast hits', () => {
    expect(handleEarthClick({}, null, 30, 104)).toBe(false);
    expect(handleEarthClick({}, [], 30, 104)).toBe(false);
  });

  it('skips same-city destination when click lands on a known city', () => {
    const journey = planRegionalBlindBoxJourney(30.6, 104.0);
    expect(journey?.departureLabel).toBe('成都');
    expect(journey?.destination.name).toBe('重庆');
    expect(journey?.distanceKm).toBeGreaterThan(200);
    expect(journey?.distanceKm).toBeLessThan(350);
  });

  it('returns null when click is too far from any blind box city', () => {
    const match = findNearestBlindBoxCity(0, -40);
    expect(match).toBeNull();
  });

  it('respects regional max distance threshold', () => {
    const match = findNearestBlindBoxCity(-8, 72);
    expect(match).toBeNull();
  });

  it('plans Jinan departure to Qingdao destination with real route distance', () => {
    const journey = planRegionalBlindBoxJourney(JINAN_LAT, JINAN_LNG);
    expect(journey?.departureLabel).toBe('济南');
    expect(journey?.destination.name).toBe('青岛');
    expect(journey?.distanceKm).toBeGreaterThan(270);
    expect(journey?.distanceKm).toBeLessThan(320);
    expect(blindBoxJourneyRoute(journey!.departureLabel, journey!.destination.name)).toBe(
      '济南  →  青岛',
    );
    expect(blindBoxJourneyEyebrow(journey!.distanceKm)).toBe(`直线距离约 ${journey!.distanceKm} 公里`);
  });

  it('measures Jinan to Lanzhou as a long-range trip', () => {
    const lanzhou = blindBoxCities.find((city) => city.name === '兰州')!;
    const distanceKm = blindBoxDistanceKm(JINAN_LAT, JINAN_LNG, lanzhou.lat, lanzhou.lng);
    expect(distanceKm).toBeGreaterThan(1100);
    expect(distanceKm).toBeLessThan(1300);
  });

  it('labels distant clicks with coordinates when no city is nearby', () => {
    const label = resolveBlindBoxDepartureLabel(0, -40);
    expect(label).toMatch(/北纬|南纬/);
    expect(label).toMatch(/东经|西经/);
  });
});
