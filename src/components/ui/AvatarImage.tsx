import OptimizedImage from '@/components/ui/OptimizedImage';
import { getAvatarAlt } from '@/utils/imageAlt';
import { cn } from '@/utils/cn';

export type AvatarImageProps = {
  src: string;
  /** 用于生成 alt，如「轻游小鹿 的头像」 */
  displayName: string;
  /** 覆盖自动生成的 alt */
  alt?: string;
  size: number;
  className?: string;
  priority?: boolean;
  onError?: () => void;
};

/** 圆形头像：封装 OptimizedImage 常用尺寸 */
export default function AvatarImage({
  src,
  displayName,
  alt,
  size,
  className,
  priority = false,
  onError,
}: AvatarImageProps) {
  const pixelSizes = [size, size * 2] as const;
  const resolvedAlt = alt?.trim() || getAvatarAlt(displayName);

  return (
    <OptimizedImage
      src={src}
      alt={resolvedAlt}
      width={size}
      height={size}
      sizes={`${size}px`}
      widths={pixelSizes}
      priority={priority}
      className={cn('rounded-full object-cover', className)}
      onError={onError}
    />
  );
}
