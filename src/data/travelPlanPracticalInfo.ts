import type { TravelPlanPracticalInfo } from '@/types/domain/travelPlanPracticalInfo';
import type { TravelOptions } from '@/types/domain/travelOptions';

const PRACTICAL_BY_GUIDE_ID: Record<string, TravelPlanPracticalInfo> = {
  hangzhou: {
    accommodationTips: [
      '优先选地铁沿线的青旅或连锁酒店，步行可达景区的片区略贵但省时间。',
      '周末西湖周边房源紧张，建议提前 3–5 天预订；淡季工作日可当日比价。',
      '若住龙翔桥 / 定安路附近，夜间出行方便，注意 23 点后公交减少。',
    ],
    transportationTips: [
      '机场 / 高铁可坐地铁 + 公交进城，比打车便宜；西湖景区环线公交覆盖主要景点。',
      '共享单车适合短距离串点，景区步行道多，穿舒适鞋。',
      '去灵隐、西溪等郊区景点预留单程 40–60 分钟交通时间。',
    ],
    precautions: [
      '西湖免费，但部分寺庙、游船项目另收费，现场比价后再购票。',
      '雨季备轻便雨具；夏季防晒防蚊，节假日断桥、雷峰塔人流大。',
      '保管好手机与钱包，景区周边注意低价「一日游」推销。',
    ],
  },
  xiamen: {
    accommodationTips: [
      '住中山路 / 轮渡码头附近便于早晚逛吃；鼓浪屿需订船票+岛上住宿，行李轻装。',
      '曾厝垵民宿多，夜间可能吵，看房型评价再下单。',
      '旺季（暑期、国庆）价格翻倍，能错峰尽量错峰。',
    ],
    transportationTips: [
      '上鼓浪屿提前在官方渠道买船票，高峰时段排队久。',
      '岛内以步行为主，坡度多；市区公交 + BRT 性价比高。',
      '机场快线 / 地铁进市区，比出租车更稳定。',
    ],
    precautions: [
      '海边紫外线强，备防晒与防风外套；台风季关注天气改签。',
      '海鲜排档先问清计价方式，避免按「斤」被误导。',
      '鼓浪屿部分路段禁行机动车，规划好返程船班时间。',
    ],
  },
  xian: {
    accommodationTips: [
      '推荐钟楼、南门、大雁塔附近，地铁换乘方便、夜宵选择多。',
      '回民街周边热闹但略吵，浅睡者可备耳塞。',
      '冬季室内有暖气，夏季空调房注意补水。',
    ],
    transportationTips: [
      '地铁覆盖主要景点；城墙段可步行 + 租车，注意防晒。',
      '兵马俑建议预留半天以上，乘正规旅游专线或地铁换乘。',
      '机场大巴 / 地铁到市区约 1 小时，高峰预留余量。',
    ],
    precautions: [
      '热门小吃排队久，错峰用餐；辣度较高，肠胃敏感者适量。',
      '博物馆类景点多需预约（如陕西历史博物馆），提前在官方平台抢票。',
      '古城内拉客「低价团」勿轻信，行程以官方信息为准。',
    ],
  },
  chengdu: {
    accommodationTips: [
      '春熙路 / 天府广场 / 宽窄巷子周边交通方便，但夜生活区可能吵。',
      '选有独立卫浴的连锁或青旅，注意查看近一年评价。',
      '看熊猫可住动物园或熊猫基地附近一早入园，市区住则需早起。',
    ],
    transportationTips: [
      '地铁 + 公交覆盖市区；去都江堰、青城山可乘城际列车。',
      '市区景点集中，共享单车 + 步行效率高。',
      '双流 / 天府机场距离市区远，预留 1 小时以上通勤。',
    ],
    precautions: [
      '火锅辣度可调，先点鸳鸯锅；排队热门店可取号后周边逛。',
      '夏季闷热、冬季阴冷湿，衣物分层携带。',
      '留意节假日宽窄巷子、锦里人流，保管随身物品。',
    ],
  },
};

const DEFAULT_PRACTICAL: TravelPlanPracticalInfo = {
  accommodationTips: [
    '优先选择地铁/公交便利区域，减少每日通勤时间和费用。',
    '多平台比价预订，关注可免费取消的房型。',
  ],
  transportationTips: [
    '市内移动以公共交通 + 步行为主，提前下载当地地铁/公交乘车码。',
    '高峰时段打车难且贵，重要行程预留时间缓冲。',
  ],
  precautions: [
    '随身携带身份证件，部分景区需实名预约。',
    '关注天气预报，节假日热门景点建议提前预约或错峰。',
    '注意饮食卫生与个人财物安全。',
  ],
};

export function getPracticalInfoForGuide(guideId: string): TravelPlanPracticalInfo {
  return PRACTICAL_BY_GUIDE_ID[guideId] ?? DEFAULT_PRACTICAL;
}

/** 根据旅行选项微调演示文案 */
export function buildPracticalInfoFromOptions(
  guideId: string,
  options: TravelOptions,
): TravelPlanPracticalInfo {
  const base = getPracticalInfoForGuide(guideId);
  const budgetNote =
    options.budget?.max != null && options.budget.max < 2000
      ? '总预算较紧，建议选青旅床位或远地铁一步的民宿，餐饮以本地小吃为主。'
      : '可在交通便捷片区适当提高住宿标准，仍建议提前比价锁定房源。';

  let paceNote = '每日动线适中，住宿与当日末站距离控制在 20 分钟内为佳。';
  if (options.pace === 'intense') {
    paceNote = '行程较满，住宿选靠近次日首站的区域，减少清晨通勤。';
  } else if (options.pace === 'relaxed') {
    paceNote = '节奏悠闲，可住景区外围安静片区，不必强求市中心。';
  }

  return {
    accommodationTips: [budgetNote, paceNote, ...base.accommodationTips].slice(0, 5),
    transportationTips: base.transportationTips,
    precautions: base.precautions,
  };
}
