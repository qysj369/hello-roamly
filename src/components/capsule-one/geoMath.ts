import * as THREE from 'three';

const EARTH_RADIUS = 5;

const ROUTE_ARC_LIFT = 0.88;

export function latLngToVector3(lat: number, lng: number, radius = EARTH_RADIUS): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lng + 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

export function buildArcPoints(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  segments = 48,
  arcHeight = ROUTE_ARC_LIFT,
): THREE.Vector3[] {
  const start = latLngToVector3(fromLat, fromLng);
  const end = latLngToVector3(toLat, toLng);
  const mid = start.clone().add(end).normalize().multiplyScalar(EARTH_RADIUS + arcHeight);
  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
  return curve.getPoints(segments);
}

export function vector3ToLatLng(point: THREE.Vector3): { lat: number; lng: number } {
  const normalized = point.clone().normalize();
  const lat = THREE.MathUtils.radToDeg(Math.asin(normalized.y));
  const lng = THREE.MathUtils.radToDeg(Math.atan2(normalized.z, -normalized.x)) - 180;
  return { lat, lng: lng > 180 ? lng - 360 : lng < -180 ? lng + 360 : lng };
}

export type SurfaceFrame = {
  position: THREE.Vector3;
  normal: THREE.Vector3;
  tangent: THREE.Vector3;
  bitangent: THREE.Vector3;
};

export function buildSurfaceFrame(lat: number, lng: number, altitude = 0): SurfaceFrame {
  const position = latLngToVector3(lat, lng, EARTH_RADIUS + altitude);
  const normal = position.clone().normalize();
  const up = new THREE.Vector3(0, 1, 0);
  let tangent = new THREE.Vector3().crossVectors(up, normal);
  if (tangent.lengthSq() < 0.001) {
    tangent.set(1, 0, 0);
  } else {
    tangent.normalize();
  }
  const bitangent = new THREE.Vector3().crossVectors(normal, tangent).normalize();
  return { position, normal, tangent, bitangent };
}

export function surfaceLocalToWorld(frame: SurfaceFrame, u: number, v: number, w = 0): THREE.Vector3 {
  return frame.position
    .clone()
    .add(frame.tangent.clone().multiplyScalar(u))
    .add(frame.bitangent.clone().multiplyScalar(v))
    .add(frame.normal.clone().multiplyScalar(w));
}

export function sampleCurve(points: THREE.Vector3[], t: number): THREE.Vector3 {
  const scaled = t * (points.length - 1);
  const index = Math.floor(scaled);
  const frac = scaled - index;
  if (index >= points.length - 1) {
    return points[points.length - 1].clone();
  }
  return points[index].clone().lerp(points[index + 1], frac);
}

export { EARTH_RADIUS };
