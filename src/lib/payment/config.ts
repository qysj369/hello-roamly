import { readEnv } from '@/lib/config/env';

function isTruthyFlag(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

/** 是否在 UI 展示支付入口（不代表已签约商户） */
export function isPaymentUiEnabled(): boolean {
  return isTruthyFlag(readEnv('VITE_PAYMENT_UI_ENABLED'));
}

export function isAlipayChannelEnabled(): boolean {
  return isTruthyFlag(readEnv('VITE_PAYMENT_ALIPAY_ENABLED'));
}

export function isWechatPayChannelEnabled(): boolean {
  return isTruthyFlag(readEnv('VITE_PAYMENT_WECHAT_ENABLED'));
}

/** 是否已配置自建 API（支付单由后端创建与验签） */
export function hasPaymentBackend(): boolean {
  return Boolean(readEnv('VITE_API_BASE_URL')?.trim());
}
