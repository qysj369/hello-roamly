import { Shield } from 'lucide-react';
import { copy } from '@/content/copy';
import ContentModerationChecker from '@/components/features/moderation/ContentModerationChecker';
import MotionSection from '@/components/motion/MotionSection';
import { isChinaPrimaryMarket } from '@/lib/config/marketScope';
import {
  CONTENT_MODERATION_SCENES,
  hasModerationBackend,
  isContentModerationEnabled,
  isModerationDemoBlockEnabled,
} from '@/lib/moderation';

export default function AboutContentModerationSection() {
  if (!isChinaPrimaryMarket()) {
    return null;
  }

  return (
    <MotionSection
      className="rounded-2xl border border-[#b7cdc4] bg-gradient-to-br from-emerald-50/80 via-[#fffef6] to-[#fffef6] p-6 shadow-sm"
      delay={0.1}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#2c6b58]">
          <Shield className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h3 className="text-base font-semibold text-slate-900">{copy.about.moderationTitle}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{copy.about.moderationBadge}</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-600">{copy.about.moderationLead}</p>

      <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
        {copy.about.moderationBullets.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-[#54786c]" aria-hidden>
              ·
            </span>
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {CONTENT_MODERATION_SCENES.map((scene) => (
          <div key={scene.id} className="rounded-lg border border-[#b7cdc4] bg-white/80 px-3 py-2">
            <p className="text-xs font-semibold text-slate-800">{scene.label}</p>
            <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">{scene.description}</p>
          </div>
        ))}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-[10px] text-slate-500">
        <div className="rounded-lg bg-slate-50 px-2 py-1.5">
          <dt className="font-medium text-slate-700">审核开关</dt>
          <dd>{isContentModerationEnabled() ? '已开启' : '未开启（默认放行）'}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 px-2 py-1.5">
          <dt className="font-medium text-slate-700">云审后端</dt>
          <dd>{hasModerationBackend() ? '已配置 API' : '演示 / 本地预检'}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 px-2 py-1.5 sm:col-span-2">
          <dt className="font-medium text-slate-700">演示拦截</dt>
          <dd>
            {isModerationDemoBlockEnabled()
              ? '已开启 DEMO_BLOCK（含「违规测试」）'
              : '未开启 VITE_CONTENT_MODERATION_DEMO_BLOCK'}
          </dd>
        </div>
      </dl>

      <div className="mt-5 rounded-xl border border-[#b7cdc4] bg-white/90 p-4">
        <p className="text-xs font-semibold text-slate-800">{copy.about.moderationDemoTitle}</p>
        <ContentModerationChecker className="mt-3" scene="ai_chat" />
      </div>
    </MotionSection>
  );
}
