import {
  getDriveVideoRoute,
  type DrivePaceSegment,
  type DriveVideoRoute,
} from '@/data/holoDriveRoutes';
import type { DriveContributionRecord } from '@/stores/driveContributions/types';

const COMMUNITY_PACE: readonly DrivePaceSegment[] = [
  { atSec: 0, speedKmh: 24, rate: 0.8 },
  { atSec: 10, speedKmh: 36, rate: 1 },
  { atSec: 22, speedKmh: 20, rate: 0.7 },
  { atSec: 35, speedKmh: 40, rate: 1.1 },
  { atSec: 50, speedKmh: 28, rate: 0.9 },
];

type ResolveOptions = {
  /** 云端已通过审核的播放地址 */
  cloudPlayUrl?: string | null;
  cloudTitle?: string | null;
  /** 本机 IndexedDB 投稿 */
  contribution?: DriveContributionRecord | null;
};

/** 云端审核通过 > 本机投稿 > 官方/演示静态路线 */
export function resolveDriveVideoRoute(
  cityLabel: string,
  options?: ResolveOptions | DriveContributionRecord | null,
): DriveVideoRoute | undefined {
  // 兼容旧调用：第二参直接传 contribution
  const opts: ResolveOptions =
    options && typeof options === 'object' && 'objectUrl' in options
      ? { contribution: options }
      : ((options as ResolveOptions | undefined) ?? {});

  if (opts.cloudPlayUrl) {
    return {
      cityLabel,
      title: opts.cloudTitle?.trim() || `${cityLabel} 云端漫游`,
      src: opts.cloudPlayUrl,
      paceSegments: COMMUNITY_PACE,
      loop: true,
      isDemo: false,
    };
  }

  if (opts.contribution?.objectUrl) {
    return {
      cityLabel,
      title: opts.contribution.title,
      src: opts.contribution.objectUrl,
      paceSegments: COMMUNITY_PACE,
      loop: true,
      isDemo: false,
    };
  }

  return getDriveVideoRoute(cityLabel);
}
