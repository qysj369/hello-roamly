/** 高德 Web 服务 — 地理编码响应（精简） */
export type AmapGeocodeResponse = {
  status: string;
  info: string;
  geocodes?: Array<{
    formatted_address?: string;
    location?: string;
    country?: string;
  }>;
};

/** 高德 Web 服务 — 逆地理编码响应（精简） */
export type AmapRegeocodeResponse = {
  status: string;
  info: string;
  regeocode?: {
    formatted_address?: string;
    addressComponent?: {
      country?: string;
      province?: string;
      city?: string;
      district?: string;
    };
  };
};
