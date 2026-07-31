import type { DriveSpeedPreset } from '@/lib/drive/driveSpeed';
import { DRIVE_SPEED_PRESETS } from '@/lib/drive/driveSpeed';

export type DriveHudLabels = {
  speedUnit: string;
  tempLabel: string;
  tempLoading: string;
  tempUnavailable: string;
  play: string;
  pause: string;
  speedSnail: string;
  speedCruise: string;
  speedSport: string;
  hint: string;
  roadEnd: string;
};

type DriveHudProps = {
  speedId: DriveSpeedPreset['id'];
  /** 随路况起伏的实时车速 */
  liveSpeedKmh: number;
  playing: boolean;
  ready: boolean;
  roadEnded: boolean;
  temperatureC: number | null;
  weatherText: string;
  weatherLoading: boolean;
  labels: DriveHudLabels;
  onTogglePlay: () => void;
  onSpeedChange: (id: DriveSpeedPreset['id']) => void;
};

const SPEED_LABEL_KEY: Record<DriveSpeedPreset['id'], keyof DriveHudLabels> = {
  snail: 'speedSnail',
  cruise: 'speedCruise',
  sport: 'speedSport',
};

/** 驾驶舱 HUD：实时车速、外温、启停与驾驶风格 */
export default function DriveHud({
  speedId,
  liveSpeedKmh,
  playing,
  ready,
  roadEnded,
  temperatureC,
  weatherText,
  weatherLoading,
  labels,
  onTogglePlay,
  onSpeedChange,
}: DriveHudProps) {
  const tempDisplay = weatherLoading
    ? labels.tempLoading
    : temperatureC != null
      ? `${Math.round(temperatureC)}℃`
      : labels.tempUnavailable;

  return (
    <div className="holo-drive__hud" aria-label="驾驶舱仪表">
      <div className="holo-drive__hud-glass" aria-hidden />

      <div className="holo-drive__hud-top">
        <div className="holo-drive__gauge holo-drive__gauge--temp">
          <span className="holo-drive__gauge-label">{labels.tempLabel}</span>
          <strong className="holo-drive__gauge-value">{tempDisplay}</strong>
          {weatherText && !weatherLoading ? (
            <span className="holo-drive__gauge-sub">{weatherText}</span>
          ) : null}
        </div>

        <div className="holo-drive__gauge holo-drive__gauge--speed" aria-live="polite">
          <strong className="holo-drive__speed-num">
            {ready && playing ? liveSpeedKmh : ready ? 0 : '—'}
          </strong>
          <span className="holo-drive__speed-unit">{labels.speedUnit}</span>
        </div>
      </div>

      <div className="holo-drive__dash">
        <div className="holo-drive__dash-hint">
          {roadEnded ? labels.roadEnd : labels.hint}
        </div>

        <div className="holo-drive__dash-controls">
          <button
            type="button"
            className={`holo-drive__play ${playing ? 'is-playing' : ''}`}
            onClick={onTogglePlay}
            disabled={!ready}
            aria-pressed={playing}
          >
            {playing ? labels.pause : labels.play}
          </button>

          <div className="holo-drive__speed-presets" role="group" aria-label="驾驶风格">
            {DRIVE_SPEED_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`holo-drive__speed-chip ${speedId === preset.id ? 'is-active' : ''}`}
                onClick={() => onSpeedChange(preset.id)}
                disabled={!ready}
              >
                {labels[SPEED_LABEL_KEY[preset.id]]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
