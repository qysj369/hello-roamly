import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { fetchUserPlanById } from '@/services/user/api/fetchUserPlanById';
import { fetchUserPlans } from '@/services/user/api/fetchUserPlans';
import type { ListUserPlansParams } from '@/types/api/userPlans';

export const userPlansListQueryKey = (params: ListUserPlansParams = {}) =>
  queryKeys.userPlans.list(params);

/** 用户方案列表（React Query） */
export function useUserPlans(params: ListUserPlansParams = {}) {
  return useQuery({
    queryKey: userPlansListQueryKey(params),
    queryFn: () => fetchUserPlans(params),
  });
}

/** 指定用户公开的穷游方案（他人主页） */
export function useUserPublicPlans(userId: string | undefined) {
  return useUserPlans({ userId, public: true });
}

export const userPlanDetailQueryKey = (id: string) => queryKeys.userPlans.detail(id);

/** 单个用户方案详情 */
export function useUserPlanDetail(planId: string | undefined) {
  return useQuery({
    queryKey: userPlanDetailQueryKey(planId ?? ''),
    queryFn: () => fetchUserPlanById(planId!),
    enabled: Boolean(planId),
  });
}
