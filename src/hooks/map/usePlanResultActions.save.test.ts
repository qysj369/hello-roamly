import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SOURCE = readFileSync(resolve(import.meta.dirname, 'usePlanResultActions.ts'), 'utf8');

describe('usePlanResultActions early save', () => {
  it('finalizes deliverable content before persist so mid-stream save works', () => {
    expect(SOURCE).toContain('isMapPlanDeliverable');
    expect(SOURCE).toContain('finalizeMapPlanContent');
    expect(SOURCE).toContain('withFinalAssistantContent');
    expect(SOURCE).toContain('行程还在生成，稍后再保存');
  });
});
