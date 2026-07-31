/**
 * 与 `theme.scss` 同步的 JS/Three 侧主题色。
 * 页面 CSS 请用 CSS 变量；Three / Canvas 无法读 var() 时用此处常量。
 */
export const themeTokens = {
  bg: '#fdfbf4',
  bgSoft: '#f6f3e8',
  surface: '#ffffff',
  ink: '#1b3b30',
  muted: '#3d5f52',
  faint: '#6a8a7c',
  line: '#c5d6cc',
  accent: '#1b3b30',
  accentSoft: '#3d5f52',
  accentWarm: '#b07a5a',
  brandFrom: '#1b3b30',
  brandTo: '#eef5f1',
  lightWarm: '#fffaf4',
  lightSoft: '#fffef8',
  lightCool: '#e7e0d4',
  hemiSky: '#faf6ee',
  hemiGround: '#c8d4c6',
} as const;
