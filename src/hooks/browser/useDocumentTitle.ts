import { usePageSeo } from '@/hooks/browser/usePageSeo';
import type { PageSeo } from '@/lib/seo/types';

/** 同步浏览器标签页标题（兼容旧 API；仅设置 title，无 description / OG） */
export function useDocumentTitle(title: string) {
  usePageSeo({ title });
}

/** 完整 SEO（title + description + og tags） */
export function useDocumentTitleWithSeo(seo: PageSeo) {
  usePageSeo(seo);
}
