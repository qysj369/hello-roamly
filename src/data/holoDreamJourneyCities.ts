/** 首页「梦幻之旅」城市标签：按优先级分层，单行横滑展示 */

export type DreamJourneyTier = 'tier1' | 'tier2' | 'tier3';

export type DreamJourneyCity = {
  id: string;
  label: string;
  tier: DreamJourneyTier;
};

/** 一线旅游城市 */
const TIER1: readonly string[] = [
  '北京',
  '上海',
  '杭州',
  '苏州',
  '济南',
  '成都',
  '西安',
  '大理',
  '阳朔',
];

/** 热门文旅城市 */
const TIER2: readonly string[] = [
  '南京',
  '重庆',
  '厦门',
  '青岛',
  '丽江',
  '桂林',
  '敦煌',
  '威海',
  '泉州',
  '长沙',
  '洛阳',
  '黄山',
  '西宁',
  '舟山',
  '凤凰',
  '无锡',
  '扬州',
];

/** 小众慢行目的地 */
const TIER3: readonly string[] = [
  '霞浦',
  '张掖',
  '普洱',
  '宏村',
  '肇兴',
  '建水',
  '临海',
  '桐庐',
  '福鼎',
  '阿勒泰',
  '中卫',
  '仙居',
];

function toCities(labels: readonly string[], tier: DreamJourneyTier): DreamJourneyCity[] {
  return labels.map((label) => ({
    id: label,
    label,
    tier,
  }));
}

/** 扁平有序列表（一线 → 热门 → 小众），供横滑标签渲染 */
export const holoDreamJourneyCities: readonly DreamJourneyCity[] = [
  ...toCities(TIER1, 'tier1'),
  ...toCities(TIER2, 'tier2'),
  ...toCities(TIER3, 'tier3'),
];
