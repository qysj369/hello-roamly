import { getEarthFlyDestination } from '@/lib/capsule/earthFlyTo';
import { useEarthFlyTo } from '@/components/capsule-one/EarthFlyToContext';

/** 飞抵后侧边文字卡，不进入 Three 场景、不加图 */
export default function EarthFlyArrivalPanel() {
  const { panelId, closePanel } = useEarthFlyTo();
  const city = panelId ? getEarthFlyDestination(panelId) : null;

  if (!city) {
    return null;
  }

  return (
    <aside className="earth-fly-card" aria-label={city.label}>
      <button type="button" className="earth-fly-card__close" aria-label="关闭" onClick={closePanel}>
        ×
      </button>
      <p className="earth-fly-card__title">{city.label}</p>
      <p className="earth-fly-card__blurb">{city.blurb}</p>
    </aside>
  );
}
