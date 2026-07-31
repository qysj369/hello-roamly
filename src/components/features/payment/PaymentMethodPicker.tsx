import { Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import {
  PaymentNotConfiguredError,
  getPaymentChannelLabel,
  launchPaymentCheckout,
  listPaymentChannels,
} from '@/lib/payment';
import { createPaymentOrder } from '@/services/payment';
import type { CreatePaymentOrderInput, PaymentChannelId } from '@/types/domain/payment';
import { cn } from '@/utils/cn';

export type PaymentMethodPickerProps = {
  /** 演示金额（分），如 990 表示 ¥9.90 */
  amountFen: number;
  title: string;
  description?: string;
  bizType?: string;
  bizId?: string;
  className?: string;
  /** 未接后端时仍允许点击以查看预留提示 */
  allowDemo?: boolean;
  onOrderCreated?: (orderId: string) => void;
  onError?: (message: string) => void;
};

const CHANNEL_STYLE: Record<PaymentChannelId, string> = {
  alipay: 'border-sky-200 bg-sky-50 text-sky-900 hover:border-sky-300',
  wechat_pay: 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-300',
};

export default function PaymentMethodPicker({
  amountFen,
  title,
  description,
  bizType,
  bizId,
  className,
  allowDemo = true,
  onOrderCreated,
  onError,
}: PaymentMethodPickerProps) {
  const channels = listPaymentChannels();
  const [loadingChannel, setLoadingChannel] = useState<PaymentChannelId | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handlePay = useCallback(
    async (channel: PaymentChannelId) => {
      const meta = channels.find((item) => item.id === channel);
      if (!meta?.reserved) {
        return;
      }
      if (!meta.available && !allowDemo) {
        onError?.(meta.unavailableReason ?? '支付暂不可用');
        return;
      }

      setLoadingChannel(channel);
      setStatusMessage(null);

      const input: CreatePaymentOrderInput = {
        channel,
        amountFen,
        title,
        description,
        bizType,
        bizId,
      };

      try {
        const order = await createPaymentOrder(input);

        if (!meta.available) {
          setStatusMessage(order.message ?? `${getPaymentChannelLabel(channel)} 接口已预留`);
          onOrderCreated?.(order.id);
          return;
        }

        await launchPaymentCheckout(order);
        onOrderCreated?.(order.id);
      } catch (error) {
        const message =
          error instanceof PaymentNotConfiguredError
            ? error.message
            : error instanceof Error
              ? error.message
              : '创建支付单失败';
        setStatusMessage(message);
        onError?.(message);
      } finally {
        setLoadingChannel(null);
      }
    },
    [allowDemo, amountFen, bizId, bizType, channels, description, onError, onOrderCreated, title],
  );

  const amountYuan = (amountFen / 100).toFixed(2);

  return (
    <div className={cn('space-y-3', className)}>
      <p className="text-xs text-slate-500">
        应付金额 <span className="font-semibold text-slate-800">¥{amountYuan}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {channels.map((channel) => {
          const disabled = !channel.reserved || (!channel.available && !allowDemo);
          const loading = loadingChannel === channel.id;

          return (
            <button
              key={channel.id}
              type="button"
              disabled={disabled || loading}
              onClick={() => handlePay(channel.id)}
              className={cn(
                'inline-flex min-w-[7.5rem] flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
                CHANNEL_STYLE[channel.id],
              )}
              title={channel.unavailableReason}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {channel.label}
              {!channel.available && (
                <span className="text-[10px] font-normal opacity-70">预留</span>
              )}
            </button>
          );
        })}
      </div>
      {statusMessage && (
        <p className="text-xs leading-relaxed text-amber-800" role="status">
          {statusMessage}
        </p>
      )}
    </div>
  );
}
