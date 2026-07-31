import { Description, Dialog as HeadlessDialog, DialogPanel, DialogTitle } from '@headlessui/react';
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import Button from '@/components/ui/Button';

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  /** 底部主按钮文案；不传则不渲染 footer */
  confirmLabel?: string;
  onConfirm?: () => void;
  cancelLabel?: string;
  className?: string;
};

export default function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  confirmLabel,
  onConfirm,
  cancelLabel = '取消',
  className,
}: DialogProps) {
  const showFooter = Boolean(confirmLabel);

  return (
    <HeadlessDialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-end justify-center p-0 sm:items-center sm:p-4">
        <DialogPanel
          className={cn(
            'flex max-h-[min(92dvh,900px)] w-full flex-col rounded-t-2xl border border-slate-200 bg-white p-5 shadow-xl sm:max-h-[min(88dvh,900px)] sm:rounded-2xl sm:p-6',
            className,
          )}
        >
          <div className="shrink-0">
            <DialogTitle className="text-base font-semibold text-slate-900">{title}</DialogTitle>
            {description && (
              <Description className="mt-2 text-sm leading-relaxed text-slate-600">
                {description}
              </Description>
            )}
          </div>

          {children && (
            <div className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-y-contain pr-1 text-sm text-slate-700 [-webkit-overflow-scrolling:touch]">
              {children}
            </div>
          )}

          {showFooter && (
            <div className="mt-4 flex shrink-0 flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
              <Button variant="secondary" size="sm" onClick={onClose}>
                {cancelLabel}
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onConfirm?.();
                  onClose();
                }}
              >
                {confirmLabel}
              </Button>
            </div>
          )}
        </DialogPanel>
      </div>
    </HeadlessDialog>
  );
}
