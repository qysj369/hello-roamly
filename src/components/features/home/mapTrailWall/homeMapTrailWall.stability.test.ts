import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SOURCE = readFileSync(
  resolve(import.meta.dirname, 'HomeMapTrailWall.tsx'),
  'utf8',
);

/** 顶栏规划依赖的出发地 hook 字段；漏解构会导致首页白屏 */
const REQUIRED_ORIGIN_HOOK_FIELDS = [
  'userOrigin',
  'originStatus',
  'originSource',
  'refreshOrigin',
  'applyFallbackOrigin',
] as const;

describe('HomeMapTrailWall stability contract', () => {
  it('destructures every origin hook field used by search/plan flow', () => {
    const destructureBlock =
      SOURCE.match(/const\s*\{([\s\S]*?)\}\s*=\s*useUserMapOrigin\(\)/)?.[1] ?? '';
    for (const field of REQUIRED_ORIGIN_HOOK_FIELDS) {
      expect(destructureBlock, `missing useUserMapOrigin.${field}`).toContain(field);
    }
  });

  it('does not mount map overlay origin chip (header-only search)', () => {
    expect(SOURCE).not.toContain('HomeMapOriginChip');
    expect(SOURCE).not.toMatch(/placement="overlay"/);
    expect(SOURCE).not.toContain('HomeMapTrailControlPanel');
  });

  it('registers header search bar for PageHeader', () => {
    expect(SOURCE).toContain('setHomeMapBar(controlPanelProps)');
    expect(SOURCE).toContain('onSearchSubmit: handleSearchSubmit');
  });

  it('does not expose origin field in header (silent backend only)', () => {
    expect(SOURCE).not.toContain('HomeMapOriginField');
    expect(SOURCE).not.toContain('onOriginConfirm');
  });

  it('prioritizes destination map fly over origin when search has a city', () => {
    expect(SOURCE).toContain('resolveCityCenterSync(destinationHint)');
    expect(SOURCE).not.toMatch(/setTimeout\(\(\)\s*=>\s*\{[\s\S]*locateOnMap/);
  });

  it('hides origin blue dot until a route is drawn', () => {
    expect(SOURCE).toContain('if (!userRouteCollection)');
  });
});
