import type { TravelPlanPracticalInfo } from '@/types/domain/travelPlanPracticalInfo';

function parseTipList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim());
}

export function parseTravelPlanPracticalInfo(value: unknown): TravelPlanPracticalInfo | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const accommodationTips = parseTipList(
    record.accommodationTips ?? record.accommodation ?? record.stay,
  );
  const transportationTips = parseTipList(
    record.transportationTips ?? record.transportation ?? record.traffic,
  );
  const precautions = parseTipList(record.precautions ?? record.notes ?? record.cautions);

  if (
    accommodationTips.length === 0 &&
    transportationTips.length === 0 &&
    precautions.length === 0
  ) {
    return undefined;
  }

  return {
    accommodationTips,
    transportationTips,
    precautions,
  };
}
