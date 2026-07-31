import type { EnrichedTravelPlan } from '@/types/domain/travelPlan';

export type GenerateMapPlanRequest = {
  lng: number;
  lat: number;
  query: string;
  /** 用户原始搜索词（多地联游解析用，避免 enriched query 干扰） */
  searchQuery?: string;
  /** 与 searchQuery 同义，兼容旧前端 */
  initialQuery?: string;
  /** 前端 AMap.Geocoder 已识别的地点名，优先于服务端再逆地理 */
  locationName?: string;
  /** 用户当前定位（出发地），用于跨城行程规划 */
  originName?: string;
};

export type GenerateMapPlanResponse = {
  locationName: string;
  /** AI 生成的 Markdown 穷游方案（花费清单 / 行程流水账 / 蜗牛启示） */
  content: string;
  /** 兼容字段：若后续需要结构化计划可再启用 */
  plan?: EnrichedTravelPlan;
};

export type GenerateMapPlanErrorResponse = {
  error: string;
  code?: 'invalid_params' | 'generate_failed' | 'geocode_failed';
};
