import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, type MutableRefObject } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import type { EarthFlight } from '@/components/capsule-one/EarthFlyToContext';
import {
  flyDurationMs,
  getEarthFlyDestination,
  interpolateFlyOrbit,
  lookAtOrbitSpherical,
  type EarthFlyDestinationId,
} from '@/lib/capsule/earthFlyTo';

type EarthFlyToRigProps = {
  controlsRef: MutableRefObject<OrbitControlsImpl | null>;
  pendingIdRef: MutableRefObject<EarthFlyDestinationId | null>;
  flightRef: MutableRefObject<EarthFlight | null>;
  onFlightEnd: (id: EarthFlyDestinationId) => void;
  isMobile: boolean;
};

/**
 * 默认优先级 0：排在 OrbitControls（-1）之后写相机。
 * 禁止用正优先级，R3F 会关掉自动 gl.render，画布只剩清屏色。
 */
export default function EarthFlyToRig({
  controlsRef,
  pendingIdRef,
  flightRef,
  onFlightEnd,
  isMobile,
}: EarthFlyToRigProps) {
  const camera = useThree((state) => state.camera);
  const offset = useMemo(() => new THREE.Vector3(), []);
  const spherical = useMemo(() => new THREE.Spherical(), []);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) {
      return;
    }

    const pendingId = pendingIdRef.current;
    if (pendingId) {
      const dest = getEarthFlyDestination(pendingId);
      pendingIdRef.current = null;
      if (dest) {
        offset.copy(camera.position).sub(controls.target);
        spherical.setFromVector3(offset);
        const from = {
          theta: spherical.theta,
          phi: spherical.phi,
          radius: spherical.radius,
        };
        const to = lookAtOrbitSpherical(dest.lat, dest.lng, from.radius, isMobile);
        flightRef.current = {
          id: dest.id,
          from,
          to,
          startedAt: performance.now(),
          durationMs: flyDurationMs(from, to),
        };
      }
    }

    const flight = flightRef.current;
    if (!flight) {
      return;
    }

    const linear = (performance.now() - flight.startedAt) / flight.durationMs;
    const orbit = interpolateFlyOrbit(flight.from, flight.to, Math.min(1, linear), isMobile);
    offset.setFromSphericalCoords(orbit.radius, orbit.phi, orbit.theta);
    camera.position.copy(controls.target).add(offset);
    camera.lookAt(controls.target);

    if (linear >= 1) {
      const arrivedId = flight.id;
      flightRef.current = null;
      onFlightEnd(arrivedId);
    }
  });

  return null;
}
