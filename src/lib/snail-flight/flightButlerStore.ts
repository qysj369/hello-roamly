import { create } from 'zustand';
import {
  isPackSwitchNotice,
  matchSnailFlightButler,
  SNAIL_FLIGHT_BUTLER_FALLBACK,
  SNAIL_FLIGHT_BUTLER_WELCOME,
} from '@/lib/snail-flight/butlerCommands';
import { useSnailFlightCaptionStore } from '@/lib/snail-flight/captionPackStore';

export type FlightButlerMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  kind?: 'pack-switch';
};

type FlightButlerState = {
  messages: FlightButlerMessage[];
  reset: () => void;
  send: (text: string) => void;
};

function uid(): string {
  return `flight-agent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function welcome(): FlightButlerMessage {
  return { id: 'flight-welcome', role: 'assistant', text: SNAIL_FLIGHT_BUTLER_WELCOME };
}

export const useFlightButlerStore = create<FlightButlerState>((set) => ({
  messages: [welcome()],
  reset: () => set({ messages: [welcome()] }),
  send: (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const hit = matchSnailFlightButler(trimmed, useSnailFlightCaptionStore.getState().progress);
    if (hit?.packId) {
      useSnailFlightCaptionStore.getState().setPack(hit.packId);
    }
    const replyText = hit?.message ?? SNAIL_FLIGHT_BUTLER_FALLBACK;
    const packSwitch = Boolean(hit?.packId) || isPackSwitchNotice(replyText);
    set((state) => {
      const kept = packSwitch
        ? state.messages.filter((item) => item.kind !== 'pack-switch')
        : state.messages;
      return {
        messages: [
          ...kept,
          { id: uid(), role: 'user', text: trimmed },
          {
            id: uid(),
            role: 'assistant',
            text: replyText,
            kind: packSwitch ? 'pack-switch' : undefined,
          },
        ],
      };
    });
  },
}));
