import { ImagePlus, Trash2, Video } from 'lucide-react';
import type { DropzoneInputProps, DropzoneRootProps } from 'react-dropzone';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { getMomentUploadPreviewAlt } from '@/utils/imageAlt';
import type { TravelMomentMediaFile } from '@/utils/travelMomentMedia';
import { cn } from '@/utils/cn';

export type TravelMomentMediaSectionProps = {
  mediaFiles: TravelMomentMediaFile[];
  dropHint: string;
  isDragActive: boolean;
  isPublishing: boolean;
  getRootProps: <T extends DropzoneRootProps>(props?: T) => T;
  getInputProps: <T extends DropzoneInputProps>(props?: T) => T;
  onRemoveMedia: (id: string) => void;
};

export default function TravelMomentMediaSection({
  mediaFiles,
  dropHint,
  isDragActive,
  isPublishing,
  getRootProps,
  getInputProps,
  onRemoveMedia,
}: TravelMomentMediaSectionProps) {
  const dropzoneId = 'moment-media-dropzone';

  return (
    <>
      <div
        {...getRootProps()}
        id={dropzoneId}
        aria-labelledby="moment-media-dropzone-label"
        aria-describedby="moment-media-dropzone-hint"
        className={cn(
          'mt-4 cursor-pointer rounded-xl border-2 border-dashed px-4 py-8 text-center transition',
          isDragActive
            ? 'border-violet-400 bg-violet-50'
            : 'border-slate-200 bg-white/60 hover:border-violet-300 hover:bg-violet-50/30',
          isPublishing && 'pointer-events-none opacity-60',
        )}
      >
        <input {...getInputProps()} aria-label="选择图片或视频文件" />
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-700">
          <ImagePlus className="h-6 w-6" aria-hidden />
        </div>
        <p id="moment-media-dropzone-label" className="mt-2 text-sm font-medium text-slate-800">
          {isDragActive ? '松开即可上传' : '点击或拖拽上传图片/视频'}
        </p>
        <p id="moment-media-dropzone-hint" className="mt-1 text-xs text-slate-600">
          {dropHint}
        </p>
      </div>

      {mediaFiles.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {mediaFiles.map((item, mediaIndex) => (
            <li key={item.id} className="group relative overflow-hidden rounded-lg border border-slate-200">
              {item.kind === 'video' ? (
                <div className="relative aspect-square bg-slate-900">
                  <video
                    src={item.previewUrl}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    aria-label={getMomentUploadPreviewAlt(mediaIndex, 'video')}
                  />
                  <span className="absolute bottom-1 left-1 inline-flex items-center gap-0.5 rounded bg-black/60 px-1 py-0.5 text-[9px] text-white">
                    <Video className="h-3 w-3" aria-hidden />
                    视频
                  </span>
                </div>
              ) : (
                <div className="aspect-square w-full">
                  <OptimizedImage
                    src={item.previewUrl}
                    alt={getMomentUploadPreviewAlt(mediaIndex, 'image')}
                    fill
                    priority
                    sizes="120px"
                    widths={[120, 240]}
                  />
                </div>
              )}
              <button
                type="button"
                onClick={() => onRemoveMedia(item.id)}
                className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                aria-label="移除媒体"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
