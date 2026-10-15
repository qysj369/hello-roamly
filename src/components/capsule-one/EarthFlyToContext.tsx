import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { useEarthRoam } from '@/components/capsule-one/EarthRoamContext';
import {
  getEarthFlyDestination,
  type EarthFlyDestinationId,
  type OrbitSpherical,
} from '@/lib/capsule/earthFlyTo';

export type EarthFlight = {
  id: EarthFlyDestinationId;
  from: OrbitSpherical;
  to: OrbitSpherical;
  startedAt: number;
  durationMs: number;
};

type EarthFlyToContextValue = {
  selectedId: EarthFlyDestinationId | null;
  flying: boolean;
  pendingIdRef: { current: EarthFlyDestinationId | null };
  flightRef: { current: EarthFlight | null };
  requestFlyTo: (id: EarthFlyDestinationId) => void;
  cancelFly: () => void;
  markFlightEnded: () => void;
};

const EarthFlyToContext = createContext<EarthFlyToContextValue | null>(null);

export function EarthFlyToProvider({ children }: { children: ReactNode }) {
  const { stopRoam } = useEarthRoam();
  const [selectedId, setSelectedId] = useState<EarthFlyDestinationId | null>(null);
  const [flying, setFlying] = useState(false);
  const pendingIdRef = useRef<EarthFlyDestinationId | null>(null);
  const flightRef = useRef<EarthFlight | null>(null);

  const requestFlyTo = useCallback(
    (id: EarthFlyDestinationId) => {
      if (!getEarthFlyDestination(id)) {
        return;
      }
      stopRoam();
      pendingIdRef.current = id;
      flightRef.current = null;
      setSelectedId(id);
      setFlying(true);
    },
    [stopRoam],
  );

  const cancelFly = useCallback(() => {
    pendingIdRef.current = null;
    flightRef.current = null;
    setFlying(false);
    setSelectedId(null);
  }, []);

  const markFlightEnded = useCallback(() => {
    flightRef.current = null;
    pendingIdRef.current = null;
    setFlying(false);
  }, []);

  const value = useMemo(
    () => ({
      selectedId,
      flying,
      pendingIdRef,
      flightRef,
      requestFlyTo,
      cancelFly,
      markFlightEnded,
    }),
    [cancelFly, flying, markFlightEnded, requestFlyTo, selectedId],
  );

  return <EarthFlyToContext.Provider value={value}>{children}</EarthFlyToContext.Provider>;
}

export function useEarthFlyTo(): EarthFlyToContextValue {
  const value = useContext(EarthFlyToContext);
  if (!value) {
    throw new Error('useEarthFlyTo must be used within EarthFlyToProvider');
  }
  return value;
}
