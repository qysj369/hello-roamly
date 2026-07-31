import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { markCapsuleAiSession } from '@/lib/capsule/capsuleAiSession';
import { speakCapsuleSystemLine } from '@/lib/capsule/capsuleSystemVoice';
import { paths } from '@/router/paths';
import { useCapsuleOneStore } from '@/stores/capsuleOne/store';
import type { AiChatPageState } from '@/types/router-state';

export function useCapsuleLaunchToAi() {
  const navigate = useNavigate();
  const phase = useCapsuleOneStore((state) => state.phase);
  const lockedCity = useCapsuleOneStore((state) => state.lockedCity);
  const setPhase = useCapsuleOneStore((state) => state.setPhase);
  const triggerPulse = useCapsuleOneStore((state) => state.triggerPulse);

  return useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || phase === 'launching' || phase === 'processing') {
        return;
      }

      setPhase('launching');
      triggerPulse(1.4);
      markCapsuleAiSession();
      const mutedNow = useCapsuleOneStore.getState().muted;
      void speakCapsuleSystemLine('generatingReality', mutedNow);

      const state: AiChatPageState = {
        initialPrompt: trimmed,
        aiDream: trimmed,
        source: 'capsule_one',
        location: lockedCity
          ? { name: lockedCity.label, lng: lockedCity.lng, lat: lockedCity.lat }
          : undefined,
      };

      window.setTimeout(() => {
        navigate(paths.ai, { state });
      }, 1400);
    },
    [lockedCity, navigate, phase, setPhase, triggerPulse],
  );
}
