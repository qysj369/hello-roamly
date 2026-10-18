import { paths } from '@/router/paths';

export type HoloTravelToolIcon =
  | 'cycling'
  | 'budget'
  | 'stories'
  | 'ai'
  | 'suburb'
  | 'buddy'
  | 'camping';

export type HoloTravelToolAction = 'navigate';

export type HoloTravelToolDef = {
  key: string;
  icon: HoloTravelToolIcon;
  /** i18n quick.* 键 */
  labelKey: 'cycling' | 'budgetFine' | 'storiesReal' | 'aiPlan' | 'suburb' | 'buddy' | 'camping';
  action: HoloTravelToolAction;
  to?: string;
};

/**
 * 慢行工具箱只留能立刻办事的入口。
 * 发现 / 搭子 / 露营等空壳社区项已从宫格拿掉，路由仍保留。
 */
export const holoTravelToolDefs: readonly HoloTravelToolDef[] = [
  { key: 'ai', icon: 'ai', labelKey: 'aiPlan', action: 'navigate', to: paths.ai },
  { key: 'budget', icon: 'budget', labelKey: 'budgetFine', action: 'navigate', to: paths.budget },
  { key: 'suburb', icon: 'suburb', labelKey: 'suburb', action: 'navigate', to: paths.cities },
] as const;

/** Hero 图形下方入口：精打细算 + 管家（不加第三业务按钮） */
export const holoHeroPillDefs = [
  { key: 'budget', labelKey: 'budgetFine' as const, to: paths.budget },
  { key: 'ai', labelKey: 'aiPlan' as const, to: paths.ai },
] as const;
