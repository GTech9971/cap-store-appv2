import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProjectList } from './ProjectList';
import { Configuration, ProjectsApi } from 'cap-store-api-def';

const meta: Meta<typeof ProjectList> = {
    title: 'Components/projects/ProjectList',
    component: ProjectList,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],

} satisfies Meta<typeof ProjectList>;

export default meta;
type Story = StoryObj<typeof meta>;


const config: Configuration = new Configuration({
    basePath: 'http://localhost:6006'
});

const projectApi: ProjectsApi = new ProjectsApi(config);
export const Default: Story = {

    args: {
        projectApi: projectApi
    },
};