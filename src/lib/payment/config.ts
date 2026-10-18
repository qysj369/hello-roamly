import { readEnv } from '@/lib/config/env';
import { isOpenBusiness } from '@/lib/business/businessConfig';

function isTruthyFlag(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

/**
 * 支付 UI：须 isOpenBusiness 且 VITE_PAYMENT_UI_ENABLED=1。
 * 关闭商业总开关时与纯免费站一致。
 */
export function isPaymentUiEnabled(): boolean {
  if (!isOpenBusiness()) {
    return false;
  }
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
