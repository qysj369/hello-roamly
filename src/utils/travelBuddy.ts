import {
  TRAVEL_BUDDY_BUDGET_OPTIONS,
  TRAVEL_BUDDY_TAG_OPTIONS,
} from '@/lib/config/travelBuddy';
import { paths } from '@/router/paths';
import type { TravelBuddyPost } from '@/types/domain/travelBuddy';

export function defaultTravelBuddyStartDate(daysFromNow = 3): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

export function formatTravelBuddyBudgetLabel(
  range: TravelBuddyPost['budgetRange'],
): string {
  return TRAVEL_BUDDY_BUDGET_OPTIONS.find((item) => item.value === range)?.label ?? range;
}

export function formatTravelBuddyTagLabel(tag: TravelBuddyPost['tags'][number]): string {
  return TRAVEL_BUDDY_TAG_OPTIONS.find((item) => item.value === tag)?.label ?? tag;
}

export function sortSeekingTravelBuddyPosts(items: TravelBuddyPost[]): TravelBuddyPost[] {
  return items
    .filter((item) => item.status === 'seeking')
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime() ||
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function formatTravelBuddyStartDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

export function formatTravelBuddyPublishedAt(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / 3_600_000);
  if (diffHours < 1) {
    return '刚刚';
  }
  if (diffHours < 24) {
    return `${diffHours} 小时前`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} 天前`;
  }
  return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
}

export function buildTravelBuddyInterestMessage(post: TravelBuddyPost): string {
  return `你好！我对你在「${post.destination}」${formatTravelBuddyStartDate(post.startDate)} 出发的结伴需求感兴趣，想聊聊具体安排。`;
}

export function travelBuddyNewPath(): string {
  return paths.travelBuddyNew;
}
