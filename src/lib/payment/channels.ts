import type { PaymentChannelId } from '@/types/domain/payment';
import {
  hasPaymentBackend,
  isAlipayChannelEnabled,
  isPaymentUiEnabled,
  isWechatPayChannelEnabled,
} from '@/lib/payment/config';
import { isChinaPrimaryMarket } from '@/lib/config/marketScope';

export type PaymentChannelMeta = {
  id: PaymentChannelId;
  label: string;
  shortLabel: string;
  /** 代码与后端路由已预留 */
  reserved: boolean;
  /** 当前环境可尝试创建订单（需后端 + 开关） */
  available: boolean;
  unavailableReason?: string;
};

const CHANNEL_DEFS: Record<
  PaymentChannelId,
  Pick<PaymentChannelMeta, 'label' | 'shortLabel'>
> = {
  alipay: { label: '支付宝', shortLabel: '支付宝' },
  wechat_pay: { label: '微信支付', shortLabel: '微信' },
};

function channelEnabled(id: PaymentChannelId): boolean {
  if (id === 'alipay') {
    return isAlipayChannelEnabled();
  }
  return isWechatPayChannelEnabled();
}

function buildUnavailableReason(id: PaymentChannelId): string {
  if (!isChinaPrimaryMarket()) {
    return '当前为全球构建，中国支付渠道默认关闭';
  }
  if (!isPaymentUiEnabled()) {
    return '未开启 VITE_PAYMENT_UI_ENABLED';
  }
  if (!channelEnabled(id)) {
    return id === 'alipay'
      ? '未开启 VITE_PAYMENT_ALIPAY_ENABLED'
      : '未开启 VITE_PAYMENT_WECHAT_ENABLED';
  }
  if (!hasPaymentBackend()) {
    return '需配置 VITE_API_BASE_URL 与后端商户密钥';
  }
  return '商户签约与回调待接入';
}

/** 列出中国版预留的支付渠道及可用状态 */
export function listPaymentChannels(): PaymentChannelMeta[] {
  const ids: PaymentChannelId[] = ['alipay', 'wechat_pay'];

  return ids.map((id) => {
    const reserved = isChinaPrimaryMarket();
    const enabled = channelEnabled(id) && isPaymentUiEnabled();
    const backend = hasPaymentBackend();
    const available = reserved && enabled && backend;

    return {
      id,
      ...CHANNEL_DEFS[id],
      reserved,
      available,
      unavailableReason: available ? undefined : buildUnavailableReason(id),
    };
  });
}

export function getPaymentChannelLabel(id: PaymentChannelId): string {
  return CHANNEL_DEFS[id].label;
}
