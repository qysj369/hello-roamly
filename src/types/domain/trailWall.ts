/** 轨迹墙攻略项（与攻略 API 字段对齐） */
export type TrailWallGuide = {
  id: string;
  title: string;
  start_city: string;
  end_city: string;
  start_coords: [number, number];
  end_coords: [number, number];
  days: number;
  budget: string;
  /** 预算来源说明（hover 提示） */
  budgetNote?: string;
  /** 预算数据来源：花费清单合计 / 列表标注 */
  budgetSource?: 'cost_breakdown' | 'list_label';
  summary: string;
  tag: TrailWallFilterTag;
  colorStart: string;
  colorEnd: string;
};

export type TrailWallFilterTag = 'budget' | 'food' | 'photo' | 'nature';

export type TrailWallFilter = 'all' | TrailWallFilterTag;

export const TRAIL_WALL_FILTERS: { value: TrailWallFilter; label: string }[] = [
  { value: 'all', label: '全部轨迹' },
  { value: 'budget', label: '硬壳漫行' },
  { value: 'food', label: '美食' },
  { value: 'photo', label: '摄影' },
  { value: 'nature', label: '自然' },
];
