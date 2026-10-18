import { describe, expect, it } from 'vitest';
import { captionById, captionCueToFire } from '@/lib/snail-flight/captionPacks';
import {
  captionHoldMs,
  isArrivalCaption,
  shouldBeginLandingTransition,
  shouldHoldWaypointCaption,
  SNAIL_FLIGHT_CAPTION_HOLD_MS,
} from '@/lib/snail-flight/captions';

describe('snail-flight captions', () => {
  it('holds waypoint cards except the old landing beat', () => {
    expect(shouldHoldWaypointCaption('')).toBe(false);
    expect(shouldHoldWaypointCaption('takeoff')).toBe(true);
    expect(shouldHoldWaypointCaption('zibo')).toBe(true);
    expect(shouldHoldWaypointCaption('qingdao-coast')).toBe(true);
    expect(shouldHoldWaypointCaption('landing')).toBe(false);
  });

  it('treats Qingdao landing / approach as arrival', () => {
    expect(isArrivalCaption('qingdao-land')).toBe(true);
    expect(isArrivalCaption('qingdao-coast')).toBe(true);
    expect(isArrivalCaption('approach')).toBe(true);
    expect(isArrivalCaption('zibo')).toBe(false);
  });

  it('fires one cue per progress band and prefers the later overlapping band', () => {
    const fired = new Set<string>();
    expect(captionCueToFire(0, fired)?.id).toBe('takeoff');
    fired.add('takeoff');
    expect(captionCueToFire(0.08, fired)).toBeNull();
    expect(captionCueToFire(0.13, fired)?.id).toBe('lakes');
    fired.add('lakes');
    expect(captionCueToFire(0.16, fired)?.id).toBe('zhangqiu');
    expect(captionCueToFire(0.16, new Set())?.id).toBe('zhangqiu');
  });

  it('keeps three caption packs on the same ids', () => {
    expect(captionById('story', 'laizhou')?.title).toContain('莱州湾');
    expect(captionById('verse', 'zibo')?.lines).toHaveLength(1);
    expect(captionById('guide', 'weifang')?.lines[0]).toContain('风筝');
  });

  it('uses 6–8s hold in normal flight', () => {
    expect(captionHoldMs(false)).toBe(SNAIL_FLIGHT_CAPTION_HOLD_MS);
    expect(captionHoldMs(false)).toBeGreaterThanOrEqual(6_000);
    expect(captionHoldMs(false)).toBeLessThanOrEqual(8_000);
  });

  it('lands only after 100% and Qingdao caption fade, unless captions are off', () => {
    expect(
      shouldBeginLandingTransition({
        flightDone: false,
        captionsOn: true,
        arrivalCaptionDone: true,
      }),
    ).toBe(false);
    expect(
      shouldBeginLandingTransition({
        flightDone: true,
        captionsOn: true,
        arrivalCaptionDone: false,
      }),
    ).toBe(false);
    expect(
      shouldBeginLandingTransition({
        flightDone: true,
        captionsOn: true,
        arrivalCaptionDone: true,
      }),
    ).toBe(true);
    expect(
      shouldBeginLandingTransition({
        flightDone: true,
        captionsOn: false,
        arrivalCaptionDone: false,
      }),
    ).toBe(true);
  });
});
