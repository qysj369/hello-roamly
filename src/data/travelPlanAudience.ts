import { TRAVEL_INTEREST_OPTIONS } from '@/types/domain/aiTravelParams';
import type { TravelOptions } from '@/types/domain/travelOptions';

const AUDIENCE_BY_GUIDE_ID: Record<string, string> = {
  hangzhou: '周末党、自然爱好者、漫行党',
  xiamen: '摄影爱好者、海岛慢游、情侣周末',
  xian: '历史迷、美食党、骑行爱好者',
  chengdu: '美食爱好者、慢旅行、城市漫步党',
};

const TAG_AUDIENCE_HINT: Record<string, string> = {
  美食: '美食爱好者',
  步行: '城市漫步党',
  历史: '历史文化爱好者',
  骑行: '骑行爱好者',
  海岛: '海岛度假党',
  摄影: '摄影爱好者',
  自然: '自然风光爱好者',
  公交: '公共交通漫行党',
  漫行: '预算敏感型旅人',
  AI: 'AI 规划尝鲜者',
};

export function formatAudienceFromTags(tags: string[]): string {
  const mapped = tags.map((tag) => TAG_AUDIENCE_HINT[tag] ?? tag);
  if (mapped.length === 0) {
    return '漫行党、自由行爱好者';
  }
  return mapped.slice(0, 4).join('、');
}

/** 攻略 demo 计划的默认适合人群 */
export function getSuitableAudienceForGuide(guideId: string, tags: string[]): string {
  if (AUDIENCE_BY_GUIDE_ID[guideId]) {
    return AUDIENCE_BY_GUIDE_ID[guideId];
  }
  return formatAudienceFromTags(tags);
}

/** 根据旅行选项（兴趣等）生成适合人群文案 */
export function buildSuitableAudienceFromOptions(options: TravelOptions): string {
  const interestLabels =
    options.interests
      ?.map((id) => TRAVEL_INTEREST_OPTIONS.find((o) => o.id === id)?.label)
      .filter(Boolean) ?? [];

  let paceHint = '均衡节奏';
  if (options.pace === 'relaxed') {
    paceHint = '慢节奏出行';
  } else if (options.pace === 'intense') {
    paceHint = '高效打卡党';
  }

  const parts = [...interestLabels, paceHint, '漫行党'];
  return [...new Set(parts)].slice(0, 4).join('、');
}
