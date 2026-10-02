import { findHoloHomeCityKit } from '@/data/holoHotCityKit';
import { classifySearchPlanParty, type SearchPlanPartyFocus } from '@/lib/home/searchPlanParty';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

export type PlanBudgetDisplay = {
  amount: string;
  detail: string;
};

type CityBudgetProfile = {
  localTransit: string;
  food: string;
  tickets: string;
  stay: string;
  reserve: string;
  localRange: [number, number];
  foodRange: [number, number];
  ticketRange: [number, number];
  stayRange: [number, number];
  reserveRange: [number, number];
};

/** 3 天基准区间；展示时按行程天数等比换算 */
const CITY_BUDGET: Record<string, CityBudgetProfile> = {
  杭州: {
    localTransit: '杭州地铁公交为主，西湖沿线优先步行或骑行，远一点再打车',
    food: '杭帮菜正餐、片儿川与街边小吃，正餐和简餐错开即可',
    tickets: '西湖大多免费，灵隐、雷峰塔等收费点按兴趣选',
    stay: '湖滨/运河连锁或民宿，双人分摊更松',
    reserve: '预留喝茶、临时加点或下雨改道',
    localRange: [80, 120],
    foodRange: [450, 550],
    ticketRange: [180, 260],
    stayRange: [500, 700],
    reserveRange: [80, 120],
  },
  北京: {
    localTransit: '北京地铁为主，胡同短途步行或骑行，少连坐打车',
    food: '炸酱面、卤煮、街边老店，正餐与小吃分开算',
    tickets: '公园多免票或低票，颐和园等收费园按需进',
    stay: '二环外连锁或胡同民宿，双人分摊',
    reserve: '预留预约改期、加一站或胡同喝茶',
    localRange: [90, 140],
    foodRange: [480, 620],
    ticketRange: [160, 280],
    stayRange: [550, 800],
    reserveRange: [100, 150],
  },
  上海: {
    localTransit: '上海地铁过江，滨江步行即可，少用跨区打车',
    food: '生煎、本帮小炒、街头点心，正餐不必顿顿馆子',
    tickets: '外滩免费，豫园等收费点按兴趣',
    stay: '地铁沿线连锁或老洋房民宿，双人分摊',
    reserve: '预留夜景、临时加点或下雨进馆',
    localRange: [90, 140],
    foodRange: [500, 680],
    ticketRange: [120, 220],
    stayRange: [600, 900],
    reserveRange: [100, 160],
  },
  苏州: {
    localTransit: '苏州地铁+公交，古城区多走路，园林之间少连打',
    food: '苏式面、糖藕、沿街老店，正餐点一桌本地菜即可',
    tickets: '园林部分收费，街巷水巷可免费闲逛',
    stay: '平江/沧浪连锁或民宿，双人分摊',
    reserve: '预留加一座园或夜里坐船',
    localRange: [70, 110],
    foodRange: [400, 520],
    ticketRange: [150, 240],
    stayRange: [480, 680],
    reserveRange: [80, 120],
  },
  济南: {
    localTransit: '济南公交地铁，泉城路一带步行，少跨区打车',
    food: '把子肉、甜沫、老街小吃，正餐与早点分开',
    tickets: '趵突泉等收费，大明湖外缘可免费走',
    stay: '泉边连锁或民宿，双人分摊',
    reserve: '预留加一泉或夜里逛宽厚里',
    localRange: [60, 100],
    foodRange: [360, 480],
    ticketRange: [120, 200],
    stayRange: [420, 600],
    reserveRange: [60, 100],
  },
  南京: {
    localTransit: '南京地铁为主，老城南多走路',
    food: '鸭血粉丝、盐水鸭、老门东小吃',
    tickets: '玄武湖免费，中山陵等收费点按需',
    stay: '老城连锁或民宿，双人分摊',
    reserve: '预留加一馆或夜里逛老门东',
    localRange: [70, 110],
    foodRange: [400, 540],
    ticketRange: [80, 180],
    stayRange: [460, 660],
    reserveRange: [70, 110],
  },
  广州: {
    localTransit: '广州地铁+公交，沿江步行，少过江打车',
    food: '早茶点心、肠粉、街边糖水，正餐点一顿粤菜即可',
    tickets: '沙面免费闲逛，塔景等收费点按兴趣',
    stay: '老城/沿江连锁或民宿，双人分摊',
    reserve: '预留多一笼早茶或珠江夜走',
    localRange: [70, 120],
    foodRange: [420, 580],
    ticketRange: [80, 180],
    stayRange: [480, 720],
    reserveRange: [80, 130],
  },
  深圳: {
    localTransit: '深圳地铁覆盖广，湾区短途公交',
    food: '早茶、潮汕、城中村小店，正餐不必赶网红店',
    tickets: '海岸公园多免费，个别展馆收费',
    stay: '地铁沿线连锁或湾区民宿，双人分摊',
    reserve: '预留海边加点或下雨进馆',
    localRange: [80, 130],
    foodRange: [450, 620],
    ticketRange: [60, 160],
    stayRange: [550, 820],
    reserveRange: [90, 140],
  },
  成都: {
    localTransit: '成都地铁+公交，少赶场打车',
    food: '火锅、冒菜、街边串串，正餐一顿火锅即可',
    tickets: '宽窄免费逛，青城山等收费点按天',
    stay: '少城连锁或民宿，双人分摊',
    reserve: '预留加一家酒馆或喝茶',
    localRange: [70, 110],
    foodRange: [420, 580],
    ticketRange: [100, 220],
    stayRange: [420, 640],
    reserveRange: [80, 120],
  },
  西安: {
    localTransit: '西安地铁到城墙口，回民街步行',
    food: '肉夹馍、羊肉泡馍、回民街小吃',
    tickets: '城墙、大雁塔等收费，街巷可免费走',
    stay: '城墙根连锁或民宿，双人分摊',
    reserve: '预留夜市或加一段城墙',
    localRange: [70, 110],
    foodRange: [380, 520],
    ticketRange: [160, 260],
    stayRange: [420, 620],
    reserveRange: [70, 110],
  },
  厦门: {
    localTransit: '厦门公交+轮渡，岛内少开车',
    food: '沙茶面、海蛎煎、街边海鲜小炒',
    tickets: '环岛路免费，鼓浪屿船票另计',
    stay: '曾厝垵/岛内民宿，双人分摊',
    reserve: '预留轮渡改班或海边加点',
    localRange: [80, 130],
    foodRange: [420, 560],
    ticketRange: [140, 240],
    stayRange: [500, 760],
    reserveRange: [80, 130],
  },
  黄山: {
    localTransit: '屯溪公交+景区接驳，山上少重复索道',
    food: '徽菜、臭鳜鱼、屯溪老街小吃',
    tickets: '黄山门票+索道是大头，山下古镇多免费',
    stay: '山下连锁或温泉民宿，双人分摊',
    reserve: '预留天气改期或加一段索道',
    localRange: [80, 140],
    foodRange: [400, 540],
    ticketRange: [280, 420],
    stayRange: [480, 720],
    reserveRange: [100, 160],
  },
  泉州: {
    localTransit: '泉州公交为主，古城区步行',
    food: '面线糊、肉粽、巷口小吃',
    tickets: '开元寺等低票或免票，海丝遗迹按点',
    stay: '古厝民宿或连锁，双人分摊',
    reserve: '预留加一条老街或夜里逛巷',
    localRange: [60, 100],
    foodRange: [360, 480],
    ticketRange: [80, 160],
    stayRange: [400, 580],
    reserveRange: [60, 100],
  },
};

function scaleRange(range: [number, number], days: number): [number, number] {
  const factor = Math.max(1, days) / 3;
  const roundTen = (value: number) => Math.max(10, Math.round((value * factor) / 10) * 10);
  const low = roundTen(range[0]);
  const high = Math.max(low + 10, roundTen(range[1]));
  return [low, high];
}

function formatRange(range: [number, number], days: number): [number, number] {
  return scaleRange(range, days);
}

/** 最后一天按返程计，住宿晚数比行程天数少 1 */
export function stayNightsForPlanDays(days: number): number {
  const safeDays = Math.max(1, Math.round(days) || 1);
  return safeDays <= 1 ? 1 : safeDays - 1;
}

export function isSoloTravelParty(peopleType?: string | null): boolean {
  return /单人|独自|一个人|一人行/.test(peopleType?.trim() || '');
}

function localizeStayDetail(stay: string, peopleType?: string | null): string {
  if (!isSoloTravelParty(peopleType)) return stay;
  return stay.replace(/，双人分摊更松/, '，按单人整间计').replace(/，双人分摊/, '，按单人整间计');
}

function resolveProfile(city: string): { name: string; profile: CityBudgetProfile } {
  const kit = findHoloHomeCityKit(city.trim());
  const name = kit?.name || city.trim() || '这座城';
  const known = CITY_BUDGET[name];
  if (known) return { name, profile: known };

  const foodHint = kit?.foods.slice(0, 2).join('、') || '本地正餐与街边小吃';
  const spotHint = kit?.highlights.slice(0, 2).join('、') || '核心地标';
  return {
    name,
    profile: {
      localTransit: `${name}公交地铁为主，短途打车`,
      food: foodHint,
      tickets: `${spotHint}等按点购票，街巷可免费闲逛`,
      stay: '连锁或民宿，双人分摊',
      reserve: '预留临时加点或下雨改道',
      localRange: [70, 110],
      foodRange: [400, 540],
      ticketRange: [120, 220],
      stayRange: [450, 680],
      reserveRange: [70, 110],
    },
  };
}

type BudgetKind = 'longhaul' | 'localTransit' | 'food' | 'tickets' | 'stay' | 'reserve' | 'total';

function classifyBudgetItem(item: string): BudgetKind | null {
  const text = item.trim();
  if (/市内|城内/.test(text)) return 'localTransit';
  if (/大交通|往返|高铁|机票/.test(text)) return 'longhaul';
  if (/餐饮|吃饭|餐食/.test(text)) return 'food';
  if (/门票|景区/.test(text)) return 'tickets';
  if (/住宿|酒店|民宿/.test(text)) return 'stay';
  if (/机动|备用/.test(text)) return 'reserve';
  if (/合计|总计/.test(text)) return 'total';
  return null;
}

function amountLine(prefix: string, range: [number, number]): string {
  return `${prefix}${range[0]}‑${range[1]}元`;
}

type RangeKey = 'localTransit' | 'food' | 'tickets' | 'stay' | 'reserve';

/** 只调展示区间，不改生成端数字；对齐知识库分人群市内预算 */
const PARTY_RANGE_TUNE: Record<SearchPlanPartyFocus, Partial<Record<RangeKey, number>>> = {
  friends: {},
  other: {},
  family: { tickets: 1.5, reserve: 1.06 },
  couple: { food: 1.22, stay: 1.18, tickets: 1.04, reserve: 1.08 },
  solo: { food: 0.88, tickets: 0.9, reserve: 0.95 },
};

function roundTenYuan(value: number): number {
  return Math.max(10, Math.round(value / 10) * 10);
}

function tuneRange(range: [number, number], factor: number | undefined): [number, number] {
  if (!factor || factor === 1) return range;
  const low = roundTenYuan(range[0] * factor);
  return [low, Math.max(low + 10, roundTenYuan(range[1] * factor))];
}

function partyTicketDetail(base: string, peopleType?: string | null): string {
  const focus = classifySearchPlanParty(peopleType?.trim() || '');
  if (focus === 'family') {
    return '自然博物馆、科技馆等室内场馆按点购票，绿地和滨江可免费歇脚';
  }
  if (focus === 'couple') {
    return '滨江日落免费，美术馆等收费点按兴趣选';
  }
  return base;
}

export function parseBudgetAmountMid(amount: string): number | null {
  const range = amount.match(/(\d+)\s*[‑\-–—]\s*(\d+)/);
  if (range?.[1] && range[2]) {
    return Math.round((Number(range[1]) + Number(range[2])) / 2);
  }
  const single = amount.match(/(\d+)/);
  return single?.[1] ? Number(single[1]) : null;
}

function scaleRangeInAmount(amount: string, scale: number): string {
  if (!Number.isFinite(scale) || Math.abs(scale - 1) < 0.08) return amount;
  return amount.replace(/(\d+)\s*[‑\-–—]\s*(\d+)元/, (_all, low, high) => {
    const nextLow = roundTenYuan(Number(low) * scale);
    const nextHigh = Math.max(nextLow + 10, roundTenYuan(Number(high) * scale));
    return `${nextLow}‑${nextHigh}元`;
  });
}

/** 弹窗预算明细：数字行出本地区间，说明行出该城怎么花 */
export function localizePlanBudgetDisplay(
  city: string,
  days: number,
  item: string,
  peopleType?: string | null,
): PlanBudgetDisplay | null {
  const kind = classifyBudgetItem(item);
  if (!kind) return null;

  const safeDays = Math.max(1, Math.round(days) || 1);
  const stayNights = stayNightsForPlanDays(safeDays);
  const { profile } = resolveProfile(city);
  const focus = classifySearchPlanParty(peopleType?.trim() || '');
  const tune = PARTY_RANGE_TUNE[focus];

  if (kind === 'longhaul') {
    return {
      amount: '按出发地核算',
      detail: '根据你的出发地核算高铁/机票往返费用，提前购票可享折扣',
    };
  }

  if (kind === 'localTransit') {
    return {
      amount: amountLine(`${safeDays}天人均`, tuneRange(formatRange(profile.localRange, safeDays), tune.localTransit)),
      detail: profile.localTransit,
    };
  }
  if (kind === 'food') {
    return {
      amount: amountLine(`${safeDays}天人均`, tuneRange(formatRange(profile.foodRange, safeDays), tune.food)),
      detail: profile.food,
    };
  }
  if (kind === 'tickets') {
    return {
      amount: amountLine(`${safeDays}天人均`, tuneRange(formatRange(profile.ticketRange, safeDays), tune.tickets)),
      detail: partyTicketDetail(profile.tickets, peopleType),
    };
  }
  if (kind === 'stay') {
    return {
      amount: amountLine(`${stayNights}晚人均`, tuneRange(formatRange(profile.stayRange, stayNights), tune.stay)),
      detail: localizeStayDetail(profile.stay, peopleType),
    };
  }
  if (kind === 'reserve') {
    return {
      amount: amountLine(`${safeDays}天人均`, tuneRange(formatRange(profile.reserveRange, safeDays), tune.reserve)),
      detail: profile.reserve,
    };
  }

  const parts = [
    tuneRange(formatRange(profile.localRange, safeDays), tune.localTransit),
    tuneRange(formatRange(profile.foodRange, safeDays), tune.food),
    tuneRange(formatRange(profile.ticketRange, safeDays), tune.tickets),
    tuneRange(formatRange(profile.stayRange, stayNights), tune.stay),
    tuneRange(formatRange(profile.reserveRange, safeDays), tune.reserve),
  ];
  const low = parts.reduce((sum, range) => sum + range[0], 0);
  const high = parts.reduce((sum, range) => sum + range[1], 0);
  return {
    amount: `约${low}‑${high}元`,
    detail: '不含往返高铁/机票，按上面五项本地区间合计',
  };
}

function planLocalBudgetScale(plan: SearchStructuredPlan): number {
  const lowered = plan.budgetList.find(
    (item) => item.tip.includes('已按松弛降档') && !/往返|大交通|合计|总计/.test(item.item),
  );
  if (!lowered) return 1;
  const display = localizePlanBudgetDisplay(
    plan.baseInfo.targetCity,
    plan.baseInfo.days,
    lowered.item,
    plan.baseInfo.peopleType,
  );
  const mid = display ? parseBudgetAmountMid(display.amount) : null;
  if (!mid || lowered.perPerson < 10) return 1;
  return lowered.perPerson / mid;
}

/** 卡片展示：人群区间 + 若行程已降档预算则同比缩放 */
export function localizePlanBudgetDisplayForPlan(
  plan: SearchStructuredPlan,
  item: string,
): PlanBudgetDisplay | null {
  const display = localizePlanBudgetDisplay(
    plan.baseInfo.targetCity,
    plan.baseInfo.days,
    item,
    plan.baseInfo.peopleType,
  );
  if (!display) return null;
  const scale = planLocalBudgetScale(plan);
  if (Math.abs(scale - 1) < 0.08) return display;
  return { ...display, amount: scaleRangeInAmount(display.amount, scale) };
}

export function localizePlanBudgetTip(
  city: string,
  days: number,
  item: string,
  peopleType?: string | null,
): string | null {
  const display = localizePlanBudgetDisplay(city, days, item, peopleType);
  if (!display) return null;
  if (item.includes('往返') || item.includes('大交通')) {
    return display.detail;
  }
  return `${display.detail}，${display.amount}`;
}
