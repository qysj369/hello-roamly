import { describe, expect, it } from 'vitest';
import { headingDelta, normalizeHeading, pickForwardLink } from './pickForwardLink';

describe('pickForwardLink', () => {
  it('normalizes heading', () => {
    expect(normalizeHeading(-90)).toBe(270);
    expect(normalizeHeading(370)).toBe(10);
  });

  it('computes shortest heading delta', () => {
    expect(headingDelta(10, 350)).toBe(20);
    expect(headingDelta(0, 180)).toBe(180);
  });

  it('picks the forward-most link', () => {
    const links: BMapPanoramaLink[] = [
      { id: 'a', heading: 90 },
      { id: 'b', heading: 5 },
      { id: 'c', heading: 200 },
    ];
    expect(pickForwardLink(links, 0)?.id).toBe('b');
  });

  it('skips visited ids when alternatives exist', () => {
    const links: BMapPanoramaLink[] = [
      { id: 'a', heading: 0 },
      { id: 'b', heading: 20 },
    ];
    expect(pickForwardLink(links, 0, new Set(['a']))?.id).toBe('b');
  });
});
