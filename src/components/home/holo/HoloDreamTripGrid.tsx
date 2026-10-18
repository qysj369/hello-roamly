import { holoDreamTripCards, type DreamTripIcon } from '@/data/holoDreamTripCards';
import { useI18n } from '@/i18n/useI18n';

function TripIcon({ name }: { name: DreamTripIcon }) {
  const stroke = {
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'cabin':
      return (
        <svg viewBox="0 0 24 24" aria-hidden className="holo-home__trip-icon">
          <path {...stroke} d="M4 12.5 12 5l8 7.5" />
          <path {...stroke} d="M7 11.5V19h10v-7.5" />
          <path {...stroke} d="M10 19v-4h4v4" />
        </svg>
      );
    case 'tent':
      return (
        <svg viewBox="0 0 24 24" aria-hidden className="holo-home__trip-icon">
          <path {...stroke} d="M12 4 3 19h18L12 4Z" />
          <path {...stroke} d="M12 4v15" />
        </svg>
      );
    case 'pottery':
      return (
        <svg viewBox="0 0 24 24" aria-hidden className="holo-home__trip-icon">
          <circle {...stroke} cx="8.5" cy="9" r="2.4" />
          <circle {...stroke} cx="15.5" cy="8.2" r="2.1" />
          <circle {...stroke} cx="12" cy="13.5" r="2.6" />
          <path {...stroke} d="M8.5 11.4v5.2M15.5 10.3v6.3M12 16.1V20" />
        </svg>
      );
    case 'raft':
      return (
        <svg viewBox="0 0 24 24" aria-hidden className="holo-home__trip-icon">
          <path {...stroke} d="M4 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
          <path {...stroke} d="M4 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
          <path {...stroke} d="M8 8c1.5 2 3 3.5 4 5" />
        </svg>
      );
    case 'bike':
      return (
        <svg viewBox="0 0 24 24" aria-hidden className="holo-home__trip-icon">
          <circle {...stroke} cx="6.5" cy="15.5" r="3" />
          <circle {...stroke} cx="17.5" cy="15.5" r="3" />
          <path {...stroke} d="M6.5 15.5 10 9h3l3 6.5M10 9l-2 6.5M13 9h4.5" />
        </svg>
      );
    case 'moon':
      return (
        <svg viewBox="0 0 24 24" aria-hidden className="holo-home__trip-icon">
          <path {...stroke} d="M15.5 4.5A7.5 7.5 0 1 0 19.5 15 6 6 0 0 1 15.5 4.5Z" />
        </svg>
      );
    default:
      return null;
  }
}

type HoloDreamTripGridProps = {
  ariaLabel: string;
  onSelectScene: (key: string) => void;
};

/** 漫游灵感：2×3 近郊小众场景六宫格（种草预览，不直接跑业务） */
export default function HoloDreamTripGrid({ ariaLabel, onSelectScene }: HoloDreamTripGridProps) {
  const { messages: t } = useI18n();

  return (
    <div className="holo-home__trip-grid" role="list" aria-label={ariaLabel}>
      {holoDreamTripCards.map((card) => {
        const copy = t.tripCards[card.key] ?? {
          title: card.title,
          subtitle: card.subtitle,
        };
        return (
          <button
            key={card.key}
            type="button"
            role="listitem"
            className="holo-home__trip-card"
            onClick={() => onSelectScene(card.key)}
          >
            <img
              className="holo-home__trip-photo"
              src={card.cover}
              alt=""
              loading="lazy"
              decoding="async"
              style={card.objectPosition ? { objectPosition: card.objectPosition } : undefined}
            />
            <span className="holo-home__trip-mask" aria-hidden />
            <span className="holo-home__trip-tag" aria-hidden>
              {card.liteTag}
            </span>
            <span className="holo-home__trip-copy">
              <span className="holo-home__trip-title-row">
                <TripIcon name={card.icon} />
                <span className="holo-home__trip-title">{copy.title}</span>
              </span>
              <span className="holo-home__trip-sub">{copy.subtitle}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
