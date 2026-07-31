import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import {
  readPlanInteractionsStorage,
  writePlanInteractionsStorage,
  type StoredPlanInteractions,
} from '@/lib/storage/planInteractionsStorage';
import { togglePlanLikeApi } from '@/services/plans/planInteractionsApi';
import { awardPlanSaltIfLiked } from '@/services/contribution/awardContribution';

/**
 * 点赞：乐观更新 React Query + localStorage，演示环境无后端也能即时反馈；
 * 失败回滚缓存与本地存储，onSettled 再与服务端/demo API 对齐。
 */
export function useTogglePlanLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => togglePlanLikeApi(planId),
    onMutate: async (planId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.plans.interactions() });

      const previous =
        queryClient.getQueryData<StoredPlanInteractions>(queryKeys.plans.interactions()) ??
        readPlanInteractionsStorage();

      const nextLiked = previous.liked.includes(planId)
        ? previous.liked.filter((id) => id !== planId)
        : [...previous.liked, planId];

      const isNowLiked = !previous.liked.includes(planId);
      awardPlanSaltIfLiked(planId, isNowLiked);

      const optimistic = { liked: nextLiked, favorited: previous.favorited };
      queryClient.setQueryData(queryKeys.plans.interactions(), optimistic);
      writePlanInteractionsStorage(optimistic.liked, optimistic.favorited);

      return { previous };
    },
    onError: (_error, _planId, context) => {
      if (context) {
        queryClient.setQueryData(queryKeys.plans.interactions(), context.previous);
        writePlanInteractionsStorage(context.previous.liked, context.previous.favorited);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.plans.interactions() });
    },
  });
}
