import type { TravelMoment } from '@/types/domain/user/userSocial';
import { getMomentTags } from '@/utils/travelMomentDisplay';

/** 从瞬间列表汇总标签（按出现次数降序） */
export function collectMomentTags(moments: TravelMoment[]): string[] {
  const counts = new Map<string, number>();

  for (const moment of moments) {
    for (const tag of getMomentTags(moment)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'))
    .map(([tag]) => tag);
}

export function filterMomentsByTag(moments: TravelMoment[], tag: string | null): TravelMoment[] {
  if (!tag) {
    return moments;
  }

  return moments.filter((moment) => getMomentTags(moment).includes(tag));
}
