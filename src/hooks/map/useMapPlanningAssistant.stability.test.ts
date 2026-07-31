import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SOURCE = readFileSync(
  resolve(import.meta.dirname, 'useMapPlanningAssistant.ts'),
  'utf8',
);

describe('useMapPlanningAssistant stability', () => {
  it('does not reference multiStops before const multiStops (TDZ crash on 一键规划)', () => {
    const block =
      SOURCE.match(
        /const attachOrigin = shouldAttachOriginToPlan[\s\S]*?const multiStops = filterOriginFromMultiStops/,
      )?.[0] ?? '';
    expect(block).toBeTruthy();
    const beforeDeclare = block.split('const multiStops = filterOriginFromMultiStops')[0] ?? '';
    expect(beforeDeclare).not.toMatch(/\bmultiStops\b/);
  });
});
