import { cn } from '@/utils/cn';

/**
 * 无障碍「跳过导航」链接：Tab 聚焦时可见，跳至 `#main-content`。
 *
 * @remarks
 * 须与 {@link AppShell} 中 `<main id="main-content">` 配对使用，满足 WCAG 绕过重复区块要求。
 *
 * @example
 * ```tsx
 * <PageContainer>
 *   <SkipToMainLink />
 *   <PageHeader />
 *   <main id="main-content">...</main>
 * </PageContainer>
 * ```
 */
export default function SkipToMainLink() {
  return (
    <a
      href="#main-content"
      className={cn(
        'sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]',
        'rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white',
        'shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
      )}
    >
      跳到主内容
    </a>
  );
}
