import type { DiscoverFilters, DiscoverSortMode } from '@/types/domain/discover';
import type { ListGuidesParams } from '@/types/api/guides';

/** 集中管理 React Query queryKey */
export const queryKeys = {
  guides: {
    list: (params: ListGuidesParams = {}) => ['guides', 'list', params] as const,
    detail: (id: string) => ['guides', 'detail', id] as const,
  },
  discover: {
    feed: (filters: DiscoverFilters, sortMode: DiscoverSortMode) =>
      ['discover', 'feed', filters, sortMode] as const,
    trends: () => ['discover', 'trends'] as const,
  },
  travelMoments: {
    infinite: (authorId: string, tag: string | null, fingerprint: string) =>
      ['travel-moments', 'infinite', authorId, tag, fingerprint] as const,
    likes: () => ['travel-moments', 'likes'] as const,
  },
  plans: {
    interactions: () => ['plans', 'interactions'] as const,
    mapPoints: (planId: string) => ['plans', 'map-points', planId] as const,
  },
  travelBuddies: {
    list: () => ['travel-buddies', 'list'] as const,
    messages: (buddyPostId: string, peerUserId: string) =>
      ['buddy-messages', buddyPostId, peerUserId] as const,
  },
  userPlans: {
    list: (params: { public?: boolean; userId?: string } = {}) =>
      ['user-plans', 'list', params] as const,
    detail: (id: string) => ['user-plans', 'detail', id] as const,
  },
  userAiSessions: {
    list: (params: { saved?: boolean; public?: boolean; userId?: string } = {}) =>
      ['user-ai-sessions', 'list', params] as const,
    detail: (id: string) => ['user-ai-sessions', 'detail', id] as const,
  },
  github: {
    zen: () => ['github', 'zen'] as const,
  },
} as const;
