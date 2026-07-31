import { Sparkles } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BLIND_BOX_BUTTON_LABEL,
  BLIND_BOX_NO_SIGNAL_HINT,
  BLIND_BOX_NO_SIGNAL_TITLE,
  BLIND_BOX_RANDOM_HINT,
  BLIND_BOX_RANDOM_SCAN_LABEL,
  BLIND_BOX_REGION_HINT,
  BLIND_BOX_REGION_SCAN_LABEL,
  blindBoxJourneyEyebrow,
  blindBoxJourneyRoute,
  getBlindBoxRandomEyebrow,
} from '@/components/capsule-one/capsulePrompts';
import type { BlindBoxCity } from '@/data/blindBoxCities';
import {
  blindBoxCityToCapsulePoint,
  BLIND_BOX_RANDOM_SCAN_MS,
  BLIND_BOX_REGION_SCAN_MS,
  drawBlindBoxCity,
  planRegionalBlindBoxJourney,
  getBlindBoxPulseIntensity,
  getBlindBoxRarityClass,
  type BlindBoxMode,
} from '@/lib/capsule/blindBox';
import {
  playCapsuleCityLockChime,
  speakCapsuleSystemLine,
} from '@/lib/capsule/capsuleSystemVoice';
import { useCapsuleOneStore } from '@/stores/capsuleOne/store';

type BlindBoxPhase = 'idle' | 'scanning' | 'result' | 'fade-out' | 'no-signal';

const TYPEWRITER_MS = 45;
const DISPLAY_MS = 4200;
const FADE_MS = 500;
const NO_SIGNAL_MS = 3000;

function useTypewriter(text: string, active: boolean, intervalMs = TYPEWRITER_MS): string {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!active) {
      setValue('');
      return;
    }

    setValue('');
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setValue(text.slice(0, index));
      if (index >= text.length) {
        window.clearInterval(timer);
      }
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [active, intervalMs, text]);

  return value;
}

function ScanProgress({ durationMs }: { durationMs: number }) {
  return (
    <div className="capsule-blindbox__progress" aria-hidden>
      <span
        className="capsule-blindbox__progress-bar"
        style={{ animationDuration: `${durationMs}ms` }}
      />
    </div>
  );
}

/** 旅行盲盒浮层 — 地球区域扫描 + 按钮完全随机 */
export default function CapsuleBlindBox() {
  const phase = useCapsuleOneStore((state) => state.phase);
  const blindBoxRequestId = useCapsuleOneStore((state) => state.blindBoxRequestId);
  const blindBoxRequest = useCapsuleOneStore((state) => state.blindBoxRequest);
  const lockCity = useCapsuleOneStore((state) => state.lockCity);
  const addRipple = useCapsuleOneStore((state) => state.addRipple);
  const triggerPulse = useCapsuleOneStore((state) => state.triggerPulse);
  const openInput = useCapsuleOneStore((state) => state.openInput);
  const closeInput = useCapsuleOneStore((state) => state.closeInput);
  const clearCity = useCapsuleOneStore((state) => state.clearCity);
  const setBlindBoxActive = useCapsuleOneStore((state) => state.setBlindBoxActive);
  const requestBlindBox = useCapsuleOneStore((state) => state.requestBlindBox);

  const [boxPhase, setBoxPhase] = useState<BlindBoxPhase>('idle');
  const [result, setResult] = useState<BlindBoxCity | null>(null);
  const [activeMode, setActiveMode] = useState<BlindBoxMode>('random');
  const [regionDistanceKm, setRegionDistanceKm] = useState<number | null>(null);
  const [departureLabel, setDepartureLabel] = useState<string | null>(null);
  const timersRef = useRef<number[]>([]);
  const lastRequestRef = useRef(0);

  const typedCityName = useTypewriter(result?.name ?? '', boxPhase === 'result' || boxPhase === 'fade-out');

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const closeBlindBox = useCallback(() => {
    setBlindBoxActive(false);
    setBoxPhase('idle');
    setResult(null);
    setRegionDistanceKm(null);
    setDepartureLabel(null);
    openInput();
  }, [openInput, setBlindBoxActive]);

  const revealCity = useCallback(
    (
      city: BlindBoxCity,
      mode: BlindBoxMode,
      options?: { distanceKm?: number; departure?: string },
    ) => {
      clearTimers();
      closeInput();
      setBlindBoxActive(true);
      setActiveMode(mode);
      setRegionDistanceKm(mode === 'region' ? (options?.distanceKm ?? null) : null);
      setDepartureLabel(mode === 'region' ? (options?.departure ?? null) : null);
      setResult(city);
      setBoxPhase('result');

      const capsulePoint = blindBoxCityToCapsulePoint(city);
      lockCity(capsulePoint);
      addRipple(city.lat, city.lng);
      triggerPulse(getBlindBoxPulseIntensity(city.rarity));

      const muted = useCapsuleOneStore.getState().muted;
      playCapsuleCityLockChime(muted);
      void speakCapsuleSystemLine('destinationConfirmed', muted);

      const fadeTimer = window.setTimeout(() => {
        setBoxPhase('fade-out');
      }, DISPLAY_MS);
      timersRef.current.push(fadeTimer);

      const closeTimer = window.setTimeout(() => {
        closeBlindBox();
      }, DISPLAY_MS + FADE_MS);
      timersRef.current.push(closeTimer);
    },
    [addRipple, clearTimers, closeBlindBox, closeInput, lockCity, setBlindBoxActive, triggerPulse],
  );

  const showNoSignal = useCallback(() => {
    clearTimers();
    closeInput();
    setBlindBoxActive(true);
    setActiveMode('region');
    setResult(null);
    setBoxPhase('no-signal');

    const closeTimer = window.setTimeout(() => {
      setBlindBoxActive(false);
      setBoxPhase('idle');
    }, NO_SIGNAL_MS);
    timersRef.current.push(closeTimer);
  }, [clearTimers, closeInput, setBlindBoxActive]);

  const startScan = useCallback(
    (mode: BlindBoxMode, lat?: number, lng?: number) => {
      if (boxPhase !== 'idle' || phase === 'launching' || phase === 'processing') {
        return;
      }

      clearCity();
      clearTimers();
      closeInput();
      setBlindBoxActive(true);
      setActiveMode(mode);
      setResult(null);
      setBoxPhase('scanning');

      if (mode === 'region' && lat != null && lng != null) {
        addRipple(lat, lng);
      }

      const scanMs = mode === 'region' ? BLIND_BOX_REGION_SCAN_MS : BLIND_BOX_RANDOM_SCAN_MS;
      const scanTimer = window.setTimeout(() => {
        if (mode === 'random') {
          revealCity(drawBlindBoxCity(), 'random');
          return;
        }

        if (lat == null || lng == null) {
          showNoSignal();
          return;
        }

        const journey = planRegionalBlindBoxJourney(lat, lng);
        if (!journey) {
          showNoSignal();
          return;
        }
        revealCity(journey.destination, 'region', {
          distanceKm: journey.distanceKm,
          departure: journey.departureLabel,
        });
      }, scanMs);
      timersRef.current.push(scanTimer);
    },
    [
      addRipple,
      boxPhase,
      clearCity,
      clearTimers,
      closeInput,
      phase,
      revealCity,
      setBlindBoxActive,
      showNoSignal,
    ],
  );

  const handleIncomingRequest = useCallback(() => {
    if (!blindBoxRequest) {
      return;
    }

    if (blindBoxRequest.mode === 'random') {
      startScan('random');
      return;
    }

    if (blindBoxRequest.lat == null || blindBoxRequest.lng == null) {
      return;
    }

    startScan('region', blindBoxRequest.lat, blindBoxRequest.lng);
  }, [blindBoxRequest, startScan]);

  useEffect(() => {
    if (blindBoxRequestId > lastRequestRef.current) {
      lastRequestRef.current = blindBoxRequestId;
      handleIncomingRequest();
    }
  }, [blindBoxRequestId, handleIncomingRequest]);

  const isBusy = boxPhase !== 'idle';
  const isDisabled = isBusy || phase === 'launching' || phase === 'processing';
  const rarityClass = result ? getBlindBoxRarityClass(result.rarity) : '';
  const scanDurationMs =
    activeMode === 'region' ? BLIND_BOX_REGION_SCAN_MS : BLIND_BOX_RANDOM_SCAN_MS;

  const eyebrow =
    boxPhase === 'result' || boxPhase === 'fade-out'
      ? activeMode === 'region' && regionDistanceKm != null
        ? blindBoxJourneyEyebrow(regionDistanceKm)
        : getBlindBoxRandomEyebrow(result!.rarity)
      : '';

  const journeyRoute =
    activeMode === 'region' && departureLabel && result
      ? blindBoxJourneyRoute(departureLabel, result.name)
      : '';

  const resultHint = activeMode === 'region' ? BLIND_BOX_REGION_HINT : BLIND_BOX_RANDOM_HINT;

  const overlay =
    boxPhase === 'scanning' ? (
      <div
        className={`blind-box-overlay blind-box-overlay--scanning blind-box-overlay--${activeMode}`}
        role="status"
        aria-live="polite"
      >
        <div className="capsule-toast">
          <p className="capsule-toast__eyebrow">
            {activeMode === 'region' ? BLIND_BOX_REGION_SCAN_LABEL : BLIND_BOX_RANDOM_SCAN_LABEL}
          </p>
          <p className="capsule-toast__title">
            {activeMode === 'region' ? '正在扫描此区域…' : '正在抽取目的地…'}
          </p>
          <ScanProgress durationMs={scanDurationMs} />
        </div>
      </div>
    ) : boxPhase === 'no-signal' ? (
      <div className="blind-box-overlay blind-box-overlay--no-signal" role="status" aria-live="polite">
        <div className="capsule-toast capsule-toast--muted">
          <p className="capsule-toast__title">{BLIND_BOX_NO_SIGNAL_TITLE}</p>
          <p className="capsule-toast__hint">{BLIND_BOX_NO_SIGNAL_HINT}</p>
        </div>
      </div>
    ) : boxPhase !== 'idle' && result ? (
      <div
        className={`blind-box-overlay blind-box-overlay--seal ${activeMode === 'region' ? 'blind-box-overlay--region' : ''} ${rarityClass} ${boxPhase === 'fade-out' ? 'fade-out' : ''}`}
        data-rarity={result.rarity}
        data-mode={activeMode}
        role="status"
        aria-live="polite"
      >
        <div className="ink-seal-stamp">
          <div className="ink-seal-stamp__texture" aria-hidden />
          <div className="ink-seal-stamp__body">
            <p className="capsule-blindbox__eyebrow">{eyebrow}</p>
            {activeMode === 'region' && journeyRoute ? (
              <p className="capsule-blindbox__route">{journeyRoute}</p>
            ) : (
              <p className="ink-seal-stamp__city">{typedCityName}</p>
            )}
            <p className="ink-seal-stamp__tagline">{result.tagline}</p>
            <p className="ink-seal-stamp__hint">{resultHint}</p>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <>
      <button
        type="button"
        className={`capsule-action-btn capsule-blindbox-btn ${isBusy ? 'capsule-blindbox-btn--busy' : ''}`}
        aria-label={BLIND_BOX_BUTTON_LABEL}
        title={BLIND_BOX_BUTTON_LABEL}
        disabled={isDisabled}
        onClick={() => requestBlindBox({ mode: 'random' })}
      >
        <Sparkles className="h-4 w-4" aria-hidden />
      </button>

      {typeof document !== 'undefined' ? createPortal(overlay, document.body) : overlay}
    </>
  );
}
