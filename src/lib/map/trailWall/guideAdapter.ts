import { getCityCoordinates } from '@/data/cityCoordinates';
import { trailGradientForTag } from '@/lib/map/trailWall/colors';
import type { Guide } from '@/types/domain/guide';
import type { TrailWallFilterTag, TrailWallGuide } from '@/types/domain/trailWall';

/** 轨迹墙默认出发枢纽 */
export const TRAIL_WALL_HUB_CITY = '北京';
export const TRAIL_WALL_HUB_COORDS: [number, number] = [116.4074, 39.9042];

function parseGuideDays(days: string): number {
  const match = days.match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : 1;
}

function inferTrailTag(guide: Guide): TrailWallFilterTag {
  const blob = `${guide.tags.join(' ')} ${guide.title}`;
  if (/美食|小吃|吃|火锅|湘菜/.test(blob)) {
    return 'food';
  }
  if (/摄影|拍照|打卡|海景|胶片/.test(blob)) {
    return 'photo';
  }
  if (/自然|户外|徒步|洱海|西湖|公园|山/.test(blob)) {
    return 'nature';
  }
  return 'budget';
}

function resolveEndCoords(guide: Guide): [number, number] | null {
  const coords = getCityCoordinates(guide.city);
  if (!coords) {
    return null;
  }
  return [coords.longitude, coords.latitude];
}

function resolveBudgetLabel(guide: Guide): {
  label: string;
  note: string;
  source: NonNullable<TrailWallGuide['budgetSource']>;
} {
  const structuredTotal = guide.structured?.costBreakdown?.total;
  if (structuredTotal != null && structuredTotal > 0) {
    return {
      label: `¥${structuredTotal}`,
      note: '来自攻略花费清单合计（交通+住宿+餐饮+娱乐）',
      source: 'cost_breakdown',
    };
  }
  return {
    label: guide.budget,
    note: '来自攻略列表标注预算',
    source: 'list_label',
  };
}

function buildTrailSummary(guide: Guide, budgetLabel: string, budgetNote?: string): string {
  const note =
    budgetNote ??
    (guide.structured?.costBreakdown?.total
      ? `预算参考 ${budgetLabel}（攻略花费清单合计）`
      : `预算参考 ${budgetLabel}`);

  if (guide.listCard?.excerpt) {
    return `${guide.listCard.excerpt} · ${note}`;
  }

  return `${guide.city} · ${guide.days} · ${note}`;
}

/** 将攻略 API 列表项转为轨迹墙数据；缺少坐标时跳过 */
export function guideToTrailWallItem(guide: Guide): TrailWallGuide | null {
  const endCoords = resolveEndCoords(guide);
  if (!endCoords) {
    return null;
  }

  const tag = inferTrailTag(guide);
  const { colorStart, colorEnd } = trailGradientForTag(tag);
  const { label: budgetLabel, note: budgetNote, source: budgetSource } =
    resolveBudgetLabel(guide);

  return {
    id: guide.id,
    title: guide.title,
    start_city: TRAIL_WALL_HUB_CITY,
    end_city: guide.city,
    start_coords: TRAIL_WALL_HUB_COORDS,
    end_coords: endCoords,
    days: parseGuideDays(guide.days),
    budget: budgetLabel,
    budgetNote,
    budgetSource,
    summary: buildTrailSummary(guide, budgetLabel, budgetNote),
    tag,
    colorStart,
    colorEnd,
  };
}

export function guidesToTrailWallItems(guides: Guide[]): TrailWallGuide[] {
  return guides
    .map(guideToTrailWallItem)
    .filter((item): item is TrailWallGuide => item !== null);
}
