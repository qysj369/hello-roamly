import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isInviteEnabled } from '@/lib/invite/config';
import { fetchInviteSummary } from '@/services/invite/inviteApi';

export const inviteSummaryQueryKey = (userId: string) => ['invite', 'summary', userId] as const;

export function useInviteSummary(userId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: inviteSummaryQueryKey(userId ?? ''),
    queryFn: () => fetchInviteSummary(userId!),
    enabled: Boolean(userId) && isInviteEnabled() && enabled,
    staleTime: 30_000,
  });
}

export function useInvalidateInviteSummary() {
  const client = useQueryClient();
  return (userId: string) => {
    void client.invalidateQueries({ queryKey: inviteSummaryQueryKey(userId) });
  };
}
