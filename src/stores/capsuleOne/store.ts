import { create } from 'zustand';
import type { CapsuleCityPoint } from '@/data/capsuleHotRoutes';
import type { BlindBoxRequest } from '@/lib/capsule/blindBox';

export type CapsulePhase =
  | 'idle'
  | 'hover'
  | 'active'
  | 'listening'
  | 'typing'
  | 'processing'
  | 'launching';

type ShockwaveHit = {
  id: number;
  lat: number;
  lng: number;
};

type CapsuleOneState = {
  phase: CapsulePhase;
  lockedCity: CapsuleCityPoint | null;
  draftText: string;
  muted: boolean;
  pulseKey: number;
  earthBrightness: number;
  particleBoost: number;
  inputOpen: boolean;
  rippleHits: ShockwaveHit[];
  rippleId: number;
  blindBoxRequestId: number;
  blindBoxRequest: BlindBoxRequest | null;
  blindBoxActive: boolean;
  /** 地球应转向对准的经度；null 表示恢复自转 */
  earthFocusLng: number | null;
  setPhase: (phase: CapsulePhase) => void;
  lockCity: (city: CapsuleCityPoint) => void;
  clearCity: () => void;
  focusEarthOn: (lat: number, lng: number) => void;
  clearEarthFocus: () => void;
  setDraftText: (text: string) => void;
  openInput: () => void;
  closeInput: () => void;
  toggleMuted: () => void;
  triggerPulse: (intensity?: number) => void;
  addRipple: (lat: number, lng: number) => void;
  removeRipple: (id: number) => void;
  requestBlindBox: (request: BlindBoxRequest) => void;
  setBlindBoxActive: (active: boolean) => void;
  setEarthBrightness: (value: number) => void;
  setParticleBoost: (value: number) => void;
};

const MUTE_KEY = 'capsule-one-muted';

function readMuted(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }
  return window.localStorage.getItem(MUTE_KEY) === '1';
}

export const useCapsuleOneStore = create<CapsuleOneState>((set) => ({
  phase: 'idle',
  lockedCity: null,
  draftText: '',
  inputOpen: true,
  muted: readMuted(),
  pulseKey: 0,
  earthBrightness: 1,
  particleBoost: 1,
  rippleHits: [],
  rippleId: 0,
  blindBoxRequestId: 0,
  blindBoxRequest: null,
  blindBoxActive: false,
  earthFocusLng: null,
  setPhase: (phase) => set({ phase }),
  lockCity: (city) =>
    set({
      lockedCity: city,
      phase: 'active',
      earthFocusLng: city.lng,
    }),
  clearCity: () => set({ lockedCity: null, earthFocusLng: null }),
  focusEarthOn: (_lat, lng) => set({ earthFocusLng: lng }),
  clearEarthFocus: () => set({ earthFocusLng: null }),
  setDraftText: (draftText) => set({ draftText }),
  openInput: () => set({ inputOpen: true, phase: 'typing' }),
  closeInput: () => set({ inputOpen: false }),
  toggleMuted: () =>
    set((state) => {
      const muted = !state.muted;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
        if (muted) {
          void import('@/lib/capsule/capsuleSystemVoice').then(({ stopCapsuleSystemVoice }) => {
            stopCapsuleSystemVoice();
          });
        }
      }
      return { muted };
    }),
  triggerPulse: (intensity = 1) => {
    if (typeof window !== 'undefined') {
      const muted = useCapsuleOneStore.getState().muted;
      void import('@/lib/capsule/capsuleSystemVoice').then(({ playCapsulePulseChime }) => {
        playCapsulePulseChime(muted, intensity);
      });
    }
    set((state) => ({
      pulseKey: state.pulseKey + 1,
      earthBrightness: 1 + 0.08 * intensity,
      particleBoost: 1 + 0.18 * intensity,
    }));
  },
  addRipple: (lat, lng) =>
    set((state) => ({
      rippleId: state.rippleId + 1,
      rippleHits: [...state.rippleHits.slice(-4), { id: state.rippleId + 1, lat, lng }],
    })),
  removeRipple: (id) =>
    set((state) => ({
      rippleHits: state.rippleHits.filter((hit) => hit.id !== id),
    })),
  requestBlindBox: (request) =>
    set((state) => ({
      blindBoxRequestId: state.blindBoxRequestId + 1,
      blindBoxRequest: request,
    })),
  setBlindBoxActive: (blindBoxActive) => set({ blindBoxActive }),
  setEarthBrightness: (earthBrightness) => set({ earthBrightness }),
  setParticleBoost: (particleBoost) => set({ particleBoost }),
}));
