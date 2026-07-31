/**
 * 分享统计 API（由后端落库；前端演示期同时写 localStorage）。
 *
 * - POST /analytics/share-events   批量上报分享事件
 * - GET  /analytics/share-summary  汇总（可选，按内容 ID 筛选）
 */
export const SHARE_ANALYTICS_API = {
  events: '/analytics/share-events',
  summary: '/analytics/share-summary',
} as const;
