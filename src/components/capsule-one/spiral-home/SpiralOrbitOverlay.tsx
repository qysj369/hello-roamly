import { useId } from 'react';

const WAYPOINTS = [
  { id: 'jinan', label: '济南历下', x: '42%', y: '28%' },
  { id: 'zibo', label: '淄博', x: '26%', y: '44%' },
  { id: 'weifang', label: '潍坊', x: '32%', y: '68%' },
  { id: 'laizhou', label: '莱州湾', x: '52%', y: '80%' },
  { id: 'qingdao', label: '青岛', x: '70%', y: '56%' },
] as const;

/** 航点 + 轻量 SVG 螺旋光轨。CSS 描边流动，禁止粒子系统 / Three 内核 */
export default function SpiralOrbitOverlay() {
  const uid = useId().replace(/:/g, '');
  const glow = `spiral-glow-${uid}`;
  const flow = `spiral-flow-${uid}`;

  return (
    <div className="spiral-home__orbit">
      <svg className="spiral-home__orbit-svg" viewBox="0 0 800 800" role="presentation" aria-hidden>
        <defs>
          <linearGradient id={glow} x1="8%" y1="12%" x2="92%" y2="88%">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.15" />
            <stop offset="42%" stopColor="#36d399" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id={flow} x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#e0fff4" stopOpacity="0" />
            <stop offset="50%" stopColor="#9af7c9" stopOpacity="1" />
            <stop offset="100%" stopColor="#67e8f9" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="spiral-home__orbit-shell" fill="none" stroke={`url(#${glow})`}>
          <ellipse className="spiral-home__ring" cx="400" cy="400" rx="292" ry="168" transform="rotate(-18 400 400)" />
          <ellipse className="spiral-home__ring" cx="400" cy="400" rx="248" ry="142" transform="rotate(12 400 400)" />
          <ellipse className="spiral-home__ring" cx="400" cy="400" rx="204" ry="118" transform="rotate(38 400 400)" />
          <ellipse className="spiral-home__ring" cx="400" cy="400" rx="164" ry="94" transform="rotate(62 400 400)" />
          <ellipse className="spiral-home__ring" cx="400" cy="400" rx="122" ry="70" transform="rotate(86 400 400)" />
          <path
            className="spiral-home__coil"
            stroke={`url(#${flow})`}
            d="M548 268c48 62 38 168-28 238-72 76-188 92-268 42-78-48-98-148-46-220 46-64 138-88 208-52 58 30 86 102 54 162-28 54-96 76-148 48"
          />
        </g>
        <g className="spiral-home__sparks">
          <circle className="spiral-home__spark" cx="548" cy="268" r="3.2" />
          <circle className="spiral-home__spark" cx="420" cy="176" r="2.4" />
          <circle className="spiral-home__spark" cx="232" cy="392" r="2.6" />
          <circle className="spiral-home__spark" cx="508" cy="512" r="2.2" />
        </g>
      </svg>
      <ul className="spiral-home__pins">
        {WAYPOINTS.map((point) => (
          <li key={point.id} className="spiral-home__pin" style={{ left: point.x, top: point.y }}>
            <button type="button" className="spiral-home__pin-btn">
              <span className="spiral-home__pin-dot" />
              <span className="spiral-home__pin-label">{point.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
