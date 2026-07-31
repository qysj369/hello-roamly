import type { TravelMoment } from '@/types/domain/user/userSocial';
import { filterMomentsByTag } from '@/utils/travelMomentFilter';

export const TRAVEL_MOMENTS_PAGE_SIZE = 2;

/** 演示用网络延迟（毫秒） */
export const TRAVEL_MOMENTS_FETCH_DELAY_MS = 380;

export type FetchTravelMomentsPageParams = {
  moments: TravelMoment[];
  offset: number;
  limit?: number;
  tag?: string | null;
};

export type FetchTravelMomentsPageResult = {
  items: TravelMoment[];
  nextOffset: number;
  hasMore: boolean;
  total: number;
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/** 分页拉取旅行瞬间（演示：客户端切片 + 模拟延迟，便于后续替换为真实 API） */
export async function fetchTravelMomentsPage(
  params: FetchTravelMomentsPageParams,
): Promise<FetchTravelMomentsPageResult> {
  // TODO: 改为请求服务端分页（offset/limit/tag），勿在客户端对全量 moments 切片
  const limit = params.limit ?? TRAVEL_MOMENTS_PAGE_SIZE;
  const filtered = filterMomentsByTag(params.moments, params.tag ?? null);
  const items = filtered.slice(params.offset, params.offset + limit);
  const nextOffset = params.offset + items.length;

  await delay(TRAVEL_MOMENTS_FETCH_DELAY_MS);

  return {
    items,
    nextOffset,
    hasMore: nextOffset < filtered.length,
    total: filtered.length,
  };
}
