import type { Meta, StoryObj } from '@storybook/react';
import FeatureComponentTemplate, {
  FeatureComponentTemplateSkeleton,
} from './FeatureComponentTemplate';

const meta = {
  title: 'Templates/FeatureComponentTemplate',
  component: FeatureComponentTemplate,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'accent'],
    },
    onAction: { action: 'action' },
  },
} satisfies Meta<typeof FeatureComponentTemplate>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: '示例标题',
    children: '展开后显示的正文内容。',
    variant: 'default',
  },
};

export const Accent: Story = {
  args: {
    ...Default.args,
    variant: 'accent',
    title: '强调样式',
  },
};

export const TitleOnly: Story = {
  args: {
    title: '仅标题',
    children: undefined,
  },
};

export const Skeleton: Story = {
  args: {
    title: '骨架屏',
  },
  render: () => <FeatureComponentTemplateSkeleton className="max-w-md" />,
};
