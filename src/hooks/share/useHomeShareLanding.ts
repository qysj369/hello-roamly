import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  readHomeShareLanding,
  readShareLandingPlanHint,
} from '@/lib/home/homeShareLanding';
import { trackShareLandingView } from '@/lib/share/analytics/trackShareEvent';

export function useHomeShareLanding() {
  const location = useLocation();
  const attribution = useMemo(
    () => readHomeShareLanding(location.search),
    [location.search],
  );
  const hint = useMemo(
    () => readShareLandingPlanHint(location.search),
    [location.search],
  );
  const [dismissed, setDismissed] = useState(false);
  const city = hint.city;
  const dismiss = useCallback(() => setDismissed(true), []);

  useEffect(() => {
    if (!attribution) return;
    trackShareLandingView({
      contentKind: attribution.contentKind,
      contentId: attribution.contentId,
      channel: attribution.channel,
      shareUrl: typeof window !== 'undefined' ? window.location.href : undefined,
    });
  }, [attribution]);

  return {
    attribution,
    city,
    days: hint.days,
    party: hint.party,
    suggestedQuery: hint.suggestedQuery,
    search: location.search,
    visible: (Boolean(attribution) || Boolean(city)) && !dismissed,
    dismiss,
  };
}
