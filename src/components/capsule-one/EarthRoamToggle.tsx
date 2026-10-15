import { earthRoamToggleLabel } from '@/lib/capsule/earthRoamCamera';
import { useEarthFlyTo } from '@/components/capsule-one/EarthFlyToContext';
import { useEarthRoam } from '@/components/capsule-one/EarthRoamContext';

/** 右下角极简开关，不进入 Three 场景 */
export default function EarthRoamToggle() {
  const { mode, roaming, toggleRoam } = useEarthRoam();
  const { cancelFly } = useEarthFlyTo();
  const label = earthRoamToggleLabel(mode);

  return (
    <button
      type="button"
      className="earth-roam-toggle"
      aria-pressed={roaming}
      aria-label={label}
      onClick={() => {
        cancelFly();
        toggleRoam();
      }}
    >
      {label}
    </button>
  );
}
