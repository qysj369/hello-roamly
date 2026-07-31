import { cn } from '@/utils/cn';
import { isPresetTag } from '@/utils/travelMomentTags';

export type TravelMomentTagListProps = {
  tags: string[];
  className?: string;
};

/** 旅行瞬间标签展示 */
export default function TravelMomentTagList({ tags, className }: TravelMomentTagListProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <ul className={cn('flex flex-wrap gap-1.5', className)} aria-label="瞬间标签">
      {tags.map((tag) => (
        <li key={tag}>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-medium',
              isPresetTag(tag)
                ? 'bg-violet-100 text-violet-800'
                : 'bg-cyan-100 text-cyan-800',
            )}
          >
            #{tag}
          </span>
        </li>
      ))}
    </ul>
  );
}
