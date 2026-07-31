import { Loader2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeleteUserPlan } from '@/hooks/api/useDeleteUserPlan';
import { usePatchUserPlan } from '@/hooks/api/usePatchUserPlan';
import type { UserPlanRecord } from '@/types/api/userPlans';
import { profileSavedPlansPath } from '@/router/paths';
import { cn } from '@/utils/cn';

export type SavedUserPlanManagePanelProps = {
  plan: UserPlanRecord;
  className?: string;
};

export default function SavedUserPlanManagePanel({ plan, className }: SavedUserPlanManagePanelProps) {
  const navigate = useNavigate();
  const patchPlan = usePatchUserPlan();
  const deletePlan = useDeleteUserPlan();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [titleDraft, setTitleDraft] = useState(plan.title);
  const [titleSaved, setTitleSaved] = useState(false);

  useEffect(() => {
    setTitleDraft(plan.title);
  }, [plan.title]);

  const isBusy = patchPlan.isPending || deletePlan.isPending;
  const titleChanged = titleDraft.trim() !== plan.title && titleDraft.trim().length > 0;

  const handleSaveTitle = () => {
    const nextTitle = titleDraft.trim();
    if (!nextTitle || nextTitle === plan.title) {
      return;
    }
    patchPlan.mutate(
      { planId: plan.id, body: { title: nextTitle } },
      {
        onSuccess: () => {
          setTitleSaved(true);
          window.setTimeout(() => setTitleSaved(false), 2000);
        },
      },
    );
  };

  return (
    <section
      className={cn(
        'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5',
        className,
      )}
    >
      <h2 className="text-sm font-semibold text-slate-900">方案管理</h2>
      <p className="mt-1 text-xs text-slate-500">仅你可见的管理选项</p>

      <label className="mt-4 block">
        <span className="mb-1 block text-xs font-medium text-slate-600">方案名称</span>
        <div className="flex gap-2">
          <input
            type="text"
            value={titleDraft}
            disabled={isBusy}
            onChange={(event) => setTitleDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleSaveTitle();
              }
            }}
            placeholder="例如：成都3日美食之旅"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
          />
          <button
            type="button"
            disabled={isBusy || !titleChanged}
            onClick={handleSaveTitle}
            className="shrink-0 rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            {patchPlan.isPending ? '保存中…' : titleSaved ? '已保存' : '重命名'}
          </button>
        </div>
      </label>

      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
        <input
          type="checkbox"
          checked={plan.isPublic}
          disabled={isBusy}
          onChange={(event) => {
            patchPlan.mutate({
              planId: plan.id,
              body: { isPublic: event.target.checked },
            });
          }}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        <span className="text-sm text-slate-700">
          公开方案
          <span className="mt-0.5 block text-xs text-slate-500">
            勾选后其他蜗友可在发现页与你的蜗居看到
          </span>
        </span>
      </label>

      {patchPlan.isError ? (
        <p className="mt-2 text-xs text-rose-600" role="alert">
          更新失败，请稍后再试
        </p>
      ) : null}

      <div className="mt-4 border-t border-slate-100 pt-4">
        {!confirmDelete ? (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            删除方案
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-slate-700">确定删除「{plan.title}」？此操作不可恢复。</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isBusy}
                onClick={() => setConfirmDelete(false)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => {
                  deletePlan.mutate(plan.id, {
                    onSuccess: () => {
                      navigate(profileSavedPlansPath(), { replace: true });
                    },
                  });
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {deletePlan.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden />
                )}
                确认删除
              </button>
            </div>
          </div>
        )}
        {deletePlan.isError ? (
          <p className="mt-2 text-xs text-rose-600" role="alert">
            删除失败，请稍后再试
          </p>
        ) : null}
      </div>
    </section>
  );
}
