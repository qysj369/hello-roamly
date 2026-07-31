import { extractSearchDestination } from '@/lib/map/parseTrailSearchQuery';

function matchesDestination(text: string, destination: string): boolean {
  const normalized = text.trim();
  return (
    normalized.includes(destination) ||
    destination.includes(normalized) ||
    normalized.startsWith(destination)
  );
}

/** 按顶栏搜索目的地筛选攻略（无匹配时返回原列表） */
export function filterGuidesByDestination<T extends { city: string; title: string }>(
  guides: T[],
  searchQuery: string,
): T[] {
  const destination = extractSearchDestination(searchQuery.trim());
  if (!destination) {
    return guides;
  }
  const matched = guides.filter(
    (guide) =>
      matchesDestination(guide.city, destination) || matchesDestination(guide.title, destination),
  );
  return matched.length > 0 ? matched : guides;
}

export function filterTrailGuidesByDestination<
  T extends { end_city: string; title: string },
>(guides: T[], searchQuery: string): T[] {
  const destination = extractSearchDestination(searchQuery.trim());
  if (!destination) {
    return guides;
  }
  const matched = guides.filter(
    (guide) =>
      matchesDestination(guide.end_city, destination) ||
      matchesDestination(guide.title, destination),
  );
  return matched.length > 0 ? matched : guides;
}
