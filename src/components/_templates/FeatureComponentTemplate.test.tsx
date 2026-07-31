import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import FeatureComponentTemplate, {
  FeatureComponentTemplateSkeleton,
} from './FeatureComponentTemplate';

describe('FeatureComponentTemplate', () => {
  it('renders the title', () => {
    render(<FeatureComponentTemplate title="  行程卡片  " />);

    expect(screen.getByRole('heading', { name: '行程卡片' })).toBeInTheDocument();
  });

  it('uses fallback title when trimmed title is empty', () => {
    render(<FeatureComponentTemplate title="   " />);

    expect(screen.getByRole('heading', { name: '未命名' })).toBeInTheDocument();
  });

  it('toggles content visibility and calls onAction', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    render(
      <FeatureComponentTemplate title="测试" onAction={onAction}>
        详情正文
      </FeatureComponentTemplate>,
    );

    const toggle = screen.getByRole('button', { name: '展开' });
    expect(screen.queryByText('详情正文')).not.toBeInTheDocument();

    await user.click(toggle);

    expect(screen.getByText('详情正文')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '收起' })).toHaveAttribute('aria-expanded', 'true');
    expect(onAction).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: '收起' }));

    expect(screen.queryByText('详情正文')).not.toBeInTheDocument();
    expect(onAction).toHaveBeenCalledTimes(2);
  });

  it('applies accent variant classes', () => {
    const { container } = render(
      <FeatureComponentTemplate title="强调" variant="accent" />,
    );

    expect(container.querySelector('section')).toHaveClass('border-amber-200/90');
  });

  it('merges custom className on the root section', () => {
    const { container } = render(
      <FeatureComponentTemplate title="样式" className="mt-8" />,
    );

    expect(container.querySelector('section')).toHaveClass('mt-8');
  });
});

describe('FeatureComponentTemplateSkeleton', () => {
  it('renders a decorative skeleton', () => {
    const { container } = render(<FeatureComponentTemplateSkeleton className="max-w-sm" />);

    const skeleton = container.firstElementChild;
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    expect(skeleton).toHaveClass('animate-pulse', 'max-w-sm');
  });
});
