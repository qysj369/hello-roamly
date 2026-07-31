import { TRAVEL_MOMENT_TAG_LIMITS } from '@/utils/travelMomentTags';

export type TravelMomentPublishFieldValues = {
  description: string;
  detail: string;
};

/** 发布前校验文案字段，返回错误信息或 null */
export function validateTravelMomentPublishFields(
  values: TravelMomentPublishFieldValues,
): string | null {
  const trimmedDescription = values.description.trim();
  if (!trimmedDescription) {
    return '请填写瞬间描述';
  }
  if (trimmedDescription.length > TRAVEL_MOMENT_TAG_LIMITS.maxDescriptionLength) {
    return `描述不超过 ${TRAVEL_MOMENT_TAG_LIMITS.maxDescriptionLength} 字`;
  }
  if (values.detail.trim().length > TRAVEL_MOMENT_TAG_LIMITS.maxDetailLength) {
    return `详细内容不超过 ${TRAVEL_MOMENT_TAG_LIMITS.maxDetailLength} 字`;
  }
  return null;
}
