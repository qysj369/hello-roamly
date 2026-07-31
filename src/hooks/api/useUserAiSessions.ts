import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { fetchUserAiSessions } from '@/services/user/api/userAiSessions';
import type { ListUserAiSessionsParams } from '@/types/api/userAiSessions';

export const userAiSessionsListQueryKey = (params: ListUserAiSessionsParams = {}) =>
  queryKeys.userAiSessions.list(params);

/** AI 会话列表（规划历史 / 已保存方案） */
export function useUserAiSessions(params: ListUserAiSessionsParams = {}) {
  return useQuery({
    queryKey: userAiSessionsListQueryKey(params),
    queryFn: () => fetchUserAiSessions(params),
  });
}

/** 规划历史侧边栏：当前用户全部会话 */
export function usePlanHistorySessions() {
  return useUserAiSessions();
}

/** 已保存方案（我的 AI 方案） */
export function useSavedAiSessions() {
  return useUserAiSessions({ saved: true });
}

/** 指定用户公开且已保存的方案 */
export function useUserPublicAiSessions(userId: string | undefined) {
  return useUserAiSessions({ userId, public: true });
}
