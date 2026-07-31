import { useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three-stdlib';

/**
 * 本地程序化 envMap — 不依赖外部 HDR，避免 warehouse.hdr fetch 失败
 */
export default function EarthGlazeEnvironment() {
  const { gl, scene } = useThree();

  const envMap = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    pmrem.compileEquirectangularShader();
    const room = RoomEnvironment();
    const texture = pmrem.fromScene(room, 0.04).texture;
    pmrem.dispose();
    return texture;
  }, [gl]);

  useEffect(() => {
    const previous = scene.environment;
    scene.environment = envMap;
    return () => {
      scene.environment = previous;
      envMap.dispose();
    };
  }, [scene, envMap]);

  return null;
}
