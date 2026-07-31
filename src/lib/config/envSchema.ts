import { readEnv } from '@/lib/config/env';
import { getBuildMarket } from '@/lib/config/marketScope';
import { getActiveCoordinateSystem } from '@/lib/map/coordinates';
import { getMapProviderMode, resolveMapProvider } from '@/lib/map/provider';
import {
  isAlipayChannelEnabled,
  isPaymentUiEnabled,
  isWechatPayChannelEnabled,
} from '@/lib/payment/config';
import {
  hasModerationBackend,
  isContentModerationEnabled,
  isContentModerationStrict,
  isModerationDemoBlockEnabled,
} from '@/lib/moderation/config';
import {
  getAssetCdnBase,
  getImageCdnTemplate,
  hasAssetCdn,
  hasImageCdn,
  preferChinaCdn,
} from '@/lib/cdn/config';

/** 客户端环境变量快照（仅 VITE_*，供调试与关于页展示） */
export type ClientEnvSnapshot = {
  siteUrl?: string;
  market: 'CN' | 'GLOBAL';
  hasMapboxToken: boolean;
  hasAmapKey: boolean;
  hasAmapSecurityCode: boolean;
  mapProviderMode: string;
  activeMapProvider: string | null;
  activeCoordinateSystem: string;
  hasApiBaseUrl: boolean;
  hasApiToken: boolean;
  hasDeepseekKey: boolean;
  deepseekModel?: string;
  paymentUiEnabled: boolean;
  paymentAlipayEnabled: boolean;
  paymentWechatEnabled: boolean;
  contentModerationEnabled: boolean;
  contentModerationStrict: boolean;
  contentModerationDemoBlock: boolean;
  hasModerationBackend: boolean;
  assetCdnBase?: string;
  imageCdnTemplate?: string;
  hasAssetCdn: boolean;
  hasImageCdn: boolean;
  preferChinaCdn: boolean;
};

/** 读取当前已配置的客户端环境（不返回值本身，避免泄露密钥） */
export function getClientEnvSnapshot(): ClientEnvSnapshot {
  return {
    siteUrl: readEnv('VITE_SITE_URL'),
    market: getBuildMarket(),
    hasMapboxToken: Boolean(readEnv('VITE_MAPBOX_TOKEN')),
    hasAmapKey: Boolean(readEnv('VITE_AMAP_KEY')),
    hasAmapSecurityCode: Boolean(readEnv('VITE_AMAP_SECURITY_CODE')),
    mapProviderMode: getMapProviderMode(),
    activeMapProvider: resolveMapProvider(),
    activeCoordinateSystem: getActiveCoordinateSystem(),
    hasApiBaseUrl: Boolean(readEnv('VITE_API_BASE_URL')),
    hasApiToken: Boolean(readEnv('VITE_API_TOKEN')),
    hasDeepseekKey: Boolean(readEnv('VITE_DEEPSEEK_API_KEY')),
    deepseekModel: readEnv('VITE_DEEPSEEK_MODEL'),
    paymentUiEnabled: isPaymentUiEnabled(),
    paymentAlipayEnabled: isAlipayChannelEnabled(),
    paymentWechatEnabled: isWechatPayChannelEnabled(),
    contentModerationEnabled: isContentModerationEnabled(),
    contentModerationStrict: isContentModerationStrict(),
    contentModerationDemoBlock: isModerationDemoBlockEnabled(),
    hasModerationBackend: hasModerationBackend(),
    assetCdnBase: getAssetCdnBase(),
    imageCdnTemplate: getImageCdnTemplate(),
    hasAssetCdn: hasAssetCdn(),
    hasImageCdn: hasImageCdn(),
    preferChinaCdn: preferChinaCdn(),
  };
}
