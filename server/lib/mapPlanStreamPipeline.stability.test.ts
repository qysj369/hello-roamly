import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SOURCE = readFileSync(
  resolve(import.meta.dirname, 'mapPlanStreamPipeline.ts'),
  'utf8',
);

describe('mapPlanStreamPipeline stability', () => {
  it('declares phase1Messages in generateCompleteMapPlanStream before repairOnce loop', () => {
    const fnBody =
      SOURCE.match(
        /export async function generateCompleteMapPlanStream[\s\S]*?^}/m,
      )?.[0] ?? '';
    expect(fnBody).toBeTruthy();

    const declareIdx = fnBody.indexOf('const phase1Messages');
    const repairLoopIdx = fnBody.indexOf('repairOnce(ctx, phase1Messages');
    expect(declareIdx).toBeGreaterThan(-1);
    expect(repairLoopIdx).toBeGreaterThan(-1);
    expect(declareIdx).toBeLessThan(repairLoopIdx);

    const between = fnBody.slice(declareIdx, repairLoopIdx);
    expect(between.match(/const phase1Messages/g)?.length ?? 0).toBe(1);
  });

  it('uses day-by-day only for long single-city trips, not every fixed day count', () => {
    expect(SOURCE).toContain('MAP_PLAN_DAY_BY_DAY_MIN_DAYS');
    expect(SOURCE).toMatch(
      /fixedDayCount\s*!=\s*null\s*&&\s*fixedDayCount\s*>=\s*MAP_PLAN_DAY_BY_DAY_MIN_DAYS/,
    );
    expect(SOURCE).not.toMatch(/else if \(fixedDayCount\) \{\s*fullText = await generateFixedDayCountPhase1/);
  });
});
