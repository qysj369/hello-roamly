/** Mapbox Geocoding API v5 — 上下文项（精简） */
export type MapboxGeocodeContext = {
  id: string;
  text: string;
  short_code?: string;
};

/** Mapbox Geocoding API v5 — Forward / Reverse 响应要素（精简） */
export type MapboxGeocodeFeature = {
  id: string;
  place_name: string;
  center: [number, number];
  relevance?: number;
  context?: MapboxGeocodeContext[];
};

export type MapboxGeocodeResponse = {
  features: MapboxGeocodeFeature[];
};
