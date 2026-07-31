import { http } from '@/lib/api/http';
import { readEnv } from '@/lib/config/env';
import { hasPaymentBackend } from '@/lib/payment/config';
import { PAYMENT_API } from '@/services/payment/paths';
import { createPaymentOrderResponseSchema } from '@/schemas/payment/order';
import type {
  CreatePaymentOrderRequest,
  CreatePaymentOrderResponse,
  PaymentOrderResponse,
} from '@/types/api/payment';
import type { CreatePaymentOrderInput, PaymentOrder } from '@/types/domain/payment';

/** 无商户后端时生成 pending 单，让支付弹窗/UI 流程可走完，便于联调前端 */
function buildDemoPaymentOrder(input: CreatePaymentOrderInput): PaymentOrder {
  const label = input.channel === 'alipay' ? '支付宝' : '微信支付';
  return {
    id: `demo-pay-${Date.now()}`,
    channel: input.channel,
    amountFen: input.amountFen,
    currency: input.currency ?? 'CNY',
    title: input.title,
    status: 'pending',
    createdAt: new Date().toISOString(),
    message: `${label} 接口已预留：请配置 VITE_API_BASE_URL 与后端商户参数后创建真实订单`,
  };
}

/**
 * 创建支付单：有 API 时走后端统一下单；否则本地演示单（不调微信/支付宝 SDK）。
 * 金额用分（amountFen）与后端约定一致，避免浮点误差。
 */
export async function createPaymentOrder(input: CreatePaymentOrderInput): Promise<PaymentOrder> {
  if (!hasPaymentBackend()) {
    // TODO: 正式环境必须 hasPaymentBackend；演示单不应出现在生产构建
    return buildDemoPaymentOrder(input);
  }

  const body: CreatePaymentOrderRequest = {
    channel: input.channel,
    amountFen: input.amountFen,
    currency: input.currency ?? 'CNY',
    title: input.title,
    description: input.description,
    bizType: input.bizType,
    bizId: input.bizId,
  };
  const { data } = await http.post<CreatePaymentOrderResponse>(PAYMENT_API.orders, body);
  const parsed = createPaymentOrderResponseSchema.parse(data);
  return parsed.order;
}

/**
 * 轮询/刷新订单状态；仅正式环境可用（演示单无持久化，查不到真实状态）。
 */
export async function fetchPaymentOrder(orderId: string): Promise<PaymentOrder> {
  if (!readEnv('VITE_API_BASE_URL')?.trim()) {
    throw new Error('未配置 VITE_API_BASE_URL，无法查询订单');
  }

  const { data } = await http.get<PaymentOrderResponse>(PAYMENT_API.orderById(orderId));
  const parsed = createPaymentOrderResponseSchema.parse(data);
  return parsed.order;
}
