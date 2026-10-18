import { describe, expect, it } from 'vitest';
import {
  cityFromSearchShareContentId,
  readHomeShareLanding,
  readShareLandingPlanHint,
  searchShareContentId,
} from '@/lib/home/homeShareLanding';

describe('homeShareLanding', () => {
  it('encodes unsaved posters by city', () => {
    expect(searchShareContentId('杭州')).toBe('search-杭州');
    expect(searchShareContentId('')).toBe('search-home');
  });

  it('reads the city back from a share id', () => {
    expect(cityFromSearchShareContentId('search-杭州')).toBe('杭州');
    expect(cityFromSearchShareContentId('search-home')).toBeNull();
  });

  it('parses homepage share query', () => {
    const landing = readHomeShareLanding('?from=share&sk=p&sid=search-杭州&sch=x');
    expect(landing).toMatchObject({
      contentKind: 'travel_plan',
      contentId: 'search-杭州',
      channel: 'xhs',
    });
  });

  it('restores city from sid when city query is missing', () => {
    const hint = readShareLandingPlanHint('?from=share&sk=p&sid=search-苏州&sch=x');
    expect(hint.city).toBe('苏州');
    expect(hint.suggestedQuery).toBe('苏州');
  });

  it('reads city days and party for a complete landing', () => {
    const hint = readShareLandingPlanHint('?city=苏州&days=3&party=好友结伴&from=share');
    expect(hint).toMatchObject({
      city: '苏州',
      days: 3,
      party: '好友结伴',
      suggestedQuery: '苏州3天好友结伴',
    });
  });
});
