import { describe, expect, it } from 'vitest';
import { buildVoiceClarifyFollowup } from '@/lib/browser/planVoiceNarration';
import { parseClarifyLockFromHandoff } from '@/lib/map/planQueryBuilder';
import {
  buildHomePlanLaunchQuery,
  isHomePlanSearchReady,
  resolveHomePlanSearchFields,
} from '@/lib/home/resolveHomePlanSearchFields';

describe('resolveHomePlanSearchFields', () => {
  it('parses the locked Qingdao couple food sentence and is ready to generate', () => {
    const fields = resolveHomePlanSearchFields('济南情侣青岛3天人均4000美食游');
    expect(fields.city).toBe('青岛');
    expect(fields.days).toBe(3);
    expect(fields.party).toBe('情侣');
    expect(fields.budgetYuan).toBe(4000);
    expect(fields.preference).toBe('美食探店');
    expect(isHomePlanSearchReady(fields)).toBe(true);
    expect(buildHomePlanLaunchQuery(fields, '济南市历下区')).toContain('去青岛玩3天');
    expect(buildHomePlanLaunchQuery(fields, '济南市历下区')).toContain('同行：情侣');
  });

  it('keeps a bare city incomplete so the sheet asks days, party and budget', () => {
    const fields = resolveHomePlanSearchFields('青岛');
    expect(fields.city).toBe('青岛');
    expect(fields.days).toBeNull();
    expect(fields.party).toBeNull();
    expect(fields.budgetYuan).toBeNull();
    expect(isHomePlanSearchReady(fields)).toBe(false);
    expect(buildVoiceClarifyFollowup(fields)).toContain('玩几天');
    expect(buildVoiceClarifyFollowup(fields)).toContain('情侣还是单人');
    expect(buildVoiceClarifyFollowup(fields)).toContain('人均预算');
    expect(buildVoiceClarifyFollowup(fields)).toContain('海鲜');
  });

  it('reads a slow-stroll pace without blocking the complete-sentence path', () => {
    const fields = resolveHomePlanSearchFields('济南情侣青岛3天人均4000松弛慢逛美食游');
    expect(fields.pace).toBe('松弛慢逛');
    expect(isHomePlanSearchReady(fields)).toBe(true);
    expect(buildHomePlanLaunchQuery(fields, '济南市历下区')).toContain('节奏：松弛慢逛');
  });

  it('does not generate from couple + city without days or budget', () => {
    const fields = resolveHomePlanSearchFields('青岛情侣');
    expect(fields.party).toBe('情侣');
    expect(isHomePlanSearchReady(fields)).toBe(false);
  });

  it('writes a handoff lock the planner can parse', () => {
    const fields = resolveHomePlanSearchFields('济南情侣青岛3天人均4000美食游');
    const lock = parseClarifyLockFromHandoff(buildHomePlanLaunchQuery(fields, '济南市历下区'));
    expect(lock).toEqual({
      city: '青岛',
      days: 3,
      party: '情侣',
      budgetYuan: 4000,
      preference: '美食探店',
    });
  });
});
