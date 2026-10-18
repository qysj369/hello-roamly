import { useEffect, useState } from 'react';
import type { PlanCityAtmosphere } from '@/lib/home/planCityAtmosphere';
import {
  PLAN_ASIDE_FOOD_PLACEHOLDER,
  PLAN_ASIDE_SCENERY_PLACEHOLDER,
  listPlanAsidePreviewCards,
} from '@/lib/home/planCityAtmosphere';

type HoloSearchPlanCityAsideProps = {
  atmosphere: PlanCityAtmosphere;
};

function AsidePhoto({
  src,
  fallback,
}: {
  src: string;
  fallback: string;
}) {
  const [current, setCurrent] = useState(src || fallback);
  useEffect(() => {
    setCurrent(src || fallback);
  }, [src, fallback]);
  return (
    <img
      src={current}
      alt=""
      loading="lazy"
      className="holo-home__plan-aside-photo"
      onError={() => {
        if (current === fallback) return;
        setCurrent(fallback);
      }}
    />
  );
}

/**
 * 行程弹窗美景/美食辅助栏：只浏览，不跳转、不联动。
 * PC 右侧固定栏，标题固定，图卡列表独立滚动。
 */
export default function HoloSearchPlanCityAside({ atmosphere }: HoloSearchPlanCityAsideProps) {
  const { cityName } = atmosphere;
  const cards = listPlanAsidePreviewCards(atmosphere);
  const empty = cards.length === 0;

  return (
    <aside className="holo-home__plan-aside" aria-label={`${cityName}美景与美食`}>
      <h4 className="holo-home__plan-aside-title">{cityName}美景与美食</h4>
      {empty ? (
        <p className="holo-home__plan-aside-empty">这城暂无配套实拍，先看左侧行程即可。</p>
      ) : (
        <div className="holo-home__plan-aside-list">
          {cards.map((card) => (
            <article key={card.key} className="holo-home__plan-aside-card">
              <AsidePhoto
                src={card.photoPath}
                fallback={card.variant === 'food' ? PLAN_ASIDE_FOOD_PLACEHOLDER : PLAN_ASIDE_SCENERY_PLACEHOLDER}
              />
              <p className="holo-home__plan-aside-name">{card.name}</p>
            </article>
          ))}
        </div>
      )}
    </aside>
  );
}
