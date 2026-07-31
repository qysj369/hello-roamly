/** 百度地图 JS API v3 全局命名空间（街景驾驶舱） */
export {};

declare global {
  interface BMapPoint {
    lng: number;
    lat: number;
  }

  interface BMapPanoramaPov {
    heading?: number;
    pitch?: number;
  }

  interface BMapPanoramaTiles {
    centerHeading?: number;
  }

  interface BMapPanoramaLocationResult {
    id: string;
    description?: string;
    position: BMapPoint;
    tiles?: BMapPanoramaTiles;
  }

  /** 相邻道路全景点 */
  interface BMapPanoramaLink {
    id: string;
    description?: string;
    /** 正北为 0，正东 90，正南 180，正西 270 */
    heading: number;
  }

  interface BMapPanoramaOptions {
    navigationControl?: boolean;
    linksControl?: boolean;
    indoorSceneSwitchControl?: boolean;
    albumsControl?: boolean;
  }

  interface BMapPanoramaInstance {
    setId(id: string): void;
    setPosition(point: BMapPoint): void;
    setPov(pov: BMapPanoramaPov): void;
    setZoom?(zoom: number): void;
    setOptions?(opts: BMapPanoramaOptions): void;
    getId(): string;
    getPosition(): BMapPoint;
    getPov(): BMapPanoramaPov;
    getLinks(): BMapPanoramaLink[];
    getZoom?(): number;
    enableScrollWheelZoom?(): void;
    disableScrollWheelZoom?(): void;
    addEventListener(
      event: 'position_changed' | 'id_changed' | 'links_changed' | 'pov_changed' | 'zoom_changed',
      handler: () => void,
    ): void;
    removeEventListener(
      event: 'position_changed' | 'id_changed' | 'links_changed' | 'pov_changed' | 'zoom_changed',
      handler: () => void,
    ): void;
  }

  interface BMapPanoramaServiceInstance {
    getPanoramaByLocation(
      point: BMapPoint,
      callback: (result: BMapPanoramaLocationResult | null) => void,
    ): void;
    getPanoramaByLocation(
      point: BMapPoint,
      radius: number,
      callback: (result: BMapPanoramaLocationResult | null) => void,
    ): void;
  }

  const BMap: {
    Point: new (lng: number, lat: number) => BMapPoint;
    Panorama: new (
      container: string | HTMLElement,
      opts?: BMapPanoramaOptions,
    ) => BMapPanoramaInstance;
    PanoramaService: new () => BMapPanoramaServiceInstance;
  };
}
