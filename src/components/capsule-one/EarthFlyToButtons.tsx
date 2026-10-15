import { EARTH_FLY_DESTINATIONS } from '@/lib/capsule/earthFlyTo';
import { useEarthFlyTo } from '@/components/capsule-one/EarthFlyToContext';

/** 左侧极简目的地，不进入 Three 场景 */
export default function EarthFlyToButtons() {
  const { selectedId, requestFlyTo } = useEarthFlyTo();

  return (
    <div className="earth-fly-to" role="group" aria-label="测试目的地">
      {EARTH_FLY_DESTINATIONS.map((city) => {
        const active = selectedId === city.id;
        return (
          <button
            key={city.id}
            type="button"
            className="earth-fly-to__btn"
            aria-pressed={active}
            onClick={() => requestFlyTo(city.id)}
          >
            {city.label}
          </button>
        );
      })}
    </div>
  );
}
