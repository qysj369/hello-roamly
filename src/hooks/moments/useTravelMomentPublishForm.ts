import { useCallback, useEffect, useState } from 'react';
import type {
  TravelMoment as TravelMomentRecord,
  TravelMomentVisibility,
} from '@/types/domain/user/userSocial';
import type { UserId } from '@/types/domain/user/userId';
import { useTravelMomentsStore } from '@/stores/travelMoments/store';
import { buildTravelMomentRecord } from '@/utils/moments/buildTravelMomentRecord';
import { readMomentMediaDataUrls } from '@/utils/moments/readMomentMediaDataUrls';
import { validateTravelMomentPublishFields } from '@/utils/moments/validateTravelMomentPublish';
import type { TravelMomentLocationValue } from '@/utils/travelMomentLocation';
import type { TravelMomentMediaFile } from '@/utils/travelMomentMedia';

export type UseTravelMomentPublishFormOptions = {
  authorId: UserId;
  defaultVisibility?: TravelMomentVisibility;
  onPublished?: (moment: TravelMomentRecord) => void;
};

export function useTravelMomentPublishForm({
  authorId,
  defaultVisibility = 'public',
  onPublished,
}: UseTravelMomentPublishFormOptions) {
  const addMoment = useTravelMomentsStore((state) => state.addMoment);
  const hydrateMoments = useTravelMomentsStore((state) => state.hydrate);

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [detail, setDetail] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [locationPin, setLocationPin] = useState<TravelMomentLocationValue>({ label: '' });
  const [visibility, setVisibility] = useState<TravelMomentVisibility>(defaultVisibility);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    hydrateMoments();
  }, [hydrateMoments]);

  const resetFields = useCallback(() => {
    setTitle('');
    setDescription('');
    setDetail('');
    setTags([]);
    setLocationPin({ label: '' });
    setVisibility(defaultVisibility);
    setError(null);
  }, [defaultVisibility]);

  const publish = useCallback(
    async (mediaFiles: TravelMomentMediaFile[], clearMedia: () => void) => {
      const validationError = validateTravelMomentPublishFields({ description, detail });
      if (validationError) {
        setError(validationError);
        return;
      }

      setIsPublishing(true);
      setError(null);

      try {
        const { imageUrls, videoUrl } = await readMomentMediaDataUrls(mediaFiles);
        const moment = buildTravelMomentRecord({
          authorId,
          title,
          description,
          detail,
          tags,
          locationPin,
          visibility,
          imageUrls,
          videoUrl,
        });

        // TODO: POST /moments 创建后以后端返回的 id/createdAt 为准，再更新本地缓存
        addMoment(authorId, moment);
        onPublished?.(moment);
        resetFields();
        clearMedia();
      } catch {
        setError('发布失败，请检查媒体文件大小后重试');
      } finally {
        setIsPublishing(false);
      }
    },
    [
      addMoment,
      authorId,
      description,
      detail,
      locationPin,
      onPublished,
      resetFields,
      tags,
      title,
      visibility,
    ],
  );

  return {
    title,
    setTitle,
    description,
    setDescription,
    detail,
    setDetail,
    tags,
    setTags,
    locationPin,
    setLocationPin,
    visibility,
    setVisibility,
    error,
    setError,
    isPublishing,
    publish,
    canPublish: Boolean(description.trim()),
  };
}
