import { describe, expect, it } from 'vitest';
import { resolveCityCenterSync } from '@/lib/map/parseTrailSearchQuery';
import {
  parseUserTravelSearch,
  readTravelSearchIntent,
  isDurationOnlyTravelQuery,
} from '@/lib/map/userTravelSearchPipeline';
import {
  USER_TRAVEL_SEARCH_FIXTURES,
  USER_TRAVEL_SEARCH_SYNC_RESOLVE_FIXTURES,
} from '@/lib/map/userTravelSearch.fixtures';

describe('userTravelSearchPipeline contract', () => {
  for (const fixture of USER_TRAVEL_SEARCH_FIXTURES) {
    it(`parses: ${fixture.input}`, () => {
      const parsed = parseUserTravelSearch(fixture.input);
      expect(parsed, 'empty input should not happen').not.toBeNull();
      expect(parsed!.primaryPlace).toBe(fixture.primaryPlace);

      if (fixture.multiStops) {
        expect(parsed!.isMultiStopQuery).toBe(true);
        expect(parsed!.multiStopNames).toEqual(fixture.multiStops);
        expect(parsed!.destinationLabel).toBe(fixture.multiStops.join('→'));
      } else {
        expect(parsed!.isMultiStopQuery).toBe(false);
      }

      const intent = readTravelSearchIntent(parsed!);
      if (fixture.days !== undefined) {
        expect(intent.days).toBe(fixture.days);
      }
      if (fixture.preferences?.length) {
        for (const pref of fixture.preferences) {
          expect(intent.preferences, `missing preference ${pref} in "${fixture.input}"`).toContain(
            pref,
          );
        }
      }
    });
  }

  it('never treats 亲子/研学 as multi-stop destinations', () => {
    for (const input of ['开封亲子游四天', '洛阳研学三天', '南京研学五日游']) {
      const parsed = parseUserTravelSearch(input)!;
      expect(parsed.multiStopNames).not.toContain('亲子');
      expect(parsed.multiStopNames).not.toContain('研学');
    }
  });

  it('rejects duration-only input without a destination', () => {
    expect(isDurationOnlyTravelQuery('三天')).toBe(true);
    expect(isDurationOnlyTravelQuery('成都 三天')).toBe(false);
    expect(isDurationOnlyTravelQuery('济南到成都 三天')).toBe(false);
  });
});

describe('userTravelSearch sync resolve contract', () => {
  for (const { input, label } of USER_TRAVEL_SEARCH_SYNC_RESOLVE_FIXTURES) {
    it(`resolveCityCenterSync: ${input} → ${label}`, () => {
      const resolved = resolveCityCenterSync(input);
      expect(resolved?.label).toBe(label);
    });
  }
});
