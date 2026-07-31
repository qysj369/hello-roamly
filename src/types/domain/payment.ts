/** 中国版预留支付渠道 */
export type PaymentChannelId = 'alipay' | 'wechat_pay';

export type PaymentCurrency = 'CNY';

export type PaymentOrderStatus = 'pending' | 'paid' | 'failed' | 'closed' | 'cancelled';

/** 创建支付单入参（前端 → 后端） */
export type CreatePaymentOrderInput = {
  channel: PaymentChannelId;
  /** 金额（分） */
  amountFen: number;
  currency?: PaymentCurrency;
  title: string;
  description?: string;
  /** 业务关联 ID，如行程/会员订单 */
  bizType?: string;
  bizId?: string;
};

/** 支付宝调起参数（由服务端签名后返回，勿在前端拼私钥） */
export type AlipayCheckoutPayload = {
  type: 'alipay';
  orderString?: string;
  payUrl?: string;
};

/** 微信 JSAPI / H5 调起参数（由服务端签名后返回） */
export type WechatCheckoutPayload = {
  type: 'wechat_pay';
  appId?: string;
  timeStamp?: string;
  nonceStr?: string;
  package?: string;
  signType?: string;
  paySign?: string;
  h5Url?: string;
};

export type PaymentCheckoutPayload = AlipayCheckoutPayload | WechatCheckoutPayload;

export type PaymentOrder = {
  id: string;
  channel: PaymentChannelId;
  amountFen: number;
  currency: PaymentCurrency;
  title: string;
  status: PaymentOrderStatus;
  createdAt: string;
  checkoutPayload?: PaymentCheckoutPayload;
  /** 未接后端时的说明 */
  message?: string;
};
