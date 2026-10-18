import BusinessSlot from '@/components/business/BusinessSlot';
import { cn } from '@/utils/cn';

type ToolboxValueAddSlotProps = {
  className?: string;
};

/** 慢行工具箱侧边「增值服务」入口插槽（仅预留，默认无内容） */
export default function ToolboxValueAddSlot({ className }: ToolboxValueAddSlotProps) {
  return (
    <BusinessSlot
      slotId="slotToolboxValueAdd"
      label="增值服务"
      className={cn('hr-business-slot--toolbox', className)}
    />
  );
}
