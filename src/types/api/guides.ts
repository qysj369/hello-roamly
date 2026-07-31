import type { Guide } from '@/types/domain/guide';

/** GET /guides 查询参数 */
export type ListGuidesParams = {
  q?: string;
  page?: number;
  limit?: number;
};

/** GET /guides 响应（分页就绪） */
export type ListGuidesResponse = {
  items: Guide[];
  total: number;
  page: number;
  limit: number;
};
