import type { SharePosterInput } from '@/lib/share/posterTypes';
import type { XhsPosterInput } from '@/lib/share/xhsPosterTypes';

const DEFAULT_HASHTAGS = ['穷游', '旅行攻略', 'HelloRoamly'];

function normalizeHashtag(tag: string): string {
  const trimmed = tag.replace(/^#/, '').trim();
  return trimmed.slice(0, 16);
}

/** 从通用分享字段映射为小红书笔记结构 */
export function mapShareInputToXhs(
  input: SharePosterInput,
  options?: {
    hashtags?: string[];
    authorLabel?: string;
    locationLabel?: string;
    titlePrefix?: string;
  },
): XhsPosterInput {
  const tags =
    options?.hashtags?.map(normalizeHashtag).filter(Boolean) ??
    DEFAULT_HASHTAGS;

  const titleCore = input.title.trim();
  const title = options?.titlePrefix
    ? `${options.titlePrefix}${titleCore}`
    : titleCore;

  const bodyParts = [input.subtitle, input.summary]
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    title,
    body: bodyParts.join('\n'),
    hashtags: tags.slice(0, 6),
    coverImageUrl: input.coverImageUrl,
    authorLabel: options?.authorLabel,
    locationLabel: options?.locationLabel,
    shareUrl: input.shareUrl,
  };
}

export function hashtagsFromTags(tags: string[], extra: string[] = []): string[] {
  const merged = [...tags, ...extra].map(normalizeHashtag).filter(Boolean);
  return [...new Set(merged)].slice(0, 6);
}
