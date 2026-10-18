import BusinessSlot from '@/components/business/BusinessSlot';
import { cn } from '@/utils/cn';

type CityStayReferenceSlotProps = {
  className?: string;
};

/** 城市弹窗 · 美食板块底部「配套住宿参考」附属插槽（仅预留，默认无内容） */
export default function CityStayReferenceSlot({ className }: CityStayReferenceSlotProps) {
  return (
    <BusinessSlot
      slotId="slotCityStay"
      label="配套住宿参考"
      className={cn('hr-business-slot--city-stay', className)}
    />
  );
}
