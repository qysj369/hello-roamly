import type { AiSnailGuideStep } from '@/types/domain/aiSnailGuide';
import { cn } from '@/utils/cn';

const WIZARD_STEPS = [
  { key: 'destination', label: '目的地' },
  { key: 'days', label: '天数' },
  { key: 'budget', label: '预算' },
  { key: 'preferences', label: '偏好' },
  { key: 'result', label: '成稿' },
] as const;

function activeIndex(step: AiSnailGuideStep): number {
  switch (step) {
    case 'destination':
      return 0;
    case 'days':
      return 1;
    case 'budget':
      return 2;
    case 'preferences':
      return 3;
    case 'generating':
    case 'editor':
    case 'published':
      return 4;
    default:
      return 0;
  }
}

type AiSnailStepProgressProps = {
  step: AiSnailGuideStep;
  className?: string;
};

/** AI蜗牛向导步骤条（仅展示，不改流程） */
export default function AiSnailStepProgress({ step, className }: AiSnailStepProgressProps) {
  const current = activeIndex(step);

  return (
    <ol className={cn('holo-ai-snail__steps', className)} aria-label="攻略引导步骤">
      {WIZARD_STEPS.map((item, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li
            key={item.key}
            className={cn(
              'holo-ai-snail__step',
              done && 'is-done',
              active && 'is-active',
            )}
            aria-current={active ? 'step' : undefined}
          >
            <span className="holo-ai-snail__step-dot" aria-hidden>
              {done ? '✓' : index + 1}
            </span>
            <span className="holo-ai-snail__step-label">{item.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
