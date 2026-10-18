import BusinessSlot from '@/components/business/BusinessSlot';
import { cn } from '@/utils/cn';

type NicheExperienceReferenceSlotProps = {
  className?: string;
};

/** AI 攻略结果页底部「小众体验参考」附属插槽（仅预留，默认无内容） */
export default function NicheExperienceReferenceSlot({
  className,
}: NicheExperienceReferenceSlotProps) {
  return (
    <BusinessSlot
      slotId="slotNicheExperience"
      label="小众体验参考"
      className={cn('hr-business-slot--niche', className)}
    />
  );
}
