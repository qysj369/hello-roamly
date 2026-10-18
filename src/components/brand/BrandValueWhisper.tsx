import {
  BRAND_CORE_VALUES,
  BRAND_PAGE_VALUE_WHISPER,
} from '@/lib/config/brandMindshare';
import { cn } from '@/utils/cn';

type BrandValueWhisperProps = {
  className?: string;
  /** 是否展示四大价值观短列 */
  showValues?: boolean;
};

/**
 * 站内品牌引导短句：仅文案模块，不介入业务逻辑。
 * 用于反馈页 / 游记发布页等底部温和收束。
 */
export default function BrandValueWhisper({
  className,
  showValues = false,
}: BrandValueWhisperProps) {
  return (
    <aside className={cn('hr-brand-whisper', className)} aria-label="蜗牛旅行价值观">
      <p className="hr-brand-whisper__line">{BRAND_PAGE_VALUE_WHISPER}</p>
      {showValues ? (
        <ul className="hr-brand-whisper__values">
          {BRAND_CORE_VALUES.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <span>：{item.line}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </aside>
  );
}
