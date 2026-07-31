import type { Guide } from '@/types/domain/guide';

/** 客户端筛选（mock / 离线回退） */
export function filterGuides(guides: Guide[], query?: string): Guide[] {
  const q = query?.trim().toLowerCase();
  if (!q) {
    return guides;
  }
  return guides.filter(
    (guide) =>
      guide.city.toLowerCase().includes(q) ||
      guide.title.toLowerCase().includes(q) ||
      guide.tags.some((tag) => tag.toLowerCase().includes(q)),
  );
}
