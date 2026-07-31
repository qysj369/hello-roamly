import type { Guide } from '@/types/domain/guide';
import { resolveCityCoverUrl } from '@/data/cityCoverImages';
import { findUserById } from '@/data/findUserById';
import { SNAIL_COMMUNITY } from '@/lib/config/snailCommunity';
import { fetchPublishedGuideRecord } from '@/services/guides/publishedGuide';
import { formatRelativeZh } from '@/utils/date';

export type GuideCardDisplay = {
  id: string;
  title: string;
  coverImageUrl: string | null;
  metaTag: string;
  excerpt: string;
  insight: string | null;
  authorName: string;
  authorId?: string;
  authorAvatar?: string;
  updatedAtLabel: string | null;
  city: string;
};

const COVER_PALETTES = [
  'from-emerald-100 to-teal-200',
  'from-sky-100 to-blue-200',
  'from-amber-100 to-orange-200',
  'from-violet-100 to-purple-200',
] as const;

function hashCity(city: string): number {
  let hash = 0;
  for (let i = 0; i < city.length; i += 1) {
    hash = (hash + city.charCodeAt(i) * (i + 1)) % 997;
  }
  return hash;
}

export function guideCoverPalette(city: string): string {
  return COVER_PALETTES[hashCity(city) % COVER_PALETTES.length]!;
}

function parseDayCount(days: string): number {
  const match = days.match(/(\d+)/);
  return match ? Number(match[1]) : 1;
}

function parseCostAmount(budget: string): number | null {
  const match = budget.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

function truncateExcerpt(text: string, max = 60): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= max) {
    return normalized;
  }
  return `${normalized.slice(0, max)}…`;
}

function buildMetaTag(destination: string, dayCount: number, cost: number | null): string {
  const costLabel = cost !== null && cost > 0 ? `¥${cost}` : '预算待定';
  return `${destination} · ${dayCount}天 · ${costLabel}`;
}

function excerptFromGuide(guide: Guide, structuredNarrative?: string): string {
  if (structuredNarrative?.trim()) {
    return truncateExcerpt(structuredNarrative);
  }
  if (guide.tags.length > 0) {
    return truncateExcerpt(`${guide.title}。亮点：${guide.tags.join('、')}`);
  }
  return truncateExcerpt(guide.title);
}

function insightFromGuide(
  structured?: { snailInsights?: { regrets?: string; recommendations?: string } },
  guide?: Guide,
): string | null {
  const recommendation = structured?.snailInsights?.recommendations?.trim();
  if (recommendation) {
    return truncateExcerpt(recommendation, 48);
  }
  const regret = structured?.snailInsights?.regrets?.trim();
  if (regret) {
    return truncateExcerpt(regret, 48);
  }
  const tag = guide?.tags[0]?.trim();
  return tag ? `亮点：${tag}` : null;
}

/** 攻略卡片展示数据（首页瀑布流 / 列表预览） */
export function resolveGuideCardDisplay(guide: Guide): GuideCardDisplay {
  const published = fetchPublishedGuideRecord(guide.id);
  const structured = published?.content ?? guide.structured;
  const destination = structured?.destination ?? guide.city;
  const dayCount = structured?.days ?? parseDayCount(guide.days);
  const cost = structured?.costBreakdown.total ?? parseCostAmount(guide.budget) ?? null;
  const narrative = structured?.dailyJournal[0]?.narrative;
  const authorId = published?.authorId ?? guide.authorId;
  const author = authorId ? findUserById(authorId) : undefined;

  return {
    id: guide.id,
    title: structured?.title ?? guide.title,
    coverImageUrl: resolveCityCoverUrl(destination),
    metaTag: buildMetaTag(destination, dayCount, cost),
    excerpt: excerptFromGuide(guide, narrative),
    insight: insightFromGuide(structured, guide),
    authorName: author?.username ?? SNAIL_COMMUNITY.defaultAuthorName,
    authorId,
    authorAvatar: author?.avatar,
    updatedAtLabel: guide.updatedAt ? formatRelativeZh(guide.updatedAt) : null,
    city: destination,
  };
}
