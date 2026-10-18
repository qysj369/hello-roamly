import { useCallback, useEffect } from 'react';
import { useHomeMapSearchVoice } from '@/hooks/map/useHomeMapSearchVoice';
import { useI18n } from '@/i18n/useI18n';
import { formatInputLevelPercent } from '@/lib/browser/advisorMicrophoneDevices';
import { primePlanVoiceNarration } from '@/lib/browser/planVoiceNarration';
import { showGlobalApiError } from '@/stores/apiErrorStore';

import type { TravelVoiceExportKind } from '@/lib/home/travelVoiceIntent';

type HoloVoiceEntryProps = {
  /** nav=导航；fab=悬浮；search=Hero 搜索栏内 */
  placement: 'nav' | 'fab' | 'search';
  disabled?: boolean;
  /** 识别过程中实时回填搜索框 */
  onTranscriptChange?: (text: string) => void;
  /** 识别结束：语音一键规划（有城市则直接生成） */
  onRecognizedText?: (text: string) => void;
  /** 行程页：语音导出小红书 / 抖音 / 微信素材 */
  onExportIntent?: (kind: TravelVoiceExportKind) => void;
};

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="holo-home__voice-icon">
      <rect
        x="9"
        y="3.5"
        width="6"
        height="11"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M6.5 11.5a5.5 5.5 0 0 0 11 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M12 17v3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function VoiceLevelBars({ level }: { level: number }) {
  const bars = [0.35, 0.55, 0.85, 0.55, 0.35];
  const energy = Math.min(1, Math.max(0.08, level * 4));
  return (
    <span className="holo-home__voice-bars" aria-hidden>
      {bars.map((scale, index) => (
        <i
          key={index}
          className={`holo-home__voice-bar${level >= 0.001 ? ' is-live' : ''}`}
          style={{ transform: `scaleY(${0.25 + scale * energy})` }}
        />
      ))}
    </span>
  );
}

/**
 * 首页语音入口：讯飞流式听写；说完可停顿自动断句，也可点「说完了」。
 */
export default function HoloVoiceEntry({
  placement,
  disabled = false,
  onTranscriptChange,
  onRecognizedText,
  onExportIntent,
}: HoloVoiceEntryProps) {
  const { messages: t } = useI18n();

  const onRecognized = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      onTranscriptChange?.(trimmed);
      onRecognizedText?.(trimmed);
    },
    [onRecognizedText, onTranscriptChange],
  );

  const voice = useHomeMapSearchVoice({
    onRecognized,
    onExportIntent,
    disabled,
  });

  useEffect(() => {
    if (!voice.active) return;
    const preview = voice.preview?.trim();
    if (preview) onTranscriptChange?.(preview.replace(/^听到：/, ''));
  }, [voice.active, voice.preview, onTranscriptChange]);

  useEffect(() => {
    if (!voice.error) return;
    if (/麦克风权限|允许麦克风|语音服务|识别失败|网络/.test(voice.error)) {
      showGlobalApiError(voice.error);
    }
  }, [voice.error]);

  const busy = voice.processing;
  const active = voice.active;
  const listeningHint = '请大声说话；音量条跳动后停顿，或点「说完了」';

  const statusLine = active
    ? voice.error ||
      (voice.processing ? voice.status || '正在识别…' : null) ||
      (voice.preview ? `听到：${voice.preview.replace(/^听到：/, '')}` : null) ||
      voice.status ||
      listeningHint ||
      t.voice.listening
    : voice.error;

  return (
    <div
      className={`holo-home__voice holo-home__voice--${placement}${active ? ' is-active' : ''}${
        !voice.supported ? ' is-unsupported' : ''
      }`}
    >
      <button
        type="button"
        className="holo-home__voice-btn"
        disabled={(busy && !active) || disabled}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (disabled) return;
          if (!voice.supported) return;
          // 用户手势内预热并「解锁」TTS（空音量占位），否则后续朗读常被手机静音
          primePlanVoiceNarration();
          try {
            if ('speechSynthesis' in window) {
              const unlock = new SpeechSynthesisUtterance('嗯');
              unlock.lang = 'zh-CN';
              unlock.volume = 0.01;
              unlock.rate = 2;
              window.speechSynthesis.speak(unlock);
            }
          } catch {
            /* ignore */
          }
          voice.toggle();
        }}
        aria-label={
          !voice.supported
            ? t.voice.unsupported
            : active
              ? t.voice.closeVoice
              : t.voice.openVoice
        }
        aria-pressed={active}
        title={!voice.supported ? t.voice.unsupported : undefined}
      >
        {active ? <span className="holo-home__voice-ripple" aria-hidden /> : null}
        <MicIcon />
      </button>
      {active ? (
        <div className="holo-home__voice-meter" aria-hidden>
          <VoiceLevelBars level={voice.inputLevel} />
          <span className="holo-home__voice-level">{formatInputLevelPercent(voice.inputLevel)}</span>
        </div>
      ) : null}
      {statusLine ? (
        <p
          className={`holo-home__voice-status${voice.error ? ' is-error' : ''}`}
          role="status"
          aria-live="polite"
        >
          {statusLine}
        </p>
      ) : null}
      {active ? (
        <button
          type="button"
          className="holo-home__voice-finish"
          disabled={busy}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            voice.finishUtterance();
          }}
        >
          {t.voice.finish}
        </button>
      ) : null}
    </div>
  );
}
