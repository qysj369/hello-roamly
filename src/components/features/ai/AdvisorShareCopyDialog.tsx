import { useEffect, useRef } from 'react';
import { Dialog } from '@/components/ui';
import { copyTextToClipboardSync } from '@/utils/copyTextToClipboard';

type AdvisorShareCopyDialogProps = {
  open: boolean;
  text: string;
  onClose: () => void;
};

export default function AdvisorShareCopyDialog({
  open,
  text,
  onClose,
}: AdvisorShareCopyDialogProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      const node = textareaRef.current;
      if (!node) {
        return;
      }
      node.focus();
      node.select();
      node.setSelectionRange(0, node.value.length);
      copyTextToClipboardSync(node.value);
    }, 60);
    return () => {
      window.clearTimeout(timer);
    };
  }, [open, text]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="复制分享内容"
      description="内容已选中。点「再试复制」，或长按/ Ctrl+A 全选后复制到微信。"
      confirmLabel="再试复制"
      onConfirm={() => {
        const node = textareaRef.current;
        if (node) {
          node.focus();
          node.select();
          copyTextToClipboardSync(node.value);
        }
      }}
      cancelLabel="关闭"
      className="sm:max-w-lg"
    >
      <textarea
        ref={textareaRef}
        readOnly
        value={text}
        className="mt-3 min-h-[12rem] w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-relaxed text-slate-800"
        onFocus={(event) => event.currentTarget.select()}
      />
    </Dialog>
  );
}
