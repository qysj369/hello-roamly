import SnailGlossaryPanel from '@/components/features/community/SnailGlossaryPanel';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { snailCulturePageSeo } from '@/lib/seo';

/** 蜗牛社区文化页 — 黑话手册与公约 */
export default function SnailCulturePage() {
  usePageSeo(snailCulturePageSeo());

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <SnailGlossaryPanel />
    </div>
  );
}
