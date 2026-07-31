import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { writeMomentLikesStorage } from '@/lib/storage/momentLikesStorage';
import { toggleMomentLikeApi } from '@/services/moments/momentLikesApi';
import { awardMomentSaltIfLiked } from '@/services/contribution/awardContribution';

export function useToggleMomentLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (momentId: string) => toggleMomentLikeApi(momentId),
    onMutate: async (momentId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.travelMoments.likes() });

      const previous =
        queryClient.getQueryData<string[]>(queryKeys.travelMoments.likes()) ?? [];

      const next = previous.includes(momentId)
        ? previous.filter((id) => id !== momentId)
        : [...previous, momentId];

      const isNowLiked = !previous.includes(momentId);
      awardMomentSaltIfLiked(momentId, isNowLiked);

      queryClient.setQueryData(queryKeys.travelMoments.likes(), next);
      writeMomentLikesStorage(next);

      return { previous };
    },
    onError: (_error, _momentId, context) => {
      if (context) {
        queryClient.setQueryData(queryKeys.travelMoments.likes(), context.previous);
        writeMomentLikesStorage(context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.travelMoments.likes() });
    },
  });
}
