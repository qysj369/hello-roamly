/**
 * 驾驶舱真实视频路线（第一人称行车记录感）。
 * 把实拍 MP4 放到 public/drive-routes/ 后改 src 即可上线。
 */
export type DrivePaceSegment = {
  /** 视频时间点（秒） */
  atSec: number;
  /** 仪表显示车速 */
  speedKmh: number;
  /** playbackRate（相对风格倍率再乘） */
  rate: number;
};

export type DriveVideoRoute = {
  cityLabel: string;
  title: string;
  src: string;
  paceSegments: readonly DrivePaceSegment[];
  loop?: boolean;
  /** 演示素材（非该城实拍） */
  isDemo?: boolean;
};

const DEFAULT_PACE: readonly DrivePaceSegment[] = [
  { atSec: 0, speedKmh: 26, rate: 0.82 },
  { atSec: 8, speedKmh: 38, rate: 1.0 },
  { atSec: 18, speedKmh: 22, rate: 0.72 },
  { atSec: 28, speedKmh: 42, rate: 1.12 },
  { atSec: 40, speedKmh: 18, rate: 0.65 },
  { atSec: 52, speedKmh: 34, rate: 0.95 },
];

/** 有真实/演示视频的城市路线 */
export const holoDriveVideoRoutes: readonly DriveVideoRoute[] = [
  {
    cityLabel: '杭州',
    title: '城区漫游实拍',
    src: '/drive-routes/hangzhou-demo.mp4',
    paceSegments: DEFAULT_PACE,
    loop: true,
    isDemo: true,
  },
  {
    cityLabel: '成都',
    title: '街头缓行实拍',
    src: '/drive-routes/chengdu-demo.mp4',
    paceSegments: DEFAULT_PACE,
    loop: true,
    isDemo: true,
  },
  {
    cityLabel: '西安',
    title: '古城沿线实拍',
    src: '/drive-routes/xian-demo.mp4',
    paceSegments: DEFAULT_PACE,
    loop: true,
    isDemo: true,
  },
  {
    cityLabel: '拉萨',
    title: '高原街景实拍',
    src: '/drive-routes/lhasa-demo.mp4',
    paceSegments: DEFAULT_PACE,
    loop: true,
    isDemo: true,
  },
] as const;

export function getDriveVideoRoute(cityLabel: string): DriveVideoRoute | undefined {
  return holoDriveVideoRoutes.find((route) => route.cityLabel === cityLabel);
}

export function getPaceAtTime(
  segments: readonly DrivePaceSegment[],
  currentTimeSec: number,
): DrivePaceSegment {
  let current = segments[0] ?? { atSec: 0, speedKmh: 30, rate: 1 };
  for (const segment of segments) {
    if (currentTimeSec + 0.001 >= segment.atSec) {
      current = segment;
    } else {
      break;
    }
  }
  return current;
}
