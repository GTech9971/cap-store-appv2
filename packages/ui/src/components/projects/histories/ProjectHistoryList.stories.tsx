import type { Meta, StoryObj } from '@storybook/react-vite';
import { Configuration, ProjectsHistoryApi } from 'cap-store-api-def';
import { ProjectHistoryList } from './ProjectHistoryList';

const meta: Meta<typeof ProjectHistoryList> = {
    title: 'Components/projects/histories/ProjectHistoryList',
    component: ProjectHistoryList,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],

} satisfies Meta<typeof ProjectHistoryList>;

export default meta;
type Story = StoryObj<typeof meta>;


const config: Configuration = new Configuration({
    basePath: 'http://localhost:6006'
});

const historyApi: ProjectsHistoryApi = new ProjectsHistoryApi(config);
export const Default: Story = {
    args: {
        historyApi: historyApi,
        projectId: 'P-000001'
    },
};