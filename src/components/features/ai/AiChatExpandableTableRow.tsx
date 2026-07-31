import { ChevronDown } from 'lucide-react';
import {
  Children,
  cloneElement,
  isValidElement,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cn } from '@/utils/cn';

function readCellText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(readCellText).join('');
  }
  if (isValidElement(node)) {
    return readCellText((node as ReactElement<{ children?: ReactNode }>).props.children);
  }
  return '';
}

type AiChatExpandableTableRowProps = {
  children: ReactNode;
};

/** 顾问回复里的 Markdown 表格行：点击展开完整内容 */
export default function AiChatExpandableTableRow({ children }: AiChatExpandableTableRowProps) {
  const [open, setOpen] = useState(false);
  const cells = Children.toArray(children).filter(isValidElement);
  const cellTexts = cells.map((cell) => readCellText(cell.props.children).trim()).filter(Boolean);

  if (cellTexts.length === 0) {
    return <tr>{children}</tr>;
  }

  const toggle = () => setOpen((value) => !value);

  return (
    <>
      <tr
        className={cn(
          'cursor-pointer transition hover:bg-brand-50/60',
          open && 'bg-brand-50/40',
        )}
        onClick={toggle}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggle();
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={open}
      >
        {cells.map((cell, index) => {
          const isLast = index === cells.length - 1;
          const element = cell as ReactElement<{ children?: ReactNode; className?: string }>;
          if (!isLast) {
            return cloneElement(element, { key: index });
          }
          return cloneElement(element, {
            key: index,
            children: (
              <span className="inline-flex items-start gap-1">
                <span className="min-w-0">{element.props.children}</span>
                <ChevronDown
                  className={cn(
                    'mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform',
                    open && 'rotate-180',
                  )}
                  aria-hidden
                />
              </span>
            ),
          });
        })}
      </tr>
      {open ? (
        <tr className="bg-brand-50/25">
          <td colSpan={cells.length} className="border-t border-brand-100 px-3 py-2.5 text-xs leading-relaxed text-slate-700">
            {cellTexts.map((text, index) => (
              <p key={index} className={index > 0 ? 'mt-1.5' : undefined}>
                {text}
              </p>
            ))}
          </td>
        </tr>
      ) : null}
    </>
  );
}
