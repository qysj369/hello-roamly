import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  isEarthRoaming,
  nextModeOnOrbitStart,
  toggleEarthViewMode,
  type EarthViewMode,
} from '@/lib/capsule/earthRoamCamera';

type EarthRoamContextValue = {
  mode: EarthViewMode;
  roaming: boolean;
  toggleRoam: () => void;
  stopRoam: () => void;
  interruptRoamOnOrbitStart: () => void;
};

const EarthRoamContext = createContext<EarthRoamContextValue | null>(null);

export function EarthRoamProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<EarthViewMode>('manual');

  const toggleRoam = useCallback(() => {
    setMode((current) => toggleEarthViewMode(current));
  }, []);

  const stopRoam = useCallback(() => {
    setMode('manual');
  }, []);

  const interruptRoamOnOrbitStart = useCallback(() => {
    setMode((current) => nextModeOnOrbitStart(current));
  }, []);

  const value = useMemo(
    () => ({
      mode,
      roaming: isEarthRoaming(mode),
      toggleRoam,
      stopRoam,
      interruptRoamOnOrbitStart,
    }),
    [interruptRoamOnOrbitStart, mode, stopRoam, toggleRoam],
  );

  return <EarthRoamContext.Provider value={value}>{children}</EarthRoamContext.Provider>;
}

export function useEarthRoam(): EarthRoamContextValue {
  const value = useContext(EarthRoamContext);
  if (!value) {
    throw new Error('useEarthRoam must be used within EarthRoamProvider');
  }
  return value;
}
