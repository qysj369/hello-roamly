import type { TravelMoment, TravelMomentVisibility } from '@/types/domain/user/userSocial';
import type { UserId } from '@/types/domain/user/userId';
import type { TravelMomentLocationValue } from '@/utils/travelMomentLocation';

export type BuildTravelMomentRecordInput = {
  authorId: UserId;
  title: string;
  description: string;
  detail: string;
  tags: string[];
  locationPin: TravelMomentLocationValue;
  visibility: TravelMomentVisibility;
  imageUrls: string[];
  videoUrl?: string;
};

/** 从表单与已编码媒体组装 TravelMoment 实体 */
export function buildTravelMomentRecord(input: BuildTravelMomentRecordInput): TravelMoment {
  const trimmedDescription = input.description.trim();
  const trimmedDetail = input.detail.trim();
  const now = new Date().toISOString();

  return {
    id: `moment-${Date.now()}`,
    authorId: input.authorId,
    description: trimmedDescription,
    content: trimmedDetail || trimmedDescription,
    title: input.title.trim() || undefined,
    tags: input.tags,
    imageUrls: input.imageUrls.length > 0 ? input.imageUrls : undefined,
    videoUrl: input.videoUrl,
    location: input.locationPin.label.trim() || undefined,
    coordinates: input.locationPin.coordinates,
    countryCode: input.locationPin.countryCode,
    visibility: input.visibility,
    likeCount: 0,
    commentCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}
