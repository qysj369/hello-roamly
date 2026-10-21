import { useId } from 'react';

const WAYPOINTS = [
  { id: 'dmh', label: '大明湖', x: '48%', y: '18%' },
  { id: 'bpt', label: '趵突泉', x: '34%', y: '34%' },
  { id: 'hhq', label: '黑虎泉', x: '30%', y: '56%' },
  { id: 'qfs', label: '千佛山', x: '56%', y: '70%' },
  { id: 'jrs', label: '九如山', x: '72%', y: '44%' },
] as const;

const RINGS = [
  { rot: -18, rx: 292, ry: 168, dur: '22s' },
  { rot: 12, rx: 248, ry: 142, dur: '18s' },
  { rot: 38, rx: 204, ry: 118, dur: '16s' },
  { rot: 62, rx: 164, ry: 94, dur: '13s' },
  { rot: 86, rx: 122, ry: 70, dur: '11s' },
] as const;

/** 贴在球面的螺旋光涡。扁平椭圆是透视，不是粒子。 */
function vortexPath(phase: number, startR: number, endR: number): string {
  const steps = 96;
  const turns = 2.45;
  let d = '';
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const ang = phase + t * turns * Math.PI * 2;
    const radius = startR + (endR - startR) * t;
    const x = 418 + Math.cos(ang) * radius * 1.12;
    const y = 388 + Math.sin(ang) * radius * 0.64;
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

const VORTEX = vortexPath(-0.4, 198, 16);
const VORTEX_INNER = vortexPath(2.2, 132, 10);

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
            <stop offset="0%" stopColor="#eaf6ff" stopOpacity="0.95" />
            <stop offset="46%" stopColor="#d9c08a" stopOpacity="1" />
            <stop offset="100%" stopColor="#7fb4cc" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id={flow} x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#fffaf0" stopOpacity="0" />
            <stop offset="48%" stopColor="#f2e2b8" stopOpacity="1" />
            <stop offset="100%" stopColor="#bcd8e8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`spiral-streak-${uid}`} gradientUnits="userSpaceOnUse" x1="360" y1="500" x2="90" y2="680">
            <stop offset="0%" stopColor="#fffaf0" stopOpacity="1" />
            <stop offset="28%" stopColor="#f2e2b8" stopOpacity="0.85" />
            <stop offset="62%" stopColor="#bcd8e8" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#bcd8e8" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`spiral-core-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fffaf0" stopOpacity="1" />
            <stop offset="18%" stopColor="#fffaf0" stopOpacity="0.9" />
            <stop offset="46%" stopColor="#f2e2b8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#7fb4cc" stopOpacity="0" />
          </radialGradient>
          <filter id={`spiral-bloom-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4.5" />
          </filter>
        </defs>
        <g
          className="spiral-home__orbit-shell"
          fill="none"
          stroke={`url(#${glow})`}
          filter={`url(#spiral-bloom-${uid})`}
        >
          <ellipse
            className="spiral-home__ring spiral-home__ring-halo"
            cx="400"
            cy="400"
            rx="292"
            ry="168"
            transform="rotate(-18 400 400)"
          />
          <ellipse
            className="spiral-home__ring spiral-home__ring-halo"
            cx="400"
            cy="400"
            rx="248"
            ry="142"
            transform="rotate(12 400 400)"
          />
          <ellipse
            className="spiral-home__ring spiral-home__ring-halo"
            cx="400"
            cy="400"
            rx="204"
            ry="118"
            transform="rotate(38 400 400)"
          />
          <ellipse
            className="spiral-home__ring spiral-home__ring-halo"
            cx="400"
            cy="400"
            rx="164"
            ry="94"
            transform="rotate(62 400 400)"
          />
          <ellipse
            className="spiral-home__ring spiral-home__ring-halo"
            cx="400"
            cy="400"
            rx="122"
            ry="70"
            transform="rotate(86 400 400)"
          />
          <path
            className="spiral-home__coil spiral-home__coil-halo"
            stroke={`url(#${flow})`}
            d="M560 250c70 80 40 210-60 280-110 78-250 70-330 10-90-68-100-190-20-270 70-70 190-80 270-20 70 52 90 150 30 210"
          />
          <path className="spiral-home__vortex spiral-home__vortex-halo" d={VORTEX} />
          <path className="spiral-home__vortex spiral-home__vortex-halo" d={VORTEX_INNER} />
        </g>
        <g className="spiral-home__ring-wash" fill="none" stroke="#7fb4cc">
          {RINGS.map((ring) => (
            <ellipse
              key={`wash-${ring.rot}`}
              cx="400"
              cy="400"
              rx={ring.rx}
              ry={ring.ry}
              transform={`rotate(${ring.rot} 400 400)`}
            />
          ))}
        </g>
        <circle className="spiral-home__vortex-heart" cx="418" cy="388" r="38" fill={`url(#spiral-core-${uid})`} />
        <g className="spiral-home__orbit-shell" fill="none" stroke={`url(#${glow})`}>
          <ellipse
            className="spiral-home__ring"
            cx="400"
            cy="400"
            rx="292"
            ry="168"
            transform="rotate(-18 400 400)"
          />
          <ellipse
            className="spiral-home__ring"
            cx="400"
            cy="400"
            rx="248"
            ry="142"
            transform="rotate(12 400 400)"
          />
          <ellipse
            className="spiral-home__ring"
            cx="400"
            cy="400"
            rx="204"
            ry="118"
            transform="rotate(38 400 400)"
          />
          <ellipse
            className="spiral-home__ring"
            cx="400"
            cy="400"
            rx="164"
            ry="94"
            transform="rotate(62 400 400)"
          />
          <ellipse
            className="spiral-home__ring"
            cx="400"
            cy="400"
            rx="122"
            ry="70"
            transform="rotate(86 400 400)"
          />
          <path
            className="spiral-home__coil"
            stroke={`url(#${flow})`}
            d="M560 250c70 80 40 210-60 280-110 78-250 70-330 10-90-68-100-190-20-270 70-70 190-80 270-20 70 52 90 150 30 210"
          />
          <path
            className="spiral-home__spiral"
            stroke={`url(#${flow})`}
            d="M520 300c80 70 40 190-70 250-120 66-240 40-300-40-70-90-20-200 90-240 100-36 190 20 200 110 8 70-50 130-120 140-60 8-120-30-130-90"
          />
          <path className="spiral-home__vortex" stroke={`url(#${flow})`} d={VORTEX} />
          <path className="spiral-home__vortex" stroke={`url(#${flow})`} d={VORTEX_INNER} />
          <path className="spiral-home__vortex-cyan" d={VORTEX_INNER} />
          <path className="spiral-home__vortex-core" d={VORTEX} />
          <path className="spiral-home__vortex-core" d={VORTEX_INNER} />
          <path className="spiral-home__streak" stroke={`url(#spiral-streak-${uid})`} d="M248 492 C 190 545, 145 578, 108 598" />
          <path className="spiral-home__streak" stroke={`url(#spiral-streak-${uid})`} d="M300 528 C 230 590, 175 628, 128 650" />
          <path className="spiral-home__streak" stroke={`url(#spiral-streak-${uid})`} d="M352 558 C 275 625, 215 662, 168 688" />
        </g>
        <g className="spiral-home__ring-cores" fill="none" stroke="#fffaf0">
          {RINGS.map((ring) => (
            <ellipse
              key={`core-${ring.rot}`}
              className="spiral-home__ring-core"
              cx="400"
              cy="400"
              rx={ring.rx}
              ry={ring.ry}
              transform={`rotate(${ring.rot} 400 400)`}
            />
          ))}
        </g>
        <g className="spiral-home__ring-flows" fill="none" stroke="#fffaf0">
          {RINGS.map((ring) => (
            <ellipse
              key={`flow-${ring.rot}`}
              className="spiral-home__ring-flow"
              cx="400"
              cy="400"
              rx={ring.rx}
              ry={ring.ry}
              transform={`rotate(${ring.rot} 400 400)`}
            />
          ))}
        </g>
        <g className="spiral-home__sparks">
          <circle className="spiral-home__spark" cx="548" cy="268" r="3.2" />
          <circle className="spiral-home__spark" cx="420" cy="176" r="2.4" />
          <circle className="spiral-home__spark" cx="232" cy="392" r="2.6" />
          <circle className="spiral-home__spark" cx="508" cy="512" r="2.2" />
        </g>
        <g className="spiral-home__motes">
          {RINGS.map((ring) => (
            <g key={ring.rot} transform={`rotate(${ring.rot} 400 400)`}>
              <circle className="spiral-home__mote" r="7.5" fill="#fffaf0">
                <animateMotion
                  dur={ring.dur}
                  repeatCount="indefinite"
                  rotate="auto"
                  path={`M ${400 + ring.rx} 400 A ${ring.rx} ${ring.ry} 0 1 1 ${400 + ring.rx - 0.2} 400.2`}
                />
              </circle>
            </g>
          ))}
        </g>
      </svg>
      <ul className="spiral-home__pins">
        {WAYPOINTS.map((point) => (
          <li key={point.id} className="spiral-home__pin" style={{ left: point.x, top: point.y }}>
            <button type="button" className="spiral-home__pin-btn">
              <span className="spiral-home__pin-dot" />
              <span className="spiral-home__pin-label">{point.label}</span>
              <span className="spiral-home__pin-land">降落这里</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
