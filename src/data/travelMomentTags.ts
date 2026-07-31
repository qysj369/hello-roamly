/** 旅行瞬间推荐标签 */
export const TRAVEL_MOMENT_TAG_PRESETS = [
  '美食',
  '摄影',
  '穷游',
  '自然风光',
  '城市漫步',
  '人文',
  '冒险',
  '亲子',
  '海岛',
  '古镇',
  '夜市',
  '徒步',
  '博物馆',
  '咖啡',
  '露营',
] as const;

export type TravelMomentTagPreset = (typeof TRAVEL_MOMENT_TAG_PRESETS)[number];
