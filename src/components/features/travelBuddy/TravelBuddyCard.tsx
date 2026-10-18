import { CalendarDays, MapPin, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TRAVEL_BUDDY_STATUS_LABELS } from '@/lib/config/travelBuddy';
import { userProfilePath } from '@/router/paths';
import type { TravelBuddyPost } from '@/types/domain/travelBuddy';
import { findUserById } from '@/data/findUserById';
import { AvatarImage } from '@/components/ui';
import {
  formatTravelBuddyBudgetLabel,
  formatTravelBuddyPublishedAt,
  formatTravelBuddyStartDate,
  formatTravelBuddyTagLabel,
} from '@/utils/travelBuddy';
import { cn } from '@/utils/cn';

export type TravelBuddyCardProps = {
  post: TravelBuddyPost;
  onInterest: (post: TravelBuddyPost) => void;
  className?: string;
};

export default function TravelBuddyCard({ post, onInterest, className }: TravelBuddyCardProps) {
  const author = findUserById(post.userId);

  return (
    <article
      className={cn(
        'flex flex-col rounded-xl border border-[#b7cdc4] bg-[#fffef6] p-4 shadow-none',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">{post.destination}</h2>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              {TRAVEL_BUDDY_STATUS_LABELS[post.status]}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
            出发 {formatTravelBuddyStartDate(post.startDate)}
          </p>
        </div>
        <span className="shrink-0 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-[#2c6b58]">
          {formatTravelBuddyBudgetLabel(post.budgetRange)}
        </span>
      </div>

      <ul className="mt-3 flex flex-wrap gap-1.5">
        {post.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
          >
            {formatTravelBuddyTagLabel(tag)}
          </li>
        ))}
      </ul>

      {post.description && (
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">{post.description}</p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        {author ? (
          <Link
            to={userProfilePath(author.id)}
            className="flex min-w-0 items-center gap-2 text-sm text-slate-700 hover:text-emerald-700"
          >
            {author.avatar ? (
              <AvatarImage
                src={author.avatar}
                displayName={author.username}
                size={32}
                className="h-8 w-8"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                <User className="h-4 w-4 text-slate-500" aria-hidden />
              </span>
            )}
            <span className="truncate font-medium">{author.username}</span>
          </Link>
        ) : (
          <span className="text-sm text-slate-500">蜗友</span>
        )}
        <span className="shrink-0 text-[11px] text-slate-400">
          {formatTravelBuddyPublishedAt(post.createdAt)}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onInterest(post)}
        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#2c6b58] px-4 py-2.5 text-sm font-semibold text-[#f9f7eb] hover:brightness-105"
      >
        <MapPin className="h-4 w-4" aria-hidden />
        感兴趣
      </button>
    </article>
  );
}
