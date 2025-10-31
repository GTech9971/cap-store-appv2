import type { Meta, StoryObj } from '@storybook/react-vite';

import { ProjectHistoryItem } from './ProjectHistoryItem';

const meta: Meta<typeof ProjectHistoryItem> = {
    title: 'Components/projects/histories/ProjectHistoryItem',
    component: ProjectHistoryItem,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],

} satisfies Meta<typeof ProjectHistoryItem>;

export default meta;
type Story = StoryObj<typeof meta>;


export const Default: Story = {
    args: {
        historyId: 'P-00001-H-000123',
        changeType: 'updated',
        createdAt: new Date(),
        message: 'BOMを追加',
        changedFields: [
            'bomList',
            'name',
            'summary'
        ]
    },
};

export const Delete: Story = {
    args: {
        historyId: 'P-00001-H-000123',
        changeType: 'deleted',
        createdAt: new Date(),
        changedFields: [],
        message: '間違えて作成した'
    },
};

export const Created: Story = {
    args: {
        historyId: 'P-00001-H-000123',
        changeType: 'created',
        createdAt: new Date(),
        changedFields: []
    },
};

export const Restore: Story = {
    args: {
        historyId: 'P-00001-H-000123',
        changeType: 'restored',
        createdAt: new Date(),
        changedFields: []
    },
};