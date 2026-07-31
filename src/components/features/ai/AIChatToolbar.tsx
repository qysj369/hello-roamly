import { MoreHorizontal, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { getAiProviderDisplayLabel } from '@/lib/config/ai';
import type { AiProviderDisplay } from '@/lib/config/ai';
import { cn } from '@/utils/cn';

type AIChatToolbarProps = {
  variant?: 'default' | 'capsule';
  provider: AiProviderDisplay;
  onToggleParams: () => void;
  onReset: () => void;
  isBusy: boolean;
  originLabel?: string;
};

function shortenOriginLabel(label: string): string {
  const trimmed = label.trim();
  if (trimmed.length <= 18) {
    return trimmed;
  }
  return `${trimmed.slice(0, 16)}…`;
}

export default function AIChatToolbar({
  variant = 'default',
  provider,
  onToggleParams,
  onReset,
  isBusy,
  originLabel,
}: AIChatToolbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2 border-b border-slate-200/80 bg-white px-3 py-2.5 sm:px-4',
        variant === 'capsule' && 'capsule-ai-toolbar',
      )}
    >
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-slate-900">
          {variant === 'capsule' ? 'Capsule 链路' : '旅行顾问'}
        </h2>
        <p className="text-[10px] text-slate-400">
          {variant === 'capsule'
            ? '信号已注入 · 继续描述偏好与节奏'
            : originLabel?.trim()
              ? `从 ${shortenOriginLabel(originLabel)} 出发 · 直接输入问题`
              : '直接输入问题，或点下方示例'}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="更多操作"
            aria-expanded={menuOpen}
          >
            <MoreHorizontal className="h-4 w-4" aria-hidden />
          </button>
          {menuOpen ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-10 cursor-default"
                aria-label="关闭菜单"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 min-w-[8.5rem] rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    onToggleParams();
                    setMenuOpen(false);
                  }}
                  className="block w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                >
                  旅行参数
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onReset();
                    setMenuOpen(false);
                  }}
                  disabled={isBusy}
                  className="flex w-full items-center gap-1.5 px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <RotateCcw className="h-3 w-3" aria-hidden />
                  新对话
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    const url = new URL(window.location.href);
                    url.searchParams.set('_', String(Date.now()));
                    url.searchParams.delete('session');
                    window.location.replace(url.toString());
                  }}
                  className="block w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                >
                  刷新页面
                </button>
                <p className="border-t border-slate-100 px-3 py-1.5 text-[10px] text-slate-400">
                  {getAiProviderDisplayLabel(provider)}
                </p>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
