/** 高德 JS API 2.0 全局命名空间（由 @amap/amap-jsapi-loader 注入） */
export {};

declare global {
  interface AMapLngLat {
    getLng(): number;
    getLat(): number;
  }

  interface AMapPixel {
    x: number;
    y: number;
  }

  interface AMapMapClickEvent {
    lnglat: AMapLngLat;
    pixel?: AMapPixel;
  }

  interface AMapPolylineInstance {
    setMap(map: AMapMapInstance | null): void;
    setOptions(options: Record<string, unknown>): void;
    setPath?(path: Array<[number, number]>): void;
    on(event: 'click' | 'mouseover' | 'mouseout', handler: () => void): void;
    getExtData<T>(): T;
  }

  interface AMapMapInstance {
    destroy(): void;
    addControl(control: unknown): void;
    on(event: 'click', handler: (event: AMapMapClickEvent) => void): void;
    off(event: 'click', handler: (event: AMapMapClickEvent) => void): void;
    on(event: 'zoomend', handler: () => void): void;
    off(event: 'zoomend', handler: () => void): void;
    /** bindAmapMapClick 挂载的当前 listener，用于防止重复绑定 */
    clickListener?: (event: AMapMapClickEvent) => void;
    add(overlay: unknown): void;
    remove(overlay: unknown): void;
    setFitView(
      overlays?: unknown[],
      immediately?: boolean,
      avoid?: number[],
      maxZoom?: number,
    ): void;
    setZoomAndCenter(zoom: number, center: [number, number]): void;
    clearInfoWindow(): void;
    getZoom(): number;
    setFeatures(features: ('bg' | 'road' | 'point' | 'building')[]): void;
    setStatus(status: { showLabel?: boolean }): void;
    on(event: 'complete', handler: () => void): void;
    off(event: 'complete', handler: () => void): void;
  }

  interface AMapMarkerInstance {
    setPosition(position: [number, number]): void;
    setMap(map: AMapMapInstance | null): void;
    setContent(content: string | HTMLElement): void;
    on(event: 'click', handler: () => void): void;
    getExtData<T>(): T;
  }

  interface AMapInfoWindowInstance {
    open(map: AMapMapInstance, position: [number, number]): void;
    close(): void;
    setContent(content: string | HTMLElement): void;
  }

  interface AmapGeocoderRegeocode {
    formattedAddress?: string;
    addressComponent?: {
      city?: string | string[];
      district?: string;
      township?: string;
      street?: string;
      streetNumber?: string;
      neighborhood?: { name?: string | string[] };
    };
    pois?: { name?: string; distance?: string | number }[];
  }

  interface AMapGeocoderResult {
    info?: string;
    regeocode?: AmapGeocoderRegeocode;
    geocodes?: AmapGeocodeItem[];
  }

  interface AMapGeocodeLocation {
    lng?: number;
    lat?: number;
    getLng(): number;
    getLat(): number;
  }

  interface AmapGeocodeItem {
    formattedAddress?: string;
    location?: AMapGeocodeLocation;
  }

  interface AMapGeocoderInstance {
    getAddress(
      location: [number, number],
      callback: (status: string, result: AMapGeocoderResult) => void,
    ): void;
    getLocation(
      address: string,
      callback: (status: string, result: AMapGeocoderResult) => void,
    ): void;
  }

  interface AMapPanoramaPov {
    heading?: number;
    pitch?: number;
  }

  interface AMapPanoramaLocationResult {
    panoId?: string;
    position?: [number, number];
  }

  interface AMapPanoramaInstance {
    destroy(): void;
    setPosition(position: [number, number]): void;
    setPano(panoId: string): void;
    on(event: 'complete' | 'error', handler: (...args: unknown[]) => void): void;
    off(event: 'complete' | 'error', handler: (...args: unknown[]) => void): void;
  }

  interface AMapPanoramaServiceInstance {
    getPanoramaByLocation(
      location: [number, number],
      callback: (result: AMapPanoramaLocationResult | null) => void,
    ): void;
  }

  const AMap: {
    Map: new (container: string | HTMLElement, opts?: Record<string, unknown>) => AMapMapInstance;
    Marker: new (opts?: Record<string, unknown>) => AMapMarkerInstance;
    Polyline: new (opts?: Record<string, unknown>) => AMapPolylineInstance;
    InfoWindow: new (opts?: Record<string, unknown>) => AMapInfoWindowInstance;
    Geocoder: new (opts?: Record<string, unknown>) => AMapGeocoderInstance;
    Panorama: new (
      container: string | HTMLElement,
      opts?: {
        position?: [number, number];
        pov?: AMapPanoramaPov;
      },
    ) => AMapPanoramaInstance;
    PanoramaService: new () => AMapPanoramaServiceInstance;
    plugin?: (names: string | string[], callback: () => void) => void;
    Scale: new (opts?: Record<string, unknown>) => unknown;
    ToolBar: new (opts?: Record<string, unknown>) => unknown;
    Bounds: new (southWest: [number, number], northEast: [number, number]) => unknown;
  };
}
