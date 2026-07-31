type SnailTone = 'garden' | 'helix' | 'woodland' | 'river' | 'autumn' | 'fog';

const TONE_PALETTE: Record<
  SnailTone,
  {
    body: string;
    bodyDeep: string;
    bodySheen: string;
    foot: string;
    shell: string;
    shellDeep: string;
    shellRim: string;
    spiral: string;
    stalk: string;
    mucus: string;
  }
> = {
  garden: {
    body: '#c8bdb0',
    bodyDeep: '#9a9088',
    bodySheen: '#ddd4c8',
    foot: '#b0a498',
    shell: '#a07858',
    shellDeep: '#684830',
    shellRim: '#503820',
    spiral: '#584028',
    stalk: '#a89888',
    mucus: '#d8d0c4',
  },
  helix: {
    body: '#bfb5a8',
    bodyDeep: '#908880',
    bodySheen: '#d4ccc0',
    foot: '#a89c90',
    shell: '#8a6848',
    shellDeep: '#503018',
    shellRim: '#402810',
    spiral: '#483018',
    stalk: '#9a8c80',
    mucus: '#d0c8bc',
  },
  woodland: {
    body: '#b8b0a4',
    bodyDeep: '#888078',
    bodySheen: '#ccc4b8',
    foot: '#a09888',
    shell: '#788060',
    shellDeep: '#485038',
    shellRim: '#384028',
    spiral: '#404830',
    stalk: '#908878',
    mucus: '#c8c0b4',
  },
  river: {
    body: '#b4b4ac',
    bodyDeep: '#848480',
    bodySheen: '#c8c8c0',
    foot: '#989890',
    shell: '#687880',
    shellDeep: '#384850',
    shellRim: '#283840',
    spiral: '#304048',
    stalk: '#888880',
    mucus: '#c4c4bc',
  },
  autumn: {
    body: '#c0b0a0',
    bodyDeep: '#907868',
    bodySheen: '#d4c4b4',
    foot: '#a89080',
    shell: '#985838',
    shellDeep: '#602810',
    shellRim: '#481808',
    spiral: '#502010',
    stalk: '#a08070',
    mucus: '#d4c0b0',
  },
  fog: {
    body: '#c4c0b8',
    bodyDeep: '#949088',
    bodySheen: '#d8d4cc',
    foot: '#aca89c',
    shell: '#988880',
    shellDeep: '#685850',
    shellRim: '#504840',
    spiral: '#585048',
    stalk: '#a09890',
    mucus: '#d0ccc4',
  },
};

type PaperRoamSnailGlyphProps = {
  size: number;
  id: string;
  tone?: SnailTone;
  className?: string;
};

/** 写实侧视蜗牛 SVG */
export function PaperRoamSnailGlyph({
  size,
  id,
  tone = 'garden',
  className,
}: PaperRoamSnailGlyphProps) {
  const p = TONE_PALETTE[tone];
  const bodyId = `paper-roam-snail-body-${id}`;
  const shellId = `paper-roam-snail-shell-${id}`;
  const shellLightId = `paper-roam-snail-shell-light-${id}`;

  return (
    <svg
      className={className}
      width={size}
      height={size * 0.58}
      viewBox="0 0 62 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M2 30.2C6 29.2 12 29.5 18 29.8C24 30.1 30 29.6 36 29.2"
        stroke={p.mucus}
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.35"
      />
      <path
        d="M3 29.8C9 28.2 15 28.6 21 29.2C27 29.8 33 29.1 39 28.4C43 27.9 45 28.6 47 29.6"
        stroke={p.foot}
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M3 29.2C4.8 26.2 7 24.2 10 23.5C13 22.8 17 23.6 20 25.4C21.8 26.5 23 28 23.5 29.5"
        fill={`url(#${bodyId})`}
      />
      <path
        d="M3 29.2C4.8 26.2 7 24.2 10 23.5C13 22.8 17 23.6 20 25.4C21.8 26.5 23 28 23.5 29.5"
        stroke={p.bodyDeep}
        strokeWidth="0.65"
        strokeLinejoin="round"
        opacity="0.45"
      />
      <ellipse cx="8.5" cy="24.2" rx="3.6" ry="2.6" fill={p.bodySheen} opacity="0.55" />
      <circle cx="44" cy="18.5" r="14.8" fill={p.shellDeep} />
      <circle cx="44" cy="18.5" r="14.8" fill={`url(#${shellId})`} />
      <circle cx="44" cy="18.5" r="14.8" fill={`url(#${shellLightId})`} />
      <circle cx="44" cy="18.5" r="14.8" stroke={p.shellRim} strokeWidth="0.7" opacity="0.55" />
      <path
        d="M29.2 18.5C29.2 13.8 33.2 10 38 10"
        stroke={p.spiral}
        strokeWidth="0.95"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M31.5 18.5C31.5 15.2 34.2 12.8 37.5 12.8"
        stroke={p.spiral}
        strokeWidth="0.85"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M33.8 18.5C33.8 16.5 35.5 15 37.5 15"
        stroke={p.spiral}
        strokeWidth="0.75"
        strokeLinecap="round"
        opacity="0.45"
      />
      <circle cx="44" cy="18.5" r="1.1" fill={p.spiral} opacity="0.42" />
      <g className="paper-roam-brand-snail__antenna paper-roam-brand-snail__antenna--left">
        <path d="M7.2 23.2L5.6 16.8" stroke={p.stalk} strokeWidth="0.75" strokeLinecap="round" />
        <circle cx="5.45" cy="16.4" r="0.75" fill="#2a2824" />
      </g>
      <g className="paper-roam-brand-snail__antenna paper-roam-brand-snail__antenna--right">
        <path d="M9.6 22.8L9.2 16.2" stroke={p.stalk} strokeWidth="0.75" strokeLinecap="round" />
        <circle cx="9.05" cy="15.8" r="0.75" fill="#2a2824" />
      </g>
      <defs>
        <linearGradient id={bodyId} x1="3" y1="26" x2="23" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor={p.bodySheen} />
          <stop offset="0.45" stopColor={p.body} />
          <stop offset="1" stopColor={p.bodyDeep} />
        </linearGradient>
        <radialGradient
          id={shellId}
          cx="0"
          cy="0"
          r="1"
          gradientTransform="translate(41 15.5) rotate(10) scale(16)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={p.shell} />
          <stop offset="0.72" stopColor={p.shellDeep} />
          <stop offset="1" stopColor={p.shellRim} />
        </radialGradient>
        <radialGradient
          id={shellLightId}
          cx="0"
          cy="0"
          r="1"
          gradientTransform="translate(37 12) rotate(-20) scale(10)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fffaf4" stopOpacity="0.22" />
          <stop offset="1" stopColor="#fffaf4" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}
