import {
  getSnailFlightCity,
  SNAIL_FLIGHT_DEFAULT_DEST_ID,
  SNAIL_FLIGHT_DEFAULT_ORIGIN_ID,
  type SnailFlightCity,
} from '@/lib/snail-flight/cities';
import {
  haversineMeters,
  headingRadians,
  interpolateLonLat,
  smoothstep,
} from '@/lib/snail-flight/geo';

export const SNAIL_FLIGHT_CRUISE_HEIGHT_M = 1650;
export const SNAIL_FLIGHT_DURATION_MS = 52_000;
export const SNAIL_FLIGHT_FAST_DURATION_MS = 10_000;

export type SnailFlightNarration = {
  id: string;
  title: string;
  lines: readonly string[];
  at: number;
};

export type SnailFlightWaypoint = {
  id: string;
  label: string;
  lon: number;
  lat: number;
  at: number;
};

export type SnailFlightRoute = {
  id: string;
  origin: SnailFlightCity;
  dest: SnailFlightCity;
  waypoints: readonly SnailFlightWaypoint[];
  narrations: readonly SnailFlightNarration[];
};

const DEMO_NARRATIONS: readonly SnailFlightNarration[] = [
  {
    id: 'takeoff',
    title: '起飞｜济南历下',
    at: 0,
    lines: [
      '登机完毕，蜗牛号缓缓离地。',
      '脚下是历下的街巷与河湖，我们向东启程，开启一场低空山河漫游。',
    ],
  },
  {
    id: 'zhangqiu',
    title: '途经章丘',
    at: 0.16,
    lines: ['向前飞行，掠过章丘。', '平坦的田野铺向远方，村落散落大地，山河画卷缓缓展开。'],
  },
  {
    id: 'zibo',
    title: '途经淄博',
    at: 0.34,
    lines: ['前方抵达淄博上空。', '城镇连绵铺开，土地厚重，藏着烟火与故事。'],
  },
  {
    id: 'weifang',
    title: '途经潍坊',
    at: 0.55,
    lines: ['飞越潍坊，一望无垠的原野在眼底延伸。', '风穿过机舱，大地一路向东，离海岸越来越近。'],
  },
  {
    id: 'qingdao-coast',
    title: '抵达青岛近海',
    at: 0.78,
    lines: ['海岸线出现在眼前，蔚蓝的大海映入视野。', '红瓦、海岸与碧海交织，青岛就在前方。'],
  },
  {
    id: 'landing',
    title: '落地前收尾字幕',
    at: 0.92,
    lines: ['蜗牛号即将平稳落地。', '看完沿途山河，AI正在为你生成好友结伴旅行攻略。'],
  },
];

function withDistanceProgress(
  points: readonly { id: string; label: string; lon: number; lat: number }[],
): SnailFlightWaypoint[] {
  if (!points.length) return [];
  const distances = [0];
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1]!;
    const cur = points[i]!;
    distances.push(distances[i - 1]! + haversineMeters(prev.lon, prev.lat, cur.lon, cur.lat));
  }
  const total = distances[distances.length - 1] || 1;
  return points.map((point, index) => ({
    ...point,
    at: distances[index]! / total,
  }));
}

function buildDemoRoute(): SnailFlightRoute | null {
  const origin = getSnailFlightCity(SNAIL_FLIGHT_DEFAULT_ORIGIN_ID);
  const dest = getSnailFlightCity(SNAIL_FLIGHT_DEFAULT_DEST_ID);
  const zhangqiu = getSnailFlightCity('zhangqiu');
  const zibo = getSnailFlightCity('zibo');
  const weifang = getSnailFlightCity('weifang');
  if (!origin || !dest || !zhangqiu || !zibo || !weifang) {
    return null;
  }
  const waypoints = withDistanceProgress([
    { id: 'takeoff', label: origin.label, lon: origin.lon, lat: origin.lat },
    { id: 'zhangqiu', label: zhangqiu.label, lon: zhangqiu.lon, lat: zhangqiu.lat },
    { id: 'zibo', label: zibo.label, lon: zibo.lon, lat: zibo.lat },
    { id: 'weifang', label: weifang.label, lon: weifang.lon, lat: weifang.lat },
    { id: 'qingdao-coast', label: dest.label, lon: dest.lon, lat: dest.lat },
  ]);
  return {
    id: 'jinan-lixia-qingdao',
    origin,
    dest,
    waypoints,
    narrations: DEMO_NARRATIONS,
  };
}

function genericNarrations(origin: SnailFlightCity, dest: SnailFlightCity): SnailFlightNarration[] {
  return [
    {
      id: 'takeoff',
      title: `起飞｜${origin.label}`,
      lines: [
        '登机完毕，蜗牛号缓缓离地。',
        `脚下是${origin.label}的街巷与田野，我们启程，开启一场低空山河漫游。`,
      ],
      at: 0,
    },
    {
      id: 'enroute',
      title: '途中',
      lines: ['向前飞行，城镇与田野在脚下铺开。', '山河画卷缓缓展开，风穿过机舱。'],
      at: 0.42,
    },
    {
      id: 'approach',
      title: `抵达${dest.label}`,
      lines: [`前方抵达${dest.label}上空。`, '城镇连绵铺开，土地厚重，藏着烟火与故事。'],
      at: 0.78,
    },
    {
      id: 'landing',
      title: '落地前收尾字幕',
      lines: ['蜗牛号即将平稳落地。', '看完沿途山河，AI正在为你生成好友结伴旅行攻略。'],
      at: 0.92,
    },
  ];
}

export function buildSnailFlightRoute(fromId: string, toId: string): SnailFlightRoute | null {
  if (fromId === SNAIL_FLIGHT_DEFAULT_ORIGIN_ID && toId === SNAIL_FLIGHT_DEFAULT_DEST_ID) {
    return buildDemoRoute();
  }
  const origin = getSnailFlightCity(fromId);
  const dest = getSnailFlightCity(toId);
  if (!origin || !dest || origin.id === dest.id) {
    return null;
  }
  const mid = interpolateLonLat(origin.lon, origin.lat, dest.lon, dest.lat, 0.5);
  const waypoints = withDistanceProgress([
    { id: 'takeoff', label: origin.label, lon: origin.lon, lat: origin.lat },
    { id: 'enroute', label: '途中', lon: mid.lon, lat: mid.lat },
    { id: 'approach', label: dest.label, lon: dest.lon, lat: dest.lat },
  ]);
  return {
    id: `${origin.id}-${dest.id}`,
    origin,
    dest,
    waypoints,
    narrations: genericNarrations(origin, dest),
  };
}

export function defaultSnailFlightRoute(): SnailFlightRoute {
  const route = buildSnailFlightRoute(SNAIL_FLIGHT_DEFAULT_ORIGIN_ID, SNAIL_FLIGHT_DEFAULT_DEST_ID);
  if (!route) {
    throw new Error('demo snail-flight route missing');
  }
  return route;
}

export function narrationAt(route: SnailFlightRoute, progress: number): SnailFlightNarration {
  const t = Math.min(1, Math.max(0, progress));
  return route.narrations.reduce(
    (current, beat) => (t + 1e-6 >= beat.at ? beat : current),
    route.narrations[0]!,
  );
}

export type SampledFlightPose = {
  lon: number;
  lat: number;
  height: number;
  heading: number;
};

export function sampleFlightPose(route: SnailFlightRoute, progress: number): SampledFlightPose {
  const t = Math.min(1, Math.max(0, progress));
  const points = route.waypoints;
  let index = 0;
  while (index < points.length - 2 && t > points[index + 1]!.at) {
    index += 1;
  }
  const a = points[index]!;
  const b = points[Math.min(points.length - 1, index + 1)]!;
  const span = Math.max(1e-6, b.at - a.at);
  const local = (t - a.at) / span;
  const pos = interpolateLonLat(a.lon, a.lat, b.lon, b.lat, local);
  const lookTarget = interpolateLonLat(a.lon, a.lat, b.lon, b.lat, Math.min(1, local + 0.08));
  const takeoff = smoothstep(0, 0.08, t);
  const landing = 1 - smoothstep(0.88, 1, t);
  const envelope = Math.min(takeoff, landing);
  const height = 90 + (SNAIL_FLIGHT_CRUISE_HEIGHT_M - 90) * envelope;
  return {
    lon: pos.lon,
    lat: pos.lat,
    height,
    heading: headingRadians(pos.lon, pos.lat, lookTarget.lon, lookTarget.lat),
  };
}

export function offsetLonLat(
  lon: number,
  lat: number,
  heading: number,
  rightMeters: number,
): { lon: number; lat: number } {
  const east = Math.sin(heading + Math.PI / 2) * rightMeters;
  const north = Math.cos(heading + Math.PI / 2) * rightMeters;
  const dLat = north / 111_320;
  const dLon = east / (111_320 * Math.cos((lat * Math.PI) / 180) || 1);
  return { lon: lon + dLon, lat: lat + dLat };
}
