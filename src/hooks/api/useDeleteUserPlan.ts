import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { deleteUserPlan } from '@/services/user/api/deleteUserPlan';

export function useDeleteUserPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => deleteUserPlan(planId),
    onSuccess: (_data, planId) => {
      void queryClient.invalidateQueries({ queryKey: ['user-plans'] });
      void queryClient.invalidateQueries({ queryKey: ['user-ai-sessions'] });
      queryClient.removeQueries({ queryKey: queryKeys.userPlans.detail(planId) });
      void queryClient.invalidateQueries({ queryKey: ['discover', 'feed'] });
    },
  });
}
