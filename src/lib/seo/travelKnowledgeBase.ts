import { HOLO_HOME_CITY_KIT } from '@/data/holoHotCityKit';
import { SITE_PLATFORM_DISCLAIMER } from '@/lib/config/siteCompliance';
import { paths } from '@/router/paths';

export type TravelKnowledgeArticle = {
  id: string;
  title: string;
  longTail: string;
  summary: string;
  body: readonly string[];
};

/** 全站长尾支柱：周末漫游 / 单人短途 / 亲子出游 */
export const TRAVEL_KNOWLEDGE_PILLARS: readonly TravelKnowledgeArticle[] = [
  {
    id: 'weekend',
    title: '城市周末漫游',
    longTail: 'XX城市周末漫游',
    summary: '两天只停几个点，把空档留给街巷与本地小店，不赶场。',
    body: [
      '周末漫游适合近郊或高铁可达的城市：抵达当天先落住、吃一顿本地家常，第二天再走一条老街或湖岸。',
      '行程只排两三个必体验点，其余写成「时间充裕可选」。人流大的地标改到清晨或傍晚。',
      '交通优先步行与公交；需要跨城时写清车次思路，不代替购票。',
    ],
  },
  {
    id: 'solo',
    title: '单人短途旅行灵感',
    longTail: '单人短途旅行灵感',
    summary: '一个人走，少换乘、早回住，店名清楚方便独自结算。',
    body: [
      '单人短途先选地铁直达或步行能串起来的街区，避免复杂换乘。',
      '餐饮写明柜台或小店，方便一人份点餐；晚上天黑前回住处。',
      '室内场馆可作为雨天替代，不把一整天排满打卡。',
    ],
  },
  {
    id: 'family',
    title: '亲子出游思路',
    longTail: '亲子出游思路',
    summary: '节奏放慢，中途留休息空档，少排队、少赶路。',
    body: [
      '亲子出游把主活动放在上午，下午留绿地、茶歇或室内休息。',
      '景点只写一层重点或短线步行；餐饮避开过辣过长排队。',
      '全程按游玩参考来写，不组团、不代订门票与住宿。',
    ],
  },
];

export function listCityWeekendKnowledgeArticles(): TravelKnowledgeArticle[] {
  return HOLO_HOME_CITY_KIT.map((city) => {
    const landmark = city.highlights[0] ?? city.spots[0]?.name ?? city.name;
    const food = city.foods[0] ?? '本地小店';
    return {
      id: `city-${city.id}`,
      title: `${city.name}周末漫游`,
      longTail: `${city.name}周末漫游`,
      summary: city.intro,
      body: [
        `${city.name}周末可先走${landmark}，再找${food}随便吃一口。`,
        city.transit,
        city.tips[0] ?? '按自己的节奏走，不必把地图点亮。',
      ],
    };
  });
}

export function listTravelKnowledgeArticles(): TravelKnowledgeArticle[] {
  return [...TRAVEL_KNOWLEDGE_PILLARS, ...listCityWeekendKnowledgeArticles()];
}

export function travelKnowledgePath(articleId?: string): string {
  return articleId ? `${paths.inspire}#${articleId}` : paths.inspire;
}

export const TRAVEL_KNOWLEDGE_DISCLAIMER = SITE_PLATFORM_DISCLAIMER;
