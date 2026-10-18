import type { Components } from 'react-markdown';
import type { ReactElement, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import AiChatExpandableTableRow from '@/components/features/ai/AiChatExpandableTableRow';
import { cn } from '@/utils/cn';

type AiChatMarkdownProps = {
  content: string;
  className?: string;
  /** 攻略结果柔和排版：浅灰正文、弱化序号与粗分割线 */
  soft?: boolean;
  /** 点击「示例提问」时填入下方输入框 */
  onUseExamplePrompt?: (text: string) => void;
};

function readCodeBlockText(children: ReactNode): string {
  if (typeof children === 'string') {
    return children.trim();
  }
  if (Array.isArray(children)) {
    return children.map((part) => readCodeBlockText(part)).join('').trim();
  }
  if (children && typeof children === 'object' && 'props' in children) {
    return readCodeBlockText((children as ReactElement).props.children);
  }
  return '';
}

function isExampleTextBlock(className?: string): boolean {
  if (!className) {
    return false;
  }
  return (
    className.includes('language-text') ||
    className.includes('language-plain') ||
    className.includes('language-example')
  );
}

function createMarkdownComponents(
  onUseExamplePrompt?: (text: string) => void,
  soft = false,
): Components {
  return {
    p: ({ children }) => (
      <p
        className={cn(
          'first:mt-0 last:mb-0',
          soft ? 'my-3 leading-7 text-slate-600' : 'my-2 leading-relaxed',
        )}
      >
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul
        className={cn(
          soft
            ? 'my-3 list-none space-y-2.5 pl-0 text-slate-600'
            : 'my-2 list-disc space-y-1 pl-4 marker:text-brand-500',
        )}
      >
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol
        className={cn(
          soft
            ? 'my-3 list-none space-y-2.5 pl-0 text-slate-600'
            : 'my-2 list-decimal space-y-1 pl-4 marker:font-medium marker:text-brand-600',
        )}
      >
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className={cn('leading-relaxed', soft && 'leading-7 before:mr-1.5 before:content-["▫️"]')}>
        {children}
      </li>
    ),
    strong: ({ children }) => (
      <strong className={cn('font-semibold', soft ? 'text-slate-800' : 'text-slate-900')}>
        {children}
      </strong>
    ),
    em: ({ children }) => <em className="text-slate-700">{children}</em>,
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className="font-medium text-brand-600 underline decoration-brand-300 underline-offset-2 hover:text-brand-700"
      >
        {children}
      </a>
    ),
    blockquote: ({ children }) => (
      <blockquote
        className={cn(
          'my-2 py-1 pl-3 text-slate-700',
          soft
            ? 'border-l-2 border-emerald-200/80 bg-emerald-50/40'
            : 'border-l-2 border-violet-300 bg-violet-50/60',
        )}
      >
        {children}
      </blockquote>
    ),
    h1: ({ children }) => (
      <h3
        className={cn(
          'font-bold text-slate-900',
          soft ? 'mt-4 mb-2 text-base' : 'mt-3 mb-1.5 text-base',
        )}
      >
        {children}
      </h3>
    ),
    h2: ({ children }) => (
      <h4
        className={cn(
          'font-bold text-slate-900',
          soft ? 'mt-3.5 mb-1.5 text-sm' : 'mt-2.5 mb-1 text-sm',
        )}
      >
        {children}
      </h4>
    ),
    h3: ({ children }) => (
      <h5
        className={cn(
          'font-semibold text-slate-800',
          soft ? 'mt-3 mb-1.5 text-sm' : 'mt-2 mb-1 text-sm',
        )}
      >
        {children}
      </h5>
    ),
    hr: () =>
      soft ? (
        <div className="my-4 h-px bg-gradient-to-r from-transparent via-emerald-100 to-transparent" />
      ) : (
        <hr className="my-3 border-slate-200" />
      ),
    table: ({ children }) => (
      <div className="my-2">
        <p className="mb-1 text-[10px] font-medium text-slate-400">点击表格行可展开详情</p>
        <div className="overflow-x-auto rounded-lg border border-slate-200/80">
          <table className="min-w-full text-left text-xs">{children}</table>
        </div>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-slate-100/90 text-slate-700">{children}</thead>,
    th: ({ children }) => <th className="px-2.5 py-1.5 font-semibold">{children}</th>,
    td: ({ children }) => <td className="border-t border-slate-100 px-2.5 py-2 align-top">{children}</td>,
    tr: ({ children, node }) => {
      const parentTag =
        node && 'parent' in node && node.parent && typeof node.parent === 'object'
          ? (node.parent as { tagName?: string }).tagName
          : undefined;
      if (parentTag === 'thead') {
        return <tr>{children}</tr>;
      }
      return <AiChatExpandableTableRow>{children}</AiChatExpandableTableRow>;
    },
    code: ({ className, children }) => {
      const isBlock = Boolean(className?.includes('language-'));
      if (isBlock && isExampleTextBlock(className)) {
        return <span className="text-sm leading-relaxed text-slate-700">{children}</span>;
      }
      if (isBlock) {
        return (
          <code className={cn('font-mono text-[11px] leading-relaxed', className)}>{children}</code>
        );
      }
      return (
        <code className="rounded-md bg-slate-200/70 px-1.5 py-0.5 font-mono text-[0.8em] text-brand-800">
          {children}
        </code>
      );
    },
    pre: ({ children }) => {
      const child = children as ReactElement<{ className?: string; children?: ReactNode }> | undefined;
      const className = child?.props?.className;
      if (isExampleTextBlock(className)) {
        const exampleText = readCodeBlockText(child?.props?.children);
        const hint = (
          <>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-brand-600">
              示例提问 · 不是输入框，无需删除
            </p>
            <p className="text-sm leading-relaxed text-slate-700">{exampleText}</p>
            {onUseExamplePrompt ? (
              <p className="mt-1.5 text-[10px] font-medium text-brand-700">点击填入下方输入框</p>
            ) : null}
          </>
        );

        if (onUseExamplePrompt && exampleText) {
          return (
            <button
              type="button"
              onClick={() => onUseExamplePrompt(exampleText)}
              className={cn(
                'my-2.5 w-full rounded-xl border border-dashed border-brand-200/90 bg-brand-50/50 px-3 py-2.5 text-left',
                'transition hover:border-brand-300 hover:bg-brand-50',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30',
              )}
            >
              {hint}
            </button>
          );
        }

        return (
          <div className="my-2.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-3 py-2.5">
            {hint}
          </div>
        );
      }

      return (
        <pre className="ai-chat-code-block my-2.5 overflow-x-auto rounded-xl bg-slate-900 p-3 text-slate-100 shadow-inner">
          {children}
        </pre>
      );
    },
  };
}

/** AI 回复 Markdown 渲染（GFM + 代码高亮） */
export default function AiChatMarkdown({
  content,
  className,
  soft = false,
  onUseExamplePrompt,
}: AiChatMarkdownProps) {
  return (
    <div
      className={cn(
        'ai-chat-markdown text-sm',
        soft ? 'text-slate-600' : 'text-slate-800',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={createMarkdownComponents(onUseExamplePrompt, soft)}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
