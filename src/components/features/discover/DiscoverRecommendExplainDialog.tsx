import { useMemo } from 'react';
import Dialog from '@/components/ui/Dialog';
import { getDiscoverRecommendationProfile } from '@/utils/discoverRecommend';

export type DiscoverRecommendExplainDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function DiscoverRecommendExplainDialog({
  open,
  onClose,
}: DiscoverRecommendExplainDialogProps) {
  const profile = useMemo(() => getDiscoverRecommendationProfile(), []);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="推荐如何工作？"
      description={`基于 ${profile.username} 的旅行档案，在本地为你计算匹配度并排序（演示环境，无云端模型）。`}
      confirmLabel="知道了"
      onConfirm={onClose}
      className="max-w-lg"
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-violet-100 bg-violet-50/80 p-3">
          <p className="text-xs font-semibold text-violet-900">你的兴趣画像</p>
          <ul className="mt-2 space-y-1 text-xs text-violet-950/90">
            <li>
              <span className="text-violet-700">关注兴趣：</span>
              {profile.interestLabels.join('、') || '未设置'}
            </li>
            <li>
              <span className="text-violet-700">旅行性格：</span>
              {profile.personalityTitle}
              {profile.personalityTraits.length > 0 && (
                <span className="text-violet-800/80">
                  {' '}
                  · {profile.personalityTraits.join('、')}
                </span>
              )}
            </li>
            <li>
              <span className="text-violet-700">足迹：</span>
              {profile.visitedLabels.length > 0 ? profile.visitedLabels.join('、') : '暂无记录'}
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-800">打分维度</p>
          <ul className="mt-2 space-y-2">
            {profile.scoringFactors.map((factor) => (
              <li
                key={factor.title}
                className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
              >
                <p className="text-xs font-medium text-slate-900">{factor.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{factor.detail}</p>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[11px] leading-relaxed text-slate-500">
          匹配分 ≥ 45 的内容会显示「为你推荐」角标。切换「最新发布」时按更新时间排序，角标仍保留参考分。
        </p>
      </div>
    </Dialog>
  );
}
