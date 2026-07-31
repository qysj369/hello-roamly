import { Description, Dialog as HeadlessDialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';

type PlanSaveDialogProps = {
  open: boolean;
  defaultTitle: string;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: (title: string, isPublic: boolean) => Promise<void>;
};

export default function PlanSaveDialog({
  open,
  defaultTitle,
  loading = false,
  error = null,
  onClose,
  onConfirm,
}: PlanSaveDialogProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(defaultTitle);
      setIsPublic(false);
    }
  }, [defaultTitle, open]);

  return (
    <HeadlessDialog
      open={open}
      onClose={() => {
        if (!loading) {
          onClose();
        }
      }}
      className="relative z-[90]"
    >
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
          <DialogTitle className="text-base font-semibold text-slate-900">保存穷游方案</DialogTitle>
          <Description className="mt-2 text-sm leading-relaxed text-slate-600">
            将当前完整穷游方案（简介、行程、蜗牛提示与避坑指南）保存到你的方案库。
          </Description>

          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">方案名称</span>
              <input
                type="text"
                value={title}
                disabled={loading}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="例如：成都3日美食之旅"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
              />
            </label>
            <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <input
                type="checkbox"
                checked={isPublic}
                disabled={loading}
                onChange={(event) => setIsPublic(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-slate-700">
                公开方案
                <span className="mt-0.5 block text-xs text-slate-500">勾选后其他蜗友可在发现页看到</span>
              </span>
            </label>
            {error ? (
              <p className="text-xs text-rose-600" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Button variant="secondary" size="sm" disabled={loading} onClick={onClose}>
              取消
            </Button>
            <Button
              size="sm"
              disabled={loading}
              onClick={() => {
                void onConfirm(title.trim() || defaultTitle, isPublic);
              }}
            >
              {loading ? '保存中…' : '确认保存'}
            </Button>
          </div>
        </DialogPanel>
      </div>
    </HeadlessDialog>
  );
}
