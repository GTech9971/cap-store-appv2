import type { Meta, StoryObj } from '@storybook/react-vite';

import { ProjectPage } from './ProjectPage';

const meta: Meta<typeof ProjectPage> = {
    title: 'Layouts/ProjectPage',
    component: ProjectPage,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],

} satisfies Meta<typeof ProjectPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {

    args: {

    },
};

