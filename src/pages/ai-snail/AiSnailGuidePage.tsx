import { Link, useLocation } from 'react-router-dom';
import AISnailGuideWizard from '@/components/features/ai-snail/AISnailGuideWizard';
import MotionPage, { MotionBlock } from '@/components/motion/MotionPage';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { aiSnailGuidePageSeo } from '@/lib/seo';
import { paths } from '@/router/paths';
import { BRAND_FUNCTION_DESC } from '@/lib/config/brandCopy';

type AiSnailPageState = {
  destination?: string;
};

export default function AiSnailGuidePage() {
  usePageSeo(aiSnailGuidePageSeo());
  const location = useLocation();
  const routeState = location.state as AiSnailPageState | null;
  const initialDestination = routeState?.destination?.trim();

  return (
    <MotionPage className="pb-2">
      <MotionBlock>
        <nav className="mb-3 flex items-center gap-2 text-xs text-slate-500">
          <Link to={paths.home} className="font-medium text-brand-600 hover:text-brand-700">
            首页
          </Link>
          <span aria-hidden>/</span>
          <span className="text-slate-700">AI生成攻略</span>
        </nav>

        <div className="mb-4">
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">AI生成攻略</h1>
          <p className="mt-1 text-sm text-slate-600">
            {BRAND_FUNCTION_DESC} · 由 AI蜗牛 分步引导，生成可执行的穷游行程。
          </p>
        </div>

        <AISnailGuideWizard initialDestination={initialDestination} />
      </MotionBlock>
    </MotionPage>
  );
}
