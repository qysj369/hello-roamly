import type { SearchPlanPartyFocus } from '@/lib/home/searchPlanParty';

export type PlanAsideKind = 'landmark' | 'food' | 'party';

export type PlanAsideAsset = {
  name: string;
  photoPath: string;
  keys: string[];
  kind: PlanAsideKind;
  parties: Exclude<SearchPlanPartyFocus, 'other'>[];
  place?: string;
};

/** 上海行程侧栏图库：通用地标 + 美食 + 分人群场景，≥15 张本城路径 */
export const SHANGHAI_PLAN_ASIDE_ASSETS: readonly PlanAsideAsset[] = [
  {
    name: '外滩',
    photoPath: '/city-kit/shanghai/spot-bund.jpg',
    keys: ['外滩', '外滩滨江', '外滩源'],
    kind: 'landmark',
    parties: ['friends', 'couple', 'solo'],
  },
  {
    name: '陆家嘴夜色',
    photoPath: '/city-kit/shanghai/spot-bund-night.jpg',
    keys: ['陆家嘴', '夜景', '滨江'],
    kind: 'landmark',
    parties: ['couple'],
  },
  {
    name: '豫园',
    photoPath: '/city-kit/shanghai/spot-yuyuan.jpg',
    keys: ['豫园', '城隍庙', '豫园老街'],
    kind: 'landmark',
    parties: ['friends', 'family', 'solo'],
  },
  {
    name: '黄浦江畔',
    photoPath: '/city-kit/shanghai/cover.jpg',
    keys: ['黄浦江', '江畔'],
    kind: 'landmark',
    parties: ['friends', 'couple', 'solo'],
  },
  {
    name: '武康大楼',
    photoPath: '/plan-scenes/shanghai/spot-wukang.jpg',
    keys: ['武康', '武康路', '梧桐'],
    kind: 'landmark',
    parties: ['friends', 'couple'],
  },
  {
    name: '新天地石库门',
    photoPath: '/plan-scenes/shanghai/spot-xintiandi.jpg',
    keys: ['新天地', '石库门'],
    kind: 'landmark',
    parties: ['friends', 'couple'],
  },
  {
    name: '上海博物馆',
    photoPath: '/plan-scenes/shanghai/spot-natural-museum.jpg',
    keys: ['上海博物馆', '上博'],
    kind: 'landmark',
    parties: ['friends', 'family', 'solo'],
  },
  {
    name: '人民广场',
    photoPath: '/plan-scenes/shanghai/spot-peoples-square.jpg',
    keys: ['人民广场'],
    kind: 'landmark',
    parties: ['friends', 'family', 'solo'],
  },
  {
    name: '上海自然博物馆',
    photoPath: '/plan-scenes/shanghai/spot-natural-museum.jpg',
    keys: ['自然博物馆'],
    kind: 'party',
    parties: ['family'],
  },
  {
    name: '上海科技馆',
    photoPath: '/plan-scenes/shanghai/spot-science-museum.jpg',
    keys: ['科技馆'],
    kind: 'party',
    parties: ['family'],
  },
  {
    name: '世纪公园绿地',
    photoPath: '/plan-scenes/shanghai/spot-century-park.jpg',
    keys: ['世纪公园', '绿地'],
    kind: 'party',
    parties: ['family'],
  },
  {
    name: '北外滩日落',
    photoPath: '/plan-scenes/shanghai/spot-north-bund.jpg',
    keys: ['北外滩', '日落'],
    kind: 'party',
    parties: ['couple'],
  },
  {
    name: '徐汇滨江',
    photoPath: '/plan-scenes/shanghai/spot-xuhui-river.jpg',
    keys: ['徐汇滨江', '龙美术馆'],
    kind: 'party',
    parties: ['couple'],
  },
  {
    name: '老城街巷',
    photoPath: '/plan-scenes/shanghai/spot-old-street.jpg',
    keys: ['老街', '街巷', '市集'],
    kind: 'party',
    parties: ['friends'],
  },
  {
    name: '沈大成点心',
    photoPath: '/plan-scenes/shanghai/spot-food-shendacheng.jpg',
    keys: ['沈大成', '条头糕', '点心'],
    kind: 'food',
    parties: ['friends', 'family', 'solo'],
    place: '南京东路 / 人民广场',
  },
  {
    name: '南翔小笼',
    photoPath: '/plan-scenes/shanghai/spot-food-xiaolong.jpg',
    keys: ['南翔', '小笼', '馒头店'],
    kind: 'food',
    parties: ['friends', 'family', 'solo'],
    place: '城隍庙 / 静安',
  },
  {
    name: '生煎',
    photoPath: '/plan-scenes/shanghai/spot-food-shengjian.jpg',
    keys: ['生煎', '小杨生煎'],
    kind: 'food',
    parties: ['friends', 'solo'],
    place: '黄浦 / 静安',
  },
  {
    name: '本帮小炒',
    photoPath: '/plan-scenes/shanghai/spot-food-benbang.jpg',
    keys: ['本帮', '红烧肉', '老吉士'],
    kind: 'food',
    parties: ['couple'],
    place: '本帮馆子',
  },
  {
    name: '咖啡馆特调',
    photoPath: '/plan-scenes/shanghai/spot-food-cafe.jpg',
    keys: ['咖啡', '老麦', '毕尔巴鄂'],
    kind: 'food',
    parties: ['friends', 'couple'],
    place: '武康路 / 安福路',
  },
];
