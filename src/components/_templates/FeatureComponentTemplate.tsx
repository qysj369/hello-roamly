import { useCallback, useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

/** 视觉变体：用 cn() 条件拼接，勿写独立 .css 文件 */
export type FeatureComponentTemplateVariant = 'default' | 'accent';

/**
 * 组件 Props（TypeScript，不用 PropTypes）。
 * - 命名：`{ComponentName}Props`，与组件同文件并 `export`
 * - 优先 `export type`（与 features 一致）；需 extends 合并时用 `interface` 亦可
 * - 领域类型从 `@/types/...` 引入，勿在 Props 里重复定义实体结构
 */
export type FeatureComponentTemplateProps = {
  /** 主标题 */
  title: string;
  /** 可选子内容 */
  children?: ReactNode;
  /** 根节点样式扩展（由父级传入，用 cn 合并） */
  className?: string;
  variant?: FeatureComponentTemplateVariant;
  /** 可选回调（由父组件传入） */
  onAction?: () => void;
};

export type FeatureComponentTemplateSkeletonProps = {
  className?: string;
};

const sectionVariants: Record<FeatureComponentTemplateVariant, string> = {
  default: 'border-slate-200 bg-white',
  accent: 'border-amber-200/90 bg-gradient-to-br from-amber-50/70 via-white to-white',
};

/**
 * 功能组件模板（勿直接引用到页面）。
 * 复制本文件到 `src/components/features/<domain>/` 后改名，并删除本目录下的引用说明。
 *
 * 约定：
 * - TypeScript 严格类型
 * - 函数组件 + Hooks（无 class 组件）
 * - Tailwind CSS：仅用 utility class；合并用 `cn()`（@/utils/cn）
 * - 不写 CSS Modules / inline style（除动态数值等极少数情况）
 * - Props：`export type XxxProps`（禁止 prop-types；编译期由 tsc 校验）
 * - Storybook：同目录 `Xxx.stories.tsx`；本地预览 `pnpm storybook`
 * - 单元测试：同目录 `Xxx.test.tsx`；运行 `pnpm test`
 * - 数据请求优先抽到 `src/hooks/` 自定义 Hook
 */
export default function FeatureComponentTemplate({
  title,
  children,
  className,
  variant = 'default',
  onAction,
}: FeatureComponentTemplateProps) {
  const headingId = useId();
  const [expanded, setExpanded] = useState(false);

  const displayTitle = useMemo(() => title.trim() || '未命名', [title]);

  const handleToggle = useCallback(() => {
    setExpanded((prev) => !prev);
    onAction?.();
  }, [onAction]);

  useEffect(() => {
    // 副作用示例：埋点、订阅、同步 document title 等
    // 复制后替换为真实逻辑；依赖数组只放 effect 内用到的值
    return () => {
      // cleanup：取消订阅、abort fetch 等
    };
  }, [displayTitle]);

  return (
    <section
      className={cn(
        'rounded-2xl border p-4 shadow-sm sm:p-5',
        sectionVariants[variant],
        className,
      )}
      aria-labelledby={headingId}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id={headingId} className="text-base font-semibold text-slate-900">
          {displayTitle}
        </h2>
        <button
          type="button"
          className={cn(
            'w-full rounded-lg border px-3 py-1.5 text-sm transition-colors sm:w-auto',
            'border-slate-200 text-slate-700 hover:bg-slate-50',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500',
            expanded && 'border-sky-200 bg-sky-50/80 text-sky-800',
          )}
          onClick={handleToggle}
          aria-expanded={expanded}
        >
          {expanded ? '收起' : '展开'}
        </button>
      </div>

      {expanded && children ? (
        <div
          className={cn(
            'mt-3 text-sm text-slate-600',
            'border-t border-slate-100 pt-3',
          )}
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}

/** 加载态骨架（与主组件同文件或拆到 *Skeleton.tsx） */
export function FeatureComponentTemplateSkeleton({
  className,
}: FeatureComponentTemplateSkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-2xl border border-slate-200 bg-slate-100/80 p-5 h-24', className)}
      aria-hidden
    />
  );
}
