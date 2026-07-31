import type { TrailWallFilterTag } from '@/types/domain/trailWall';

const TAG_GRADIENTS: Record<TrailWallFilterTag, { start: string; end: string }> = {
  budget: { start: '#34d399', end: '#10b981' },
  food: { start: '#fbbf24', end: '#f97316' },
  photo: { start: '#38bdf8', end: '#6366f1' },
  nature: { start: '#2dd4bf', end: '#14b8a6' },
};

export function trailGradientForTag(tag: TrailWallFilterTag): { colorStart: string; colorEnd: string } {
  const pair = TAG_GRADIENTS[tag];
  return { colorStart: pair.start, colorEnd: pair.end };
}
