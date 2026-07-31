import type { TravelMoment } from '@/types/domain/user/userSocial';

export function normalizeTravelMoment(moment: TravelMoment): TravelMoment {
  const description = moment.description?.trim() || moment.content?.trim() || '';
  const content = moment.content?.trim() || description;

  return {
    ...moment,
    description,
    content,
    tags: moment.tags ?? [],
    visibility: moment.visibility ?? 'public',
  };
}

export function getMomentDescription(moment: TravelMoment): string {
  return normalizeTravelMoment(moment).description;
}

export function getMomentDetailText(moment: TravelMoment): string | undefined {
  const normalized = normalizeTravelMoment(moment);
  if (normalized.content === normalized.description) {
    return undefined;
  }
  return normalized.content;
}

export function getMomentTags(moment: TravelMoment): string[] {
  return normalizeTravelMoment(moment).tags;
}
