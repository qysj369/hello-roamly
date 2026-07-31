import type { ServerEnv } from './deepseekServer';
import { readAmapWebServiceKey } from './amapGeocodeServer';

const WEATHER_URL = 'https://restapi.amap.com/v3/weather/weatherInfo';

type AmapWeatherResponse = {
  status?: string;
  lives?: Array<{
    city?: string;
    weather?: string;
    temperature?: string;
    winddirection?: string;
    windpower?: string;
    reporttime?: string;
  }>;
};

export type AmapWeatherHint = {
  available: boolean;
  city: string;
  summary: string;
};

/** 高德实况天气（无 Key 时返回明确不可用说明） */
export async function fetchAmapWeatherLive(
  cityName: string,
  env: ServerEnv,
): Promise<AmapWeatherHint> {
  const city = cityName.trim() || '全国';
  const key = readAmapWebServiceKey(env);
  if (!key) {
    return {
      available: false,
      city,
      summary: '天气服务未配置，出发前请自行查询当地天气预报。',
    };
  }

  try {
    const params = new URLSearchParams({
      key,
      city,
      extensions: 'base',
      output: 'JSON',
    });
    const response = await fetch(`${WEATHER_URL}?${params.toString()}`);
    if (!response.ok) {
      return {
        available: false,
        city,
        summary: '天气接口暂时不可用，出发前请自行查询。',
      };
    }

    const data = (await response.json()) as AmapWeatherResponse;
    const live = data.lives?.[0];
    if (data.status !== '1' || !live?.weather) {
      return {
        available: false,
        city,
        summary: `${city} 天气暂查不到，请以出发前实时预报为准。`,
      };
    }

    const bits = [
      live.weather,
      live.temperature != null ? `${live.temperature}℃` : null,
      live.winddirection && live.windpower ? `${live.winddirection}风 ${live.windpower}级` : null,
    ].filter(Boolean);

    return {
      available: true,
      city: live.city?.trim() || city,
      summary: `${live.city ?? city} 实况：${bits.join('，')}（${live.reporttime ?? '刚刚'}）`,
    };
  } catch {
    return {
      available: false,
      city,
      summary: '天气查询失败，出发前请自行查询。',
    };
  }
}
