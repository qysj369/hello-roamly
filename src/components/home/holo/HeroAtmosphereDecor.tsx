/**
 * Hero 氛围装饰层（山水纹理 / 飞鸟 / 远山 / 经纬与古道线 / 暗部地球弧）
 * 不改锁定 PNG 主视觉，仅底层与侧旁点缀。
 */
export default function HeroAtmosphereDecor() {
  return (
    <div className="holo-home__atmosphere" aria-hidden>
      <svg
        className="holo-home__atmosphere-earth-arc"
        viewBox="0 0 800 200"
        preserveAspectRatio="xMidYMax slice"
      >
        <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
          <path d="M-40 160 C160 40 640 40 840 160" opacity="0.9" />
          <path d="M20 175 C200 70 600 70 780 175" opacity="0.55" />
          <path d="M80 188 C260 110 540 110 720 188" opacity="0.35" />
        </g>
      </svg>

      <svg
        className="holo-home__atmosphere-landscape"
        viewBox="0 0 800 360"
        preserveAspectRatio="xMidYMid slice"
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M0 250 C80 220 140 210 220 230 C300 250 340 200 420 210 C520 222 580 180 680 200 C740 212 780 230 800 240 L800 360 L0 360 Z" />
          <path d="M0 280 C120 260 200 270 300 290 C400 310 520 270 640 285 C720 295 770 310 800 318" />
          <path d="M40 300 C160 290 260 310 380 305 C500 300 620 320 760 310" />
          <path d="M120 200 C180 160 240 150 300 170" />
          <path d="M480 170 C540 140 600 135 670 155" />
          <path d="M60 320 C180 340 320 330 460 345 C580 356 700 340 800 350" />
        </g>
      </svg>

      <svg className="holo-home__atmosphere-meridian" viewBox="0 0 200 200">
        <g fill="none" stroke="currentColor" strokeWidth="0.8">
          <circle cx="100" cy="100" r="62" />
          <ellipse cx="100" cy="100" rx="28" ry="62" />
          <ellipse cx="100" cy="100" rx="50" ry="62" />
          <path d="M38 100h124" />
          <path d="M48 70h104" />
          <path d="M48 130h104" />
        </g>
      </svg>

      <svg className="holo-home__atmosphere-path" viewBox="0 0 240 120">
        <path
          d="M20 90 C70 80 110 40 150 50 C180 58 200 70 220 45"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="2 5"
        />
      </svg>

      <svg className="holo-home__atmosphere-bird holo-home__atmosphere-bird--a" viewBox="0 0 40 20">
        <path
          d="M4 12 C12 6 16 6 20 12 C24 6 28 6 36 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
      </svg>
      <svg className="holo-home__atmosphere-bird holo-home__atmosphere-bird--b" viewBox="0 0 40 20">
        <path
          d="M6 11 C13 7 17 7 20 11 C23 7 27 7 34 11"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>

      <svg className="holo-home__atmosphere-peaks" viewBox="0 0 200 60">
        <path
          d="M8 48 L40 16 L68 42 L96 22 L132 46 L160 20 L192 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
