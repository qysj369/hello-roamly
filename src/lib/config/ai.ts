import { isProductionAppMode } from '@/lib/config/appMode';
import { readEnv } from '@/lib/config/env';
import { normalizeMapCredential } from '@/lib/map/credentials';

export type DeepSeekConfig = {
  apiKey: string;
  baseURL: string;
  model: string;
};

const DEFAULT_DEEPSEEK_BASE_URL = 'https://api.deepseek.com';
const DEFAULT_DEEPSEEK_MODEL = 'deepseek-chat';

export function getDeepSeekConfig(): DeepSeekConfig | null {
  const apiKey = normalizeMapCredential(readEnv('VITE_DEEPSEEK_API_KEY'));
  if (!apiKey) {
    return null;
  }

  return {
    apiKey,
    baseURL: readEnv('VITE_DEEPSEEK_BASE_URL') ?? DEFAULT_DEEPSEEK_BASE_URL,
    model: readEnv('VITE_DEEPSEEK_MODEL') ?? DEFAULT_DEEPSEEK_MODEL,
  };
}

export function isDeepSeekConfigured(): boolean {
  return getDeepSeekConfig() !== null;
}

export type AiProvider = 'deepseek' | 'mock';

/** UI / 逻辑：deepseek | mock（演示）| unconfigured（上线模式但未配 Key） */
export type AiProviderDisplay = AiProvider | 'unconfigured';

export function getAiProvider(): AiProvider {
  return isDeepSeekConfigured() ? 'deepseek' : 'mock';
}

export function getAiProviderDisplay(): AiProviderDisplay {
  if (isDeepSeekConfigured()) {
    return 'deepseek';
  }
  if (isProductionAppMode()) {
    return 'unconfigured';
  }
  return 'mock';
}

export function getAiProviderDisplayLabel(display: AiProviderDisplay = getAiProviderDisplay()): string {
  if (display === 'deepseek') {
    return 'DeepSeek';
  }
  if (display === 'unconfigured') {
    return '未配置 AI';
  }
  return '演示模式';
}

const PRODUCTION_AI_ERROR =
  '上线模式需要配置 VITE_DEEPSEEK_API_KEY。请在 .env.local 填入 DeepSeek Key 后重启 pnpm dev。';

/** 上线模式下强制要求 DeepSeek；演示模式不校验 */
export function assertAiServiceReady(): void {
  if (isProductionAppMode() && !isDeepSeekConfigured()) {
    throw new Error(PRODUCTION_AI_ERROR);
  }
}
