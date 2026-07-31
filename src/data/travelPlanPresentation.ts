import { getTravelPlanCover } from '@/data/travelPlanCovers';
import { getTravelPlanCreator } from '@/data/travelPlanCreators';
import { getTravelPlanLikeCount } from '@/data/travelPlanStats';
import { getTravelPlanStyleTags } from '@/data/travelPlanStyleTags';
import type { Guide } from '@/types/domain/guide';
import type { TravelPlanPresentation } from '@/types/domain/travelPlan';
import type { TravelPlanStyleTag } from '@/types/domain/travelPlanStyleTag';

export function buildTravelPlanPresentation(
  guide: Guide,
  destination: string,
  styleTagOverrides?: TravelPlanStyleTag[],
): TravelPlanPresentation {
  const cover = getTravelPlanCover(guide.id, destination);
  return {
    guideId: guide.id,
    destination,
    coverImageUrl: cover.url,
    coverImageAlt: cover.alt,
    styleTags: styleTagOverrides?.length ? styleTagOverrides : getTravelPlanStyleTags(guide.id),
    generatedAt: new Date().toISOString(),
    creator: getTravelPlanCreator(guide.id),
    stats: { likeCount: getTravelPlanLikeCount(guide.id) },
  };
}
