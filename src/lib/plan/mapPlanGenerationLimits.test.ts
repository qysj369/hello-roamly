import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  MAP_PLAN_DAY_BY_DAY_MIN_DAYS,
  MAP_PLAN_SINGLE_STREAM_MAX_TOKENS,
} from '@/lib/plan/mapPlanGenerationLimits';

const PIPELINE = readFileSync(
  resolve(process.cwd(), 'server/lib/mapPlanStreamPipeline.ts'),
  'utf8',
);

describe('map plan generation limits', () => {
  it('uses one-shot four-section stream for short single-city trips', () => {
    expect(MAP_PLAN_DAY_BY_DAY_MIN_DAYS).toBeGreaterThanOrEqual(5);
    expect(MAP_PLAN_SINGLE_STREAM_MAX_TOKENS).toBeGreaterThan(1500);
    expect(PIPELINE).toContain('useSingleShot');
    expect(PIPELINE).toContain('MAP_PLAN_SINGLE_STREAM_MAX_TOKENS');
    expect(PIPELINE).toContain('buildMapPlanSystemPrompt');
  });
});
