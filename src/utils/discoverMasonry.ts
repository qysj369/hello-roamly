import { demoGuides } from '@/data/demoGuides';
import type { DiscoverContentType, RecommendedDiscoverItem } from '@/types/domain/discover';

export type DiscoverPinSize = 'compact' | 'standard' | 'tall';

const PIN_ASPECT: Record<DiscoverPinSize, string> = {
  compact: 'aspect-[5/6]',
  standard: 'aspect-[4/5]',
  tall: 'aspect-[3/4]',
};

/** 估算 Pin 高度权重，用于最短列分配 */
const PIN_WEIGHT: Record<DiscoverPinSize, number> = {
  compact: 3,
  standard: 4,
  tall: 5,
};

export type MasonryPinEntry<T> = {
  item: T;
  pinSize: DiscoverPinSize;
  index: number;
};

export function filterMasonryFeedItems(
  items: RecommendedDiscoverItem[],
  contentType: DiscoverContentType,
): RecommendedDiscoverItem[] {
  if (contentType === 'all') {
    return items;
  }
  if (contentType === 'plan') {
    return items.filter((item) => item.kind === 'plan' || item.kind === 'savedPlan');
  }
  return items.filter((item) => item.kind === contentType);
}

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** 按内容类型与序号生成错落高度，模拟 Pinterest Pin */
export function getDiscoverPinSize(
  item: RecommendedDiscoverItem,
  index: number,
): DiscoverPinSize {
  const seed = hashSeed(item.id) + index;

  if (item.kind === 'moment') {
    return seed % 4 === 0 ? 'tall' : seed % 2 === 0 ? 'standard' : 'compact';
  }

  if (item.kind === 'guide') {
    const guide = demoGuides.find((entry) => entry.id === item.guideId);
    if (guide?.tags.some((tag) => tag.includes('摄影') || tag.includes('自然'))) {
      return 'tall';
    }
    return seed % 3 === 0 ? 'standard' : 'compact';
  }

  const cycle: DiscoverPinSize[] = ['compact', 'standard', 'tall', 'standard'];
  return cycle[seed % cycle.length]!;
}

export function getDiscoverPinAspectClass(size: DiscoverPinSize): string {
  return PIN_ASPECT[size];
}

export function getDiscoverPinWeight(size: DiscoverPinSize): number {
  return PIN_WEIGHT[size];
}

export function buildMasonryPinEntries(
  items: RecommendedDiscoverItem[],
): MasonryPinEntry<RecommendedDiscoverItem>[] {
  return items.map((item, index) => ({
    item,
    index,
    pinSize: getDiscoverPinSize(item, index),
  }));
}

/** 将 Pin 分配到最矮列（Pinterest 式平衡） */
export function distributeMasonryColumns<T>(
  entries: MasonryPinEntry<T>[],
  columnCount: number,
): MasonryPinEntry<T>[][] {
  const safeCount = Math.max(1, columnCount);
  const columns: MasonryPinEntry<T>[][] = Array.from({ length: safeCount }, () => []);
  const heights = new Array(safeCount).fill(0);

  for (const entry of entries) {
    let targetColumn = 0;
    for (let column = 1; column < safeCount; column += 1) {
      if (heights[column]! < heights[targetColumn]!) {
        targetColumn = column;
      }
    }
    columns[targetColumn]!.push(entry);
    heights[targetColumn] += getDiscoverPinWeight(entry.pinSize);
  }

  return columns;
}

export function getDiscoverMasonryColumnCount(width: number): number {
  if (width >= 1280) {
    return 5;
  }
  if (width >= 1024) {
    return 4;
  }
  if (width >= 640) {
    return 3;
  }
  return 2;
}
