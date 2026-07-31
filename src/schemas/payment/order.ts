import { z } from 'zod';

export const paymentChannelIdSchema = z.enum(['alipay', 'wechat_pay']);

export const paymentOrderStatusSchema = z.enum([
  'pending',
  'paid',
  'failed',
  'closed',
  'cancelled',
]);

export const alipayCheckoutPayloadSchema = z.object({
  type: z.literal('alipay'),
  orderString: z.string().optional(),
  payUrl: z.string().optional(),
});

export const wechatCheckoutPayloadSchema = z.object({
  type: z.literal('wechat_pay'),
  appId: z.string().optional(),
  timeStamp: z.string().optional(),
  nonceStr: z.string().optional(),
  package: z.string().optional(),
  signType: z.string().optional(),
  paySign: z.string().optional(),
  h5Url: z.string().optional(),
});

export const paymentCheckoutPayloadSchema = z.discriminatedUnion('type', [
  alipayCheckoutPayloadSchema,
  wechatCheckoutPayloadSchema,
]);

export const createPaymentOrderInputSchema = z.object({
  channel: paymentChannelIdSchema,
  amountFen: z.number().int().positive(),
  currency: z.literal('CNY').optional(),
  title: z.string().min(1).max(128),
  description: z.string().max(256).optional(),
  bizType: z.string().max(64).optional(),
  bizId: z.string().max(128).optional(),
});

export const paymentOrderSchema = z.object({
  id: z.string().min(1),
  channel: paymentChannelIdSchema,
  amountFen: z.number().int().positive(),
  currency: z.literal('CNY'),
  title: z.string(),
  status: paymentOrderStatusSchema,
  createdAt: z.string(),
  checkoutPayload: paymentCheckoutPayloadSchema.optional(),
  message: z.string().optional(),
});

export const createPaymentOrderResponseSchema = z.object({
  order: paymentOrderSchema,
});
