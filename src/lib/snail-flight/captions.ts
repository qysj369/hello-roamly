import { captionById, type CaptionPackId } from '@/lib/snail-flight/captionPacks';
import type { SnailFlightNarration, SnailFlightRoute } from '@/lib/snail-flight/routes';

/** 航点字幕停留（含淡入后的可见时长） */
export const SNAIL_FLIGHT_CAPTION_HOLD_MS = 7_000;
export const SNAIL_FLIGHT_CAPTION_FADE_MS = 560;

const ARRIVAL_IDS = new Set(['qingdao-land', 'qingdao-coast', 'approach']);

export function shouldHoldWaypointCaption(id: string): boolean {
  return Boolean(id) && id !== 'landing';
}

export function isArrivalCaption(id: string): boolean {
  return ARRIVAL_IDS.has(id);
}

export function captionHoldMs(fast?: boolean): number {
  return fast ? 1_200 : SNAIL_FLIGHT_CAPTION_HOLD_MS;
}

/** 飞行动画到 100% 后停止；青岛字幕淡出（或已关字幕）再转场。 */
export function shouldBeginLandingTransition(args: {
  flightDone: boolean;
  captionsOn: boolean;
  arrivalCaptionDone: boolean;
}): boolean {
  if (!args.flightDone) return false;
  if (!args.captionsOn) return true;
  return args.arrivalCaptionDone;
}

export function resolveFlightCaption(
  route: SnailFlightRoute,
  packId: CaptionPackId,
  beatId: string,
): SnailFlightNarration {
  const packed = captionById(packId, beatId);
  if (packed) return packed;
  return route.narrations.find((item) => item.id === beatId) ?? route.narrations[0]!;
}

export function syncCaptionVoiceText(narration: SnailFlightNarration | null, visible: boolean): void {
  if (typeof document === 'undefined') return;
  const text = narration && visible ? [narration.title, ...narration.lines].join('\n') : '';
  document.documentElement.dataset.snailCaptionVoice = text;
}
