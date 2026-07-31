import { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { applyTravelMomentMediaDrop } from '@/utils/moments/applyTravelMomentMediaDrop';
import {
  revokeMediaPreviewUrls,
  TRAVEL_MOMENT_MEDIA_LIMITS,
  type TravelMomentMediaFile,
} from '@/utils/travelMomentMedia';

export function useTravelMomentMediaUpload(disabled = false) {
  const [mediaFiles, setMediaFiles] = useState<TravelMomentMediaFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const mediaFilesRef = useRef(mediaFiles);
  mediaFilesRef.current = mediaFiles;

  useEffect(
    () => () => {
      revokeMediaPreviewUrls(mediaFilesRef.current);
    },
    [],
  );

  const onDrop = useCallback((accepted: File[]) => {
    setError(null);
    setMediaFiles((prev) => {
      const result = applyTravelMomentMediaDrop(prev, accepted);
      if (!result.ok) {
        setError(result.error);
        return prev;
      }
      return result.files;
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: (rejections) => {
      const message = rejections[0]?.errors[0]?.message;
      setError(message ?? '文件类型不支持');
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov'],
    },
    maxFiles: TRAVEL_MOMENT_MEDIA_LIMITS.maxImages,
    disabled,
  });

  const handleRemoveMedia = useCallback((id: string) => {
    setMediaFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        revokeMediaPreviewUrls([target]);
      }
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const clearMedia = useCallback(() => {
    setMediaFiles((prev) => {
      revokeMediaPreviewUrls(prev);
      return [];
    });
  }, []);

  const hasVideo = mediaFiles.some((item) => item.kind === 'video');
  const imageCount = mediaFiles.filter((item) => item.kind === 'image').length;
  const dropHint = hasVideo
    ? '已选视频，可拖入替换'
    : `拖入图片（最多 ${TRAVEL_MOMENT_MEDIA_LIMITS.maxImages} 张）或 1 个短视频`;

  return {
    mediaFiles,
    error,
    setError,
    getRootProps,
    getInputProps,
    isDragActive,
    handleRemoveMedia,
    clearMedia,
    hasVideo,
    imageCount,
    dropHint,
  };
}
