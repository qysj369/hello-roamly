import { Link, useLocation } from 'react-router-dom';
import AISnailGuideWizard from '@/components/features/ai-snail/AISnailGuideWizard';
import MotionPage, { MotionBlock } from '@/components/motion/MotionPage';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { BRAND_FUNCTION_DESC } from '@/lib/config/brandCopy';
import { aiSnailGuidePageSeo } from '@/lib/seo';
import { paths } from '@/router/paths';
import '@/styles/holo-inner.css';

type AiSnailPageState = {
  destination?: string;
};

export default function AiSnailGuidePage() {
  usePageSeo(aiSnailGuidePageSeo());
  const location = useLocation();
  const routeState = location.state as AiSnailPageState | null;
  const initialDestination = routeState?.destination?.trim();

  return (
    <MotionPage className="holo-ai-snail pb-2">
      <MotionBlock>
        <div className="holo-ai-snail__intro">
          <h1 className="holo-ai-snail__title">AI生成攻略</h1>
          <p className="holo-ai-snail__subtitle">
            {BRAND_FUNCTION_DESC} · 由 AI蜗牛 分步引导，生成可执行的漫行行程。
          </p>
          <p className="holo-ai-snail__hint">
            也可从首页场景卡进入；完成后可
            <Link to={paths.guides} className="holo-ai-snail__inline-link">
              回到攻略列表
            </Link>
            查看。
          </p>
        </div>

        <AISnailGuideWizard initialDestination={initialDestination} />
      </MotionBlock>
    </MotionPage>
  );
}
