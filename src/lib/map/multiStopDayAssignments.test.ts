import { describe, expect, it } from 'vitest';
import { buildMultiStopDayAssignments } from '@/lib/map/multiStopDayAssignments';

describe('buildMultiStopDayAssignments', () => {
  it('assigns one day per stop when days equal stops', () => {
    expect(buildMultiStopDayAssignments(['曲阜', '微山湖', '台儿庄'], 3)).toEqual([
      { dayNumber: 1, stopName: '曲阜', previousStop: null, isDepthDay: false },
      { dayNumber: 2, stopName: '微山湖', previousStop: '曲阜', isDepthDay: false },
      { dayNumber: 3, stopName: '台儿庄', previousStop: '微山湖', isDepthDay: false },
    ]);
  });

  it('extends last stop for extra days (4 days 3 stops)', () => {
    const assignments = buildMultiStopDayAssignments(['周村古城', '青州', '潍坊'], 4);
    expect(assignments).toHaveLength(4);
    expect(assignments[2]).toMatchObject({ dayNumber: 3, stopName: '潍坊', isDepthDay: false });
    expect(assignments[3]).toMatchObject({ dayNumber: 4, stopName: '潍坊', isDepthDay: true });
  });
});
