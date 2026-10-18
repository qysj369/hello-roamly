import { useCallback, useEffect, useRef, useState } from 'react';
import { companionSketchToSearchPlan } from '@/lib/snail-flight/companionPlan';
import {
  COMPANION_SKETCH_FAIL_HINT,
  COMPANION_SKETCH_LOADING,
  COMPANION_SKETCH_RETRY,
} from '@/lib/capsule/earthCompanionSketch';
import { fetchCompanionSketch } from '@/services/ai/api/fetchCompanionSketch';
import { useTravelAgentStore } from '@/stores/travelAgent/store';
import type { SnailFlightRoute } from '@/lib/snail-flight/routes';

type SnailFlightLandingPanelProps = {
  route: SnailFlightRoute;
  onReady?: () => void;
};

export default function SnailFlightLandingPanel({ route, onReady }: SnailFlightLandingPanelProps) {
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const pendingRef = useRef(false);
  const adoptPlan = useTravelAgentStore((state) => state.adoptPlan);

  const generate = useCallback(async () => {
    if (pendingRef.current) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    pendingRef.current = true;
    setLoading(true);
    setFailed(false);
    try {
      const text = await fetchCompanionSketch(
        { cityId: route.dest.id, cityLabel: route.dest.label },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      setPlan(text);
      adoptPlan(
        companionSketchToSearchPlan({
          startCity: route.origin.label,
          targetCity: route.dest.label,
          text,
        }),
      );
    } catch (error) {
      if (
        controller.signal.aborted ||
        (error instanceof DOMException && error.name === 'AbortError')
      ) {
        return;
      }
      setFailed(true);
      setPlan(null);
    } finally {
      pendingRef.current = false;
      setLoading(false);
    }
  }, [adoptPlan, route.dest.id, route.dest.label, route.origin.label]);

  useEffect(() => {
    generate().catch(() => undefined);
    return () => {
      abortRef.current?.abort();
    };
  }, [generate]);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
    <aside
      className="snail-flight-landing is-in"
      aria-label={`${route.dest.label}结伴旅行攻略`}
      aria-busy={loading}
    >
      <h2>{route.dest.label} · 好友结伴</h2>
      {plan ? (
        <p className="snail-flight-landing__plan">{plan}</p>
      ) : (
        <>
          <p>{failed ? COMPANION_SKETCH_FAIL_HINT : COMPANION_SKETCH_LOADING}</p>
          {failed ? (
            <button
              type="button"
              className="snail-flight-landing__retry"
              onClick={() => generate().catch(() => undefined)}
            >
              {COMPANION_SKETCH_RETRY}
            </button>
          ) : null}
        </>
      )}
    </aside>
  );
}
