import { describe, expect, it } from 'vitest';
import { detectFollowUpIntent } from '@/lib/plan/detectFollowUpIntent';

describe('detectFollowUpIntent', () => {
  it('detects budget tweaks', () => {
    expect(detectFollowUpIntent('预算压到 1200')).toBe('budget');
  });

  it('detects pace tweaks', () => {
    expect(detectFollowUpIntent('轻松一点不要太累')).toBe('pace');
  });

  it('detects free spot requests', () => {
    expect(detectFollowUpIntent('多加免费景点')).toBe('free_spots');
  });
});
