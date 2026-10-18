import { Bot, Compass, Users, X } from 'lucide-react';
import { useState } from 'react';
import type { GuidesPageState } from '@/types/router-state';

type GuidesAiBannerProps = {
  state: GuidesPageState | null;
};

export default function GuidesAiBanner({ state }: GuidesAiBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !state) {
    return null;
  }

  const dream = state.aiDream?.trim();
  const plan = state.aiPlan;
  const buddy = state.travelBuddy;

  if (!dream && !plan && !buddy) {
    return null;
  }

  return (
    <section className="holo-guides-banner">
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="holo-guides-banner__close"
        aria-label="关闭提示"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
      <p className="holo-guides-banner__eyebrow">
        {buddy ? (
          <>
            <Users className="h-3.5 w-3.5" aria-hidden />
            寻找旅伴
          </>
        ) : state.source === 'capsule_one' ? (
          <>
            <Compass className="h-3.5 w-3.5" aria-hidden />
            Capsule One 注入
          </>
        ) : (
          <>
            <Bot className="h-3.5 w-3.5" aria-hidden />
            AI 规划上下文
          </>
        )}
      </p>
      {buddy && (
        <p className="holo-guides-banner__body">
          已带入行程「{buddy.planTitle}」，正在为你匹配 {buddy.destination} 相关攻略与同频出行灵感。
        </p>
      )}
      {buddy && (
        <p className="holo-guides-banner__meta">
          {buddy.days} 天 · 预算 {buddy.budgetLabel} · 可在下方关键词继续筛选
        </p>
      )}
      {dream && (
        <p className="holo-guides-banner__body">
          正在根据你的想法筛选：「{dream}」
        </p>
      )}
      {plan && (
        <p className="holo-guides-banner__meta">
          {plan.destination && `目的地：${plan.destination} · `}
          {plan.days} 天 · 预算约 ¥{plan.budget}
        </p>
      )}
      <p className="holo-guides-banner__meta">
        {buddy
          ? '下方已根据行程推荐同频旅伴，可发起结伴申请。'
          : '完整 AI 行程生成即将接入，当前为攻略智能匹配。'}
      </p>
    </section>
  );
}
