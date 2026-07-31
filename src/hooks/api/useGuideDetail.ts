import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { fetchGuideDetail } from '@/services/guides/detail';

export const guideDetailQueryKey = (id: string) => queryKeys.guides.detail(id);

/** 攻略详情（React Query） */
export function useGuideDetail(id: string | undefined) {
  return useQuery({
    queryKey: guideDetailQueryKey(id ?? ''),
    queryFn: () => fetchGuideDetail(id!),
    enabled: Boolean(id?.trim()),
  });
}
