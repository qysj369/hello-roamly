import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { fetchPlanInteractions } from '@/services/plans/planInteractionsApi';

export function usePlanInteractions(enabled = true) {
  return useQuery({
    queryKey: queryKeys.plans.interactions(),
    queryFn: fetchPlanInteractions,
    enabled,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
