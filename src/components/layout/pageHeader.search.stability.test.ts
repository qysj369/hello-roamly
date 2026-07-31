import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const PAGE_HEADER = readFileSync(resolve(import.meta.dirname, 'PageHeader.tsx'), 'utf8');

describe('home search uniqueness contract', () => {
  it('mounts planning search only once in PageHeader (header placement)', () => {
    const jsxMounts = PAGE_HEADER.match(/<HomeMapTrailControlPanel\b/g) ?? [];
    expect(jsxMounts.length).toBe(1);
    expect(PAGE_HEADER).toContain('placement="header"');
    expect(PAGE_HEADER).not.toMatch(/placement="overlay"/);
    expect(PAGE_HEADER).not.toMatch(/placement="above"/);
  });
});
