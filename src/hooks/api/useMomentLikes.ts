import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { fetchMomentLikes } from '@/services/moments/momentLikesApi';

export function useMomentLikes(enabled = true) {
  return useQuery({
    queryKey: queryKeys.travelMoments.likes(),
    queryFn: fetchMomentLikes,
    enabled,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
