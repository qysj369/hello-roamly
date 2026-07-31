import { headingDelta } from '@/lib/drive/pickForwardLink';

/** 驾驶风格：视频播放倍速 / 百度缓行节奏共用 */
export type DriveSpeedPreset = {
  id: 'snail' | 'cruise' | 'sport';
  /** 风格倍率：越大越慢越稳（百度 creep） */
  paceScale: number;
  /** 车速倍率 */
  speedScale: number;
  /** 真实视频 playbackRate 倍率 */
  videoRateScale: number;
};

export const DRIVE_SPEED_PRESETS: readonly DriveSpeedPreset[] = [
  { id: 'snail', paceScale: 1.35, speedScale: 0.78, videoRateScale: 0.75 },
  { id: 'cruise', paceScale: 1, speedScale: 1, videoRateScale: 1 },
  { id: 'sport', paceScale: 0.78, speedScale: 1.22, videoRateScale: 1.28 },
] as const;

export function getDriveSpeedPreset(id: DriveSpeedPreset['id']): DriveSpeedPreset {
  return DRIVE_SPEED_PRESETS.find((item) => item.id === id) ?? DRIVE_SPEED_PRESETS[1];
}

export type RoadSituation = 'straight' | 'curve' | 'junction' | 'end';

export type RoadPace = {
  situation: RoadSituation;
  creepMs: number;
  targetSpeedKmh: number;
  peakScale: number;
  crossfadeMs: number;
};

/** 百度链路：根据相邻道路估算路况 */
export function assessRoadPace(
  links: readonly BMapPanoramaLink[],
  heading: number,
  style: DriveSpeedPreset,
  forward: BMapPanoramaLink | null,
): RoadPace {
  if (!forward) {
    return {
      situation: 'end',
      creepMs: 0,
      targetSpeedKmh: 0,
      peakScale: 1,
      crossfadeMs: 700,
    };
  }

  const delta = headingDelta(heading, forward.heading);
  const branches = links.length;

  let situation: RoadSituation = 'straight';
  let creepMs = 4200;
  let targetSpeedKmh = 38;
  let peakScale = 1.14;
  let crossfadeMs = 850;

  if (branches >= 3 || delta >= 50) {
    situation = 'junction';
    creepMs = 7200;
    targetSpeedKmh = 16;
    peakScale = 1.07;
    crossfadeMs = 1000;
  } else if (branches === 2 || delta >= 22) {
    situation = 'curve';
    creepMs = 5600;
    targetSpeedKmh = 26;
    peakScale = 1.1;
    crossfadeMs = 900;
  }

  const jitter = 0.92 + Math.random() * 0.16;

  return {
    situation,
    creepMs: Math.round(creepMs * style.paceScale * jitter),
    targetSpeedKmh: Math.max(
      8,
      Math.round(targetSpeedKmh * style.speedScale * (0.94 + Math.random() * 0.12)),
    ),
    peakScale,
    crossfadeMs,
  };
}
