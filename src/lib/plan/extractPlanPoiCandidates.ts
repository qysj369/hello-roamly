const POI_SUFFIX =
  /(?:公园|博物馆|纪念馆|寺|庙|塔|山|岛|古城|老街|广场|景区|湿地|湖|海|湾|峡谷|瀑布|故居|城墙|遗址|动物园|植物园|古镇|牌坊|阁|楼|祠)/;

const NOISE =
  /^(上午|下午|傍晚|早上|中午|晚上|Day\d|第\d+天|地铁|公交|高铁|火车|步行|打车|午餐|晚餐|早餐|合计|总计)/;

/** 从流水账提取待校验的景点/地点关键词（最多 max 个） */
export function extractPlanPoiCandidates(itinerary: string, max = 6): string[] {
  const seen = new Set<string>();
  const results: string[] = [];

  const lines = itinerary.split(/\n+/);
  for (const line of lines) {
    const trimmed = line.replace(/\*\*/g, '').trim();
    if (!trimmed || trimmed.length < 2) {
      continue;
    }

    const segments = trimmed.split(/[，,、；;→\-—|]/);
    for (const segment of segments) {
      const text = segment.trim();
      if (text.length < 2 || text.length > 24 || NOISE.test(text)) {
        continue;
      }
      if (!POI_SUFFIX.test(text) && !/(公园|博物馆|景区|古城|广场)/.test(text)) {
        continue;
      }
      const normalized = text.replace(/约\s*¥\d+.*$/, '').trim();
      if (normalized.length < 2 || seen.has(normalized)) {
        continue;
      }
      seen.add(normalized);
      results.push(normalized);
      if (results.length >= max) {
        return results;
      }
    }
  }

  return results;
}
