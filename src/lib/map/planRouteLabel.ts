import { isSameCityRegion } from '@/lib/map/planQueryBuilder';
import { extractPrimaryLocation } from '@/lib/map/travelQueryParsing';
import { getMultiStopNames } from '@/lib/plan/mapPlanCompleteness';

/** 标题区路线：出发地 → 目的地（含多地联游） */
export function buildPlanRouteDisplayLabel(
  destinationLabel: string,
  originName?: string | null,
): string {
  const dest = destinationLabel.trim();
  if (!dest) {
    return '所选地点';
  }
  const origin = originName?.trim();
  if (!origin) {
    return dest;
  }
  if (dest.includes('→')) {
    const firstStop = dest.split('→')[0]?.trim();
    if (firstStop && isSameCityRegion(origin, firstStop)) {
      return dest;
    }
    return `${origin} → ${dest}`;
  }
  if (isSameCityRegion(origin, dest)) {
    return dest;
  }
  return `${origin} → ${dest}`;
}

export function filterOriginFromMultiStops(
  stops: string[],
  originName?: string | null,
): string[] {
  const origin = originName?.trim();
  if (!origin || stops.length < 2) {
    return stops;
  }
  const originCity = extractPrimaryLocation(origin) ?? origin;
  return stops.filter((stop) => {
    if (stop === origin || stop === originCity) {
      return false;
    }
    if (isSameCityRegion(origin, stop)) {
      return false;
    }
    return true;
  });
}

/** 客户端已算好的路线优先；服务端逆地理误解析时不覆盖 */
export function preferPlanRouteLabel(clientLabel: string, serverLabel: string): string {
  const client = clientLabel.trim();
  const server = serverLabel.trim();
  if (!client) {
    return server || '所选地点';
  }
  if (!server) {
    return client;
  }
  const clientStops = getMultiStopNames(client);
  const serverStops = getMultiStopNames(server);
  if (clientStops.length >= 2 && clientStops.length >= serverStops.length) {
    return client;
  }
  if (serverStops.length >= 2 && serverStops.length > clientStops.length) {
    return server;
  }
  if (client.includes('→') && !server.includes('→')) {
    return client;
  }
  return server;
}
