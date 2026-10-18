import { readEnv } from '@/lib/config/env';

export type SnailFlightImageryKind = 'tianditu' | 'amap' | 'esri';

export type SnailFlightImagerySource = {
  kind: SnailFlightImageryKind;
  url: string;
  subdomains?: string[];
  credit: string;
};

/** 优先天地图（中国标准地图）；无 Key 时走同源代理的高德卫星，避免 Esri 在境内被糊成色块 */
export function listSnailFlightImagerySources(): SnailFlightImagerySource[] {
  const tk = readEnv('VITE_TIANDITU_TK');
  if (tk) {
    return [
      {
        kind: 'tianditu',
        url: `https://{s}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tk}`,
        subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
        credit: '天地图',
      },
      {
        kind: 'tianditu',
        url: `https://{s}.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tk}`,
        subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
        credit: '天地图注记',
      },
    ];
  }
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return [
    {
      kind: 'amap',
      url: `${base}cesium-sat/amap/{z}/{x}/{y}`,
      credit: '卫星影像',
    },
  ];
}
