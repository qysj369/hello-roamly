import { STRUCTURED_GUIDE_SECTIONS, type StructuredGuideSectionId } from '@/lib/guides/structuredGuideSections';
import SnailSlangTerm from '@/components/features/community/SnailSlangTerm';
import { cn } from '@/utils/cn';
type StructuredGuideSectionNavProps = {
  className?: string;
  sticky?: boolean;
  activeSectionId?: StructuredGuideSectionId | null;
};

export default function StructuredGuideSectionNav({
  className,
  sticky = true,
  activeSectionId,
}: StructuredGuideSectionNavProps) {
  return (
    <nav
      className={cn(
        'flex flex-wrap gap-2 rounded-xl border border-slate-200/90 bg-white/95 p-2 shadow-sm backdrop-blur-sm',
        sticky && 'lg:sticky lg:top-20 lg:z-10',
        className,
      )}
      aria-label="攻略板块导航"
    >
      {STRUCTURED_GUIDE_SECTIONS.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          aria-current={activeSectionId === section.id ? 'location' : undefined}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
            activeSectionId === section.id
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800',
          )}
        >
          {'slangId' in section && section.slangId ? (
            <SnailSlangTerm id={section.slangId} />
          ) : (
            section.label
          )}        </a>
      ))}
    </nav>
  );
}
