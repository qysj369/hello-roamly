import { describe, expect, it } from 'vitest';
import * as THREE from 'three';

import { latLngToVector3 } from '@/components/capsule-one/geoMath';
import { computeEarthFocusRotationY, lerpAngleRadians } from '@/components/capsule-one/earthMotion';

function rotateY(point: THREE.Vector3, angle: number): THREE.Vector3 {
  return point.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
}

describe('earthMotion', () => {
  it('rotates destination toward camera (+Z hemisphere)', () => {
    const cases = [
      { lat: 30.57, lng: 104.06, label: '成都' },
      { lat: 36.65, lng: 117.12, label: '济南' },
      { lat: 36.07, lng: 120.38, label: '青岛' },
    ];

    for (const city of cases) {
      const local = latLngToVector3(city.lat, city.lng).normalize();
      const targetY = computeEarthFocusRotationY(city.lat, city.lng);
      const world = rotateY(local, targetY);

      expect(Math.abs(world.x)).toBeLessThan(0.05);
      expect(world.z).toBeGreaterThan(0.5);
    }
  });

  it('lerps along shortest arc', () => {
    const from = 0.2;
    const to = -0.2;
    const mid = lerpAngleRadians(from, to, 0.5);
    expect(Math.abs(mid)).toBeLessThan(0.05);
  });
});
