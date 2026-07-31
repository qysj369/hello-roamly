/** 城市中心坐标（演示 / 无地理编码 API 时的锚点） */
export type CityCoordinates = {
  longitude: number;
  latitude: number;
};

export const CITY_COORDINATES: Record<string, CityCoordinates> = {
  // —— 一线 & 热门 ——
  成都: { longitude: 104.0665, latitude: 30.5723 },
  西安: { longitude: 108.9398, latitude: 34.3416 },
  厦门: { longitude: 118.0894, latitude: 24.4798 },
  杭州: { longitude: 120.1551, latitude: 30.2741 },
  济南: { longitude: 117.1205, latitude: 36.6519 },
  北京: { longitude: 116.4074, latitude: 39.9042 },
  上海: { longitude: 121.4737, latitude: 31.2304 },
  重庆: { longitude: 106.5516, latitude: 29.563 },
  大理: { longitude: 100.2257, latitude: 25.5894 },
  长沙: { longitude: 112.9389, latitude: 28.2282 },
  青岛: { longitude: 120.3826, latitude: 36.0671 },
  南京: { longitude: 118.7969, latitude: 32.0603 },
  苏州: { longitude: 120.5853, latitude: 31.2989 },
  武汉: { longitude: 114.3055, latitude: 30.5928 },
  广州: { longitude: 113.2644, latitude: 23.1291 },
  深圳: { longitude: 114.0579, latitude: 22.5431 },
  桂林: { longitude: 110.2902, latitude: 25.2736 },
  三亚: { longitude: 109.5119, latitude: 18.2528 },
  昆明: { longitude: 102.8329, latitude: 24.8801 },
  丽江: { longitude: 100.227, latitude: 26.8555 },
  哈尔滨: { longitude: 126.5349, latitude: 45.8038 },
  天津: { longitude: 117.201, latitude: 39.0842 },
  扬州: { longitude: 119.4129, latitude: 32.3942 },

  // —— 华北东北 ——
  秦皇岛: { longitude: 119.6, latitude: 39.94 },
  承德: { longitude: 117.93, latitude: 40.97 },
  大同: { longitude: 113.3, latitude: 40.08 },
  平遥: { longitude: 112.18, latitude: 37.2 },
  太原: { longitude: 112.55, latitude: 37.87 },
  呼和浩特: { longitude: 111.67, latitude: 40.82 },
  长春: { longitude: 125.32, latitude: 43.82 },
  沈阳: { longitude: 123.43, latitude: 41.8 },
  大连: { longitude: 121.62, latitude: 38.92 },
  丹东: { longitude: 124.35, latitude: 40.13 },

  // —— 华东 ——
  无锡: { longitude: 120.31, latitude: 31.49 },
  宁波: { longitude: 121.55, latitude: 29.87 },
  温州: { longitude: 120.67, latitude: 28.0 },
  嘉兴: { longitude: 120.75, latitude: 30.75 },
  绍兴: { longitude: 120.58, latitude: 30.01 },
  黄山: { longitude: 118.3375, latitude: 29.7147 },
  婺源: { longitude: 117.8618, latitude: 29.2489 },
  庐山: { longitude: 115.99, latitude: 29.55 },
  福州: { longitude: 119.2965, latitude: 26.0745 },
  鼓浪屿: { longitude: 118.07, latitude: 24.45 },
  泉州: { longitude: 118.6757, latitude: 24.8741 },
  武夷山: { longitude: 117.98, latitude: 27.76 },
  威海: { longitude: 122.12, latitude: 37.51 },
  烟台: { longitude: 121.45, latitude: 37.46 },
  泰山: { longitude: 117.089, latitude: 36.254 },
  曲阜: { longitude: 116.9865, latitude: 35.5809 },
  洛阳: { longitude: 112.454, latitude: 34.6197 },
  开封: { longitude: 114.307, latitude: 34.7972 },
  郑州: { longitude: 113.625, latitude: 34.7466 },
  景德镇: { longitude: 117.1782, latitude: 29.2688 },

  // —— 华中华南 ——
  宜昌: { longitude: 111.29, latitude: 30.69 },
  张家界: { longitude: 110.479, latitude: 29.117 },
  凤凰: { longitude: 109.5993, latitude: 27.9483 },
  常德: { longitude: 111.68, latitude: 29.05 },
  南昌: { longitude: 115.86, latitude: 28.68 },
  珠海: { longitude: 113.58, latitude: 22.27 },
  汕头: { longitude: 116.68, latitude: 23.35 },
  潮州: { longitude: 116.62, latitude: 23.66 },
  阳朔: { longitude: 110.496, latitude: 24.778 },
  北海: { longitude: 109.1193, latitude: 21.4813 },
  海口: { longitude: 110.33, latitude: 20.03 },

  // —— 西南西北 ——
  乐山: { longitude: 103.765, latitude: 29.5521 },
  峨眉山: { longitude: 103.48, latitude: 29.59 },
  九寨沟: { longitude: 103.919, latitude: 33.152 },
  腾冲: { longitude: 98.49, latitude: 25.02 },
  香格里拉: { longitude: 99.7, latitude: 27.83 },
  西双版纳: { longitude: 100.8, latitude: 22.0 },
  贵阳: { longitude: 106.71, latitude: 26.57 },
  遵义: { longitude: 106.93, latitude: 27.7 },
  武隆: { longitude: 107.76, latitude: 29.33 },
  兰州: { longitude: 103.83, latitude: 36.06 },
  敦煌: { longitude: 94.66, latitude: 40.14 },
  张掖: { longitude: 100.45, latitude: 38.93 },
  西宁: { longitude: 101.78, latitude: 36.62 },
  拉萨: { longitude: 91.13, latitude: 29.65 },
  乌鲁木齐: { longitude: 87.62, latitude: 43.83 },
  喀什: { longitude: 75.99, latitude: 39.47 },
  伊犁: { longitude: 81.32, latitude: 43.92 },

  // —— 山东联游 & 江苏补充 ——
  莆田: { longitude: 119.0076, latitude: 25.4541 },
  镇江: { longitude: 119.4528, latitude: 32.2044 },
  溧阳: { longitude: 119.4842, latitude: 31.4169 },
  台儿庄: { longitude: 117.734, latitude: 34.564 },
  微山湖: { longitude: 117.128, latitude: 34.806 },
  济宁: { longitude: 116.587, latitude: 35.415 },
  淄博: { longitude: 118.048, latitude: 36.813 },
  周村: { longitude: 117.869, latitude: 36.803 },
  周村古城: { longitude: 117.869, latitude: 36.803 },
  青州: { longitude: 118.484, latitude: 36.685 },
  潍坊: { longitude: 119.161, latitude: 36.706 },
  聊城: { longitude: 115.985, latitude: 36.456 },
  临清: { longitude: 115.7047, latitude: 36.8384 },
  临沂: { longitude: 118.356, latitude: 35.104 },
  菏泽: { longitude: 115.481, latitude: 35.234 },
  德州: { longitude: 116.359, latitude: 37.435 },
  东营: { longitude: 118.675, latitude: 37.434 },
  滨州: { longitude: 117.972, latitude: 37.383 },
  枣庄: { longitude: 117.558, latitude: 34.856 },
  日照: { longitude: 119.527, latitude: 35.416 },
  泰安: { longitude: 117.129, latitude: 36.195 },
};

export const GUIDE_ID_TO_CITY: Record<string, string> = {
  chengdu: '成都',
  xian: '西安',
  xiamen: '厦门',
  hangzhou: '杭州',
};

export function getCityCoordinates(cityName: string): CityCoordinates | undefined {
  const trimmed = cityName.trim();
  if (!trimmed) {
    return undefined;
  }
  if (CITY_COORDINATES[trimmed]) {
    return CITY_COORDINATES[trimmed];
  }
  const entry = Object.entries(CITY_COORDINATES)
    .filter(([name]) => trimmed.includes(name))
    .sort(([a], [b]) => b.length - a.length)[0];
  return entry?.[1];
}

export function getCityCoordinatesByGuideId(guideId: string): CityCoordinates | undefined {
  const city = GUIDE_ID_TO_CITY[guideId];
  return city ? CITY_COORDINATES[city] : undefined;
}

/** 从地点文案中尝试匹配已知城市中心 */
export function getCityCoordinatesFromLocation(location: string): CityCoordinates | undefined {
  return getCityCoordinates(location);
}
