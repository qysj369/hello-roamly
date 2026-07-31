import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import {
  handleMutationApiError,
  handleQueryApiError,
  isRetryableApiError,
} from '@/lib/api/handleApiError';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      handleQueryApiError(error, query.queryKey);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      handleMutationApiError(error, mutation.options.mutationKey);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: (failureCount, error) => failureCount < 1 && isRetryableApiError(error),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
