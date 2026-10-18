import { Copy } from 'lucide-react';
import { useCallback, useState } from 'react';
import AiSnailGuideResultView from '@/components/features/ai-snail/AiSnailGuideResultView';
import { Dialog } from '@/components/ui';
import type { AiSnailGuideResult } from '@/types/domain/aiSnailGuide';
import { copyStructuredGuidePlainText } from '@/utils/structuredGuidePlainText';

export type AiSnailGuideResultDialogProps = {
  open: boolean;
  guide: AiSnailGuideResult | null;
  onClose: () => void;
};

export default function AiSnailGuideResultDialog({
  open,
  guide,
  onClose,
}: AiSnailGuideResultDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!guide) {
      return;
    }
    try {
      const ok = await copyStructuredGuidePlainText(guide);
      setCopied(ok);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [guide]);

  if (!guide) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="漫行攻略已生成"
      description="花费清单、行程流水账与蜗牛启示已就绪，可复制分享。"
      confirmLabel="好的"
      onConfirm={onClose}
      className="max-w-md sm:max-w-2xl"
    >
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => {
            void handleCopy();
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <Copy className="h-3.5 w-3.5" aria-hidden />
          {copied ? '已复制' : '复制攻略'}
        </button>
      </div>

      <div className="max-h-[min(65vh,32rem)] overflow-y-auto pr-1">
        <AiSnailGuideResultView guide={guide} />
      </div>
    </Dialog>
  );
}
