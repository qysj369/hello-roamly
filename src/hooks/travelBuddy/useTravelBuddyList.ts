import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { createTravelBuddyPost, fetchTravelBuddyList } from '@/services/travelBuddies/api';
import { queryKeys } from '@/lib/query/keys';
import type { CreateTravelBuddyRequest } from '@/types/api/travelBuddy';

export function useTravelBuddyList() {
  return useQuery({
    queryKey: queryKeys.travelBuddies.list(),
    queryFn: fetchTravelBuddyList,
    staleTime: 30_000,
  });
}

export function useCreateTravelBuddy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTravelBuddyRequest) => createTravelBuddyPost(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.travelBuddies.list() });
    },
  });
}
