import { useCallback, useRef } from 'react';
import { useAdvisorVoiceDialog } from '@/hooks/ai/useAdvisorVoiceDialog';
import { requestAutoNarrateNextPlan, speakPlanVoiceNarration } from '@/lib/browser/planVoiceNarration';
import {
  classifyTravelVoiceIntent,
  TRAVEL_VOICE_NEED_PLAN,
  TRAVEL_VOICE_REFUSAL,
  type TravelVoiceExportKind,
} from '@/lib/home/travelVoiceIntent';
import { correctAdvisorSpeechIntent } from '@/lib/speech/advisorSpeechIntentCorrections';

export type UseHomeMapSearchVoiceOptions = {
  /** 识别完成后填入搜索并触发规划 */
  onRecognized: (text: string) => void | Promise<void>;
  /** 行程页：语音导出公域素材 */
  onExportIntent?: (kind: TravelVoiceExportKind) => void;
  /** 首页规划完成后自动播报碎片灵感；行程页改写自己播报 */
  markAutoNarrate?: boolean;
  disabled?: boolean;
};

/** 手机内置麦跳过逐设备探测，避免开麦慢半拍 */
function shouldSkipMicProbe(): boolean {
  if (typeof navigator === 'undefined') {
    return true;
  }
  return /Android|iPhone|iPad|iPod|Mobile|webOS/i.test(navigator.userAgent);
}

/** 首页搜索：语音 → 纠错 → 旅游意图校验 → 一键规划；识别成功后自动结束本轮收音 */
export function useHomeMapSearchVoice({
  onRecognized,
  onExportIntent,
  markAutoNarrate = true,
  disabled = false,
}: UseHomeMapSearchVoiceOptions) {
  const stopRef = useRef<(() => void) | null>(null);

  const handleSend = useCallback(
    async (raw: string) => {
      const text = correctAdvisorSpeechIntent(raw).trim();
      if (!text) {
        return;
      }
      try {
        const intent = classifyTravelVoiceIntent(text);
        if (intent === 'reject') {
          speakPlanVoiceNarration(TRAVEL_VOICE_REFUSAL, { immediate: true });
          return;
        }
        if (intent === 'export-xhs' || intent === 'export-douyin' || intent === 'export-wechat') {
          const kind = intent.slice('export-'.length) as TravelVoiceExportKind;
          if (onExportIntent) {
            onExportIntent(kind);
          } else {
            speakPlanVoiceNarration(TRAVEL_VOICE_NEED_PLAN, { immediate: true });
          }
          return;
        }
        if (markAutoNarrate) {
          requestAutoNarrateNextPlan();
        }
        await onRecognized(text);
      } finally {
        stopRef.current?.();
      }
    },
    [markAutoNarrate, onExportIntent, onRecognized],
  );

  const voice = useAdvisorVoiceDialog({
    onSend: handleSend,
    isPaused: disabled,
    // 移动端快开；台式机仍探测，避开静音 Philips
    skipInitialProbe: shouldSkipMicProbe(),
  });

  stopRef.current = voice.stop;

  return voice;
}
