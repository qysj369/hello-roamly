import type {
  CreatePaymentOrderInput,
  PaymentChannelId,
  PaymentCheckoutPayload,
  PaymentOrder,
} from '@/types/domain/payment';
import { getPaymentChannelLabel } from '@/lib/payment/channels';

export class PaymentNotConfiguredError extends Error {
  constructor(channel: PaymentChannelId, detail?: string) {
    super(detail ?? `${getPaymentChannelLabel(channel)} 尚未配置，接口已预留`);
    this.name = 'PaymentNotConfiguredError';
  }
}

/** 各渠道支付网关统一接口（实现由后端签名 + 前端调起） */
export type PaymentGateway = {
  channel: PaymentChannelId;
  /** 调起收银台：H5 跳转或 JSBridge / 微信 JSAPI */
  launchCheckout(order: PaymentOrder): Promise<void>;
};

function openCheckoutUrl(url: string): void {
  window.location.assign(url);
}

function launchAlipay(order: PaymentOrder): Promise<void> {
  const payload = order.checkoutPayload;
  if (payload?.type !== 'alipay') {
    throw new PaymentNotConfiguredError('alipay', order.message);
  }
  if (payload.payUrl) {
    openCheckoutUrl(payload.payUrl);
    return Promise.resolve();
  }
  if (payload.orderString) {
    // TODO: 在 App WebView / 支付宝小程序内接入 SDK 调起 orderString
    throw new PaymentNotConfiguredError(
      'alipay',
      '已返回 orderString，需在 App / 小程序容器内调起支付宝 SDK',
    );
  }
  throw new PaymentNotConfiguredError('alipay', order.message);
}

function launchWechatPay(order: PaymentOrder): Promise<void> {
  const payload = order.checkoutPayload;
  if (payload?.type !== 'wechat_pay') {
    throw new PaymentNotConfiguredError('wechat_pay', order.message);
  }
  if (payload.h5Url) {
    openCheckoutUrl(payload.h5Url);
    return Promise.resolve();
  }
  const hasJsapi =
    payload.appId &&
    payload.timeStamp &&
    payload.nonceStr &&
    payload.package &&
    payload.signType &&
    payload.paySign;

  if (hasJsapi) {
    // TODO: 微信内置浏览器内调用 WeixinJSBridge.invoke('getBrandWCPayRequest', …)
    throw new PaymentNotConfiguredError(
      'wechat_pay',
      '已返回 JSAPI 参数，需在微信内置浏览器中调用 WeixinJSBridge',
    );
  }
  throw new PaymentNotConfiguredError('wechat_pay', order.message);
}

export function getPaymentGateway(channel: PaymentChannelId): PaymentGateway {
  if (channel === 'alipay') {
    return { channel, launchCheckout: launchAlipay };
  }
  return { channel, launchCheckout: launchWechatPay };
}

export async function launchPaymentCheckout(order: PaymentOrder): Promise<void> {
  const gateway = getPaymentGateway(order.channel);
  await gateway.launchCheckout(order);
}

export type { CreatePaymentOrderInput, PaymentCheckoutPayload };
