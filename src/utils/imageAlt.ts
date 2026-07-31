import type { Guide } from '@/types/domain/guide';
import type { TravelPlan } from '@/types/domain/travelPlan';
import type { TravelMoment } from '@/types/domain/user/userSocial';
import { getMomentDescription } from '@/utils/travelMomentDisplay';
import { getPlanCoverAlt } from '@/utils/travelPlanView';

/** 用户头像 alt */
export function getAvatarAlt(displayName: string): string {
  const name = displayName.trim();
  return name ? `${name} 的头像` : '用户头像';
}

/** 攻略封面 alt */
export function getGuideCoverAlt(guide: Guide): string {
  return `${guide.city} · ${guide.title} 封面图`;
}

/** 发现流 / 热门卡片封面（已有标题时） */
export function getDiscoverCardCoverAlt(kindLabel: string, title: string): string {
  const trimmedTitle = title.trim();
  return trimmedTitle ? `${kindLabel}：${trimmedTitle}` : `${kindLabel}封面图`;
}

/** 旅行计划封面（复用展示元数据逻辑） */
export function getTravelPlanCoverAlt(plan: TravelPlan): string {
  return getPlanCoverAlt(plan);
}

/** 旅行动态配图 alt */
export function getMomentImageAlt(
  moment: Pick<TravelMoment, 'title' | 'description' | 'content' | 'location'>,
  options?: { index?: number; total?: number },
): string {
  const label =
    moment.title?.trim() ||
    getMomentDescription(moment as TravelMoment) ||
    moment.location?.trim() ||
    '旅行动态';

  const locationSuffix =
    moment.location?.trim() && !label.includes(moment.location.trim())
      ? `（${moment.location.trim()}）`
      : '';

  const base = `${label}${locationSuffix}`;

  if (options?.total && options.total > 1 && options.index !== undefined) {
    return `${base}，第 ${options.index + 1} 张，共 ${options.total} 张`;
  }

  return `${base} 配图`;
}

/** 旅行动态视频 alt（用于 video 元素 aria-label） */
export function getMomentVideoAlt(
  moment: Pick<TravelMoment, 'title' | 'description' | 'content' | 'location'>,
): string {
  const label =
    moment.title?.trim() ||
    getMomentDescription(moment as TravelMoment) ||
    moment.location?.trim() ||
    '旅行动态';
  return `${label} 视频`;
}

/** 发布瞬间时的本地预览图 */
export function getMomentUploadPreviewAlt(index: number, kind: 'image' | 'video'): string {
  if (kind === 'video') {
    return `待发布视频预览 ${index + 1}`;
  }
  return `待发布图片预览 ${index + 1}`;
}

/** 无封面图时的目的地占位说明（装饰性区块仍保留 aria-label） */
export function getDestinationPlaceholderAlt(destination: string): string {
  const place = destination.trim();
  return place ? `${place} 目的地示意图` : '目的地示意图';
}
