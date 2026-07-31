import { useCallback, useEffect } from 'react';
import { useAdvisorVoiceDialog } from '@/hooks/ai/useAdvisorVoiceDialog';
import { useCapsuleLaunchToAi } from '@/hooks/capsule/useCapsuleLaunchToAi';
import { useCapsuleOneStore } from '@/stores/capsuleOne/store';

/** Capsule 专用语音输入 — 同步预览、阶段联动、麦克风降级 */
export function useCapsuleVoiceInput() {
  const phase = useCapsuleOneStore((state) => state.phase);
  const lockedCity = useCapsuleOneStore((state) => state.lockedCity);
  const setPhase = useCapsuleOneStore((state) => state.setPhase);
  const setDraftText = useCapsuleOneStore((state) => state.setDraftText);
  const openInput = useCapsuleOneStore((state) => state.openInput);
  const launchToAi = useCapsuleLaunchToAi();

  const voice = useAdvisorVoiceDialog({
    onSend: (text) => {
      setDraftText(text);
      launchToAi(text);
    },
    isPaused: phase === 'launching' || phase === 'processing',
    skipInitialProbe: true,
  });

  useEffect(() => {
    if (!voice.active && !voice.recording) {
      return;
    }
    openInput();
    if (voice.preview) {
      setDraftText(voice.preview);
    }
  }, [openInput, setDraftText, voice.active, voice.preview, voice.recording]);

  const toggleMic = useCallback(async () => {
    if (voice.active || voice.recording) {
      voice.stop();
      setPhase('active');
      return;
    }

    setPhase('listening');
    await voice.toggle();

    if (!voice.supported) {
      setPhase('active');
      openInput();
    }
  }, [openInput, setPhase, voice]);

  const micBlockedHint = !voice.supported
    ? voice.error ??
      (typeof window !== 'undefined' && !window.isSecureContext
        ? '语音需 HTTPS，请先用文字输入（配置 SSL 后可用麦克风）'
        : '当前浏览器不支持语音，请用文字输入（Edge / Chrome 可开麦克风）')
    : null;

  const statusText =
    phase === 'launching'
      ? null
      : voice.active && voice.preview
        ? voice.preview
        : voice.active && voice.status
          ? voice.status
          : lockedCity && phase !== 'listening'
            ? `已锁定 · ${lockedCity.label}`
            : null;

  return {
    voice,
    toggleMic,
    lockedCity,
    micBlockedHint,
    statusText,
    isListening: voice.active || voice.recording,
  };
}
