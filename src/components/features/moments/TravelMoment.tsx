import { Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import TravelMomentComposeFields from '@/components/features/moments/TravelMomentComposeFields';
import TravelMomentMediaSection from '@/components/features/moments/TravelMomentMediaSection';
import TravelMomentPublishBar from '@/components/features/moments/TravelMomentPublishBar';
import TravelMomentVisibilityField from '@/components/features/moments/TravelMomentVisibilityField';
import { useTravelMomentMediaUpload } from '@/hooks/moments/useTravelMomentMediaUpload';
import { useTravelMomentPublishForm } from '@/hooks/moments/useTravelMomentPublishForm';
import type { TravelMoment as TravelMomentRecord, TravelMomentVisibility } from '@/types/domain/user/userSocial';
import type { UserId } from '@/types/domain/user/userId';
import { cn } from '@/utils/cn';

export type TravelMomentProps = {
  authorId: UserId;
  defaultVisibility?: TravelMomentVisibility;
  onPublished?: (moment: TravelMomentRecord) => void;
  className?: string;
};

/** 发布旅行瞬间：容器组件，逻辑见 hooks/moments */
export default function TravelMoment({
  authorId,
  defaultVisibility = 'public',
  onPublished,
  className,
}: TravelMomentProps) {
  const form = useTravelMomentPublishForm({
    authorId,
    defaultVisibility,
    onPublished,
  });

  const media = useTravelMomentMediaUpload(form.isPublishing);

  const displayError = useMemo(
    () => form.error ?? media.error,
    [form.error, media.error],
  );

  const handlePublish = () => {
    void form.publish(media.mediaFiles, media.clearMedia);
  };

  return (
    <section
      className={cn(
        'rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50/80 via-white to-cyan-50/50 p-4 shadow-sm sm:p-5',
        className,
      )}
      aria-labelledby="travel-moment-compose-title"
    >
      <header className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-violet-600" aria-hidden />
        <h2 id="travel-moment-compose-title" className="text-sm font-semibold text-slate-900">
          分享旅行瞬间
        </h2>
      </header>
      <p className="mt-1 text-xs text-slate-500">填写描述与标签，支持图片、视频与地图选点</p>

      <div className="mt-4">
        <TravelMomentComposeFields
          title={form.title}
          description={form.description}
          detail={form.detail}
          tags={form.tags}
          locationPin={form.locationPin}
          onTitleChange={form.setTitle}
          onDescriptionChange={form.setDescription}
          onDetailChange={form.setDetail}
          onTagsChange={form.setTags}
          onLocationPinChange={form.setLocationPin}
        />
      </div>

      <TravelMomentMediaSection
        mediaFiles={media.mediaFiles}
        dropHint={media.dropHint}
        isDragActive={media.isDragActive}
        isPublishing={form.isPublishing}
        getRootProps={media.getRootProps}
        getInputProps={media.getInputProps}
        onRemoveMedia={media.handleRemoveMedia}
      />

      <TravelMomentVisibilityField visibility={form.visibility} onChange={form.setVisibility} />

      <TravelMomentPublishBar
        hasVideo={media.hasVideo}
        imageCount={media.imageCount}
        error={displayError}
        isPublishing={form.isPublishing}
        canPublish={form.canPublish}
        onPublish={handlePublish}
      />
    </section>
  );
}
