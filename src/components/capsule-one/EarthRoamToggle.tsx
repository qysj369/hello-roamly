import { earthRoamToggleLabel } from '@/lib/capsule/earthRoamCamera';
import { useEarthRoam } from '@/components/capsule-one/EarthRoamContext';

/** 右下角极简开关，不进入 Three 场景 */
export default function EarthRoamToggle() {
  const { mode, roaming, toggleRoam } = useEarthRoam();
  const label = earthRoamToggleLabel(mode);

  return (
    <button
      type="button"
      className="earth-roam-toggle"
      aria-pressed={roaming}
      aria-label={label}
      onClick={toggleRoam}
    >
      {label}
    </button>
  );
}
