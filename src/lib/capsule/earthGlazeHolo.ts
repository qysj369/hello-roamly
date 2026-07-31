import * as THREE from 'three';

export const HOLO_MINT = {
  bright: '#e8fffb',
  core: '#a7f3d0',
  rim: '#8fd8d4',
  mist: '#6a8caf',
} as const;

export type HoloContinentCloud = {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  count: number;
};

function sampleLuminance(data: Uint8ClampedArray, width: number, x: number, y: number): number {
  const clampedX = Math.max(0, Math.min(width - 1, x));
  const index = (y * width + clampedX) * 4;
  return (data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114) / 255;
}

/** 参考稿 2：大陆 = 球面发光数据点阵 */
export function buildHoloContinentCloud(
  source: CanvasImageSource,
  radius: number,
  sampleStep = 3,
): HoloContinentCloud {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas unavailable');
  }

  ctx.drawImage(source, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);

  const positions: number[] = [];
  const colors: number[] = [];
  const sizes: number[] = [];

  for (let y = 0; y < height; y += sampleStep) {
    for (let x = 0; x < width; x += sampleStep) {
      const lum = sampleLuminance(data, width, x, y);
      if (lum < 0.21) {
        continue;
      }

      const hash = (x * 13 + y * 7) % 11;
      if (hash > 7 && lum < 0.38) {
        continue;
      }

      const lat = 90 - (y / height) * 180;
      const lng = (x / width) * 360 - 180;
      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lng + 180);
      const depth = radius * (0.988 + (hash / 11) * 0.022);

      positions.push(
        -depth * Math.sin(phi) * Math.cos(theta),
        depth * Math.cos(phi),
        depth * Math.sin(phi) * Math.sin(theta),
      );

      const boost = 0.7 + (lum - 0.21) * 0.95;
      colors.push(0.72 * boost + 0.18, 0.98 * boost, 0.9 * boost + 0.08);
      sizes.push(0.022 + lum * 0.038 + (hash % 4) * 0.004);
    }
  }

  return {
    positions: new Float32Array(positions),
    colors: new Float32Array(colors),
    sizes: new Float32Array(sizes),
    count: positions.length / 3,
  };
}

/** 内部水墨雾 — 球内柔和体积感 */
export function createInnerMistTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas unavailable');
  }

  const cx = size / 2;
  const grad = ctx.createRadialGradient(cx, cx, size * 0.06, cx, cx, size * 0.5);
  grad.addColorStop(0, 'rgba(168, 232, 240, 0.34)');
  grad.addColorStop(0.28, 'rgba(126, 205, 224, 0.16)');
  grad.addColorStop(0.55, 'rgba(106, 140, 175, 0.08)');
  grad.addColorStop(1, 'rgba(106, 140, 175, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  for (let blob = 0; blob < 14; blob += 1) {
    const bx = cx + (Math.random() - 0.5) * size * 0.62;
    const by = cx + (Math.random() - 0.5) * size * 0.62;
    const br = size * (0.05 + Math.random() * 0.16);
    const mist = ctx.createRadialGradient(bx, by, 0, bx, by, br);
    mist.addColorStop(0, `rgba(143, 216, 212, ${0.06 + Math.random() * 0.08})`);
    mist.addColorStop(1, 'rgba(106, 140, 175, 0)');
    ctx.fillStyle = mist;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export const FRESNEL_RIM_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const FRESNEL_RIM_FRAGMENT = /* glsl */ `
  uniform vec3 glowColor;
  uniform float power;
  uniform float intensity;

  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), power);
    float alpha = fresnel * intensity;
    gl_FragColor = vec4(glowColor, alpha);
  }
`;
