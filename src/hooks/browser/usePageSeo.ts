import { useEffect } from 'react';
import { applyPageSeo } from '@/lib/seo/updatePageMeta';
import type { PageSeo } from '@/lib/seo/types';

/**
 * 同步页面 title、description、Open Graph 与 Twitter Card。
 * 传入对象应在 useMemo 中稳定引用（动态页）。
 */
export function usePageSeo(seo: PageSeo) {
  useEffect(() => {
    return applyPageSeo(seo);
  }, [
    seo.title,
    seo.description,
    seo.path,
    seo.ogImage,
    seo.ogType,
    seo.noIndex,
  ]);
}
