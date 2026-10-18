import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  dismissSideRail,
  isSideRailDismissed,
  type HoloHomeSideRailItem,
} from '@/data/holoHomeSideRails';

type HoloHomeSideRailProps = {
  side: 'left' | 'right';
  item: HoloHomeSideRailItem | null;
  /** 视口是否达到配置的最小宽度 */
  viewportReady: boolean;
};

/**
 * 宽屏侧栏槽位。无有效配置 / 未到宽屏断点时不渲染（不占位、不影响主栏）。
 */
export default function HoloHomeSideRail({ side, item, viewportReady }: HoloHomeSideRailProps) {
  const [dismissed, setDismissed] = useState(() =>
    item?.dismissible ? isSideRailDismissed(item.id) : false,
  );

  if (!viewportReady || !item || dismissed) return null;

  const media = item.imageUrl ? (
    <img className="holo-home__side-rail-img" src={item.imageUrl} alt="" loading="lazy" decoding="async" />
  ) : null;

  const copy =
    item.title || item.subtitle ? (
      <span className="holo-home__side-rail-copy">
        {item.title ? <span className="holo-home__side-rail-title">{item.title}</span> : null}
        {item.subtitle ? <span className="holo-home__side-rail-sub">{item.subtitle}</span> : null}
      </span>
    ) : null;

  const inner = (
    <>
      {media}
      {copy}
    </>
  );

  const onDismiss = () => {
    dismissSideRail(item.id);
    setDismissed(true);
  };

  const cardClass = 'holo-home__side-rail-card';
  const card = item.href ? (
    item.external || /^https?:\/\//i.test(item.href) ? (
      <a className={cardClass} href={item.href} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    ) : (
      <Link className={cardClass} to={item.href}>
        {inner}
      </Link>
    )
  ) : (
    <div className={`${cardClass} holo-home__side-rail-card--static`}>{inner}</div>
  );

  return (
    <aside
      className={`holo-home__side-rail holo-home__side-rail--${side} is-active`}
      data-rail={side}
      data-rail-kind={item.kind}
      aria-label={item.title || (side === 'left' ? '左侧推荐' : '右侧推荐')}
    >
      <div className="holo-home__side-rail-shell">
        {item.dismissible ? (
          <button type="button" className="holo-home__side-rail-close" aria-label="关闭" onClick={onDismiss}>
            ×
          </button>
        ) : null}
        {card}
      </div>
    </aside>
  );
}
