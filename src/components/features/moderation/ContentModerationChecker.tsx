import { Loader2, ShieldCheck } from 'lucide-react';
import { useCallback, useState } from 'react';
import { moderateUserContent } from '@/lib/moderation';
import { getContentSceneLabel } from '@/lib/moderation/scenes';
import type { ContentModerationScene, ModerationResult } from '@/types/domain/contentModeration';
import { cn } from '@/utils/cn';

export type ContentModerationCheckerProps = {
  scene?: ContentModerationScene;
  className?: string;
  placeholder?: string;
};

const DECISION_LABEL: Record<ModerationResult['decision'], string> = {
  pass: '通过',
  reject: '拒绝',
  review: '待复核',
};

export default function ContentModerationChecker({
  scene = 'ai_chat',
  className,
  placeholder = '输入待检测文本…',
}: ContentModerationCheckerProps) {
  const [draft, setDraft] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ModerationResult | null>(null);

  const handleCheck = useCallback(async () => {
    const text = draft.trim();
    if (!text) {
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const next = await moderateUserContent({ scene, text });
      setResult(next);
    } catch (error) {
      setResult({
        decision: 'reject',
        requestId: `client-error-${Date.now()}`,
        message: error instanceof Error ? error.message : '审核请求失败',
      });
    } finally {
      setLoading(false);
    }
  }, [draft, scene]);

  return (
    <div className={cn('space-y-3', className)}>
      <p className="text-[11px] text-slate-500">
        场景：{getContentSceneLabel(scene)}
        {scene === 'ai_chat' && (
          <span className="ml-1 text-slate-400">
            （演示拦截词：违规测试，需 VITE_CONTENT_MODERATION_DEMO_BLOCK=1）
          </span>
        )}
      </p>
      <label htmlFor="moderation-check-text" className="mb-1 block text-xs font-medium text-slate-600">
        待检测文本
      </label>
      <textarea
        id="moderation-check-text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        rows={3}
        placeholder={placeholder}
        className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
      />
      <button
        type="button"
        onClick={handleCheck}
        disabled={loading || !draft.trim()}
        className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <ShieldCheck className="h-4 w-4" aria-hidden />
        )}
        检测内容
      </button>
      {result && (
        <div
          className={cn(
            'rounded-lg border px-3 py-2 text-xs',
            result.decision === 'pass' && 'border-emerald-200 bg-emerald-50 text-emerald-900',
            result.decision === 'reject' && 'border-rose-200 bg-rose-50 text-rose-900',
            result.decision === 'review' && 'border-amber-200 bg-amber-50 text-amber-900',
          )}
          role="status"
        >
          <p className="font-semibold">{DECISION_LABEL[result.decision]}</p>
          {result.message && <p className="mt-1 leading-relaxed">{result.message}</p>}
          {result.labels && result.labels.length > 0 && (
            <p className="mt-1 text-[10px] opacity-80">标签：{result.labels.join(', ')}</p>
          )}
        </div>
      )}
    </div>
  );
}
