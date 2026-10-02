/**
 * 首页热门城市内嵌数组（非外部 JSON）。
 * 规则：一城一专属本地实拍封面；一景点一本地图库路径并标注地标名；
 * AI 仅可读取路径，禁止生成/替换图片。首页 13 城 +「更多」进 /cities。
 *
 * 文案约束：本地人视角、近郊松弛慢游；优先老街古巷本地老店。
 * 产品底线：城市弹窗查询永久免费（见 productPositioning）。
 */
import type { BusinessExtensionFields } from '@/types/domain/businessExtensions';

export type HoloCitySpotKit = {
  name: string;
  keys: string[];
  photoPath: string;
  /** 画廊一句旁白，短、具体，不讲大道理 */
  blurb?: string;
  lat: number;
  lng: number;
} & BusinessExtensionFields;

export type HoloHomeCityKitItem = {
  id: string;
  name: string;
  nameEn: string;
  coverPath: string;
  lat: number;
  lng: number;
  /** 种草短文：松弛叙事，自然带过景 / 食 / 行 */
  intro: string;
  highlights: string[];
  foods: string[];
  transit: string;
  /** 慢行小贴士（短句，弹窗用 ▫️/🌿 排） */
  tips: string[];
  spots: HoloCitySpotKit[];
} & BusinessExtensionFields;

/** 首页热门城；素材指向 /public/city-kit（深圳走 plan-scenes） */
export const HOLO_HOME_CITY_KIT: readonly HoloHomeCityKitItem[] = [
  {
    id: 'beijing',
    name: '北京',
    nameEn: 'Beijing',
    coverPath: '/city-kit/beijing/cover.jpg',
    lat: 39.9,
    lng: 116.4,
    intro:
      '夏天的什刹海傍晚最好坐着看。人不多时，骑到湖边喝点东西；想安静一点，就去颐和园外缘的长廊吹风。肚子饿了，附近一碗炸酱面或卤煮就够，地铁到站后短途留给腿。',
    highlights: ['什刹海', '颐和园外缘', '胡同'],
    foods: ['炸酱面', '卤煮', '豆汁焦圈'],
    transit: '地铁到站后，短途更适合走走或骑车；胡同里别赶点。',
    tips: ['傍晚去湖边，比正午松', '园外缘往往比园门好坐'],
    spots: [
      {
        name: '什刹海',
        keys: ['什刹海', '后海'],
        photoPath: '/city-kit/beijing/spot-shichahai.jpg',
        blurb: '傍晚湖边，风比景点名单重要。',
        lat: 39.94,
        lng: 116.39,
      },
      {
        name: '颐和园外缘',
        keys: ['颐和园', '颐和园外缘'],
        photoPath: '/city-kit/beijing/spot-yiheyuan.jpg',
        blurb: '不一定买票进园，长廊外也很慢。',
        lat: 39.999,
        lng: 116.275,
      },
    ],
  },
  {
    id: 'shanghai',
    name: '上海',
    nameEn: 'Shanghai',
    coverPath: '/city-kit/shanghai/cover.jpg',
    lat: 31.23,
    lng: 121.47,
    intro:
      '外滩走走就够半天。想躲人群，钻进豫园亭廊一带；饿了买生煎，边走边吃。过江坐地铁，江边那一段留给腿。',
    highlights: ['外滩', '豫园', '滨江'],
    foods: ['生煎', '本帮小炒', '阿婆甜品'],
    transit: '地铁过江；滨江更适合步行，别把时间耗在换乘上。',
    tips: ['天际线留给傍晚', '豫园适合空走，不必进店'],
    spots: [
      {
        name: '外滩',
        keys: ['外滩源', '外滩'],
        photoPath: '/city-kit/shanghai/spot-bund.jpg',
        blurb: '天际线在傍晚最好看。',
        lat: 31.24,
        lng: 121.49,
      },
      {
        name: '豫园',
        keys: ['豫园', '城隍庙'],
        photoPath: '/city-kit/shanghai/spot-yuyuan.jpg',
        blurb: '亭廊水影，适合慢慢晃。',
        lat: 31.23,
        lng: 121.49,
      },
    ],
  },
  {
    id: 'hangzhou',
    name: '杭州',
    nameEn: 'Hangzhou',
    coverPath: '/city-kit/hangzhou/cover.jpg',
    lat: 30.259,
    lng: 120.143,
    intro:
      '环湖走一截比进园排队舒服。灵隐人少时更松，龙井村适合喝茶闲逛；夜里拱宸桥一带桥灯亮了再去。片儿川暖胃，其余随缘，别把一天排满。',
    highlights: ['西湖环湖', '灵隐寺', '拱宸桥', '龙井村'],
    foods: ['片儿川', '龙井虾仁', '西湖醋鱼'],
    transit: '西湖周边优先骑行或步行；远一点再坐地铁。去龙井村预留半日空档。',
    tips: ['节假日西湖人多，错峰更松', '傍晚再去运河边'],
    spots: [
      {
        name: '西湖环湖',
        keys: ['西湖', '苏堤', '西湖环湖'],
        photoPath: '/city-kit/hangzhou/spot-westlake.jpg',
        blurb: '骑一段或走一段就够，不必赶遍岸边。',
        lat: 30.259,
        lng: 120.143,
      },
      {
        name: '灵隐寺',
        keys: ['灵隐', '灵隐寺'],
        photoPath: '/city-kit/hangzhou/spot-lingyin.jpg',
        blurb: '清晨香客少，后山步道更静。',
        lat: 30.2412,
        lng: 120.0968,
      },
      {
        name: '京杭大运河（拱宸桥）',
        keys: ['拱宸桥', '运河'],
        photoPath: '/city-kit/hangzhou/spot-boat.jpg',
        blurb: '傍晚桥灯亮起后，慢慢晃一圈。',
        lat: 30.3184,
        lng: 120.1495,
      },
      {
        name: '龙井村',
        keys: ['龙井村', '茶园', '龙井'],
        photoPath: '/city-kit/hangzhou/spot-teahill-2.jpg',
        blurb: '茶垄之间空走，找家茶馆坐下就好。',
        lat: 30.2267,
        lng: 120.0806,
      },
    ],
  },
  {
    id: 'suzhou',
    name: '苏州',
    nameEn: 'Suzhou',
    coverPath: '/city-kit/suzhou/cover.jpg',
    lat: 31.3,
    lng: 120.62,
    intro:
      '平江路适合边走边吃。园林人多就看看外缘的墙和树；想更静，同里外缘吹半日风。一碗苏式面够了，古城内多走路更顺。',
    highlights: ['平江路', '拙政园外缘', '同里'],
    foods: ['苏式面', '糕团', '松鼠鳜鱼'],
    transit: '古城内多走路；古镇可短途接驳，不必硬排园门。',
    tips: ['石板路边走边吃', '人多时看墙影也够'],
    spots: [
      {
        name: '平江路',
        keys: ['平江路', '平江'],
        photoPath: '/city-kit/suzhou/spot-pingjiang.jpg',
        blurb: '石板路，边走边买点吃的。',
        lat: 31.32,
        lng: 120.63,
      },
      {
        name: '拙政园外缘',
        keys: ['拙政园', '拙政园外缘'],
        photoPath: '/city-kit/suzhou/spot-zhuozheng.jpg',
        blurb: '园外墙影也有味道。',
        lat: 31.324,
        lng: 120.629,
      },
      {
        name: '同里外缘',
        keys: ['同里', '甪直'],
        photoPath: '/city-kit/suzhou/spot-tongli.jpg',
        blurb: '桥多、船慢，半日刚好。',
        lat: 31.16,
        lng: 120.72,
      },
    ],
  },
  {
    id: 'jinan',
    name: '济南',
    nameEn: 'Jinan',
    coverPath: '/city-kit/jinan/cover.jpg',
    lat: 36.65,
    lng: 117.12,
    intro:
      '先听趵突泉，再去芙蓉街找点热乎的。大明湖适合把步子放慢。油旋、把子肉，点自己想吃的就行；老城一段走路最顺。',
    highlights: ['趵突泉', '芙蓉街', '大明湖'],
    foods: ['把子肉', '油旋', '甜沫'],
    transit: '老城一段，走路最顺；稍远再坐公交。',
    tips: ['清晨泉声更清楚', '芙蓉街侧巷比主街松'],
    spots: [
      {
        name: '趵突泉',
        keys: ['趵突泉', '趵突泉周边'],
        photoPath: '/city-kit/jinan/spot-baotu.jpg',
        blurb: '清晨泉声更清楚。',
        lat: 36.66,
        lng: 117.01,
      },
      {
        name: '芙蓉街',
        keys: ['芙蓉街', '芙蓉'],
        photoPath: '/city-kit/jinan/spot-furong.jpg',
        blurb: '侧巷吃东西，比主街松一点。',
        lat: 36.665,
        lng: 117.02,
      },
      {
        name: '大明湖',
        keys: ['大明湖', '大明湖环线'],
        photoPath: '/city-kit/jinan/spot-daming.jpg',
        blurb: '环湖走一圈，城市声远了。',
        lat: 36.68,
        lng: 117.03,
      },
    ],
  },
  {
    id: 'nanjing',
    name: '南京',
    nameEn: 'Nanjing',
    coverPath: '/city-kit/nanjing/cover.jpg',
    lat: 32.06,
    lng: 118.8,
    intro:
      '玄武湖日落前后最好逛。中山陵外缘留一段缓坡就行，不必冲顶。午饭鸭血粉丝或盐水鸭，地铁到站后湖边多走路。',
    highlights: ['玄武湖', '中山陵外缘', '城墙'],
    foods: ['鸭血粉丝', '盐水鸭', '小笼'],
    transit: '地铁到站，湖边多走路；陵园只走外缘缓坡即可。',
    tips: ['日落前后去湖边', '不必冲顶，走到哪算哪'],
    spots: [
      {
        name: '玄武湖',
        keys: ['玄武湖'],
        photoPath: '/city-kit/nanjing/spot-xuanwu.jpg',
        blurb: '日落前后，风刚好。',
        lat: 32.07,
        lng: 118.8,
      },
      {
        name: '中山陵外缘',
        keys: ['中山陵', '中山陵外缘'],
        photoPath: '/city-kit/nanjing/spot-zhongshan.jpg',
        blurb: '林荫缓坡，走到哪里算哪里。',
        lat: 32.05,
        lng: 118.85,
      },
    ],
  },
  {
    id: 'guangzhou',
    name: '广州',
    nameEn: 'Guangzhou',
    coverPath: '/city-kit/guangzhou/cover.jpg',
    lat: 23.13,
    lng: 113.26,
    intro:
      '早茶开启一天，沙面树荫下走走。傍晚去珠江边吹风。肠粉、点心、糖水按顿点就好；地铁到老城后，江边留给步行。',
    highlights: ['沙面', '珠江', '早茶'],
    foods: ['早茶点心', '肠粉', '糖水'],
    transit: '地铁到老城后，江边步行；短途别换乘太勤。',
    tips: ['早茶别赶点', '夜风起来再去江边'],
    spots: [
      {
        name: '沙面',
        keys: ['沙面', '沙面岛'],
        photoPath: '/city-kit/guangzhou/spot-shamian.jpg',
        blurb: '树荫与铜像，适合慢慢逛。',
        lat: 23.11,
        lng: 113.24,
      },
      {
        name: '珠江边',
        keys: ['珠江', '珠江边', '广州塔'],
        photoPath: '/city-kit/guangzhou/spot-river-skyline.jpg',
        blurb: '塔影江风，步子自然慢。',
        lat: 23.11,
        lng: 113.32,
      },
    ],
  },
  {
    id: 'shenzhen',
    name: '深圳',
    nameEn: 'Shenzhen',
    coverPath: '/plan-scenes/shenzhen/cover-sz.jpg',
    lat: 22.54,
    lng: 114.06,
    intro:
      '白天在海岸城附近歇脚，傍晚去深圳湾栈道吹海风。一顿早茶或花胶鸡煲收尾，地铁到站后滨海那段留给腿。',
    highlights: ['深圳湾', '海岸城', '科技园'],
    foods: ['粤式早茶', '花胶鸡煲', '肠粉'],
    transit: '地铁到湾区，栈道步行；滨海段不必再坐车。',
    tips: ['落日前后去栈道', '海岸城适合歇脚补给'],
    spots: [
      {
        name: '海岸城',
        keys: ['海岸城', '海岸城商圈'],
        photoPath: '/plan-scenes/shenzhen/coast-city.jpg',
        blurb: '补给、歇脚，都方便。',
        lat: 22.52,
        lng: 113.94,
      },
      {
        name: '深圳湾栈道',
        keys: ['深圳湾滨海栈道', '深圳湾公园', '深圳湾'],
        photoPath: '/plan-scenes/shenzhen/bay-park.jpg',
        blurb: '落日前后，风最大。',
        lat: 22.52,
        lng: 113.99,
      },
      {
        name: '南山科技园',
        keys: ['南山科技园', '科技园', '高新南'],
        photoPath: '/plan-scenes/shenzhen/nanshan-tech.jpg',
        blurb: '绿荫和咖啡，歇一口气。',
        lat: 22.54,
        lng: 113.95,
      },
    ],
  },
  {
    id: 'chengdu',
    name: '成都',
    nameEn: 'Chengdu',
    coverPath: '/city-kit/chengdu/cover.jpg',
    lat: 30.67,
    lng: 104.06,
    intro:
      '宽窄外缘找家茶馆坐下，比挤主街舒服。锦里灯笼下走走，有空再去青城山晃半日。火锅还是冒菜，看当天想吃什么；城里地铁，近郊再换乘。',
    highlights: ['宽窄外缘', '锦里', '青城山'],
    foods: ['火锅', '冒菜', '兔丁'],
    transit: '城里地铁；近郊再换乘，别把一天排满。',
    tips: ['茶座比主街耐坐', '青城山留给半日空档'],
    spots: [
      {
        name: '宽窄外缘',
        keys: ['宽窄巷子', '宽窄'],
        photoPath: '/city-kit/chengdu/spot-kuanzhai.jpg',
        blurb: '茶座比主街耐坐。',
        lat: 30.67,
        lng: 104.05,
      },
      {
        name: '锦里',
        keys: ['锦里', '锦里古街'],
        photoPath: '/city-kit/chengdu/spot-jinli.jpg',
        blurb: '灯笼巷子，慢慢晃。',
        lat: 30.65,
        lng: 104.05,
      },
      {
        name: '青城山',
        keys: ['青城山', '青城'],
        photoPath: '/city-kit/chengdu/spot-qingcheng.jpg',
        blurb: '云雾里的石阶，走到哪算哪。',
        lat: 30.9,
        lng: 103.57,
      },
    ],
  },
  {
    id: 'xian',
    name: '西安',
    nameEn: 'Xi’an',
    coverPath: '/city-kit/xian/cover.jpg',
    lat: 34.27,
    lng: 108.95,
    intro:
      '城墙上租车慢骑半圈就很爽。下来找碗肉夹馍或凉皮。大雁塔外缘晚上灯亮了再去看看，不一定登塔；地铁到古城后，城墙骑行最省事。',
    highlights: ['城墙', '大雁塔外缘', '回坊'],
    foods: ['肉夹馍', '凉皮', '胡辣汤'],
    transit: '地铁到古城；城墙骑行最省事，短途别硬走。',
    tips: ['租车半圈就够', '夜灯亮了再去塔外缘'],
    spots: [
      {
        name: '城墙',
        keys: ['西安城墙', '城墙'],
        photoPath: '/city-kit/xian/spot-wall.jpg',
        blurb: '租车半圈，比硬走轻松。',
        lat: 34.26,
        lng: 108.94,
      },
      {
        name: '大雁塔外缘',
        keys: ['大雁塔'],
        photoPath: '/city-kit/xian/spot-dayan.jpg',
        blurb: '夜灯亮起后更好逛。',
        lat: 34.22,
        lng: 108.96,
      },
    ],
  },
  {
    id: 'xiamen',
    name: '厦门',
    nameEn: 'Xiamen',
    coverPath: '/city-kit/xiamen/cover.jpg',
    lat: 24.48,
    lng: 118.09,
    intro:
      '鼓浪屿别追店，找一段安静海边坐下。环岛路傍晚骑一截海风最好。沙茶面、海鲜粥饿了再点；轮渡上岛，环岛适合骑行。',
    highlights: ['鼓浪屿', '环岛路', '海边'],
    foods: ['沙茶面', '海鲜粥', '花生汤'],
    transit: '轮渡上岛；环岛适合骑行，别追店。',
    tips: ['找安静海岸坐下', '傍晚再骑环岛路'],
    spots: [
      {
        name: '鼓浪屿',
        keys: ['鼓浪屿'],
        photoPath: '/city-kit/xiamen/spot-gulangyu.jpg',
        blurb: '找安静海岸，坐一会儿。',
        lat: 24.45,
        lng: 118.06,
      },
      {
        name: '环岛路',
        keys: ['环岛路', '环岛'],
        photoPath: '/city-kit/xiamen/spot-huandao.jpg',
        blurb: '傍晚海风，骑一段就够。',
        lat: 24.44,
        lng: 118.12,
      },
    ],
  },
  {
    id: 'huangshan',
    name: '黄山',
    nameEn: 'Huangshan',
    coverPath: '/city-kit/huangshan/cover.jpg',
    lat: 30.13,
    lng: 118.16,
    intro:
      '云海和石阶留给半天就好，不必硬冲顶。山下找碗徽菜暖胃，索道与步行按体力选；把步子放慢，雾散的瞬间最值。',
    highlights: ['黄山主峰外缘', '云海', '徽州村落'],
    foods: ['徽州刀板香', '毛豆腐', '一碗热汤面'],
    transit: '进城后转景区接驳；山路段量力而行，可坐索道。',
    tips: ['雾大时别赶景', '留一段空走看云'],
    spots: [
      {
        name: '黄山主峰外缘',
        keys: ['黄山', '云海', '光明顶'],
        photoPath: '/city-kit/huangshan/spot-main.jpg',
        blurb: '云雾里的石阶，走到哪算哪。',
        lat: 30.13,
        lng: 118.16,
      },
    ],
  },
  {
    id: 'quanzhou',
    name: '泉州',
    nameEn: 'Quanzhou',
    coverPath: '/city-kit/quanzhou/cover.jpg',
    lat: 24.87,
    lng: 118.68,
    intro:
      '开元寺外缘晃晃就够半日，西街边走边吃。牛肉羹、面线糊暖胃；古城内多走路，稍远再坐公交，把海丝旧巷留给慢步。',
    highlights: ['开元寺外缘', '西街', '古城巷'],
    foods: ['牛肉羹', '面线糊', '花生汤'],
    transit: '古城内多走路；稍远再换乘公交。',
    tips: ['寺外缘比人流中心松', '西街边走边吃就好'],
    spots: [
      {
        name: '开元寺外缘',
        keys: ['开元寺', '西街', '泉州古城'],
        photoPath: '/city-kit/quanzhou/spot-main.jpg',
        blurb: '古塔与旧巷，半日刚好。',
        lat: 24.91,
        lng: 118.59,
      },
    ],
  },
];

export function getHoloHomeCityNames(): string[] {
  return HOLO_HOME_CITY_KIT.map((c) => c.name);
}

export function findHoloHomeCityKit(cityOrText: string): HoloHomeCityKitItem | null {
  const hay = cityOrText.replace(/\s+/g, '');
  for (const city of HOLO_HOME_CITY_KIT) {
    if (hay === city.name || hay.includes(city.name)) return city;
  }
  return null;
}

export function localizeHoloHomeCityLabel(city: string, locale: string): string {
  if (locale !== 'en') return city;
  const hit = HOLO_HOME_CITY_KIT.find((c) => c.name === city);
  return hit?.nameEn ?? city;
}
