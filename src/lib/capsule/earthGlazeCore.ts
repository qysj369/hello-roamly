import * as THREE from 'three';



/** 浅米白背景（与 theme.scss --theme-bg 对齐） */

export const GLAZE_PAPER = '#f7f3eb';

export const GLAZE_DAI = '#6A8CAF';

export const GLAZE_SKY = '#A0C4E0';

export const GLAZE_MINT = '#9EC8DE';

export const GLAZE_HOLO_CYAN = '#8FD8D4';

export const GLAZE_HOLO_BRIGHT = '#B8ECE8';

export const GLAZE_HOLO_DEEP = '#4A7888';



export const GLAZE_COLOR_PRESETS = {

  dai: '#6A8CAF',

  violet: '#9D4EDD',

  amber: '#FFD60A',

} as const;



const EURASIA: Array<[number, number]> = [

  [-12, 36],

  [8, 58],

  [22, 68],

  [55, 72],

  [95, 68],

  [130, 52],

  [145, 38],

  [128, 22],

  [105, 8],

  [78, 18],

  [55, 28],

  [32, 38],

  [12, 42],

  [-8, 38],

];



const AFRICA: Array<[number, number]> = [

  [-12, 32],

  [8, 28],

  [22, 12],

  [38, -8],

  [42, -28],

  [32, -36],

  [18, -34],

  [8, -18],

  [-2, 2],

  [-10, 18],

  [-14, 30],

];



const NORTH_AMERICA: Array<[number, number]> = [

  [-168, 65],

  [-142, 72],

  [-108, 70],

  [-82, 62],

  [-72, 48],

  [-78, 32],

  [-92, 24],

  [-104, 28],

  [-118, 36],

  [-132, 48],

  [-152, 58],

];



const SOUTH_AMERICA: Array<[number, number]> = [

  [-80, 10],

  [-72, 0],

  [-58, -4],

  [-48, -14],

  [-42, -28],

  [-50, -42],

  [-62, -54],

  [-72, -46],

  [-76, -24],

  [-78, -2],

];



const HOLO_CONTINENTS = [EURASIA, AFRICA, NORTH_AMERICA, SOUTH_AMERICA];



/** 参考图 · 半透明全息琉璃球 */

export const EARTH_GLAZE_PHYSICAL = {
  color: '#6a8caf',
  emissive: '#3a5a7a',
  emissiveIntensity: 0.08,
  transmission: 0.88,
  ior: 1.2,
  roughness: 0.14,
  opacity: 0.32,
  thickness: 0.85,
  metalness: 0,
  clearcoat: 1,
  clearcoatRoughness: 0.1,
  envMapIntensity: 0.5,
  tint: '#6a8caf',
  attenuationColor: '#5a7a9a',
  attenuationDistance: 0.75,
} as const;



export const EARTH_GLAZE_INNER_GLOW = {

  scale: 0.992,

  opacity: 0.11,

} as const;



export const EARTH_GLAZE_BODY_FILL = {

  scale: 0.996,

  opacity: 0.08,

} as const;



export const EARTH_GLAZE_LINE_OVERLAY = {

  scale: 1.002,

  opacity: 0.92,

} as const;



export const EARTH_GLAZE_GLOW_SHELL = {

  scale: 1.04,

  opacity: 0.12,

  segments: 64,

} as const;



export const EARTH_GLAZE_ATMOSPHERE = {

  segments: 64,

} as const;



export const EARTH_GLAZE_FRESNEL = {

  scale: 1.05,

  intensity: 0.82,

  power: 1.72,

} as const;



/** Bloom — 对齐 HTML demo UnrealBloomPass(0.8, 0.3, 0.2) */

export const EARTH_GLAZE_BLOOM = {

  intensity: 0.18,

  luminanceThreshold: 0.82,

  luminanceSmoothing: 0.22,

  radius: 0.16,

} as const;



export const EARTH_GLAZE_FOG = {

  color: GLAZE_PAPER,

  density: 0.004,

} as const;



export const EARTH_GLAZE_HOVER = {

  scale: 1.04,

  lerp: 4.8,

} as const;



export const EARTH_GLAZE_TEXTURE_DRIFT = {

  speed: 0.018,

} as const;



/** 虚线椭圆轨道 — 参考图 2 三条倾斜光轨 */

export const EARTH_GLAZE_ORBIT = {

  dashSize: 0.24,

  gapSize: 0.86,

  lineOpacity: 0.32,

  breatheSpeed: 0.65,

  breatheAmplitude: 0.06,

  groupSpinZ: 0.0005,

  groupSpinX: 0.00025,

} as const;



function lngLatToCanvas(lng: number, lat: number, width: number, height: number): { x: number; y: number } {

  return {

    x: ((lng + 180) / 360) * width,

    y: ((90 - lat) / 180) * height,

  };

}



function strokePath(

  ctx: CanvasRenderingContext2D,

  points: Array<[number, number]>,

  width: number,

  height: number,

): void {

  points.forEach(([lng, lat], index) => {

    const { x, y } = lngLatToCanvas(lng, lat, width, height);

    if (index === 0) {

      ctx.moveTo(x, y);

    } else {

      ctx.lineTo(x, y);

    }

  });

  ctx.closePath();

}



function fillContinent(

  ctx: CanvasRenderingContext2D,

  points: Array<[number, number]>,

  width: number,

  height: number,

  fillStyle: string,

  alpha: number,

): void {

  ctx.save();

  ctx.globalAlpha = alpha;

  ctx.fillStyle = fillStyle;

  ctx.beginPath();

  strokePath(ctx, points, width, height);

  ctx.fill();

  ctx.restore();

}



function drawGraticule(ctx: CanvasRenderingContext2D, width: number, height: number): void {

  ctx.save();

  ctx.strokeStyle = 'rgba(126, 205, 224, 0.04)';

  ctx.lineWidth = 0.45;



  for (let lat = -60; lat <= 60; lat += 30) {

    const y = ((90 - lat) / 180) * height;

    ctx.beginPath();

    ctx.moveTo(0, y);

    ctx.lineTo(width, y);

    ctx.stroke();

  }



  for (let lng = -150; lng <= 150; lng += 30) {

    const x = ((lng + 180) / 360) * width;

    ctx.beginPath();

    ctx.moveTo(x, 0);

    ctx.lineTo(x, height);

    ctx.stroke();

  }



  ctx.restore();

}



function drawContinentStrokes(

  ctx: CanvasRenderingContext2D,

  width: number,

  height: number,

  strokeStyle: string,

  passes: Array<{ lineWidth: number; alpha: number }>,

): void {

  ctx.lineCap = 'round';

  ctx.lineJoin = 'round';



  for (const pass of passes) {

    ctx.strokeStyle = strokeStyle;

    ctx.lineWidth = pass.lineWidth;

    ctx.globalAlpha = pass.alpha;



    for (const continent of HOLO_CONTINENTS) {

      ctx.beginPath();

      strokePath(ctx, continent, width, height);

      ctx.stroke();

    }

  }

}



/** 参考图 · 海洋透明 + 极淡大陆剪影 + 内部青雾 */

export function createHoloContinentSurfaceMap(): THREE.CanvasTexture {

  const width = 1024;

  const height = 512;

  const canvas = document.createElement('canvas');

  canvas.width = width;

  canvas.height = height;

  const ctx = canvas.getContext('2d');

  if (!ctx) {

    throw new Error('Canvas unavailable');

  }



  ctx.clearRect(0, 0, width, height);



  const oceanGlow = ctx.createRadialGradient(width * 0.46, height * 0.44, 0, width * 0.5, height * 0.5, width * 0.42);

  oceanGlow.addColorStop(0, 'rgba(143, 216, 212, 0.12)');

  oceanGlow.addColorStop(0.45, 'rgba(126, 205, 224, 0.05)');

  oceanGlow.addColorStop(1, 'rgba(106, 140, 175, 0)');

  ctx.fillStyle = oceanGlow;

  ctx.fillRect(0, 0, width, height);



  drawGraticule(ctx, width, height);



  for (const continent of HOLO_CONTINENTS) {

    fillContinent(ctx, continent, width, height, '#7a8288', 0.06);

  }



  drawContinentStrokes(ctx, width, height, '#4a5258', [

    { lineWidth: 4, alpha: 0.08 },

    { lineWidth: 1.6, alpha: 0.32 },

    { lineWidth: 0.85, alpha: 0.55 },

  ]);



  const texture = new THREE.CanvasTexture(canvas);

  texture.colorSpace = THREE.SRGBColorSpace;

  texture.wrapS = THREE.RepeatWrapping;

  texture.wrapT = THREE.ClampToEdgeWrapping;

  texture.anisotropy = 8;

  texture.needsUpdate = true;

  return texture;

}



/** 轮廓线 overlay */

export function createMinimalistInkEarthMap(): THREE.CanvasTexture {

  const width = 1024;

  const height = 512;

  const canvas = document.createElement('canvas');

  canvas.width = width;

  canvas.height = height;

  const ctx = canvas.getContext('2d');

  if (!ctx) {

    throw new Error('Canvas unavailable');

  }



  ctx.clearRect(0, 0, width, height);



  drawGraticule(ctx, width, height);



  drawContinentStrokes(ctx, width, height, '#3d4548', [

    { lineWidth: 3.5, alpha: 0.12 },

    { lineWidth: 1.5, alpha: 0.48 },

    { lineWidth: 0.82, alpha: 0.92 },

  ]);



  const texture = new THREE.CanvasTexture(canvas);

  texture.colorSpace = THREE.SRGBColorSpace;

  texture.wrapS = THREE.RepeatWrapping;

  texture.wrapT = THREE.ClampToEdgeWrapping;

  texture.anisotropy = 8;

  texture.needsUpdate = true;

  return texture;

}



/** emissiveMap — 大陆线发光 */

export function createMinimalistInkEmissiveMap(): THREE.CanvasTexture {

  const width = 1024;

  const height = 512;

  const canvas = document.createElement('canvas');

  canvas.width = width;

  canvas.height = height;

  const ctx = canvas.getContext('2d');

  if (!ctx) {

    throw new Error('Canvas unavailable');

  }



  ctx.fillStyle = '#000000';

  ctx.fillRect(0, 0, width, height);



  drawContinentStrokes(ctx, width, height, '#9ad4e8', [

    { lineWidth: 3, alpha: 0.1 },

    { lineWidth: 1.2, alpha: 0.28 },

    { lineWidth: 0.65, alpha: 0.55 },

  ]);



  const texture = new THREE.CanvasTexture(canvas);

  texture.colorSpace = THREE.NoColorSpace;

  texture.wrapS = THREE.RepeatWrapping;

  texture.wrapT = THREE.ClampToEdgeWrapping;

  texture.anisotropy = 8;

  texture.needsUpdate = true;

  return texture;

}



export function createInkOutlineEarthMap(_source?: CanvasImageSource): THREE.CanvasTexture {

  return createMinimalistInkEarthMap();

}



export function createEarthGlazeSurfaceMap(_source?: CanvasImageSource): THREE.CanvasTexture {

  return createHoloContinentSurfaceMap();

}



export function createEarthGlazeInkTexture(_source?: CanvasImageSource | null): THREE.CanvasTexture {

  return createMinimalistInkEarthMap();

}



export function createEarthInkContourTexture(_source?: CanvasImageSource): THREE.CanvasTexture {

  return createMinimalistInkEarthMap();

}

/** Paper Roam · 真实地球渲染参数（自然光感，无辉光） */
export const PAPER_ROAM_EARTH = {
  bumpScale: 0.04,
  roughness: 0.72,
  metalness: 0.015,
  cloudScale: 1.01,
  cloudOpacity: 0.46,
  cloudAlphaTest: 0.035,
  cloudBrightness: 1.24,
  cloudEmissiveIntensity: 0.16,
  cloudSpin: 0.012,
  exposure: 1.08,
  /** 0–1，海洋向浅蓝青色调靠拢的强度 */
  oceanLift: 0.62,
} as const;

/** 仅提亮海洋像素，陆地保持原色 */
export function createLightenedEarthMap(
  source: CanvasImageSource,
  lift = PAPER_ROAM_EARTH.oceanLift,
): THREE.CanvasTexture {
  const image = source instanceof HTMLImageElement ? source : null;
  const width = image?.naturalWidth ?? 2048;
  const height = image?.naturalHeight ?? 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas unavailable');
  }

  ctx.drawImage(source, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const targetRed = 172;
  const targetGreen = 218;
  const targetBlue = 242;

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const isOcean = blue > red + 8 && blue > green + 2;

    if (!isOcean) {
      continue;
    }

    data[index] = Math.round(red + (targetRed - red) * lift);
    data[index + 1] = Math.round(green + (targetGreen - green) * lift);
    data[index + 2] = Math.round(blue + (targetBlue - blue) * lift);
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

/** 提亮云图 — 增强白色云团层次，保留透明区域 */
export function createBrightenedCloudMap(
  source: CanvasImageSource,
  brightness = PAPER_ROAM_EARTH.cloudBrightness,
): THREE.CanvasTexture {
  const image = source instanceof HTMLImageElement ? source : null;
  const width = image?.naturalWidth ?? 1024;
  const height = image?.naturalHeight ?? 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas unavailable');
  }

  ctx.drawImage(source, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3];
    if (alpha < 6) {
      continue;
    }

    const coverage = alpha / 255;
    const lift = 0.08 + coverage * (brightness - 1);

    data[index] = Math.min(255, Math.round(data[index] + (255 - data[index]) * lift + 6));
    data[index + 1] = Math.min(255, Math.round(data[index + 1] + (255 - data[index + 1]) * lift + 8));
    data[index + 2] = Math.min(255, Math.round(data[index + 2] + (255 - data[index + 2]) * lift * 0.85 + 4));
    data[index + 3] = Math.min(255, Math.round(alpha * (0.92 + coverage * 0.14)));
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

/** Paper Roam · 水墨虚线轨道 */
export const PAPER_ROAM_ORBITS = [
  { radiusX: 7.2, radiusY: 2.8, tiltX: 0.6, tiltZ: 0.2, color: 0x2e4868, size: 0.044, opacity: 0.55, lineOpacity: 0.34, spinSpeed: 0.0025 },
  { radiusX: 8.6, radiusY: 3.6, tiltX: -0.4, tiltZ: 0.5, color: 0x3a5878, size: 0.038, opacity: 0.46, lineOpacity: 0.28, spinSpeed: -0.0032 },
  { radiusX: 10.0, radiusY: 2.2, tiltX: 0.8, tiltZ: -0.3, color: 0x4a6888, size: 0.034, opacity: 0.38, lineOpacity: 0.22, spinSpeed: 0.004 },
] as const;

