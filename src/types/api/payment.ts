import type {
  PaymentChannelId,
  PaymentCheckoutPayload,
  PaymentCurrency,
  PaymentOrderStatus,
} from '@/types/domain/payment';

/** POST /payments/orders 请求体 */
export type CreatePaymentOrderRequest = {
  channel: PaymentChannelId;
  amountFen: number;
  currency?: PaymentCurrency;
  title: string;
  description?: string;
  bizType?: string;
  bizId?: string;
};

/** POST /payments/orders 响应体 */
export type CreatePaymentOrderResponse = {
  order: {
    id: string;
    channel: PaymentChannelId;
    amountFen: number;
    currency: PaymentCurrency;
    title: string;
    status: PaymentOrderStatus;
    createdAt: string;
    checkoutPayload?: PaymentCheckoutPayload;
    message?: string;
  };
};

/** GET /payments/orders/:id 响应体 */
export type PaymentOrderResponse = CreatePaymentOrderResponse;
