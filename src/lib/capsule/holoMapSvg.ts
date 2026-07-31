/** 全息地球 equirectangular 大陆轮廓（仅描边） */

export type LngLat = [number, number];

export const HOLO_EURASIA: LngLat[] = [
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

export const HOLO_AFRICA: LngLat[] = [
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

export const HOLO_NORTH_AMERICA: LngLat[] = [
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

export const HOLO_SOUTH_AMERICA: LngLat[] = [
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

const MAP_W = 1024;
const MAP_H = 512;

function lngLatToSvg(lng: number, lat: number): string {
  const x = ((lng + 180) / 360) * MAP_W;
  const y = ((90 - lat) / 180) * MAP_H;
  return `${x.toFixed(1)},${y.toFixed(1)}`;
}

function continentPath(points: LngLat[]): string {
  return points
    .map(([lng, lat], index) => `${index === 0 ? 'M' : 'L'}${lngLatToSvg(lng, lat)}`)
    .join(' ')
    .concat(' Z');
}

export function buildHoloMapSvgDataUrl(): string {
  const paths = [HOLO_EURASIA, HOLO_AFRICA, HOLO_NORTH_AMERICA, HOLO_SOUTH_AMERICA]
    .map((points) => `<path d="${continentPath(points)}"/>`)
    .join('');

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 512">
  <g fill="none" stroke="#4A5258" stroke-width="0.72" stroke-linecap="round" stroke-linejoin="round" opacity="0.58">
    ${paths}
  </g>
</svg>`.trim();

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
