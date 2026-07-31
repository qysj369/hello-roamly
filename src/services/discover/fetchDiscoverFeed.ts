import type { DiscoverFilters, DiscoverSortMode, RecommendedDiscoverItem } from '@/types/domain/discover';

import { buildDiscoverFeed } from '@/utils/discoverContent';

import { fetchUserAiSessions } from '@/services/user/api/userAiSessions';



const DISCOVER_FEED_DELAY_MS = 80;



function delay(ms: number): Promise<void> {

  return new Promise((resolve) => {

    window.setTimeout(resolve, ms);

  });

}



/** 拉取发现页 feed（TanStack Query 用） */

export async function fetchDiscoverFeed(

  filters: DiscoverFilters,

  sortMode: DiscoverSortMode,

): Promise<RecommendedDiscoverItem[]> {

  let publicSavedSessions: Awaited<ReturnType<typeof fetchUserAiSessions>>['items'] = [];

  try {

    const response = await fetchUserAiSessions({ public: true });

    publicSavedSessions = response.items;

  } catch {

    publicSavedSessions = [];

  }



  await delay(DISCOVER_FEED_DELAY_MS);

  return buildDiscoverFeed(filters, sortMode, publicSavedSessions);

}

