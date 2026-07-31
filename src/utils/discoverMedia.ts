import {
  getDefaultCityCoverUrl,
  resolveCityCoverUrl,
  resolveCoverFromPlaceText,
} from '@/data/cityCoverImages';
import type { Guide } from '@/types/domain/guide';
import type { TravelMoment } from '@/types/domain/user/userSocial';
import { getPlanCoverUrl, getPlanDestination, getPlanGuideId } from '@/utils/travelPlanView';
import type { TravelPlan } from '@/types/domain/travelPlan';

const PLACEHOLDER_IMAGE_HOSTS = ['picsum.photos', 'placehold.co', 'placekitten.com'];

function isPlaceholderImageUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return PLACEHOLDER_IMAGE_HOSTS.some(
      (placeholderHost) => host === placeholderHost || host.endsWith(`.${placeholderHost}`),
    );
  } catch {
    return false;
  }
}

function resolveMomentPlaceCover(moment: TravelMoment, width: number): string | null {
  const text = [moment.location, moment.title, moment.description, ...(moment.tags ?? [])]
    .filter(Boolean)
    .join(' ');
  return resolveCoverFromPlaceText(text, { width });
}

export function getGuideCoverUrl(guide: Guide, width = 640): string {
  const fromCity = resolveCityCoverUrl(guide.city, { width });
  if (fromCity) {
    return fromCity;
  }
  const fromId = resolveCityCoverUrl(guide.id, { width });
  if (fromId) {
    return fromId;
  }
  return getDefaultCityCoverUrl(width);
}

export function getMomentCoverUrl(moment: TravelMoment, width = 640): string {
  const uploaded = moment.imageUrls?.find((url) => url && !isPlaceholderImageUrl(url));
  if (uploaded) {
    return uploaded;
  }

  const fromPlace = resolveMomentPlaceCover(moment, width);
  if (fromPlace) {
    return fromPlace;
  }

  return getDefaultCityCoverUrl(width);
}

export function getPlanCoverImage(plan: TravelPlan, width = 640): string {
  const fromPresentation = getPlanCoverUrl(plan);
  if (fromPresentation && !isPlaceholderImageUrl(fromPresentation)) {
    return fromPresentation;
  }

  const destination = getPlanDestination(plan);
  return (
    resolveCoverFromPlaceText(destination, { width }) ??
    resolveCityCoverUrl(getPlanGuideId(plan), { width }) ??
    getDefaultCityCoverUrl(width)
  );
}
