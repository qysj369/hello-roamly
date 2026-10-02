import { searchPlanShareCityName } from '@/lib/home/searchPlanShareCopy';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

export type CityShareShot = {
  title: string;
  caption: string;
  imageUrl: string;
  keys: string[];
};

export type CityShareDouyinScript = {
  id: string;
  title: string;
  spoken: string;
  tags: string;
  keys: string[];
  shots: CityShareShot[];
};

export type CityShareXhsNote = {
  id: string;
  title: string;
  body: string;
  keys: string[];
};

export type CityShareSeed = {
  city: string;
  douyin: CityShareDouyinScript[];
  xhs: CityShareXhsNote[];
};

/** 上海 / 杭州 / 成都 / 西安公域种草碎片：单景点灵感，不含多日路线、预算、外链。 */
export const CITY_SHARE_SEED_KIT: readonly CityShareSeed[] = [
  {
    city: '上海',
    douyin: [
      {
        id: 'sh-food',
        title: '沈大成热气点心',
        spoken:
          '午饭别去网红店排队。沈大成一笼蟹粉小笼冒热气，再咬一口鲜肉条头糕，老上海的甜咸就在这一口里。',
        tags: '#上海点心 #沈大成 #城市逛吃',
        keys: ['沈大成', '蟹粉', '小笼', '条头糕', '点心'],
        shots: [
          {
            title: '沈大成柜台',
            caption: '热气一笼刚出屉',
            imageUrl: '/plan-scenes/shanghai/spot-food-xiaolong.jpg',
            keys: ['沈大成', '点心'],
          },
          {
            title: '蟹粉小笼',
            caption: '皮薄汤鲜就够',
            imageUrl: '/plan-scenes/shanghai/spot-food-xiaolong.jpg',
            keys: ['小笼', '蟹粉'],
          },
          {
            title: '老城街巷',
            caption: '吃完慢慢晃回去',
            imageUrl: '/plan-scenes/shanghai/spot-old-street.jpg',
            keys: ['老街', '街巷'],
          },
        ],
      },
      {
        id: 'sh-bund',
        title: '外滩滨江落日',
        spoken:
          '别在外滩主街被人流推着走。傍晚去滨江步道找一段栏杆，万国建筑的落日自己会来，江风比打卡更值。',
        tags: '#上海citywalk #外滩落日 #黄浦江漫游',
        keys: ['外滩', '滨江', '万国', '落日', '黄浦江'],
        shots: [
          {
            title: '外滩滨江',
            caption: '找一段空栏杆',
            imageUrl: '/city-kit/shanghai/spot-bund.jpg',
            keys: ['外滩', '滨江'],
          },
          {
            title: '万国建筑轮廓',
            caption: '落日铺上石库门',
            imageUrl: '/city-kit/shanghai/cover.jpg',
            keys: ['万国', '建筑'],
          },
          {
            title: '江对岸灯火',
            caption: '天黑前回得去',
            imageUrl: '/city-kit/shanghai/spot-bund-night.jpg',
            keys: ['夜景', '灯火'],
          },
        ],
      },
      {
        id: 'sh-museum',
        title: '上博馆藏安静半日',
        spoken:
          '上海博物馆上午人少，把青铜和书画慢慢看完。主街的热闹留给别人，馆里的安静才是这一趟的芯。',
        tags: '#上海博物馆 #人文慢游 #周末去哪',
        keys: ['博物馆', '馆藏', '上博', '人民广场'],
        shots: [
          {
            title: '上海博物馆',
            caption: '上午人少看一组就够',
            imageUrl: '/plan-scenes/shanghai/spot-natural-museum.jpg',
            keys: ['上海博物馆', '上博'],
          },
          {
            title: '馆藏走廊',
            caption: '把镇馆慢慢看完',
            imageUrl: '/plan-scenes/shanghai/spot-natural-museum.jpg',
            keys: ['馆藏', '走廊'],
          },
          {
            title: '梧桐街角',
            caption: '看完再去附近晃',
            imageUrl: '/plan-scenes/shanghai/spot-wukang.jpg',
            keys: ['梧桐', '街角'],
          },
        ],
      },
    ],
    xhs: [
      {
        id: 'sh-xhs-oldtown',
        title: '人民广场松弛半日｜上博馆藏 + 沈大成点心',
        keys: ['博物馆', '馆藏', '沈大成', '条头糕', '蟹粉', '小笼', '人民广场'],
        body: `来上海别被南京东路人流推着走，人民广场这一带就能慢慢逛👇
🏛上海博物馆：上午人少，挑青铜或书画看一组就够，不必赶场
🥟沈大成：蟹粉小笼、鲜肉条头糕各来一份，热气比网红店实在
🌳馆出来沿广场绿地慢慢走，把空档留给发呆
旅行不用排满点位，吃一口、看一层，就已经很上海。
#上海慢游 #上海博物馆 #沈大成 #城市逛吃`,
      },
      {
        id: 'sh-xhs-bund',
        title: '外滩避开人流｜滨江栏杆看万国建筑落日',
        keys: ['外滩', '滨江', '万国', '落日', '北外滩'],
        body: `外滩主街永远人挤人，真正好看的是滨江那条步道。
🌤傍晚沿栏杆慢慢走，万国建筑轮廓被落日铺一层金
🚶人少就停，人多就再往北走一段，江风比打卡位舒服
🌃灯亮之前往回走，不必跟夜游团挤。
#上海citywalk #外滩落日 #黄浦江漫游 #周末去哪`,
      },
    ],
  },
  {
    city: '杭州',
    douyin: [
      {
        id: 'hz-westlake',
        title: '西湖松弛漫游',
        spoken:
          '来杭州不必挤断桥人潮，沿着苏堤慢慢散步，找一处湖边长椅发呆。傍晚看落日落在雷峰塔，江南的温柔全在这一瞬间。',
        tags: '#杭州citywalk #西湖漫游 #江南松弛旅行',
        keys: ['西湖', '苏堤', '雷峰塔', '断桥', '湖'],
        shots: [
          {
            title: '苏堤',
            caption: '柳树空镜，慢慢散步',
            imageUrl: '/city-kit/hangzhou/spot-westlake.jpg',
            keys: ['苏堤', '西湖', '柳'],
          },
          {
            title: '湖边长椅',
            caption: '找一处发呆喝茶',
            imageUrl: '/city-kit/hangzhou/spot-teagarden.jpg',
            keys: ['长椅', '喝茶', '湖边'],
          },
          {
            title: '雷峰塔远景',
            caption: '傍晚落日这一瞬间',
            imageUrl: '/city-kit/hangzhou/cover.jpg',
            keys: ['雷峰塔', '落日'],
          },
        ],
      },
      {
        id: 'hz-oldlane',
        title: '老巷烟火灵感',
        spoken:
          '杭州老城藏着安静小巷，没有拥挤游客，走一走青石板路，尝几口本地点心，感受慢节奏江南烟火。',
        tags: '#杭州老街 #小众杭州 #城市漫步',
        keys: ['河坊', '小河直街', '老街', '老巷', '青石'],
        shots: [
          {
            title: '河坊街小巷',
            caption: '屋檐下慢慢走',
            imageUrl: '/city-kit/hangzhou/spot-canal.jpg',
            keys: ['河坊', '小巷'],
          },
          {
            title: '本地点心',
            caption: '尝几口就够',
            imageUrl: '/city-kit/hangzhou/spot-food-dumpling.jpg',
            keys: ['糕点', '点心'],
          },
          {
            title: '小河直街',
            caption: '流水边的慢节奏',
            imageUrl: '/city-kit/hangzhou/spot-boat.jpg',
            keys: ['小河直街', '流水'],
          },
        ],
      },
      {
        id: 'hz-tea',
        title: '茶山治愈碎片',
        spoken: '想躲开闹市就往茶山走，满眼绿意治愈人心，山间小店坐一下午，风里都是茶叶清香。',
        tags: '#杭州龙井村 #治愈旅行 #周末出游',
        keys: ['龙井', '茶山', '茶园', '龙井村'],
        shots: [
          {
            title: '龙井村茶山',
            caption: '满眼绿意',
            imageUrl: '/city-kit/hangzhou/spot-teahill-2.jpg',
            keys: ['龙井', '茶山'],
          },
          {
            title: '茶垄小路',
            caption: '顺着风的方向走',
            imageUrl: '/city-kit/hangzhou/spot-longjing.jpg',
            keys: ['茶垄', '绿意'],
          },
          {
            title: '山间小店',
            caption: '窗边坐一下午',
            imageUrl: '/city-kit/hangzhou/spot-teagarden.jpg',
            keys: ['咖啡馆', '茶馆'],
          },
        ],
      },
    ],
    xhs: [
      {
        id: 'hz-xhs-westlake',
        title: '杭州西湖小众发呆地｜避开人流独享江南温柔',
        keys: ['西湖', '苏堤', '杨公堤', '乌龟潭', '断桥'],
        body: `来西湖不想挤断桥，分享几处安静角落，适合散步、拍照、放空👇
🌿苏堤南段：人少柳树成片，湖边长椅随便坐，落日视野绝佳
🍵杨公堤周边：沿路小众茶馆，临湖喝茶看山水，安静不嘈杂
🌊乌龟潭：水域开阔游客极少，草木茂盛，治愈感拉满
旅行不用赶景点，找一处安静角落慢下来就很好。
#杭州citywalk #西湖小众点位 #江南旅行 #城市漫游`,
      },
      {
        id: 'hz-xhs-tea',
        title: '杭州近郊治愈山野｜龙井村慢逛思路',
        keys: ['龙井', '茶山', '茶园'],
        body: `厌倦城市喧嚣就往龙井村走，整片茶山绿意扑面而来。
沿着山间小路随意漫步，沿途有本地农家咖啡馆，窗边直面茶园。
不用规划固定路线，顺着风的方向走，山野氛围感十足。
#杭州龙井村 #周边治愈出游 #城市漫步 #江南小众`,
      },
    ],
  },
  {
    city: '成都',
    douyin: [
      {
        id: 'cd-oldtown',
        title: '老城慢逛日常',
        spoken: '成都不止热门景点，老城区茶馆坐一坐，晒着太阳喝茶，烟火气才是这座城市的底色。',
        tags: '#成都citywalk #成都慢生活 #川渝旅行灵感',
        keys: ['宽窄', '锦里', '茶馆', '老城'],
        shots: [
          {
            title: '宽窄外围',
            caption: '老墙边慢慢晃',
            imageUrl: '/city-kit/chengdu/spot-kuanzhai.jpg',
            keys: ['宽窄', '老墙'],
          },
          {
            title: '街边茶馆',
            caption: '竹椅晒太阳',
            imageUrl: '/city-kit/chengdu/spot-jinli.jpg',
            keys: ['茶馆', '竹椅'],
          },
          {
            title: '街边串串',
            caption: '烟火气特写',
            imageUrl: '/city-kit/chengdu/spot-food-stall.jpg',
            keys: ['串串', '小吃'],
          },
        ],
      },
      {
        id: 'cd-park',
        title: '公园松弛玩法',
        spoken: '本地人私藏的放松地，不用赶打卡，在公园喝茶闲聊，慢悠悠度过一下午。',
        tags: '#成都人民公园 #松弛感旅行 #成都小众玩法',
        keys: ['人民公园', '公园', '掏耳朵'],
        shots: [
          {
            title: '竹林',
            caption: '绿荫里放空',
            imageUrl: '/city-kit/chengdu/spot-qingcheng.jpg',
            keys: ['竹林', '公园'],
          },
          {
            title: '湖边喝茶',
            caption: '慢悠悠一下午',
            imageUrl: '/city-kit/chengdu/spot-kuanzhai.jpg',
            keys: ['喝茶', '竹椅'],
          },
          {
            title: '街边小坐',
            caption: '不用赶打卡',
            imageUrl: '/city-kit/chengdu/cover.jpg',
            keys: ['公园', '放空'],
          },
        ],
      },
      {
        id: 'cd-food',
        title: '老街美食碎片',
        spoken: '逛老城顺路打卡本地小吃，不用扎堆网红店，街边小店就能吃到地道川味。',
        tags: '#成都美食碎片 #城市逛吃 #川渝出游',
        keys: ['钟水饺', '蛋烘糕', '小吃', '火锅', '冒菜'],
        shots: [
          {
            title: '街边小吃摊',
            caption: '不用扎堆网红店',
            imageUrl: '/city-kit/chengdu/spot-food-stall.jpg',
            keys: ['小吃', '摊'],
          },
          {
            title: '地道川味',
            caption: '街边小店就够',
            imageUrl: '/city-kit/chengdu/spot-mapo.jpg',
            keys: ['川味', '麻婆'],
          },
          {
            title: '热气腾腾',
            caption: '顺路吃一口',
            imageUrl: '/city-kit/chengdu/spot-hotpot.jpg',
            keys: ['火锅', '热'],
          },
        ],
      },
    ],
    xhs: [
      {
        id: 'cd-xhs-oldtown',
        title: '成都本地人私藏老城｜拒绝流水线打卡',
        keys: ['宽窄', '老城', '茶馆', '锦里'],
        body: `来成都别只逛网红景区，老城区才藏着城市真实模样。
人民公园竹椅喝茶、老巷子里逛小吃、街边茶馆闲聊，不用赶行程。
慢悠悠感受川式松弛，这才是成都正确打开方式。
#成都慢生活 #成都citywalk #川渝出游 #城市逛吃`,
      },
      {
        id: 'cd-xhs-park',
        title: '成都治愈公园玩法｜本地人日常放空地',
        keys: ['人民公园', '公园'],
        body: `如果不想走拥挤景区，直接扎进城市公园。
晒着太阳喝茶、看大爷大妈闲聊，随手拍都是生活化氛围感照片。
旅行不必奔波，放空发呆也是很好的出行体验。
#成都人民公园 #松弛感旅行 #周末短途游`,
      },
    ],
  },
  {
    city: '西安',
    douyin: [
      {
        id: 'xa-wall',
        title: '城墙落日氛围感',
        spoken: '傍晚登西安城墙骑行，落日搭配古建红灯笼，一秒穿越回盛唐，氛围感拉满。',
        tags: '#西安城墙 #古都漫游 #西安旅行灵感',
        keys: ['城墙', '落日', '灯笼', '骑行'],
        shots: [
          {
            title: '城墙骑行',
            caption: '傍晚慢骑一截',
            imageUrl: '/city-kit/xian/spot-wall.jpg',
            keys: ['城墙', '骑行'],
          },
          {
            title: '古建轮廓',
            caption: '落日铺上砖瓦',
            imageUrl: '/city-kit/xian/cover.jpg',
            keys: ['落日', '古建'],
          },
          {
            title: '夜灯亮起',
            caption: '红灯笼氛围感',
            imageUrl: '/city-kit/xian/spot-dayan.jpg',
            keys: ['灯笼', '夜灯'],
          },
        ],
      },
      {
        id: 'xa-lane',
        title: '老城街巷烟火',
        spoken: '避开主街人流，钻进西安老城小巷，随处都是地道本地吃食，感受千年古都烟火。',
        tags: '#西安老城 #古都citywalk #西安小众打卡',
        keys: ['回民街', '回坊', '肉夹馍', '老城', '小巷'],
        shots: [
          {
            title: '回坊小巷',
            caption: '躲开主街人流',
            imageUrl: '/city-kit/xian/spot-muslim.jpg',
            keys: ['回民', '回坊', '小巷'],
          },
          {
            title: '肉夹馍门店',
            caption: '地道本地吃食',
            imageUrl: '/city-kit/xian/spot-muslim.jpg',
            keys: ['肉夹馍'],
          },
          {
            title: '老街屋檐',
            caption: '千年古都烟火',
            imageUrl: '/city-kit/xian/spot-wall.jpg',
            keys: ['屋檐', '老街'],
          },
        ],
      },
      {
        id: 'xa-museum',
        title: '博物院人文碎片',
        spoken: '静下心逛一趟博物院，读懂西安藏在文物里的历史，人文爱好者别错过。',
        tags: '#陕西历史博物馆 #人文旅行 #西安出游',
        keys: ['陕博', '博物', '文物', '历史博物馆'],
        shots: [
          {
            title: '古都庭院',
            caption: '静下来慢慢看',
            imageUrl: '/city-kit/xian/spot-dayan.jpg',
            keys: ['庭院', '古松'],
          },
          {
            title: '城垣轮廓',
            caption: '历史就在砖瓦里',
            imageUrl: '/city-kit/xian/spot-wall.jpg',
            keys: ['文物', '城垣'],
          },
          {
            title: '古都一角',
            caption: '人文碎片就够',
            imageUrl: '/city-kit/xian/cover.jpg',
            keys: ['博物', '人文'],
          },
        ],
      },
    ],
    xhs: [
      {
        id: 'xa-xhs-wall',
        title: '西安城墙傍晚｜一秒穿越盛唐氛围感',
        keys: ['城墙', '落日', '灯笼'],
        body: `来西安一定要傍晚登城墙，落日搭配古建红灯笼超出片。
不用全程骑行，找一段人少的城墙步道散步，看夕阳铺满砖瓦。
夜晚灯光亮起，古都氛围感直接拉满。
#西安城墙 #古都漫游 #西安拍照点位 #人文旅行`,
      },
      {
        id: 'xa-xhs-food',
        title: '西安老城小众街巷｜躲开人流吃地道小吃',
        keys: ['回民', '回坊', '肉夹馍', '甑糕', '凉皮', '老城'],
        body: `回民街主街游客扎堆，周边小巷才是本地人觅食地。
街巷里藏着肉夹馍、甑糕、凉皮小店，味道地道，人少安静。
逛古建顺路觅食，兼顾人文与烟火气。
#西安老城逛吃 #西安小众打卡 #古都citywalk`,
      },
    ],
  },
];

function planBlob(plan: SearchStructuredPlan): string {
  return [
    searchPlanShareCityName(plan),
    plan.baseInfo.theme ?? '',
    ...plan.dayList.flatMap((day) => [
      day.title,
      day.tips,
      ...day.spots.map((spot) => `${spot.name}${spot.intro}`),
      ...day.foods.map((food) => `${food.shop}${food.dish}`),
    ]),
  ].join(' ');
}

function scoreKeys(blob: string, keys: string[]): number {
  return keys.reduce((sum, key) => (key && blob.includes(key) ? sum + key.length : sum), 0);
}

function pickBest<T extends { keys: string[] }>(items: readonly T[], blob: string): T {
  return items.reduce((best, item) => (scoreKeys(blob, item.keys) > scoreKeys(blob, best.keys) ? item : best), items[0]!);
}

export function matchCityShareSeed(plan: SearchStructuredPlan): CityShareSeed | null {
  const city = searchPlanShareCityName(plan);
  return CITY_SHARE_SEED_KIT.find((item) => city.includes(item.city) || item.city.includes(city)) ?? null;
}

export function pickCityShareDouyinScript(plan: SearchStructuredPlan): CityShareDouyinScript | null {
  const seed = matchCityShareSeed(plan);
  if (!seed?.douyin.length) return null;
  return pickBest(seed.douyin, planBlob(plan));
}

export function pickCityShareXhsNote(plan: SearchStructuredPlan): CityShareXhsNote | null {
  const seed = matchCityShareSeed(plan);
  if (!seed?.xhs.length) return null;
  return pickBest(seed.xhs, planBlob(plan));
}
