/** 计划实用信息：住宿、交通、注意事项 */
export type TravelPlanPracticalInfo = {
  accommodationTips: string[];
  transportationTips: string[];
  precautions: string[];
};

export const EMPTY_PRACTICAL_INFO: TravelPlanPracticalInfo = {
  accommodationTips: [],
  transportationTips: [],
  precautions: [],
};
