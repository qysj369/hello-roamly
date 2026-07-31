import { getAmapWebServiceKey } from '@/lib/map/amap';

export type CityWeatherLive = {
  available: boolean;
  city: string;
  temperatureC: number | null;
  weatherText: string;
  summary: string;
};

type AmapWeatherResponse = {
  status?: string;
  lives?: Array<{
    city?: string;
    weather?: string;
    temperature?: string;
  }>;
};

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
  };
};

/** WMO weather code → 简短中文 */
function weatherCodeText(code: number | undefined): string {
  if (code == null || Number.isNaN(code)) {
    return '';
  }
  if (code === 0) return '晴';
  if (code <= 3) return '多云';
  if (code <= 48) return '雾';
  if (code <= 57) return '毛毛雨';
  if (code <= 67) return '雨';
  if (code <= 77) return '雪';
  if (code <= 82) return '阵雨';
  if (code <= 86) return '阵雪';
  if (code <= 99) return '雷雨';
  return '实况';
}

async function fetchAmapWeather(cityName: string): Promise<CityWeatherLive | null> {
  const key = getAmapWebServiceKey();
  if (!key) {
    return null;
  }

  try {
    const params = new URLSearchParams({
      key,
      city: cityName,
      extensions: 'base',
      output: 'JSON',
    });
    const response = await fetch(
      `https://restapi.amap.com/v3/weather/weatherInfo?${params.toString()}`,
    );
    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as AmapWeatherResponse;
    const live = data.lives?.[0];
    if (data.status !== '1' || !live) {
      return null;
    }

    const temperatureC =
      live.temperature != null && live.temperature !== ''
        ? Number.parseFloat(live.temperature)
        : null;
    const weatherText = live.weather?.trim() ?? '';

    if (!Number.isFinite(temperatureC) && !weatherText) {
      return null;
    }

    return {
      available: true,
      city: live.city?.trim() || cityName,
      temperatureC: Number.isFinite(temperatureC) ? temperatureC : null,
      weatherText,
      summary:
        temperatureC != null && Number.isFinite(temperatureC)
          ? `${weatherText || '实况'} ${temperatureC}℃`
          : weatherText || '实况',
    };
  } catch {
    return null;
  }
}

/** Open-Meteo：无需 Key，按经纬度取当前气温（高德 Web Key 不可用时兜底） */
async function fetchOpenMeteoWeather(
  cityName: string,
  lat: number,
  lng: number,
): Promise<CityWeatherLive | null> {
  try {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lng),
      current: 'temperature_2m,weather_code',
      timezone: 'Asia/Shanghai',
    });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as OpenMeteoResponse;
    const temperatureC = data.current?.temperature_2m;
    if (temperatureC == null || Number.isNaN(temperatureC)) {
      return null;
    }
    const weatherText = weatherCodeText(data.current?.weather_code);
    return {
      available: true,
      city: cityName,
      temperatureC,
      weatherText,
      summary: `${weatherText || '实况'} ${Math.round(temperatureC)}℃`,
    };
  } catch {
    return null;
  }
}

/** 驾驶舱外温：优先高德实况，失败则按坐标用 Open-Meteo */
export async function fetchCityWeatherLive(
  cityName: string,
  coords?: { lat: number; lng: number },
): Promise<CityWeatherLive> {
  const city = cityName.trim() || '全国';

  const amap = await fetchAmapWeather(city);
  if (amap) {
    return amap;
  }

  if (coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng)) {
    const open = await fetchOpenMeteoWeather(city, coords.lat, coords.lng);
    if (open) {
      return open;
    }
  }

  return {
    available: false,
    city,
    temperatureC: null,
    weatherText: '',
    summary: '暂无实况',
  };
}
