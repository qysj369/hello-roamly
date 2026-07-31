import { AudioLines, Loader2 } from 'lucide-react';
import { formatInputLevelPercent } from '@/lib/browser/advisorMicrophoneDevices';
import type { useHomeMapSearchVoice } from '@/hooks/map/useHomeMapSearchVoice';
import { cn } from '@/utils/cn';

type VoiceState = ReturnType<typeof useHomeMapSearchVoice>;

type HomeMapSearchVoiceControlProps = {
  voice: VoiceState;
  disabled?: boolean;
  /** mic=仅麦克风按钮；strip=波纹与状态；all=垂直堆叠 */
  part?: 'mic' | 'strip' | 'all';
  className?: string;
};

function VoiceWaveBars({ level }: { level: number }) {
  const bars = [0.35, 0.55, 0.85, 0.55, 0.35];
  const energy = Math.min(1, Math.max(0.08, level * 4));

  return (
    <div className="home-map-search-voice__bars" aria-hidden>
      {bars.map((scale, index) => (
        <span
          key={index}
          className={cn(
            'home-map-search-voice__bar',
            level >= 0.001 ? 'home-map-search-voice__bar--live' : 'home-map-search-voice__bar--idle',
          )}
          style={{ transform: `scaleY(${0.25 + scale * energy})` }}
        />
      ))}
    </div>
  );
}

function VoiceMicButton({
  voice,
  disabled,
}: {
  voice: VoiceState;
  disabled: boolean;
}) {
  const busy = disabled || voice.processing;

  return (
    <button
      type="button"
      disabled={busy && !voice.active}
      onClick={() => voice.toggle()}
      className={cn(
        'home-map-search-voice__mic',
        voice.active && 'home-map-search-voice__mic--active',
        busy && !voice.active && 'opacity-60',
      )}
      aria-label={voice.active ? '关闭语音搜索' : '语音搜索'}
      aria-pressed={voice.active}
    >
      {voice.processing ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
      ) : (
        <AudioLines className="h-3.5 w-3.5" aria-hidden />
      )}
    </button>
  );
}

function VoiceStrip({ voice }: { voice: VoiceState }) {
  const statusLine =
    voice.error ||
    (voice.processing ? voice.status || '正在识别…' : null) ||
    (voice.active ? voice.preview || voice.status || '说出目的地与天数，停顿约 2 秒自动规划' : null);

  if (!voice.active && !statusLine) {
    return null;
  }

  return (
    <>
      {voice.active ? (
        <div className="home-map-search-voice__panel">
          <VoiceWaveBars level={voice.inputLevel} />
          <span className="home-map-search-voice__level">{formatInputLevelPercent(voice.inputLevel)}</span>
          {voice.requiresManualFinish ? (
            <button
              type="button"
              disabled={voice.processing}
              onClick={() => voice.finishUtterance()}
              className="home-map-search-voice__finish"
            >
              说完了
            </button>
          ) : null}
        </div>
      ) : null}
      {statusLine ? (
        <p
          className={cn(
            'home-map-search-voice__status',
            voice.error && 'home-map-search-voice__status--error',
          )}
          role="status"
          aria-live="polite"
        >
          {statusLine}
        </p>
      ) : null}
    </>
  );
}

/** 首页搜索：麦克风 + 紧凑语音波纹 */
export default function HomeMapSearchVoiceControl({
  voice,
  disabled = false,
  part = 'all',
  className,
}: HomeMapSearchVoiceControlProps) {
  if (!voice.supported) {
    return null;
  }

  if (part === 'mic') {
    return (
      <div className={cn('home-map-search-voice home-map-search-voice--mic-only', className)}>
        <VoiceMicButton voice={voice} disabled={disabled} />
      </div>
    );
  }

  if (part === 'strip') {
    return (
      <div className={cn('home-map-search-voice home-map-search-voice--strip', className)}>
        <VoiceStrip voice={voice} />
      </div>
    );
  }

  return (
    <div className={cn('home-map-search-voice', className)}>
      <VoiceMicButton voice={voice} disabled={disabled} />
      <VoiceStrip voice={voice} />
    </div>
  );
}
