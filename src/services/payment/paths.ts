/**
 * 支付 API 路径（由后端实现；密钥与回调仅在服务端）。
 *
 * 建议后端路由：
 * - POST   /payments/orders           创建支付单并返回调起参数
 * - GET    /payments/orders/:id         查询支付状态
 * - POST   /payments/notify/alipay      支付宝异步通知（公网 HTTPS）
 * - POST   /payments/notify/wechat      微信支付异步通知
 */
export const PAYMENT_API = {
  orders: '/payments/orders',
  orderById: (orderId: string) => `/payments/orders/${encodeURIComponent(orderId)}`,
  notifyAlipay: '/payments/notify/alipay',
  notifyWechat: '/payments/notify/wechat',
} as const;
