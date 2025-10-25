import type { Meta, StoryObj } from '@storybook/react-vite';
import { Indicator } from './Indicator';

const meta: Meta<typeof Indicator> = {
    title: 'Components/images/Indicator',
    component: Indicator,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        isSelected: true
    },
};

export const UnSelected: Story = {
    args: {
        isSelected: false
    },
};
