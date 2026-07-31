import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { isInviteEnabled } from '@/lib/invite/config';
import { normalizeInviteCode, parseInviteCodeFromSearch } from '@/lib/invite/inviteLink';
import { getPendingInviteCode, setPendingInviteCode } from '@/lib/invite/store';
import { getDemoInviteCodeForUser } from '@/data/demoInvite';
import { DEMO_CURRENT_USER_ID } from '@/data/demoUsers';

export function useInviteAttribution(): {
  pendingCode: string | null;
  dismiss: () => void;
} {
  const location = useLocation();
  const [pendingCode, setPending] = useState<string | null>(() =>
    isInviteEnabled() ? getPendingInviteCode() : null,
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isInviteEnabled()) {
      return;
    }

    const fromUrl = parseInviteCodeFromSearch(location.search);
    if (!fromUrl) {
      setPending(getPendingInviteCode());
      return;
    }

    const ownCode = getDemoInviteCodeForUser(DEMO_CURRENT_USER_ID);
    if (normalizeInviteCode(fromUrl) === normalizeInviteCode(ownCode)) {
      return;
    }

    setPendingInviteCode(fromUrl);
    setPending(fromUrl);
  }, [location.search]);

  return {
    pendingCode: dismissed ? null : pendingCode,
    dismiss: () => setDismissed(true),
  };
}
