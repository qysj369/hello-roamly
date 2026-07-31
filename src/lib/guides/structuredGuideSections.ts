/** 结构化穷游攻略 — 固定板块 ID（发布器锚点 / 展示器导航） */
export const STRUCTURED_GUIDE_SECTIONS = [
  { id: 'sg-cost', label: '花费清单' },
  { id: 'sg-journal', label: '行程流水账' },
  { id: 'sg-insights', label: '蜗牛启示', slangId: 'snail-insights' as const },
] as const;
export type StructuredGuideSectionId = (typeof STRUCTURED_GUIDE_SECTIONS)[number]['id'];

/** 发布清单项 → 编辑器字段/板块 DOM id（点击跳转） */
export const STRUCTURED_GUIDE_EDITOR_TARGETS: Record<string, string> = {
  title: 'guide-title',
  destination: 'guide-destination',
  days: 'guide-days',
  cost: 'sg-edit-cost',
  journal: 'sg-edit-journal',
  insights: 'sg-edit-insights',
};

export const USER_PUBLISHED_GUIDE_ID_PREFIX = 'user-guide-';

export function isUserPublishedGuideId(guideId: string): boolean {
  return guideId.startsWith(USER_PUBLISHED_GUIDE_ID_PREFIX);
}
