/** 高德 API 不可用时的行程景点坐标兜底（GCJ-02） */
export type KnownPlanLocationFallback = {
  label: string;
  lng: number;
  lat: number;
};

type PlanLocationFallbackRule = {
  pattern: RegExp;
  entry: KnownPlanLocationFallback;
  /** 限定城市，避免「古城」等歧义名误匹配 */
  cities?: string[];
};

const CHENGDU = '成都';
const NANJING = '南京';
const HANGZHOU = '杭州';
const BEIJING = '北京';

const RULES: PlanLocationFallbackRule[] = [
  { pattern: /锦城湖/, entry: { label: '锦城湖', lng: 104.0433, lat: 30.5742 }, cities: [CHENGDU] },
  { pattern: /宽窄巷子/, entry: { label: '宽窄巷子', lng: 104.0531, lat: 30.6635 }, cities: [CHENGDU] },
  { pattern: /春熙路|太古里|IFS|国际金融中心/, entry: { label: '春熙路商圈', lng: 104.0815, lat: 30.6573 }, cities: [CHENGDU] },
  { pattern: /武侯祠/, entry: { label: '武侯祠', lng: 104.0488, lat: 30.6469 }, cities: [CHENGDU] },
  { pattern: /锦里/, entry: { label: '锦里古街', lng: 104.049, lat: 30.6453 }, cities: [CHENGDU] },
  { pattern: /杜甫草堂|浣花溪/, entry: { label: '杜甫草堂', lng: 104.0302, lat: 30.6601 }, cities: [CHENGDU] },
  { pattern: /大熊猫|熊猫基地/, entry: { label: '成都大熊猫繁育研究基地', lng: 104.1419, lat: 30.7347 }, cities: [CHENGDU] },
  { pattern: /铁像寺/, entry: { label: '铁像寺水街', lng: 104.0412, lat: 30.5868 }, cities: [CHENGDU] },
  { pattern: /大源中央公园|大源/, entry: { label: '大源中央公园', lng: 104.0445, lat: 30.5518 }, cities: [CHENGDU] },
  { pattern: /四川大学.*江安|江安校区/, entry: { label: '四川大学江安校区', lng: 104.0067, lat: 30.574 }, cities: [CHENGDU] },
  { pattern: /青城山/, entry: { label: '青城山', lng: 103.5672, lat: 30.9001 }, cities: [CHENGDU] },
  { pattern: /都江堰/, entry: { label: '都江堰景区', lng: 103.6238, lat: 30.9983 }, cities: [CHENGDU] },
  { pattern: /文殊院/, entry: { label: '文殊院', lng: 104.0734, lat: 30.6712 }, cities: [CHENGDU] },
  { pattern: /东郊记忆/, entry: { label: '东郊记忆', lng: 104.123, lat: 30.6698 }, cities: [CHENGDU] },
  { pattern: /环球中心/, entry: { label: '环球中心', lng: 104.0638, lat: 30.5702 }, cities: [CHENGDU] },
  { pattern: /人民公园|鹤鸣茶社/, entry: { label: '人民公园', lng: 104.0559, lat: 30.6624 }, cities: [CHENGDU] },
  { pattern: /天府广场/, entry: { label: '天府广场', lng: 104.0657, lat: 30.6572 }, cities: [CHENGDU] },
  { pattern: /九眼桥/, entry: { label: '九眼桥', lng: 104.0864, lat: 30.6411 }, cities: [CHENGDU] },
  { pattern: /锦城公园/, entry: { label: '锦城公园', lng: 104.0485, lat: 30.5785 }, cities: [CHENGDU] },
  { pattern: /中和湿地/, entry: { label: '中和湿地公园', lng: 104.0895, lat: 30.5485 }, cities: [CHENGDU] },

  { pattern: /夫子庙/, entry: { label: '夫子庙', lng: 118.7942, lat: 32.0215 }, cities: [NANJING] },
  { pattern: /中山陵/, entry: { label: '中山陵', lng: 118.8489, lat: 32.059 }, cities: [NANJING] },
  { pattern: /玄武湖/, entry: { label: '玄武湖', lng: 118.7972, lat: 32.074 }, cities: [NANJING] },
  { pattern: /鸡鸣寺/, entry: { label: '鸡鸣寺', lng: 118.7955, lat: 32.0608 }, cities: [NANJING] },

  { pattern: /西湖(?!区)/, entry: { label: '西湖', lng: 120.1485, lat: 30.2425 }, cities: [HANGZHOU] },
  { pattern: /灵隐寺/, entry: { label: '灵隐寺', lng: 120.1012, lat: 30.2408 }, cities: [HANGZHOU] },
  { pattern: /河坊街/, entry: { label: '河坊街', lng: 120.1692, lat: 30.2398 }, cities: [HANGZHOU] },

  { pattern: /故宫/, entry: { label: '故宫博物院', lng: 116.3971, lat: 39.9175 }, cities: [BEIJING] },
  { pattern: /天安门/, entry: { label: '天安门广场', lng: 116.3975, lat: 39.9087 }, cities: [BEIJING] },
  { pattern: /颐和园/, entry: { label: '颐和园', lng: 116.2752, lat: 39.9998 }, cities: [BEIJING] },
  { pattern: /天坛/, entry: { label: '天坛公园', lng: 116.4069, lat: 39.8819 }, cities: [BEIJING] },
  { pattern: /南锣鼓巷/, entry: { label: '南锣鼓巷', lng: 116.4032, lat: 39.9365 }, cities: [BEIJING] },
];

function normalizeCityToken(city?: string): string | undefined {
  const trimmed = city?.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.replace(/市$/, '');
}

function cityMatches(rule: PlanLocationFallbackRule, city?: string): boolean {
  if (!rule.cities?.length) {
    return true;
  }
  const cityCore = normalizeCityToken(city);
  if (!cityCore) {
    return true;
  }
  return rule.cities.some((name) => cityCore.includes(name) || name.includes(cityCore));
}

export function matchKnownPlanLocationFallback(
  query: string,
  city?: string,
): KnownPlanLocationFallback | null {
  const trimmed = query.trim();
  if (!trimmed) {
    return null;
  }

  for (const rule of RULES) {
    if (!cityMatches(rule, city)) {
      continue;
    }
    if (rule.pattern.test(trimmed)) {
      return rule.entry;
    }
  }

  return null;
}

/** 对 geocode 候选依次尝试兜底匹配 */
export function resolveKnownPlanLocationFallback(
  query: string,
  city?: string,
): KnownPlanLocationFallback | null {
  const trimmed = query.trim();
  if (!trimmed) {
    return null;
  }

  const direct = matchKnownPlanLocationFallback(trimmed, city);
  if (direct) {
    return direct;
  }

  const segments = trimmed
    .split(/[·•|｜/\\-–—]/)
    .map((part) => part.trim())
    .filter(Boolean);

  for (const segment of segments) {
    const hit = matchKnownPlanLocationFallback(segment, city);
    if (hit) {
      return hit;
    }
  }

  return null;
}
