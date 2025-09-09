import type { Meta, StoryObj } from '@storybook/react';

import { ComponentCard } from './ComponentCard';

const meta: Meta<typeof ComponentCard> = {
  title: 'Components/ComponentCard',
  component: ComponentCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    currentStock: { control: 'number' },
    onClick: { action: 'clicked' },
  },
  args: { onClick: undefined },
} satisfies Meta<typeof ComponentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: '1',
    name: 'Sample Component',
    model: 'Model ABC-123',
    img: 'https://akizukidenshi.com//img/goods/L/113065.jpg',
    currentStock: 10,
  },
};