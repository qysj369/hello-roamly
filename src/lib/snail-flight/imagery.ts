import { readEnv } from '@/lib/config/env';

export type SnailFlightImageryKind = 'tianditu' | 'amap' | 'esri';

export type SnailFlightImagerySource = {
  kind: SnailFlightImageryKind;
  url: string;
  subdomains?: string[];
  credit: string;
};

/** 优先天地图（中国标准地图）；无 Key 时退到国内卫星或全球影像，仅用于山东低空观光 */
export function listSnailFlightImagerySources(): SnailFlightImagerySource[] {
  const tk = readEnv('VITE_TIANDITU_TK');
  const sources: SnailFlightImagerySource[] = [];
  if (tk) {
    sources.push({
      kind: 'tianditu',
      url: `https://{s}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tk}`,
      subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
      credit: '天地图',
    });
    sources.push({
      kind: 'tianditu',
      url: `https://{s}.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tk}`,
      subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
      credit: '天地图注记',
    });
    return sources;
  }
  sources.push({
    kind: 'esri',
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    credit: '卫星影像',
  });
  sources.push({
    kind: 'amap',
    url: 'https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
    subdomains: ['1', '2', '3', '4'],
    credit: '卫星影像',
  });
  return sources;
}
