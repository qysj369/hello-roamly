/** 蜗牛号相机漫游 — 与地球材质/贴图解耦，只约束轨道半径与模式切换 */

export type EarthViewMode = 'manual' | 'roam';

export const EARTH_ROAM_CAMERA = {
  /** drei / three OrbitControls：约 2°/s 量级，平缓巡航 */
  autoRotateSpeed: 0.32,
  /** 越小惯性越长；拖拽松开后平滑减速 */
  dampingFactor: 0.055,
  minPolarAngle: 0.38,
  maxPolarAngle: Math.PI - 0.38,
  desktop: {
    minDistance: 7.5,
    maxDistance: 26,
  },
  mobile: {
    minDistance: 7,
    maxDistance: 24,
  },
} as const;

export function isEarthRoaming(mode: EarthViewMode): boolean {
  return mode === 'roam';
}

export function toggleEarthViewMode(mode: EarthViewMode): EarthViewMode {
  return mode === 'roam' ? 'manual' : 'roam';
}

/** 拖拽 / 触屏开始操控时立刻退出自动巡航 */
export function nextModeOnOrbitStart(mode: EarthViewMode): EarthViewMode {
  return mode === 'roam' ? 'manual' : mode;
}

export function earthRoamToggleLabel(mode: EarthViewMode): string {
  return mode === 'roam' ? '停止漫游' : '开启漫游';
}

export function clampOrbitDistance(distance: number, min: number, max: number): number {
  if (!Number.isFinite(distance)) {
    return min;
  }
  return Math.min(max, Math.max(min, distance));
}

export function orbitDistanceLimits(isMobile: boolean): { minDistance: number; maxDistance: number } {
  return isMobile ? EARTH_ROAM_CAMERA.mobile : EARTH_ROAM_CAMERA.desktop;
}
