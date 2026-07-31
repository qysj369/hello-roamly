import { SNAIL_GLOBAL_COPY } from '@/lib/config/snailCommunity';
import { APP_TITLE_SUFFIX, BRAND_FUNCTION_DESC } from '@/lib/config/brand';
import { DEFAULT_SITE_DESCRIPTION } from '@/lib/seo/config';
import type { PageSeo } from '@/lib/seo/types';
import { paths } from '@/router/paths';

function page(title: string, description: string, path: string, ogType: PageSeo['ogType'] = 'website'): PageSeo {
  return { title, description, path, ogType };
}

function titled(pageLabel: string, description: string, path: string, ogType?: PageSeo['ogType']): PageSeo {
  return page(`${pageLabel} — ${APP_TITLE_SUFFIX}`, description, path, ogType);
}

export const homePageSeo = (): PageSeo =>
  page(
    APP_TITLE_SUFFIX,
    `${BRAND_FUNCTION_DESC}。HelloRoamly（helloroamly.com）— 搜索城市与预算，浏览结构化穷游攻略；支持 AI 生成与发布。`,
    paths.home,
  );

export const discoverPageSeo = (): PageSeo =>
  titled(
    '发现',
    'Pinterest 式瀑布流浏览攻略、旅行计划与瞬间；按兴趣、目的地与标签智能推荐。',
    paths.discover,
  );

export const guidesPageSeo = (): PageSeo =>
  titled(
    '黏液轨迹库',
    '浏览蜗友留下的结构化穷游攻略：花费清单、行程流水账与蜗牛启示，支持关键词筛选。',
    paths.guides,
  );

export const mapPageSeo = (): PageSeo =>
  titled(
    '地图',
    `${BRAND_FUNCTION_DESC}。地图一键规划穷游方案。`,
    paths.home,
  );

export const aiChatPageSeo = (): PageSeo =>
  titled(
    'AI 旅行顾问',
    '与 AI 对话生成穷游行程、预算拆分与目的地建议，支持导出旅行计划。',
    paths.ai,
  );

export const aiSnailGuidePageSeo = (): PageSeo =>
  titled(
    'AI生成攻略',
    `${BRAND_FUNCTION_DESC}。AI蜗牛 分步引导目的地、天数、预算与偏好，生成结构化穷游攻略。`,
    paths.aiSnail,
  );

export const messagesPageSeo = (): PageSeo =>
  titled('消息', '与旅伴站内私信，讨论行程与结伴出行。', paths.messages);

export const profilePageSeo = (): PageSeo =>
  titled(
    SNAIL_GLOBAL_COPY.myDen,
    `管理蜗友资料、旅行瞬间、计划与${SNAIL_GLOBAL_COPY.favoritesTab}珍藏。`,
    paths.profile,
    'profile',
  );

export const aboutPageSeo = (pageTitle: string): PageSeo =>
  titled(pageTitle, DEFAULT_SITE_DESCRIPTION, paths.about);

export const snailCulturePageSeo = (): PageSeo =>
  titled(
    '蜗牛黑话手册',
    '蜗牛社区黑话词典、蜗牛公约与蜗阶称号。懂黏液轨迹、蜗壳与避坑雷达，才像自己人。',
    paths.snailCulture,
  );

export const notFoundPageSeo = (): PageSeo => ({
  title: `页面未找到 — ${APP_TITLE_SUFFIX}`,
  description: '您访问的页面不存在，请返回首页继续浏览。',
  path: '/404',
  noIndex: true,
});

export function guideDetailPageSeo(
  city: string,
  title: string,
  guideId: string,
  extras?: { budget?: string; days?: string },
): PageSeo {
  const detail = [extras?.budget, extras?.days].filter(Boolean).join(' · ');
  return {
    title: `${city} · ${title} — ${APP_TITLE_SUFFIX}`,
    description: `${city}穷游攻略：${title}${detail ? `（${detail}）` : ''}。查看路线、预算与玩法建议。`,
    path: `${paths.guides}/${encodeURIComponent(guideId)}`,
    ogType: 'article',
  };
}

export function travelPlanPageSeo(
  planTitle: string,
  planId: string,
  destination?: string,
  ogImage?: string,
): PageSeo {
  return {
    title: `${planTitle} — ${APP_TITLE_SUFFIX}`,
    description: destination
      ? `${destination}旅行计划：${planTitle}。查看每日行程、预算与地图路线。`
      : `旅行计划：${planTitle}。查看行程时间线与实用信息。`,
    path: `${paths.plans}/${encodeURIComponent(planId)}`,
    ogType: 'article',
    ogImage,
  };
}

export function userProfilePageSeo(
  username: string,
  userId: string,
  options?: { isOwnProfile?: boolean; bio?: string; ogImage?: string },
): PageSeo {
  const path = options?.isOwnProfile
    ? paths.profile
    : `${paths.users}/${encodeURIComponent(userId)}`;

  return {
    title: options?.isOwnProfile
      ? `${SNAIL_GLOBAL_COPY.myDen} — ${APP_TITLE_SUFFIX}`
      : `${username} 的蜗居 — ${APP_TITLE_SUFFIX}`,
    description: options?.bio?.trim() || `查看 ${username} 的旅行瞬间、计划与旅伴信息。`,
    path,
    ogType: 'profile',
    ogImage: options?.ogImage,
  };
}

export function chatThreadPageSeo(peerUsername: string, peerUserId: string): PageSeo {
  return {
    title: `与 ${peerUsername} 聊天 — ${APP_TITLE_SUFFIX}`,
    description: `与 ${peerUsername} 的站内对话。`,
    path: `${paths.messages}/${encodeURIComponent(peerUserId)}`,
    noIndex: true,
  };
}
