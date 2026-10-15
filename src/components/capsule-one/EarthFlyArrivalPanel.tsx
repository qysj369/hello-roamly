import { useCallback, useEffect, useRef, useState } from 'react';
import { getEarthFlyDestination } from '@/lib/capsule/earthFlyTo';
import {
  COMPANION_SKETCH_BUTTON,
  COMPANION_SKETCH_FAIL_HINT,
  COMPANION_SKETCH_LOADING,
  COMPANION_SKETCH_RETRY,
} from '@/lib/capsule/earthCompanionSketch';
import { useEarthFlyTo } from '@/components/capsule-one/EarthFlyToContext';
import { fetchCompanionSketch } from '@/services/ai/api/fetchCompanionSketch';

/** 飞抵后侧边文字卡；行程请求可取消，不进 Three 场景 */
export default function EarthFlyArrivalPanel() {
  const { panelId, closePanel } = useEarthFlyTo();
  const city = panelId ? getEarthFlyDestination(panelId) : null;
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const pendingRef = useRef(false);

  useEffect(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    pendingRef.current = false;
    setPlan(null);
    setLoading(false);
    setFailed(false);
  }, [panelId]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const generate = useCallback(async () => {
    if (!city || pendingRef.current) {
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    pendingRef.current = true;
    setLoading(true);
    setFailed(false);
    try {
      const text = await fetchCompanionSketch(city.id, controller.signal);
      if (controller.signal.aborted) {
        return;
      }
      setPlan(text);
    } catch (error) {
      if (controller.signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) {
        return;
      }
      setFailed(true);
      setPlan(null);
    } finally {
      pendingRef.current = false;
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [city]);

  if (!city) {
    return null;
  }

  return (
    <aside className="earth-fly-card" aria-label={city.label} aria-busy={loading}>
      <button type="button" className="earth-fly-card__close" aria-label="关闭" onClick={closePanel}>
        ×
      </button>
      <p className="earth-fly-card__title">{city.label}</p>
      {plan ? (
        <p className="earth-fly-card__plan">{plan}</p>
      ) : (
        <>
          {failed ? (
            <p className="earth-fly-card__blurb">{COMPANION_SKETCH_FAIL_HINT}</p>
          ) : (
            <p className="earth-fly-card__blurb">{city.blurb}</p>
          )}
          <button
            type="button"
            className="earth-fly-card__action"
            disabled={loading}
            onClick={() => void generate()}
          >
            {loading ? COMPANION_SKETCH_LOADING : failed ? COMPANION_SKETCH_RETRY : COMPANION_SKETCH_BUTTON}
          </button>
        </>
      )}
    </aside>
  );
}
