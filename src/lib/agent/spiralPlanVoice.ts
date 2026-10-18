import { sanitizePosterOverlayText } from '@/lib/home/searchPlanShareChannels';
import type { CaptionPackId } from '@/lib/snail-flight/captionPacks';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

const BANNED =
  /预订|预定|下单|抢购|特惠|组团|旅行社|订票|酒店套餐|一键定制|专属旅行方案/g;

function dayLines(plan: SearchStructuredPlan): string[] {
  return plan.dayList.slice(0, 4).map((day) => {
    const spots = day.spots
      .map((spot) => spot.name.trim())
      .filter(Boolean)
      .slice(0, 3)
      .join('、');
    const intro = day.spots
      .map((spot) => sanitizePosterOverlayText(spot.intro).slice(0, 22))
      .find((text) => text.length >= 4);
    return { spots, intro, title: day.title, day: day.day };
  }).map((item) => {
    const core = item.spots || item.title || '街巷闲逛';
    return `第${item.day}天 ${core}${item.intro ? ` · ${item.intro}` : ''}`;
  });
}

function scrub(text: string): string {
  return sanitizePosterOverlayText(text.replace(BANNED, '')).replace(/\s{2,}/g, ' ').trim();
}

/** 按三种文风把行程收成灵感短文，不做经营/订票描述 */
export function formatSpiralPlanVoice(plan: SearchStructuredPlan, voice: CaptionPackId): string {
  const city = plan.baseInfo.targetCity || '这座城';
  const days = plan.baseInfo.days;
  const party = plan.baseInfo.peopleType || '结伴';
  const lines = dayLines(plan);
  const body = lines.join('\n');

  if (voice === 'verse') {
    return scrub(
      `${city}，${days}日慢走。\n${lines.map((line) => line.replace(/^第\d+天\s*/, '')).join('；')}\n留白给街巷与晚饭。仅作漫行参考。`,
    );
  }
  if (voice === 'guide') {
    return scrub(
      `${city}${days}天地理慢读（${party}）：先认方向，再进街巷。\n${body}\n说明：仅作漫行灵感参考。`,
    );
  }
  return scrub(
    `按本地人节奏，在${city}停${days}天（${party}）。\n${body}\n下雨就改室内馆子，不必赶场。仅旅行灵感，不是旅游经营。`,
  );
}
