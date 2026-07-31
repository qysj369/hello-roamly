import { useCallback } from 'react';
import { useAdvisorVoiceDialog } from '@/hooks/ai/useAdvisorVoiceDialog';
import { correctAdvisorSpeechIntent } from '@/lib/speech/advisorSpeechIntentCorrections';

export type UseHomeMapSearchVoiceOptions = {
  /** 识别完成后填入搜索并触发规划 */
  onRecognized: (text: string) => void | Promise<void>;
  disabled?: boolean;
};

/** 首页搜索：讯飞流式语音 → 纠错 → 一键规划 */
export function useHomeMapSearchVoice({ onRecognized, disabled = false }: UseHomeMapSearchVoiceOptions) {
  const handleSend = useCallback(
    async (raw: string) => {
      const text = correctAdvisorSpeechIntent(raw).trim();
      if (!text) {
        return;
      }
      await onRecognized(text);
    },
    [onRecognized],
  );

  return useAdvisorVoiceDialog({
    onSend: handleSend,
    isPaused: disabled,
    skipInitialProbe: true,
  });
}
