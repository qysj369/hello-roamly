import * as THREE from 'three';

import { latLngToVector3 } from '@/components/capsule-one/geoMath';

/** 地球自转基准速度 — 轨道与小球均以此为基准协调运动 */
export const EARTH_SPIN_SPEED = 0.14;

/** 盲盒出结果后，地球转向目标城市的动画时长（秒） */
export const EARTH_FOCUS_SPIN_SECONDS = 1.35;

/** 计算让指定经度朝向相机 (+Z) 所需的地球 Y 轴旋转角 */
export function computeEarthFocusRotationY(lat: number, lng: number): number {
  const surface = latLngToVector3(lat, lng).normalize();
  return Math.atan2(-surface.x, surface.z);
}

/** 沿最短弧插值角度（弧度） */
export function lerpAngleRadians(from: number, to: number, alpha: number): number {
  const delta = Math.atan2(Math.sin(to - from), Math.cos(to - from));
  return from + delta * THREE.MathUtils.clamp(alpha, 0, 1);
}

/** 转向动画进度：0→1，easeOutCubic */
export function earthFocusSpinProgress(elapsedSeconds: number): number {
  const t = THREE.MathUtils.clamp(elapsedSeconds / EARTH_FOCUS_SPIN_SECONDS, 0, 1);
  return 1 - (1 - t) ** 3;
}
