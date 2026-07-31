import { Check, Copy } from 'lucide-react';
import { useCallback, useState } from 'react';
import type { AiSnailGuideResult } from '@/types/domain/aiSnailGuide';
import { copyStructuredGuidePlainText } from '@/utils/structuredGuidePlainText';
import { cn } from '@/utils/cn';

type StructuredGuideCopyButtonProps = {
  guide: AiSnailGuideResult;
  className?: string;
};

export default function StructuredGuideCopyButton({
  guide,
  className,
}: StructuredGuideCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const ok = await copyStructuredGuidePlainText(guide);
    if (!ok) {
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [guide]);

  return (
    <button
      type="button"
      onClick={() => {
        void handleCopy();
      }}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50',
        className,
      )}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
          已复制
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" aria-hidden />
          复制攻略全文
        </>
      )}
    </button>
  );
}
