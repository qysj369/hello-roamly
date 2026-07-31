import { Bookmark, MapPin, Share2, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';

type AiChatMessageActionsProps = {
  canGenerate: boolean;
  canViewMap: boolean;
  canSave: boolean;
  canShare: boolean;
  hasPlan: boolean;
  isBusy: boolean;
  isGeneratingPlan: boolean;
  copyFeedback?: 'idle' | 'success' | 'error';
  shareFeedback?: 'idle' | 'success' | 'error';
  onGeneratePlan: () => void;
  onViewMap: () => void;
  onSavePlan: () => void;
  onSharePlan: () => void;
};

function ActionChip({
  label,
  icon: Icon,
  onClick,
  disabled,
  active,
  variant = 'secondary',
}: {
  label: string;
  icon: typeof Sparkles;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  variant?: 'primary' | 'secondary';
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        if (!disabled) {
          onClick();
        }
      }}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition',
        variant === 'primary'
          ? active
            ? 'border-brand-400 bg-brand-600 text-white'
            : 'border-brand-500 bg-brand-600 text-white hover:bg-brand-700'
          : active
            ? 'border-brand-300 bg-brand-50 text-brand-700'
            : 'border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700',
        'disabled:pointer-events-none disabled:opacity-45',
      )}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden />
      {label}
    </button>
  );
}

/** 顾问回复下方的结构化快捷操作：主操作 + 次要操作分层，避免与顶栏重复 */
export default function AiChatMessageActions({
  canGenerate,
  canViewMap,
  canSave,
  canShare,
  hasPlan,
  isBusy,
  isGeneratingPlan,
  copyFeedback = 'idle',
  shareFeedback,
  onGeneratePlan,
  onViewMap,
  onSavePlan,
  onSharePlan,
}: AiChatMessageActionsProps) {
  const feedback = shareFeedback ?? copyFeedback;
  const shareLabel =
    feedback === 'success'
      ? '已复制，去粘贴'
      : feedback === 'error'
        ? '复制失败'
        : '分享';

  const showGenerate = canGenerate;
  const showViewMap = canViewMap && hasPlan;

  if (!showGenerate && !showViewMap && !canSave && !canShare) {
    return null;
  }

  return (
    <div
      className="relative z-10 mt-2 px-1"
      role="toolbar"
      aria-label="行程快捷操作"
    >
      <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto">
        {showGenerate ? (
          <ActionChip
            label={isGeneratingPlan ? '生成中…' : hasPlan ? '重新生成' : '生成行程'}
            icon={Sparkles}
            onClick={onGeneratePlan}
            disabled={isBusy}
            active={isGeneratingPlan}
            variant="primary"
          />
        ) : null}
        {showViewMap ? (
          <ActionChip
            label="查看地图"
            icon={MapPin}
            onClick={onViewMap}
            disabled={isBusy}
          />
        ) : null}
        {canSave ? (
          <ActionChip
            label="保存"
            icon={Bookmark}
            onClick={onSavePlan}
            disabled={isBusy}
          />
        ) : null}
        {canShare ? (
          <ActionChip
            label={shareLabel}
            icon={Share2}
            onClick={onSharePlan}
            active={feedback === 'success'}
          />
        ) : null}
      </div>

      {feedback === 'success' ? (
        <p className="px-1 text-[10px] font-medium text-emerald-600" role="status">
          对话已复制，可在微信或备忘录中粘贴
        </p>
      ) : null}
      {feedback === 'error' ? (
        <p className="px-1 text-[10px] font-medium text-rose-500" role="status">
          复制失败，请长按选中对话后手动复制
        </p>
      ) : null}
    </div>
  );
}
