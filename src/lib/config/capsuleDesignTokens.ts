/** Capsule One 全局设计令牌 — AI 页深空 2.3 */
export const CAPSULE_COLORS = {
  spaceTop: '#1A2438',
  spaceBottom: '#141E30',
  techBlue: '#00FFFF',
  warmOrange: '#FFB800',
  bodyText: '#E0E6ED',
  borderCyan: 'rgba(0, 255, 255, 0.2)',
  spaceBlack: '#1A2438',
  electronicCyan: '#00FFFF',
} as const;

/** 首页 · 赛博新中式 */
export const CAPSULE_INK_COLORS = {
  ricePaper: '#F2F0E9',
  ricePaperDeep: '#EBE8E0',
  inkGray: '#4A4A4A',
  inkMist: '#8A8A8A',
  cinnabar: '#B8504B',
  daiBlue: '#6A8CAF',
  orbitOpacity: 0.24,
  glowCyan: '#6A8CAF',
  accentCyan: '#6A8CAF',
  mist: 'rgba(74, 74, 74, 0.08)',
} as const;

/** 首页 · 2+4 琉璃地球 */
export const CAPSULE_GLAZE_COLORS = {
  holoCyan: '#8fd8d4',
  holoBright: '#b8ece8',
  jade: '#9ec4b8',
  jadeTint: '#b8d4cc',
  coreWarm: '#c98880',
  rimCool: CAPSULE_INK_COLORS.daiBlue,
  oceanGlass: 'rgba(160, 240, 237, 0.12)',
} as const;

export const CAPSULE_HOME_COLORS = {
  skyBase: CAPSULE_INK_COLORS.ricePaper,
  skySoft: CAPSULE_INK_COLORS.ricePaperDeep,
  accentCyan: CAPSULE_INK_COLORS.accentCyan,
  accentPurple: CAPSULE_INK_COLORS.daiBlue,
  textPrimary: CAPSULE_INK_COLORS.inkGray,
  textMuted: 'rgba(74, 74, 74, 0.45)',
  glassSurface: 'rgba(242, 240, 233, 0.82)',
  glassBorder: 'rgba(106, 140, 175, 0.22)',
} as const;

export const CAPSULE_BG_GRADIENT = `linear-gradient(180deg, ${CAPSULE_COLORS.spaceTop} 0%, ${CAPSULE_COLORS.spaceBottom} 100%)`;

export const CAPSULE_HOME_BG_GRADIENT = `linear-gradient(180deg, ${CAPSULE_HOME_COLORS.skyBase} 0%, ${CAPSULE_HOME_COLORS.skySoft} 100%)`;

export const CAPSULE_FONTS = {
  display: "'Inter', 'Noto Sans SC', system-ui, sans-serif",
  body: "'Inter', 'Noto Sans SC', system-ui, sans-serif",
  serif: "'Noto Serif SC', 'Songti SC', 'STSong', serif",
} as const;

export const CAPSULE_FONT_URL =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Noto+Serif+SC:wght@400;500;600&display=swap';
