import { Loader2 } from 'lucide-react';

export type TravelMomentPublishBarProps = {
  hasVideo: boolean;
  imageCount: number;
  error: string | null;
  isPublishing: boolean;
  canPublish: boolean;
  onPublish: () => void;
};

export default function TravelMomentPublishBar({
  hasVideo,
  imageCount,
  error,
  isPublishing,
  canPublish,
  onPublish,
}: TravelMomentPublishBarProps) {
  return (
    <>
      <div className="mt-3 flex flex-wrap items-center justify-end">
        <p className="text-[10px] text-slate-400">
          {hasVideo ? '1 个视频' : `${imageCount} 张图片`}
        </p>
      </div>

      {error && (
        <p
          className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800"
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onPublish}
        disabled={isPublishing || !canPublish}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-500 sm:w-auto"
      >
        {isPublishing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            发布中…
          </>
        ) : (
          '发布瞬间'
        )}
      </button>
    </>
  );
}
