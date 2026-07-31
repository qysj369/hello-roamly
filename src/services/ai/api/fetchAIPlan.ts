export {
  fetchMapPlanFromApi as fetchAIPlan,
  GenerateMapPlanApiError as FetchAIPlanError,
} from '@/services/ai/api/generateMapPlan';

export type {
  GenerateMapPlanRequest as FetchAIPlanRequest,
  GenerateMapPlanResponse as FetchAIPlanResponse,
} from '@/types/api/mapGeneratePlan';
