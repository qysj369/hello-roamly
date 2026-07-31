import { Share2 } from 'lucide-react';
import { useState } from 'react';
import { copy } from '@/content/copy';
import { demoGuides } from '@/data/demoGuides';
import GuideShareControls from '@/components/features/guides/GuideShareControls';
import MotionSection from '@/components/motion/MotionSection';
import { isChinaPrimaryMarket } from '@/lib/config/marketScope';

const DEMO_GUIDE = demoGuides[0]!;

export default function AboutWechatShareSection() {
  const [showDemo, setShowDemo] = useState(false);

  if (!isChinaPrimaryMarket()) {
    return null;
  }

  return (
    <MotionSection
      className="rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/80 via-white to-white p-6 shadow-sm"
      delay={0.14}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
          <Share2 className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h3 className="text-base font-semibold text-slate-900">{copy.about.wechatShareTitle}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{copy.about.wechatShareBadge}</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-600">{copy.about.wechatShareLead}</p>

      <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
        {copy.about.wechatShareBullets.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-emerald-600" aria-hidden>
              ·
            </span>
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-xl border border-emerald-100 bg-white/90 p-4">
        <p className="text-xs font-semibold text-slate-800">{copy.about.wechatShareDemoTitle}</p>
        <p className="mt-1 text-[11px] text-slate-500">
          示例攻略：{DEMO_GUIDE.city} · {DEMO_GUIDE.title}
        </p>
        {!showDemo ? (
          <button
            type="button"
            onClick={() => setShowDemo(true)}
            className="mt-3 text-sm font-semibold text-emerald-700 hover:underline"
          >
            打开分享按钮演示
          </button>
        ) : (
          <GuideShareControls className="mt-3" guide={DEMO_GUIDE} variant="primary" />
        )}
      </div>
    </MotionSection>
  );
}
