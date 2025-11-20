import type { Meta, StoryObj } from '@storybook/react-vite';
import { NorthRoom } from './NorthRoom';

const meta: Meta<typeof NorthRoom> = {
    title: 'Components/locations/NorthRoom',
    component: NorthRoom,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
    },
};
