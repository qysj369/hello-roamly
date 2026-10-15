import { SNAIL_FLIGHT_DISCLAIMER } from '@/lib/snail-flight/copy';
import type { SnailFlightNarration } from '@/lib/snail-flight/routes';

type SnailFlightHudProps = {
  progress: number;
  narration: SnailFlightNarration;
  captionsOn: boolean;
  muted: boolean;
  canMute: boolean;
  onExit: () => void;
  onToggleCaptions: () => void;
  onToggleMute: () => void;
};

export default function SnailFlightHud({
  progress,
  narration,
  captionsOn,
  muted,
  canMute,
  onExit,
  onToggleCaptions,
  onToggleMute,
}: SnailFlightHudProps) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  return (
    <div className="snail-flight__hud">
      <div className="snail-flight__top">
        <button type="button" className="snail-flight__exit" onClick={onExit}>
          退出
        </button>
        <div
          className="snail-flight__progress"
          role="progressbar"
          aria-label="飞行进度"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <span style={{ width: `${pct}%` }} />
        </div>
        <button
          type="button"
          className="snail-flight__icon-btn"
          onClick={onToggleCaptions}
          aria-pressed={captionsOn}
        >
          {captionsOn ? '关闭字幕' : '显示字幕'}
        </button>
        {canMute ? (
          <button
            type="button"
            className="snail-flight__icon-btn"
            onClick={onToggleMute}
            aria-pressed={!muted}
          >
            {muted ? '声关' : '静音'}
          </button>
        ) : null}
      </div>
      <div className="snail-flight__captions" hidden={!captionsOn}>
        <p className="snail-flight__captions-title">{narration.title}</p>
        {narration.lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <p className="snail-flight__disclaimer">{SNAIL_FLIGHT_DISCLAIMER}</p>
    </div>
  );
}
