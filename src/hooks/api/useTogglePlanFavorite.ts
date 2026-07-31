import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import {
  readPlanInteractionsStorage,
  writePlanInteractionsStorage,
  type StoredPlanInteractions,
} from '@/lib/storage/planInteractionsStorage';
import { togglePlanFavoriteApi } from '@/services/plans/planInteractionsApi';
import { awardPlanShellKeepIfFavorited } from '@/services/contribution/awardContribution';

/** 收藏：与 useTogglePlanLike 相同的乐观更新 + localStorage 模式 */
export function useTogglePlanFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => togglePlanFavoriteApi(planId),
    onMutate: async (planId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.plans.interactions() });

      const previous =
        queryClient.getQueryData<StoredPlanInteractions>(queryKeys.plans.interactions()) ??
        readPlanInteractionsStorage();

      const nextFavorited = previous.favorited.includes(planId)
        ? previous.favorited.filter((id) => id !== planId)
        : [...previous.favorited, planId];

      const isNowFavorited = !previous.favorited.includes(planId);
      awardPlanShellKeepIfFavorited(planId, isNowFavorited);

      const optimistic = { liked: previous.liked, favorited: nextFavorited };
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
