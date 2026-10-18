import type { CapsuleCityPoint } from '@/data/capsuleHotRoutes';
import { capsuleCityPoints } from '@/data/capsuleHotRoutes';

export type HoloCityPreviewContent = {
  intro: string;
  highlights: string[];
  spots: string[];
  foods: string[];
};

const FALLBACK: HoloCityPreviewContent = {
  intro: '一座适合慢下来的城市：少赶景，多走街巷与近郊，把行程交给感受。',
  highlights: ['近郊轻户外', '本地市井烟火', '不赶路的半日线'],
  spots: ['老城漫步区', '近郊绿道', '夜间慢逛街区'],
  foods: ['本地家常味', '街头小吃', '时令时鲜'],
};

/** 预览文案（种草用，不触发攻略/驾驶舱业务） */
const CITY_CONTENT: Record<string, HoloCityPreviewContent> = {
  北京: {
    intro: '古今叠影的慢城样本：胡同与公园比打卡点更值得停驻。',
    highlights: ['胡同骑行', '公园半日闲', '博物馆错峰'],
    spots: ['什刹海', '颐和园外缘', '南锣鼓巷侧巷'],
    foods: ['卤煮火烧', '炸酱面', '豆汁焦圈'],
  },
  上海: {
    intro: '弄堂与江景并行：把步频放慢，城市缝隙里全是生活气。',
    highlights: ['滨江步道', '老洋房街区', '周末近郊岛'],
    spots: ['外滩源', '武康路一带', '朱家角'],
    foods: ['生煎', '本帮红烧', '阿婆甜品'],
  },
  杭州: {
    intro: '湖山一体，最适合「少计划」：顺着绿道与茶山慢慢走。',
    highlights: ['环湖骑行', '茶山半日', '夜游运河'],
    spots: ['西湖绿道', '龙井村', '运河夜色'],
    foods: ['片儿川', '西湖醋鱼', '龙井虾仁'],
  },
  苏州: {
    intro: '园林之外还有水巷与近郊古镇，适合把一天拆成几段闲逛。',
    highlights: ['园林错峰', '水巷漫步', '古镇夜色'],
    spots: ['平江路', '拙政园外缘', '同里/甪直'],
    foods: ['苏式面', '松鼠鳜鱼', '糕团'],
  },
  济南: {
    intro: '泉城慢游：听泉、走老街、吃一碗热乎的本地味。',
    highlights: ['泉水脉络', '老商埠', '近郊山线'],
    spots: ['趵突泉周边', '芙蓉街侧巷', '大明湖环线'],
    foods: ['把子肉', '油旋', '甜沫'],
  },
  南京: {
    intro: '城墙与梧桐夹道，把历史当成散步的背景音。',
    highlights: ['城墙慢行', '民国街区', '江景日落'],
    spots: ['老门东', '玄武湖', '中山陵外缘'],
    foods: ['鸭血粉丝', '盐水鸭', '小笼'],
  },
  广州: {
    intro: '市井与珠江并进：早茶拉开一天，夜市把节奏放软。',
    highlights: ['早茶文化', '珠江夜游', '老城骑楼'],
    spots: ['永庆坊一带', '沙面', '珠江边'],
    foods: ['早茶点心', '肠粉', '糖水'],
  },
  成都: {
    intro: '慢是本地默认设置：茶馆、绿道与近郊山野都很近。',
    highlights: ['茶馆半日', '绿道骑行', '近郊轻徒步'],
    spots: ['宽窄巷侧街', '锦城绿道', '青城山前山'],
    foods: ['火锅', '串串', '甜水面'],
  },
  西安: {
    intro: '古城墙内外都可慢走，把博物馆与夜市拆成轻松段落。',
    highlights: ['城墙骑行', '回坊夜色', '博物馆半日'],
    spots: ['永宁门一带', '大唐不夜城外缘', '回民街侧巷'],
    foods: ['肉夹馍', '凉皮', '羊肉泡馍'],
  },
  青岛: {
    intro: '海风与老建筑：把行程交给海岸线与啤酒味的傍晚。',
    highlights: ['滨海步道', '老城街巷', '近郊海岛感'],
    spots: ['栈桥周边', '八大关', '金沙滩外缘'],
    foods: ['海鲜大排档', '啤酒配蛤蜊', '烤鱿鱼'],
  },
  厦门: {
    intro: '岛城短途友好：骑行、巷弄与对岸鼓浪屿节奏都很慢。',
    highlights: ['环岛骑行', '文艺巷弄', '海边日落'],
    spots: ['环岛路', '沙坡尾', '鼓浪屿外缘'],
    foods: ['沙茶面', '海蛎煎', '花生汤'],
  },
  重庆: {
    intro: '立体城市适合「少赶多看」：索道、步道与江景交错。',
    highlights: ['步道爬坡', '江景夜色', '老街烟火'],
    spots: ['洪崖洞外缘', '磁器口侧巷', '南山一棵树远眺'],
    foods: ['火锅', '小面', '酸辣粉'],
  },
  大理: {
    intro: '环湖与风花雪月之外，更值得停的是村子与骑行道。',
    highlights: ['环海骑行', '村落漫游', '苍山轻徒步'],
    spots: ['洱海生态廊道', '喜洲', '双廊外缘'],
    foods: ['乳扇', '饵块', '酸辣鱼'],
  },
};

/** 城市近似坐标（用于迷你地球定位演示） */
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  北京: { lat: 39.9, lng: 116.4 },
  上海: { lat: 31.23, lng: 121.47 },
  杭州: { lat: 30.25, lng: 120.17 },
  苏州: { lat: 31.3, lng: 120.62 },
  济南: { lat: 36.65, lng: 117.12 },
  南京: { lat: 32.06, lng: 118.8 },
  广州: { lat: 23.13, lng: 113.26 },
  成都: { lat: 30.57, lng: 104.07 },
  西安: { lat: 34.26, lng: 108.94 },
  青岛: { lat: 36.07, lng: 120.38 },
  厦门: { lat: 24.48, lng: 118.09 },
  重庆: { lat: 29.56, lng: 106.55 },
  大理: { lat: 25.6, lng: 100.27 },
  昆明: { lat: 25.04, lng: 102.71 },
  桂林: { lat: 25.27, lng: 110.29 },
  阳朔: { lat: 24.78, lng: 110.5 },
  丽江: { lat: 26.86, lng: 100.23 },
  敦煌: { lat: 40.14, lng: 94.66 },
  长沙: { lat: 28.23, lng: 112.94 },
  武汉: { lat: 30.59, lng: 114.3 },
  深圳: { lat: 22.54, lng: 114.06 },
  天津: { lat: 39.12, lng: 117.2 },
  拉萨: { lat: 29.65, lng: 91.12 },
  黄山: { lat: 30.14, lng: 118.17 },
  洛阳: { lat: 34.62, lng: 112.45 },
  威海: { lat: 37.51, lng: 122.12 },
  泉州: { lat: 24.87, lng: 118.68 },
  西宁: { lat: 36.62, lng: 101.78 },
  舟山: { lat: 30.02, lng: 122.11 },
  凤凰: { lat: 27.95, lng: 109.6 },
  无锡: { lat: 31.49, lng: 120.31 },
  扬州: { lat: 32.39, lng: 119.42 },
  霞浦: { lat: 26.89, lng: 120.0 },
  张掖: { lat: 38.93, lng: 100.45 },
  普洱: { lat: 22.78, lng: 100.97 },
  宏村: { lat: 30.0, lng: 117.99 },
  肇兴: { lat: 25.91, lng: 109.17 },
  建水: { lat: 23.64, lng: 102.83 },
  临海: { lat: 28.86, lng: 121.14 },
  桐庐: { lat: 29.79, lng: 119.69 },
  福鼎: { lat: 27.32, lng: 120.22 },
  阿勒泰: { lat: 47.85, lng: 88.14 },
  中卫: { lat: 37.51, lng: 105.18 },
  仙居: { lat: 28.85, lng: 120.73 },
};

export function getHoloCityPreviewContent(city: string): HoloCityPreviewContent {
  return CITY_CONTENT[city] ?? FALLBACK;
}

export function resolveHoloCityPoint(city: string): CapsuleCityPoint {
  const fromCapsule = capsuleCityPoints.find((p) => p.label === city || p.label.startsWith(city));
  if (fromCapsule) return fromCapsule;
  const coords = CITY_COORDS[city] ?? { lat: 35.0, lng: 105.0 };
  return {
    id: `holo-${city}`,
    label: city,
    lat: coords.lat,
    lng: coords.lng,
  };
}
