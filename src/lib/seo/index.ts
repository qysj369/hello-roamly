export {
  DEFAULT_OG_IMAGE_URL,
  DEFAULT_SITE_DESCRIPTION,
  resolveSiteOrigin,
  SITE_NAME,
  SITE_TAGLINE,
} from '@/lib/seo/config';
export type { PageSeo } from '@/lib/seo/types';
export { applyPageSeo } from '@/lib/seo/updatePageMeta';
export {
  collectSitemapEntries,
  DEFAULT_SITE_ORIGIN,
  getSiteOriginForBuild,
  renderRobotsTxt,
  renderSitemapXml,
} from '@/lib/seo/sitemap';
export type { SitemapChangeFreq, SitemapEntry } from '@/lib/seo/sitemap';
export { applyJsonLd } from '@/lib/seo/jsonLd/applyJsonLd';
export { buildTravelPlanJsonLd } from '@/lib/seo/jsonLd/travelPlanJsonLd';
export {
  aboutPageSeo,
  aiChatPageSeo,
  aiSnailGuidePageSeo,
  chatThreadPageSeo,
  discoverPageSeo,
  guideDetailPageSeo,
  guidesPageSeo,
  homePageSeo,
  mapPageSeo,
  messagesPageSeo,
  notFoundPageSeo,
  profilePageSeo,
  snailCulturePageSeo,
  travelPlanPageSeo,
  userProfilePageSeo,
} from '@/lib/seo/pageSeoPresets';
