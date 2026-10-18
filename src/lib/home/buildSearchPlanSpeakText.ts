import { searchPlanLiteHeader } from '@/lib/home/searchPlanShareCopy';
import { buildTravelVoiceReply, sanitizeTravelVoiceSpeech } from '@/lib/home/travelVoiceIntent';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

const MAX_SPEECH_CHARS = 360;

/** 卡片朗读摘要：单点碎片灵感，不播预算、外链、完整多日清单 */
export function buildSearchPlanSpeakText(plan: SearchStructuredPlan): string {
  const { targetCity, days, peopleType } = plan.baseInfo;
  const day1 = plan.dayList[0];
  const spot = day1?.spots[0]?.name.trim();
  const food = day1?.foods[0]?.shop.replace(/（[^）]*）$/u, '').trim();
  const title = sanitizeTravelVoiceSpeech(
    (day1?.title ?? '').replace(/第[一二三四五六七八九十\d]+天/g, '').trim(),
  );
  const bits = [
    `${targetCity}${days}天${peopleType}，${searchPlanLiteHeader(plan).replace(/ · /g, '')}慢慢逛就够。`,
    spot ? `先去${spot}停一停。` : title ? `${title}。` : '',
    food ? `顺路${food}随便吃一口。` : '',
  ];
  return buildTravelVoiceReply(bits.filter(Boolean).join('')).slice(0, MAX_SPEECH_CHARS);
}
