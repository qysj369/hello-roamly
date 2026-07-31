import MotionLink from '@/components/motion/MotionLink';
import MotionSection from '@/components/motion/MotionSection';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { notFoundPageSeo } from '@/lib/seo';
import { paths } from '@/router/paths';

export default function NotFoundPage() {
  usePageSeo(notFoundPageSeo());
  return (
    <MotionSection className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">页面不存在</h2>
      <p className="mt-2 text-sm text-slate-600">请检查地址，或返回首页继续浏览。</p>
      <MotionLink
        to={paths.home}
        className="mt-6 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        返回首页
      </MotionLink>
    </MotionSection>
  );
}
