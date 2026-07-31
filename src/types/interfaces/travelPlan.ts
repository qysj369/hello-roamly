import type { TravelPlanPracticalInfo } from '@/types/domain/travelPlanPracticalInfo';
import type { TravelPlanStyleTag } from '@/types/domain/travelPlanStyleTag';

/** 计划创建者（卡片 / 详情展示） */
export interface TravelPlanCreator {
  id: string;
  nickname: string;
  avatarUrl?: string;
}

/**
 * 经纬度（与当前地图服务商一致：高德 GCJ-02 / Mapbox WGS84）。
 * 跨服务商迁移时请用 `normalizeCoordinatesForActiveProvider`。
 */
export interface MapCoordinates {
  longitude: number;
  latitude: number;
}

/** 单日行程中的活动 */
export interface TravelPlanActivity {
  time: string;
  description: string;
  location?: string;
  cost?: number;
  coordinates?: MapCoordinates;
}

/** 按天划分的行程 */
export interface TravelPlanDay {
  day: number;
  title: string;
  activities: TravelPlanActivity[];
}

/**
 * 旅行计划核心结构（AI 生成或 GET /plans/:id 主体字段）。
 * 与后端 JSON 契约对齐；展示元数据见 `TravelPlanPresentation` / `EnrichedTravelPlan`。
 */
export interface TravelPlan {
  id: string;
  title: string;
  summary: string;
  dailyPlans: TravelPlanDay[];
  totalCost: number;
  tags: string[];
  suitableAudience?: string;
  practicalInfo?: TravelPlanPracticalInfo;
}

/** 列表卡片、详情页所需的展示元数据 */
export interface TravelPlanPresentation {
  guideId: string;
  destination: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  styleTags: TravelPlanStyleTag[];
  /** ISO 8601 */
  generatedAt: string;
  creator: TravelPlanCreator;
  stats?: {
    likeCount: number;
  };
}

/** 带展示元数据的完整计划（应用内与发现流卡片） */
export interface EnrichedTravelPlan extends TravelPlan {
  presentation: TravelPlanPresentation;
}
