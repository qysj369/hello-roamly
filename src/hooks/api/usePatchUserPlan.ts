import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { patchUserPlan } from '@/services/user/api/patchUserPlan';
import type { PatchUserPlanRequest } from '@/types/api/userPlans';

type PatchVariables = {
  planId: string;
  body: PatchUserPlanRequest;
};

export function usePatchUserPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, body }: PatchVariables) => patchUserPlan(planId, body),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['user-plans'] });
      void queryClient.invalidateQueries({ queryKey: ['user-ai-sessions'] });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.userPlans.detail(variables.planId),
      });
      void queryClient.invalidateQueries({ queryKey: ['discover', 'feed'] });
    },
  });
}
