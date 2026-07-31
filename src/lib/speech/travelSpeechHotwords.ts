import { CITY_COORDINATES } from '@/data/cityCoordinates';

/** 旅行场景 ASR 热词：地名 + 常见口语（讯飞 dhw 会话级热词） */
const EXTRA_TRAVEL_HOTWORDS = [
  '蜗牛旅行',
  '穷游',
  '预算',
  '三天',
  '五天',
  '七天',
  '联游',
  '出发地',
  '历下区',
  '中林路',
  '绿城百合花园',
  '济南西站',
  '曲阜',
  '曲阜三孔',
  '孔庙',
  '孔府',
  '孔林',
  '尼山圣境',
  '微山湖',
  '红荷湿地',
  '台儿庄',
  '台儿庄古城',
  '滕州',
  '高铁',
  '动车',
  '青旅',
  '民宿',
  '门票',
  '预约',
  '攻略',
  '行程',
  '规划',
  '转场',
  '无缝衔接',
  '门到门',
  '地铁',
  '公交',
  '打车',
  '网约车',
  '顺风车',
  'BRT',
  '自驾',
  '租车',
  '周村',
  '周村古城',
  '青州',
  '潍坊',
  '淄博',
  '苏杭',
  '联游',
  '露营',
  '帐篷',
  '垂钓',
  '钓鱼',
  '亲子',
  '研学',
  '采摘',
  '普快',
  '大巴',
  '航空',
  '航班',
  '普列',
  '硬卧',
  '过路费',
  '油费',
] as const;

const MAX_HOTWORD_COUNT = 120;
const MAX_DHW_LENGTH = 1800;

function uniqueHotwords(words: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const word of words) {
    const trimmed = word.trim();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result;
}

/** 供讯飞 IAT `dhw` 使用的热词串（| 分隔）；口语/主题词优先，城市表补充 */
export function buildTravelSpeechHotwordPayload(): string {
  const cityNames = Object.keys(CITY_COORDINATES);
  const merged = uniqueHotwords([...EXTRA_TRAVEL_HOTWORDS, ...cityNames]);

  const selected: string[] = [];
  let length = 0;
  for (const word of merged) {
    const nextLength = length === 0 ? word.length : length + 1 + word.length;
    if (selected.length >= MAX_HOTWORD_COUNT || nextLength > MAX_DHW_LENGTH) {
      break;
    }
    selected.push(word);
    length = nextLength;
  }

  return selected.join('|');
}

export function getTravelSpeechHotwordCount(): number {
  return buildTravelSpeechHotwordPayload().split('|').filter(Boolean).length;
}
