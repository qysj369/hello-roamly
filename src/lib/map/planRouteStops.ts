import type { PlanMapPoint } from '@/lib/map/planMapPoints';

/** 大交通 / 门到门衔接节点，不参与目的地市内游玩路线 */
const TRANSIT_ROUTE_PATTERNS: RegExp[] = [
  /家门口/,
  /出发地/,
  /返程/,
  /回程/,
  /返回(?:家|城|市|济南|临清|成都|杭州|南京)/,
  /(?:西|东|南|北)?(?:高铁)?站$/,
  /(?:高铁|火车|动车|城际)(?:站|枢纽)?/,
  /(?:国际)?机场|航站楼|候机楼/,
  /(?:出发|抵达|到达|接站|送站)站/,
  /大交通/,
  /接驳(?:车|段)?/,
  /换乘枢纽/,
  /(?:G|D|K|Z|T|C)\d{1,4}(?:次)?(?:列车|高铁|动车)?/,
  /乘坐(?:高铁|动车|火车|飞机|航班)/,
  /(?:济南|临清|成都|杭州|南京|北京|上海)(?:西|东|南|北)?站/,
  /酒店(?:接站|入住|放行李)/,
  /住宿区(?:接站|入住)?/,
];

function routeStopText(point: PlanMapPoint): string {
  return [point.name, point.location, point.description, point.dayTitle].filter(Boolean).join(' ');
}

/** 是否为跨城大交通节点（不应连入目的地游玩路线） */
export function isTransitRouteStop(point: PlanMapPoint): boolean {
  const text = routeStopText(point);
  return TRANSIT_ROUTE_PATTERNS.some((pattern) => pattern.test(text));
}
