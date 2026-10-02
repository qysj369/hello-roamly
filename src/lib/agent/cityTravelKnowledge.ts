import { EXTRA_CITY_KNOWLEDGE } from '@/lib/agent/cityTravelKnowledgeExtra';
import { MORE_CITY_KNOWLEDGE } from '@/lib/agent/cityTravelKnowledgeMore';
import { classifySearchPlanParty, type SearchPlanPartyFocus } from '@/lib/home/searchPlanShareCopy';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

export type CityKnowledgeFood = {
  shop: string;
  dish: string;
  perCost: number;
  parties: Exclude<SearchPlanPartyFocus, 'other'>[];
};

export type CityKnowledgeSpot = {
  name: string;
  note: string;
  crowd: string;
};

export type KnowledgeLayer = 'static' | 'dynamic' | 'user';

export type KnowledgeMeta = {
  layer: KnowledgeLayer;
  updatedAt: string;
  source: 'official' | 'curated';
  staleAfterDays: number;
};

export type CityTravelKnowledge = {
  city: string;
  staticMeta: KnowledgeMeta;
  dynamicMeta: KnowledgeMeta;
  spots: CityKnowledgeSpot[];
  foods: CityKnowledgeFood[];
  rainAlts: string[];
  holidayAlts: string[];
  transit: string;
  pitfalls: string[];
  partyBudget: Record<Exclude<SearchPlanPartyFocus, 'other'>, string>;
};

export const KNOWLEDGE_VERIFY_TIP =
  '门票、开放时间与临时闭园请出行前以官方渠道确认为准，本库仅供参考。';

export function isKnowledgeStale(meta: KnowledgeMeta, now = Date.now()): boolean {
  const updated = Date.parse(meta.updatedAt);
  if (!Number.isFinite(updated)) return true;
  return now - updated > meta.staleAfterDays * 24 * 60 * 60 * 1000;
}

const SHANGHAI: CityTravelKnowledge = {
  city: '上海',
  staticMeta: {
    layer: 'static',
    updatedAt: '2026-08-01',
    source: 'curated',
    staleAfterDays: 180,
  },
  dynamicMeta: {
    layer: 'dynamic',
    updatedAt: '2026-09-01',
    source: 'official',
    staleAfterDays: 45,
  },
  spots: [
    { name: '上海博物馆', note: '馆藏文物，适合错峰上午', crowd: '主街外相对好逛' },
    { name: '外滩滨江', note: '傍晚万国建筑落日，不必上台阶人群', crowd: '主台阶拥挤，滨江步道更松' },
    { name: '北外滩滨江', note: '同等江景，游客更少', crowd: '节假日外滩分流首选' },
    { name: '豫园老街', note: '免费逛街巷烟火，不进收费大殿', crowd: '城隍庙主街易扎堆' },
    { name: '新天地石库门', note: '下午闲逛拍照，避开夜市人潮', crowd: '晚上偏热闹' },
    { name: '武康路', note: '梧桐老洋房，清晨更安静', crowd: '避开网红打卡位' },
    { name: '安福路', note: '小店街巷，适合久坐聊天', crowd: '夜市偏挤' },
    { name: '上海自然博物馆', note: '儿童友好，馆内多休息座', crowd: '周末开馆高峰' },
    { name: '上海科技馆', note: '有母婴室，控制参观两小时', crowd: '节假日早场更松' },
    { name: '徐汇滨江', note: '人少步道，适合情侣拍照', crowd: '比外滩主台阶松' },
    { name: '龙美术馆', note: '室内错峰，雨天替代', crowd: '工作日更静' },
    { name: '上海城市规划展示馆', note: '室内看城市模型，雨天替代外滩', crowd: '人流稳定' },
  ],
  foods: [
    { shop: '沈大成', dish: '蟹粉小笼、鲜肉条头糕', perCost: 45, parties: ['friends', 'family', 'solo'] },
    { shop: '南翔馒头店', dish: '鲜肉小笼', perCost: 40, parties: ['friends', 'family', 'solo'] },
    { shop: '老麦咖啡馆', dish: '特调咖啡', perCost: 38, parties: ['friends'] },
    { shop: '老吉士', dish: '本帮红烧肉、蟹粉豆腐', perCost: 120, parties: ['couple'] },
    { shop: '毕尔巴鄂', dish: '窗边咖啡、咸派', perCost: 68, parties: ['couple'] },
    { shop: '阿娘面馆', dish: '葱油拌面', perCost: 22, parties: ['couple', 'solo'] },
    { shop: '南翔馒头店（静安店）', dish: '鲜肉小笼、小馄饨', perCost: 42, parties: ['family'] },
    { shop: '老半斋', dish: '汤包、阳春面', perCost: 35, parties: ['family'] },
  ],
  rainAlts: ['上海城市规划展示馆', '上海博物馆', '龙美术馆', '上海科技馆室内'],
  holidayAlts: ['北外滩滨江', '徐汇滨江', '武康路清晨', '自然博物馆一层'],
  transit: 'Metro大都会APP可刷地铁，微信/支付宝乘车码通用；过江优先地铁，滨江段步行。',
  pitfalls: [
    '南京东路主街人流密，改走博物馆或背街',
    '豫园收费大殿可跳过，免费老街已够烟火气',
    '外滩主台阶节假日拥挤，换北外滩或徐汇滨江',
    '返程日不要排观光塔/高价登高',
    '景点预约以馆方当日规则为准，提前在官方渠道查看',
  ],
  partyBudget: {
    friends: '市内人均约1210-1800元，偏平价探店和小吃',
    couple: '市内人均约1400-2100元，可留一顿氛围正餐',
    family: '市内人均约1300-1900元，门票按儿童优惠另核',
    solo: '市内人均约1100-1700元，住宿按整间计、简餐为主',
  },
};

const KNOWLEDGE: Record<string, CityTravelKnowledge> = {
  上海: SHANGHAI,
  ...EXTRA_CITY_KNOWLEDGE,
  ...MORE_CITY_KNOWLEDGE,
};

export function getCityTravelKnowledge(city: string): CityTravelKnowledge | null {
  const name = city.trim().replace(/市$/, '');
  return KNOWLEDGE[name] ?? null;
}

export function foodsForParty(
  knowledge: CityTravelKnowledge,
  peopleType: string,
): CityKnowledgeFood[] {
  const focus = classifySearchPlanParty(peopleType);
  if (focus === 'other') return knowledge.foods;
  const matched = knowledge.foods.filter((item) => item.parties.includes(focus));
  return matched.length > 0 ? matched : knowledge.foods;
}

/** 注入生成提示词：只给当前城市可核验素材，禁止编造全网模板 */
export function buildCityKnowledgePrompt(city: string): string {
  const knowledge = getCityTravelKnowledge(city);
  if (!knowledge) {
    return `知识库：暂无${city.trim() || '该城'}专属条目。只写能核验的本地点位与老店，禁止套用外滩/西湖万能模板。`;
  }
  const spots = knowledge.spots
    .slice(0, 8)
    .map((spot) => `${spot.name}（${spot.note}；${spot.crowd}）`)
    .join('；');
  const foods = knowledge.foods
    .map((food) => `${food.shop}·${food.dish}·约${food.perCost}元`)
    .join('；');
  const stale = isKnowledgeStale(knowledge.dynamicMeta);
  return [
    `【${knowledge.city}分层私有知识库，优先检索本库；库中没有的内容才兜底，并禁止直接套用互联网过时通用攻略】`,
    `静态核心库：地理/主干地铁/固定规则，更新${knowledge.staticMeta.updatedAt}，来源${knowledge.staticMeta.source}`,
    `动态时效库：票价/开放/人流/季节，更新${knowledge.dynamicMeta.updatedAt}，来源${knowledge.dynamicMeta.source}${stale ? '（已过期，降权，只作弱参考）' : ''}`,
    `用户公开行程库仅作风格推荐，不作为事实依据。`,
    `景点与取舍：${spots}`,
    `本地招牌：${foods}`,
    `雨天替代：${knowledge.rainAlts.join('、')}`,
    `节假日分流：${knowledge.holidayAlts.join('、')}`,
    `接驳：${knowledge.transit}`,
    `避坑：${knowledge.pitfalls.join('；')}`,
    `分人群市内预算：好友${knowledge.partyBudget.friends}；情侣${knowledge.partyBudget.couple}；亲子${knowledge.partyBudget.family}；单人${knowledge.partyBudget.solo}`,
    `风险提示：${KNOWLEDGE_VERIFY_TIP}`,
  ].join('\n');
}

/** 动态易变信息只提示核验，不改三点贴士结构 */
export function applyKnowledgeRiskTip(plan: SearchStructuredPlan): SearchStructuredPlan {
  return {
    ...plan,
    globalTips: plan.globalTips.map((tip) => {
      if (!tip.startsWith('本地交通：') || /官方/.test(tip)) return tip;
      return `${tip.replace(/[；。]?$/, '')}；${KNOWLEDGE_VERIFY_TIP}`;
    }),
  };
}
