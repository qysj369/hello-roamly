/** 主要城市光点（静态，避免持续 CSS 动画占用合成层） */
const CITY_GLOWS = [
  { id: 'tokyo', cx: 84, cy: 38 },
  { id: 'seoul', cx: 80, cy: 36 },
  { id: 'singapore', cx: 76, cy: 52 },
  { id: 'sydney', cx: 88, cy: 68 },
  { id: 'dubai', cx: 58, cy: 44 },
  { id: 'paris', cx: 48, cy: 34 },
  { id: 'london', cx: 46, cy: 32 },
  { id: 'nyc', cx: 28, cy: 38 },
  { id: 'sf', cx: 18, cy: 40 },
  { id: 'rio', cx: 32, cy: 62 },
  { id: 'capetown', cx: 50, cy: 72 },
  { id: 'mumbai', cx: 62, cy: 48 },
] as const;

/** Hero 深色区：全球城市微光点（低干扰、无动画） */
export default function HomeHeroCityGlow() {
  return (
    <svg
      className="home-hero-city-glow pointer-events-none absolute inset-0 h-full w-full opacity-50"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {CITY_GLOWS.map((city) => (
        <circle
          key={city.id}
          cx={city.cx}
          cy={city.cy}
          r="0.65"
          fill="rgb(196 181 253 / 0.85)"
        />
      ))}
    </svg>
  );
}
