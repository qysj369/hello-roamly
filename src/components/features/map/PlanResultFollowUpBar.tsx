import { Loader2, Send } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { cn } from '@/utils/cn';

const QUICK_PROMPTS = [
  { id: 'budget', label: '压预算', text: '把总预算再压 200 元，花费表和流水账要对齐' },
  { id: 'pace', label: '轻松点', text: '行程轻松一点，每天少排 1 个景点，留机动时间' },
  { id: 'free', label: '多免费', text: '多加免费景点和本地小吃，少门票' },
  { id: 'traffic', label: '省交通', text: '市内交通尽量地铁公交，写清上车站和换乘车' },
] as const;

type PlanResultFollowUpBarProps = {
  disabled?: boolean;
  loading?: boolean;
  error?: string | null;
  onSend: (message: string) => void;
};

export default function PlanResultFollowUpBar({
  disabled = false,
  loading = false,
  error = null,
  onSend,
}: PlanResultFollowUpBarProps) {
  const [draft, setDraft] = useState('');
  const inputDisabled = disabled || loading;

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || inputDisabled) {
      return;
    }
    onSend(trimmed);
    setDraft('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(draft);
  }

  return (
    <div className="border-t border-slate-100 bg-slate-50/90 px-5 py-3 sm:px-6">
      <p className="mb-2 text-[10px] font-medium text-slate-500">
        增量修改：改预算/天数/节奏，会基于当前方案局部调整（非从零重写）
      </p>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {QUICK_PROMPTS.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={inputDisabled}
            onClick={() => submit(item.text)}
            className={cn(
              'rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-600',
              'hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700',
              'disabled:pointer-events-none disabled:opacity-50',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={draft}
          disabled={inputDisabled}
          placeholder="例如：预算压到 1200，第三天轻松一点"
          onChange={(event) => setDraft(event.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={inputDisabled || !draft.trim()}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
          aria-label="发送追问"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Send className="h-4 w-4" aria-hidden />
          )}
        </button>
      </form>
      {error ? (
        <p className="mt-2 text-xs text-rose-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
