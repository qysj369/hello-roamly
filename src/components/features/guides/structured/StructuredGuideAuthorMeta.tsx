import { Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { findUserById } from '@/data/findUserById';
import { SNAIL_COMMUNITY } from '@/lib/config/snailCommunity';
import { SLIME_TRAIL_AI_ATTRIBUTION } from '@/lib/guides/slimeTrail';import { profilePathForUser } from '@/router/paths';
import { formatDateZh, formatRelativeZh } from '@/utils/date';
import { cn } from '@/utils/cn';

type StructuredGuideAuthorMetaProps = {
  authorId: string;
  publishedAt: string;
  aiAssisted?: boolean;
  className?: string;
};

export default function StructuredGuideAuthorMeta({
  authorId,
  publishedAt,
  aiAssisted = false,
  className,
}: StructuredGuideAuthorMetaProps) {
  const author = findUserById(authorId);
  const authorName = author?.username ?? SNAIL_COMMUNITY.defaultAuthorName;
  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-xl border border-slate-200/90 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-slate-700">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <User className="h-3.5 w-3.5 text-slate-400" aria-hidden />
          <Link to={profilePathForUser(authorId)} className="hover:text-emerald-700 hover:underline">
            {authorName}
          </Link>
        </span>
        {aiAssisted && (
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-[#2c6b58]">
            {SLIME_TRAIL_AI_ATTRIBUTION}
          </span>
        )}
      </div>
      <p className="flex items-center gap-1.5 text-xs text-slate-500">
        <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
        发布于 {formatDateZh(publishedAt)}（{formatRelativeZh(publishedAt)}）
      </p>
    </div>
  );
}
