import type { HoloTravelToolIcon } from '@/data/holoTravelTools';

const stroke = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** 慢行工具箱图标（8 宫格共用） */
export default function HoloToolIcon({ name }: { name: HoloTravelToolIcon }) {
  switch (name) {
    case 'suburb':
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path {...stroke} d="M4 18 12 6l8 12" />
          <path {...stroke} d="M8 18h8" />
        </svg>
      );
    case 'budget':
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <circle {...stroke} cx="12" cy="12" r="7.5" />
          <path {...stroke} d="M12 7.5v9M9.5 9.8c.6-1 1.7-1.5 2.8-1.5 1.6 0 2.7 1 2.7 2.3S13.9 13 12 13s-2.8.8-2.8 2.2c0 1.3 1.2 2.3 2.9 2.3 1.2 0 2.2-.5 2.8-1.4" />
        </svg>
      );
    case 'stories':
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <rect {...stroke} x="5" y="4" width="14" height="16" rx="2" />
          <path {...stroke} d="M8 9h8M8 13h6" />
        </svg>
      );
    case 'ai':
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <circle {...stroke} cx="12" cy="12" r="3.2" />
          <path {...stroke} d="M12 4.5v2.2M12 17.3v2.2M4.5 12h2.2M17.3 12h2.2M6.6 6.6l1.6 1.6M15.8 15.8l1.6 1.6M17.4 6.6l-1.6 1.6M8.2 15.8l-1.6 1.6" />
        </svg>
      );
    case 'cycling':
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <circle {...stroke} cx="6.5" cy="15.5" r="3" />
          <circle {...stroke} cx="17.5" cy="15.5" r="3" />
          <path {...stroke} d="M6.5 15.5 10 9h3l3 6.5M10 9l-2 6.5M13 9h4.5" />
        </svg>
      );
    case 'buddy':
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <circle {...stroke} cx="9" cy="9" r="3" />
          <circle {...stroke} cx="16" cy="10" r="2.4" />
          <path {...stroke} d="M3.8 18.5c1-3 2.9-4.5 5.2-4.5s4.2 1.5 5.2 4.5M13.2 14.2c1.4-.4 2.8-.2 4 .8" />
        </svg>
      );
    case 'camping':
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path {...stroke} d="M12 4 3 19h18L12 4Z" />
          <path {...stroke} d="M12 4v15" />
        </svg>
      );
    default:
      return null;
  }
}
