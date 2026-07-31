import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { fetchGuideList } from '@/services/guides/list';
import type { ListGuidesParams } from '@/types/api/guides';

export const guideListQueryKey = (params: ListGuidesParams = {}) =>
  queryKeys.guides.list(params);

/** 攻略列表（React Query） */
export function useGuideList(params: ListGuidesParams = {}) {
  return useQuery({
    queryKey: guideListQueryKey(params),
    queryFn: () => fetchGuideList(params),
  });
}
