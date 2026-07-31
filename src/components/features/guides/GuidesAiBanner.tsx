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
    <section
      className={`relative rounded-2xl border p-4 shadow-sm ${
        state.source === 'capsule_one'
          ? 'border-cyan-400/35 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 text-cyan-50'
          : 'border-cyan-400/40 bg-gradient-to-r from-cyan-50 to-violet-50'
      }`}
    >
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 hover:bg-white/60 hover:text-slate-600"
        aria-label="关闭提示"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
      <p
        className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider ${
          state.source === 'capsule_one' ? 'text-cyan-300/80' : 'text-cyan-700'
        }`}
      >
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
        <p className="mt-2 pr-8 text-sm text-slate-800">
          已带入行程
          <span className="font-medium text-violet-700">「{buddy.planTitle}」</span>
          ，正在为你匹配
          <span className="font-medium text-violet-700">{buddy.destination}</span>
          相关攻略与同频出行灵感。
        </p>
      )}
      {buddy && (
        <p className="mt-1 text-xs text-slate-600">
          {buddy.days} 天 · 预算 {buddy.budgetLabel} · 可在下方关键词继续筛选
        </p>
      )}
      {dream && (
        <p className="mt-2 pr-8 text-sm text-slate-800">
          正在根据你的想法筛选：
          <span className="font-medium text-violet-700">「{dream}」</span>
        </p>
      )}
      {plan && (
        <p className="mt-1 text-xs text-slate-600">
          {plan.destination && `目的地：${plan.destination} · `}
          {plan.days} 天 · 预算约 ¥{plan.budget}
        </p>
      )}
      <p className="mt-2 text-xs text-slate-500">
        {buddy
          ? '下方已根据行程推荐同频旅伴，可发起结伴申请。'
          : '完整 AI 行程生成即将接入，当前为攻略智能匹配。'}
      </p>
    </section>
  );
}
