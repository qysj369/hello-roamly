import { create } from 'zustand';
import {
  DEFAULT_CAPTION_PACK,
  isCaptionPackId,
  type CaptionPackId,
} from '@/lib/snail-flight/captionPacks';

const SESSION_KEY = 'hello-roamly.snail-flight.caption-pack';

function readStoredPack(): CaptionPackId {
  if (typeof sessionStorage === 'undefined') return DEFAULT_CAPTION_PACK;
  try {
    const value = sessionStorage.getItem(SESSION_KEY);
    return isCaptionPackId(value) ? value : DEFAULT_CAPTION_PACK;
  } catch {
    return DEFAULT_CAPTION_PACK;
  }
}

function persistPack(packId: CaptionPackId): void {
  try {
    sessionStorage.setItem(SESSION_KEY, packId);
  } catch {
    /* private mode */
  }
}

type CaptionPackState = {
  packId: CaptionPackId;
  progress: number;
  setPack: (packId: CaptionPackId) => void;
  setProgress: (progress: number) => void;
};

export const useSnailFlightCaptionStore = create<CaptionPackState>((set, get) => ({
  packId: readStoredPack(),
  progress: 0,
  setPack: (packId) => {
    if (packId === get().packId) return;
    persistPack(packId);
    set({ packId });
  },
  setProgress: (progress) => {
    const next = Math.min(1, Math.max(0, progress));
    if (Math.abs(get().progress - next) < 0.004) return;
    set({ progress: next });
  },
}));
