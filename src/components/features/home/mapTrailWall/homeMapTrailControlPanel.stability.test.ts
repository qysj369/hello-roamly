import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const PANEL = readFileSync(
  resolve(import.meta.dirname, 'HomeMapTrailControlPanel.tsx'),
  'utf8',
);

describe('HomeMapTrailControlPanel voice search contract', () => {
  it('does not expose AI badge on plan button', () => {
    expect(PANEL).not.toContain('home-map-trail-control__ai-mark');
    expect(PANEL).not.toContain('<Bot');
  });

  it('gates home voice search behind feature flag', () => {
    expect(PANEL).toContain('HOME_MAP_TRAIL_VOICE_SEARCH_ENABLED');
    expect(PANEL).toContain('HomeMapSearchVoiceControl');
    expect(PANEL).toContain('useHomeMapSearchVoice');
  });
});
