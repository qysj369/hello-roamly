/**
 * 热门城市弹窗右侧面板文案（氛围标题 / 地标 / 美食 / 出行 / 贴士）。
 * 种草图一律经 getCityPreviewGallery 白名单绑定，禁止混城。
 *
 * 【内容结构 · 固定顺序】城市简介 → 核心地标 → 本地美食与街巷门店 → 出行贴士
 * 【选点原则】优先老街、古巷、本地老店；弱化流水线网红打卡点
 * 【美食】须带街区 / 门店参考（shop · area · note）
 * 【禁词】特惠 / 抢购 / 预订 / 下单 等电商话术
 * 【产品底线】城市弹窗查询永久免费，见 `@/lib/config/productPositioning`
 */

import { getCityPreviewGallery, type HoloPreviewGalleryItem } from '@/data/holoCityPreviewMedia';
import type { BusinessExtensionFields } from '@/types/domain/businessExtensions';

export type HoloPreviewFoodItem = {
  name: string;
  /** 代表性参考店铺；无则不渲染店铺行 */
  shop?: string;
  /** 街区 / 商圈 */
  area?: string;
  /** 无店铺时的风味补充 */
  note?: string;
} & BusinessExtensionFields;

export type HoloPreviewSpotItem = {
  name: string;
  blurb: string;
  tag: string;
  lat: number;
  lng: number;
} & BusinessExtensionFields;

export type HoloCityPreviewPanel = {
  /** 「城·主题漫行」气质短句；弹窗主标题另用「城市·XX漫行」 */
  moodTitle: string;
  moodTitleEn: string;
  intro: string;
  foods: HoloPreviewFoodItem[];
  transit: string;
  tips: string[];
  spots: HoloPreviewSpotItem[];
} & BusinessExtensionFields;

type PanelDraft = Omit<HoloCityPreviewPanel, never>;

const PANEL_DRAFTS: Record<string, PanelDraft> = {
  北京: {
    moodTitle: '北京·湖园漫行',
    moodTitleEn: 'Beijing · Lake & garden roam',
    intro:
      '帝都更适合把步子放慢：清晨故宫外缘看一眼轴线，傍晚把时间交给什刹海。护国寺海碗居一碗炸酱面暖胃，园子之间地铁到站后短途留给腿，少追清单式赶场。',
    foods: [
      { name: '炸酱面', shop: '海碗居', area: '护国寺一带' },
      { name: '北京烤鸭', shop: '四季民福', area: '王府井 / 前门' },
      { name: '卤煮', shop: '小肠陈', area: '老城街巷' },
    ],
    transit: '地铁覆盖主要景区；到站后胡同与园外缘更适合步行或骑行，短途别反复换乘。',
    tips: ['轴线景点清晨更松', '湖边与园外缘留给傍晚', '长城只走一段就够'],
    spots: [
      {
        name: '故宫',
        blurb: '选一条轴线慢慢看，不必求全。',
        tag: '世界遗产',
        lat: 39.9163,
        lng: 116.3972,
      },
      {
        name: '天安门',
        blurb: '广场开阔，清晨人少更好走。',
        tag: '国家级',
        lat: 39.9087,
        lng: 116.3975,
      },
      {
        name: '天坛',
        blurb: '柏树林里空走一圈，比赶点从容。',
        tag: '国家级',
        lat: 39.8822,
        lng: 116.4066,
      },
      {
        name: '长城·八达岭',
        blurb: '不必冲顶，走一段城砖就够。',
        tag: '世界遗产',
        lat: 40.359,
        lng: 116.02,
      },
      {
        name: '颐和园',
        blurb: '佛香阁隔湖望一眼，园外缘也能坐很久。',
        tag: '世界遗产',
        lat: 39.999,
        lng: 116.275,
      },
      {
        name: '什刹海',
        blurb: '夜里灯影落在水里，比景点名单重要。',
        tag: '慢行湖景',
        lat: 39.94,
        lng: 116.39,
      },
    ],
  },
  上海: {
    moodTitle: '上海·江岸漫行',
    moodTitleEn: 'Shanghai · Bund roam',
    intro:
      '开埠与弄堂叠在同一座城里：外滩看一眼天际线就够，余下时间留给豫园亭廊与滨江空走。把节奏放慢，生煎边走边吃，夜色会自己长出来。',
    foods: [
      { name: '生煎', shop: '小杨生煎', area: '黄浦 / 静安' },
      { name: '本帮小炒', shop: '老吉士', area: '淮海中路一带' },
      { name: '白切肉', shop: '老正兴', area: '黄浦老城厢' },
    ],
    transit: '地铁过江最省事；滨江一段留给步行，少在站与站之间空耗。',
    tips: ['天际线留给蓝调时刻', '豫园适合空走', '别把夜景排满'],
    spots: [
      { name: '外滩', blurb: '对岸陆家嘴在傍晚最好看。', tag: '城市地标', lat: 31.24, lng: 121.49 },
      {
        name: '陆家嘴江岸',
        blurb: '夜灯亮起后，站一会儿就够。',
        tag: '江岸夜景',
        lat: 31.235,
        lng: 121.505,
      },
      { name: '豫园', blurb: '亭廊水影，适合慢慢晃。', tag: '慢行园林', lat: 31.23, lng: 121.49 },
    ],
  },
  杭州: {
    moodTitle: '杭州·西湖漫行',
    moodTitleEn: 'Hangzhou · West Lake roam',
    intro:
      '环湖走一截比进园排队舒服。灵隐人少时更松，龙井村适合喝茶闲逛；湖滨奎元馆一碗片儿川暖胃，西湖周边优先骑行或步行，夜里拱宸桥灯亮了再去。',
    foods: [
      { name: '片儿川', shop: '奎元馆', area: '湖滨一带' },
      { name: '龙井虾仁', shop: '楼外楼', area: '西湖边' },
      { name: '西湖醋鱼', shop: '知味观', area: '市区老店' },
    ],
    transit: '西湖周边优先骑行或步行；远一点再坐地铁。去龙井村预留半日空档。',
    tips: ['节假日西湖人多，错峰更松', '傍晚再去运河边'],
    spots: [
      {
        name: '西湖环湖',
        blurb: '骑一段或走一段就够，不必赶遍岸边。',
        tag: '湖畔慢行',
        lat: 30.259,
        lng: 120.143,
      },
      {
        name: '灵隐寺',
        blurb: '清晨香客少，后山步道更静。',
        tag: '名寺',
        lat: 30.2412,
        lng: 120.0968,
      },
      {
        name: '京杭大运河（拱宸桥）',
        blurb: '傍晚桥灯亮起后，慢慢晃一圈。',
        tag: '慢行水岸',
        lat: 30.3184,
        lng: 120.1495,
      },
      {
        name: '龙井村',
        blurb: '茶垄之间空走，找家茶馆坐下就好。',
        tag: '茶山慢逛',
        lat: 30.2267,
        lng: 120.0806,
      },
    ],
  },
  苏州: {
    moodTitle: '苏州·水巷漫行',
    moodTitleEn: 'Suzhou · Canal roam',
    intro:
      '吴门风物藏在墙影与水巷里：园林人多就看拙政园外缘，夜里平江路灯影映在河里更耐看。观前朱鸿兴一碗苏式面收尾，古城内多走路，把一天拆成几段闲逛。',
    foods: [
      { name: '苏式面', shop: '朱鸿兴', area: '观前 / 平江' },
      { name: '糕团', shop: '黄天源', area: '古城街巷' },
      { name: '奥灶面', shop: '陆稿荐', area: '观前街一带' },
    ],
    transit: '古城内多走路；古镇可短途接驳，不必把园门排满。',
    tips: ['水巷夜里更松', '人多时看墙影也够', '古镇半日刚好'],
    spots: [
      {
        name: '拙政园外缘',
        blurb: '园外墙影也有味道，不必硬挤。',
        tag: '世界遗产',
        lat: 31.324,
        lng: 120.629,
      },
      {
        name: '平江路水巷',
        blurb: '红灯映在水里，边走边停。',
        tag: '慢行水巷',
        lat: 31.32,
        lng: 120.63,
      },
      {
        name: '山塘街',
        blurb: '石板与河沿慢慢晃，比挤园门松。',
        tag: '慢行老街',
        lat: 31.317,
        lng: 120.605,
      },
      {
        name: '同里',
        blurb: '游船码头坐一坐，半日刚好。',
        tag: '慢行古镇',
        lat: 31.16,
        lng: 120.72,
      },
    ],
  },
  济南: {
    moodTitle: '济南·泉城漫行',
    moodTitleEn: 'Jinan · Spring city roam',
    intro:
      '泉城因水而活，一条「飞阅济南」线串起五处降落点：先听趵突泉三股水，沿护城河到黑虎泉看市民打水，大明湖环湖后登千佛山俯瞰全城，再把半天留给九如山的瀑布群。芙蓉街侧巷便宜坊的把子肉热乎，老城走路最顺，泉水与湖风替你把城市介绍完。',
    foods: [
      { name: '把子肉', shop: '便宜坊', area: '芙蓉街附近' },
      { name: '油旋', shop: '草包包子', area: '老城街口' },
      { name: '甜沫', shop: '张子久', area: '芙蓉街侧巷' },
    ],
    transit: '老城一段走路最顺；稍远再坐公交，泉点之间别赶点。',
    tips: ['清晨泉声更清楚', '芙蓉街侧巷比主街松', '环湖不必求全'],
    spots: [
      {
        name: '趵突泉',
        blurb: '三股水昼夜翻滚，水温常年18℃。',
        tag: '天下第一泉',
        lat: 36.662,
        lng: 117.028,
      },
      {
        name: '大明湖',
        blurb: '众泉汇流成湖，超然楼亮灯是仪式感。',
        tag: '慢行湖景',
        lat: 36.671,
        lng: 117.018,
      },
      {
        name: '千佛山',
        blurb: '舜耕历山，登一览亭俯瞰全城。',
        tag: '登高远眺',
        lat: 36.636,
        lng: 117.03,
      },
      {
        name: '黑虎泉',
        blurb: '三个虎头吐水，市民清晨排队打水。',
        tag: '泉水生活',
        lat: 36.654,
        lng: 117.028,
      },
      {
        name: '九如山',
        blurb: '泰山北麓瀑布群，夏瀑冬冰。',
        tag: '山野慢行',
        lat: 36.53,
        lng: 117.196,
      },
    ],
  },
  南京: {
    moodTitle: '南京·城垣漫行',
    moodTitleEn: 'Nanjing · Wall & lake roam',
    intro:
      '六朝与民国叠在梧桐影里：玄武湖日落前后最好逛，中山陵缓坡走到哪算哪。把历史当成散步的背景音，鸭血粉丝随便解决一顿就好。',
    foods: [
      { name: '鸭血粉丝', shop: '回味', area: '湖南路一带' },
      { name: '盐水鸭', shop: '韩复兴', area: '老城街巷' },
      { name: '小笼', shop: '皮胖小笼', area: '老门东一带' },
    ],
    transit: '地铁到站后湖边多走路；陵园只走外缘缓坡，不必冲顶。',
    tips: ['日落前后去湖边', '缓坡走到哪算哪', '梧桐道适合空走'],
    spots: [
      {
        name: '中山陵',
        blurb: '石阶缓坡，走到哪里算哪里。',
        tag: '国家级',
        lat: 32.05,
        lng: 118.85,
      },
      { name: '玄武湖', blurb: '日落前后，风刚好。', tag: '慢行湖景', lat: 32.07, lng: 118.8 },
      {
        name: '老门东',
        blurb: '石板街走走停停，适合歇脚。',
        tag: '慢行街区',
        lat: 32.014,
        lng: 118.79,
      },
    ],
  },
  广州: {
    moodTitle: '广州·骑楼漫行',
    moodTitleEn: 'Guangzhou · Arcade roam',
    intro:
      '岭南市井从早茶开始：骑楼底下慢慢晃，傍晚把珠江夜色留给眼睛。点心按顿来，糖水收个尾，城市的松弛感就在两顿之间。',
    foods: [
      { name: '早茶点心', shop: '点都德', area: '天河 / 老城' },
      { name: '肠粉', shop: '银记', area: '中大 / 老城' },
      { name: '糖水', shop: '南信牛奶', area: '上下九一带' },
    ],
    transit: '地铁到老城后江边步行；短途别换乘太勤，把时间留给骑楼。',
    tips: ['早茶别赶点', '夜风起来再去江边', '骑楼适合空走'],
    spots: [
      {
        name: '珠江边',
        blurb: '广州塔夜灯亮起后，站一会儿就够。',
        tag: '江岸夜景',
        lat: 23.11,
        lng: 113.32,
      },
      { name: '永庆坊', blurb: '骑楼底下，适合慢慢逛。', tag: '慢行骑楼', lat: 23.12, lng: 113.24 },
      { name: '沙面', blurb: '林荫道空走，比主街松。', tag: '慢行林荫', lat: 23.11, lng: 113.24 },
    ],
  },
  深圳: {
    moodTitle: '深圳·湾区漫行',
    moodTitleEn: 'Shenzhen · Bay roam',
    intro:
      '年轻城市也有慢法：海岸城歇脚补给，深圳湾栈道把落日留给风。滨海那段交给腿，早茶或一盅花胶鸡煲收尾，都市感与海风可以并存。',
    foods: [
      { name: '粤式早茶', shop: '点都德', area: '海岸城 / 福田' },
      { name: '花胶鸡煲', shop: '老火靓汤馆', area: '南山海岸城' },
      { name: '肠粉', shop: '街坊肠粉', area: '南头古城一带' },
    ],
    transit: '地铁到湾区后栈道步行；滨海段不必再坐车，短途留给腿。',
    tips: ['落日前后去栈道', '海岸城适合歇脚', '别把湾区排满'],
    spots: [
      { name: '深圳湾栈道', blurb: '落日前后，风最大。', tag: '慢行海风', lat: 22.52, lng: 113.99 },
      {
        name: '深圳湾落日',
        blurb: '站在栏杆边看一会儿就够。',
        tag: '湾区氛围',
        lat: 22.515,
        lng: 113.995,
      },
      { name: '海岸城', blurb: '补给、歇脚，都方便。', tag: '都市歇脚', lat: 22.52, lng: 113.94 },
    ],
  },
  成都: {
    moodTitle: '成都·茶馆漫行',
    moodTitleEn: 'Chengdu · Teahouse roam',
    intro:
      '慢是本地默认设置：宽窄外缘找茶座，比挤主街舒服；有空留半日给山间石径。火锅还是冒菜看当天胃口，城里地铁，近郊再换乘。',
    foods: [
      { name: '火锅', shop: '小龙坎 / 大龙燚', area: '市区多家' },
      { name: '冒菜', shop: '冒椒火辣', area: '宽窄外缘' },
      { name: '兔丁', shop: '二姐兔丁', area: '老城街口' },
    ],
    transit: '城里地铁最省事；近郊山线再换乘，别把一天排满。',
    tips: ['茶座比主街耐坐', '山路留给半日空档', '火锅别连续两顿'],
    spots: [
      { name: '宽窄外缘', blurb: '茶座比主街耐坐。', tag: '慢行茶馆', lat: 30.67, lng: 104.05 },
      { name: '锦里', blurb: '灯笼巷子，慢慢晃。', tag: '慢行古街', lat: 30.65, lng: 104.05 },
      { name: '青城山', blurb: '林间石径，走到哪算哪。', tag: '近郊慢登', lat: 30.9, lng: 103.57 },
    ],
  },
  西安: {
    moodTitle: '西安·城墙漫行',
    moodTitleEn: 'Xi’an · City wall roam',
    intro:
      '十三朝古都把城墙留到今天：租车慢骑半圈就很爽，下来吃肉夹馍；大雁塔外缘夜里再看看。回坊边走边吃，别追网红店，古城味在烟火里。',
    foods: [
      { name: '肉夹馍', shop: '老孙家 / 樊记', area: '回坊一带' },
      { name: '凉皮', shop: '魏家凉皮', area: '古城街巷' },
      { name: '胡辣汤', shop: '老刘家', area: '回坊侧巷' },
    ],
    transit: '地铁到古城后，城墙骑行最省事；短途别硬走。',
    tips: ['租车半圈就够', '夜灯亮了再去塔外缘', '回坊别追网红店'],
    spots: [
      { name: '城墙', blurb: '租车半圈，比硬走轻松。', tag: '国家级', lat: 34.26, lng: 108.94 },
      {
        name: '大雁塔',
        blurb: '塔影看一眼就够，外缘慢慢晃。',
        tag: '城市地标',
        lat: 34.22,
        lng: 108.96,
      },
      { name: '回坊', blurb: '边走边吃，别追网红店。', tag: '慢行小吃', lat: 34.26, lng: 108.94 },
    ],
  },
  厦门: {
    moodTitle: '厦门·海岛漫行',
    moodTitleEn: 'Xiamen · Island roam',
    intro:
      '海风是厦门的底色：对岸红瓦看一眼，鼓浪屿找安静海边坐下；环岛路傍晚骑一截最舒服。沙茶面饿了再点，别把海岛行程排成赶场。',
    foods: [
      { name: '沙茶面', shop: '黄则和', area: '中山路一带' },
      { name: '海鲜粥', shop: '八市海鲜粥', area: '八市周边' },
      { name: '花生汤', shop: '黄则和', area: '中山路' },
    ],
    transit: '轮渡上岛；环岛适合骑行，短途别追车。',
    tips: ['找安静海岸坐下', '傍晚再骑环岛路', '别追店'],
    spots: [
      { name: '鼓浪屿', blurb: '找安静海岸，坐一会儿。', tag: '海岛慢游', lat: 24.45, lng: 118.06 },
      { name: '环岛路', blurb: '傍晚海风，骑一段就够。', tag: '慢行海湾', lat: 24.44, lng: 118.12 },
      {
        name: '对岸海岸',
        blurb: '红瓦与海面，站一会儿也值。',
        tag: '海岛氛围',
        lat: 24.45,
        lng: 118.07,
      },
    ],
  },
  黄山: {
    moodTitle: '黄山·山间漫行',
    moodTitleEn: 'Huangshan · Mountain roam',
    intro:
      '奇松与云海是黄山的名片，却不必硬冲顶：石阶留给半天，雾散的瞬间最值。山下热汤暖胃，把体力留给眼睛，山会自己说话。',
    foods: [
      { name: '徽州刀板香', shop: '老街徽菜馆', area: '汤口镇一带' },
      { name: '毛豆腐', shop: '山脚下老店', area: '汤口街巷' },
      { name: '热汤面', shop: '索道站下小面馆', area: '景区外缘' },
    ],
    transit: '进城后转景区接驳；山路段量力而行，可坐索道。',
    tips: ['雾大时别赶景', '留一段空走看云', '不必硬冲顶'],
    spots: [
      {
        name: '黄山主峰外缘',
        blurb: '云海与奇松，走到哪算哪。',
        tag: '世界遗产',
        lat: 30.13,
        lng: 118.16,
      },
    ],
  },
  泉州: {
    moodTitle: '泉州·古巷漫行',
    moodTitleEn: 'Quanzhou · Old-lane roam',
    intro:
      '海丝名城把古塔与红砖巷留到今天：开元寺外缘晃半日，西街边走边吃。牛肉羹暖胃，旧巷留给慢步，不必把古城走成清单。',
    foods: [
      { name: '牛肉羹', shop: '西街老店', area: '西街一带' },
      { name: '面线糊', shop: '巷口早摊', area: '开元寺外缘' },
      { name: '花生汤', shop: '古巷甜汤铺', area: '西街侧巷' },
    ],
    transit: '古城内多走路；稍远再换乘公交，寺外缘比中心松。',
    tips: ['寺外缘比人流中心松', '西街边走边吃就好', '旧巷适合空走'],
    spots: [
      {
        name: '开元寺双塔',
        blurb: '石塔立在绿树里，半日刚好。',
        tag: '世界遗产',
        lat: 24.91,
        lng: 118.59,
      },
    ],
  },
};

export type HoloCityPreviewPanelView = HoloCityPreviewPanel & {
  gallery: HoloPreviewGalleryItem[];
};

export function getHoloCityPreviewPanel(city: string): HoloCityPreviewPanelView | null {
  const draft = PANEL_DRAFTS[city];
  if (!draft) return null;
  return {
    ...draft,
    gallery: getCityPreviewGallery(city),
  };
}

export function listHoloCityPreviewPanelCities(): string[] {
  return Object.keys(PANEL_DRAFTS);
}
