import { TRAVEL_MOMENT_TAG_PRESETS } from '@/data/travelMomentTags';

export const TRAVEL_MOMENT_TAG_LIMITS = {
  maxTags: 8,
  maxTagLength: 16,
  maxDescriptionLength: 500,
  maxDetailLength: 2000,
} as const;

export function normalizeTravelMomentTag(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').slice(0, TRAVEL_MOMENT_TAG_LIMITS.maxTagLength);
}

export function isValidTravelMomentTag(tag: string): boolean {
  const normalized = normalizeTravelMomentTag(tag);
  return normalized.length >= 1 && normalized.length <= TRAVEL_MOMENT_TAG_LIMITS.maxTagLength;
}

export function toggleTagSelection(selected: string[], tag: string): string[] {
  const normalized = normalizeTravelMomentTag(tag);
  if (!isValidTravelMomentTag(normalized)) {
    return selected;
  }
  if (selected.includes(normalized)) {
    return selected.filter((item) => item !== normalized);
  }
  if (selected.length >= TRAVEL_MOMENT_TAG_LIMITS.maxTags) {
    return selected;
  }
  return [...selected, normalized];
}

export function addCustomTag(selected: string[], raw: string): { tags: string[]; error?: string } {
  const normalized = normalizeTravelMomentTag(raw);
  if (!isValidTravelMomentTag(normalized)) {
    return { tags: selected, error: '标签不能为空' };
  }
  if (selected.includes(normalized)) {
    return { tags: selected, error: '标签已存在' };
  }
  if (selected.length >= TRAVEL_MOMENT_TAG_LIMITS.maxTags) {
    return { tags: selected, error: `最多 ${TRAVEL_MOMENT_TAG_LIMITS.maxTags} 个标签` };
  }
  return { tags: [...selected, normalized] };
}

export function isPresetTag(tag: string): boolean {
  return (TRAVEL_MOMENT_TAG_PRESETS as readonly string[]).includes(tag);
}
