import type { DreamTripCard } from '@/data/holoDreamTripCards';
import { holoDreamTripCards } from '@/data/holoDreamTripCards';

export type HoloInspireSceneDetail = {
  key: DreamTripCard['key'];
  /** 场景长介绍（种草） */
  intro: string;
  /** 适合的国内近郊目的地 */
  nearbyPlaces: string[];
};

/**
 * 漫游灵感种草文案：对齐四大价值观（松弛优先 / 真实在地 / 纯粹免费 / 轻量漫行）
 * 剔除高强度、商业化出行描述。
 */
const SCENE_DETAILS: Record<string, Omit<HoloInspireSceneDetail, 'key'>> = {
  farmstay: {
    intro: '离开流水线打卡点，去田埂与果园待半天：采摘、闲坐、和孩子一起把时间变慢。',
    nearbyPlaces: ['杭州·径山/龙井茶村', '成都·蒲江/邛崃近郊', '南京·高淳慢城', '苏州·东山/西山'],
  },
  camping: {
    intro: '不是网红露营地排队，而是星空与可控的轻装过夜——适合周末近郊松弛一晚。',
    nearbyPlaces: ['湖州·莫干山营地', '昆明·轿子山前山', '北京·怀柔浅山', '重庆·武隆近郊营地'],
  },
  heritage: {
    intro: '手作、市集与非遗体验：把「买」换成「做」，在灯火里感受在地节奏。',
    nearbyPlaces: ['泉州·古城手作', '苏州·平江夜市侧巷', '景德镇近郊窑口', '大理·喜洲手作'],
  },
  rafting: {
    intro: '溪谷浅水的半日轻游：选水位友好、可轻松往返的近郊线，把体力留给闲逛。',
    nearbyPlaces: ['桐庐·天目溪', '清远·黄腾峡近线', '湘西·峒河轻漂', '龙岩·永定近郊溪谷'],
  },
  cycling: {
    intro: '绿道与湖畔才是主角：平缓路段、树影与闲聊，比配速重要，亲子也可随行。',
    nearbyPlaces: ['杭州·西湖/运河绿道', '厦门·环岛路', '成都·锦城绿道', '大理·洱海生态廊'],
  },
  nighttown: {
    intro: '古镇夜游拒绝人潮剧本：灯影、巷弄与慢步，选错峰与次热门侧街更舒服。',
    nearbyPlaces: ['乌镇西栅外缘', '凤凰古城侧街', '丽江束河', '绍兴·仓桥直街'],
  },
};

export function getHoloInspireSceneDetail(key: string): HoloInspireSceneDetail {
  const card = holoDreamTripCards.find((c) => c.key === key);
  const detail = SCENE_DETAILS[key] ?? {
    intro: '近郊小众慢旅行场景：少流水线打卡、多在地空档，把周末还给山野与市井。',
    nearbyPlaces: ['本地近郊绿道', '周末古镇侧巷', '浅山轻徒步点'],
  };
  return {
    key: (card?.key ?? key) as DreamTripCard['key'],
    ...detail,
  };
}
