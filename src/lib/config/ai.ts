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
    /**
     * 上线包故意不带 VITE_DEEPSEEK_API_KEY（见 DEPLOY-MEMO），
     * 实际走服务端 DEEPSEEK_API_KEY。UI 不应显示「未配置 AI」。
     */
    return 'deepseek';
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
  '上线模式需要在服务端配置 DEEPSEEK_API_KEY（勿把 Key 打进前端包）。';

/**
 * 浏览器直连 DeepSeek 时校验。
 * 上线模式走服务端 DEEPSEEK_API_KEY，不因缺少 VITE_ Key 误判。
 * 本地穷游流式生成也走 /api/ai/* + 服务端 Key；VITE_ 仅用于少数浏览器直连路径，生产/本地请用两套 Key。
 */
export function assertAiServiceReady(): void {
  if (isProductionAppMode()) {
    return;
  }
  if (!isDeepSeekConfigured()) {
    throw new Error(
      '此功能需浏览器直连 DeepSeek：请在 .env.local 配置开发专用 VITE_DEEPSEEK_API_KEY（勿与生产 Key 混用）；漫行生成请优先配置服务端 DEEPSEEK_API_KEY。',
    );
  }
}
