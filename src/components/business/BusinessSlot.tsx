import type { ReactNode } from 'react';
import { shouldRenderBusinessSlot } from '@/lib/business';
import { cn } from '@/utils/cn';

export type BusinessSlotId =
  | 'slotCityStay'
  | 'slotNicheExperience'
  | 'slotToolboxValueAdd';

type BusinessSlotProps = {
  slotId: BusinessSlotId;
  /** 无障碍 / 文档用标题；商业关闭时整块不渲染 */
  label: string;
  className?: string;
  children?: ReactNode;
};

/**
 * 商业插槽壳：仅当 isOpenBusiness 开启时渲染。
 * 约束：只允许放在页面底部 / 侧边附属位置；禁止放入首屏、地图、攻略主体。
 */
export default function BusinessSlot({
  slotId,
  label,
  className,
  children,
}: BusinessSlotProps) {
  if (!shouldRenderBusinessSlot(slotId)) {
    return null;
  }

  return (
    <aside
      className={cn('hr-business-slot', className)}
      data-business-slot={slotId}
      aria-label={label}
    >
      <p className="hr-business-slot__label">{label}</p>
      {children ?? (
        <p className="hr-business-slot__placeholder">预留扩展位 · 当前无内容</p>
      )}
    </aside>
  );
}
