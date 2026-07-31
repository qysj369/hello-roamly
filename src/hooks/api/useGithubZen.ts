import { useQuery } from '@tanstack/react-query';
import { fetchGithubZen } from '@/services/github/zen';

export const githubZenQueryKey = ['github', 'zen'] as const;

/** 示例：React Query 封装远程接口 */
export function useGithubZen() {
  return useQuery({
    queryKey: githubZenQueryKey,
    queryFn: fetchGithubZen,
  });
}
