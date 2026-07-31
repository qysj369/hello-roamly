import { Send } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { consumeSiteChatDraft } from '@/utils/siteChatDraft';
import { cn } from '@/utils/cn';

export type SiteChatComposerProps = {
  onSend: (text: string) => void | Promise<void>;
  disabled?: boolean;
  isSending?: boolean;
  submitError?: string | null;
  initialDraft?: string;
  className?: string;
};

export default function SiteChatComposer({
  onSend,
  disabled,
  isSending = false,
  submitError,
  initialDraft,
  className,
}: SiteChatComposerProps) {
  const [draft, setDraft] = useState<string>('');

  useEffect(() => {
    const pending = initialDraft?.trim() || consumeSiteChatDraft()?.trim();
    if (pending) {
      setDraft(pending);
    }
  }, [initialDraft]);

  const handleSend = useCallback(async () => {
    const text = draft.trim();
    if (!text || disabled || isSending) {
      return;
    }
    await onSend(text);
    setDraft('');
  }, [disabled, draft, isSending, onSend]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const inputDisabled = disabled || isSending;

  return (
    <footer className={cn('border-t border-slate-100 bg-white p-3', className)}>
      {submitError && (
        <p className="mb-2 text-xs text-rose-700" role="alert">
          {submitError}
        </p>
      )}
      <div className="flex gap-2">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          disabled={inputDisabled}
          placeholder="输入消息…"
          className="min-h-[2.5rem] flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:bg-slate-50"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={inputDisabled || !draft.trim()}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400"
          aria-label="发送消息"
        >
          <Send className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </footer>
  );
}
