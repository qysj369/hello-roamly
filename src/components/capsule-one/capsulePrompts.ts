export const CAPSULE_SYSTEM_VOICE = {
  ready: '系统就绪。',
  inviteJourney: '请描述你的旅程。',
  destinationConfirmed: '目的地已确认。正在注入灵魂...',
  generatingReality: '正在生成现实…',
} as const;

/** 界面轮换文案 — 短促、未来感，避免「搜索」 */
export const CAPSULE_DEFAULT_PROMPTS = [
  '注入你的旅行渴望…',
  "例如：'一个能看见极光的孤独小镇'",
  '告诉我：时间、心情、与谁同行',
] as const;

export const CAPSULE_INPUT_PLACEHOLDER = '注入时间、心情、预算、同行伙伴…';
export const CAPSULE_INPUT_PLACEHOLDER_LOCKED = '注入时间、心情、预算…';

export const BLIND_BOX_BUTTON_LABEL = '旅行盲盒';
export const BLIND_BOX_REGION_HINT = '继续转动地球，探索更多目的地';
export const BLIND_BOX_RANDOM_HINT = '点盲盒可再随机一座城';
export const BLIND_BOX_REGION_SCAN_LABEL = '区域扫描中';
export const BLIND_BOX_REGION_SCAN_SUBTITLE = '正在匹配附近目的地…';
export const BLIND_BOX_RANDOM_SCAN_LABEL = '命运抽取中';
export const BLIND_BOX_RANDOM_SCAN_SUBTITLE = '从 47 座城市中随机…';
export const BLIND_BOX_NO_SIGNAL_EYEBROW = '信号中断';
export const BLIND_BOX_NO_SIGNAL_TITLE = '此处暂无旅行信号';
export const BLIND_BOX_NO_SIGNAL_HINT = '转向中国境内再试，或点 ✨ 完全随机';

export function blindBoxJourneyEyebrow(distanceKm: number): string {
  return `直线距离约 ${distanceKm} 公里`;
}

export function blindBoxJourneyRoute(departureLabel: string, destinationName: string): string {
  return `${departureLabel}  →  ${destinationName}`;
}

/** @deprecated 使用 blindBoxJourneyEyebrow */
export function blindBoxRegionEyebrow(distanceKm: number | null): string {
  if (distanceKm == null) {
    return '信号捕获 · 离你最近的目的地';
  }
  return blindBoxJourneyEyebrow(distanceKm);
}

export function getBlindBoxRandomEyebrow(rarity: 1 | 2 | 3): string {
  const labels = {
    1: '命运抽取 · 传说目的地',
    2: '命运抽取 · 精选目的地',
    3: '命运抽取 · 经典目的地',
  } as const;
  return labels[rarity];
}

export function lockedDestinationPrompt(cityLabel: string): string {
  return `目的地已确认：${cityLabel}。继续注入你的旅程构想…`;
}

export function capsuleLaunchStatusText(): string {
  return '正在构建现实…';
}
