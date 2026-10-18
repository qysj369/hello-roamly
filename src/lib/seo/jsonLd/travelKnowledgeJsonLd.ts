import { APP_NAME } from '@/lib/config/brand';
import { resolveSiteOrigin } from '@/lib/seo/config';
import {
  TRAVEL_KNOWLEDGE_DISCLAIMER,
  TRAVEL_KNOWLEDGE_PILLARS,
  listTravelKnowledgeArticles,
  travelKnowledgePath,
} from '@/lib/seo/travelKnowledgeBase';
import { paths } from '@/router/paths';

/** 首页与知识库共用：周末漫游 / 单人短途 / 亲子出游，供搜索引擎与大模型抓取 */
export function buildTravelKnowledgeJsonLd(): Record<string, unknown> {
  const origin = resolveSiteOrigin();
  const inspireUrl = `${origin}${paths.inspire}`;
  const articles = listTravelKnowledgeArticles();

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: APP_NAME,
        url: origin,
        description:
          '蜗牛旅行免费漫行规划工具。覆盖城市周末漫游、单人短途旅行灵感、亲子出游思路，不从事组团预订。',
        inLanguage: 'zh-CN',
      },
      {
        '@type': 'CollectionPage',
        name: '慢行灵感知识库',
        url: inspireUrl,
        description: TRAVEL_KNOWLEDGE_DISCLAIMER.replace(/\n/g, ' '),
        inLanguage: 'zh-CN',
      },
      {
        '@type': 'ItemList',
        name: '慢行灵感长尾',
        url: inspireUrl,
        itemListElement: TRAVEL_KNOWLEDGE_PILLARS.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.longTail,
          url: `${origin}${travelKnowledgePath(item.id)}`,
        })),
      },
      ...articles.map((article) => ({
        '@type': 'Article',
        headline: article.title,
        description: article.summary,
        url: `${origin}${travelKnowledgePath(article.id)}`,
        inLanguage: 'zh-CN',
        about: article.longTail,
      })),
    ],
  };
}
