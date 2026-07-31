import axios, { type AxiosInstance } from 'axios';
import { getDeepSeekConfig, type DeepSeekConfig } from '@/lib/config/ai';

export type DeepSeekHttpBundle = {
  client: AxiosInstance;
  config: DeepSeekConfig;
};

export function createDeepSeekHttp(): DeepSeekHttpBundle {
  const config = getDeepSeekConfig();
  if (!config) {
    throw new Error('DeepSeek 未配置：请设置 VITE_DEEPSEEK_API_KEY');
  }

  const client = axios.create({
    baseURL: config.baseURL,
    timeout: 90_000,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
  });

  return { client, config };
}
