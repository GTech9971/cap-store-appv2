import type { Meta, StoryObj } from '@storybook/react-vite';

import { CategoriesApi, Configuration } from 'cap-store-api-def';
import { CategoryList } from './CategoryList';

const meta: Meta<typeof CategoryList> = {
    title: 'Components/categories/CategoryList',
    component: CategoryList,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],

} satisfies Meta<typeof CategoryList>;

export default meta;
type Story = StoryObj<typeof meta>;


const config: Configuration = new Configuration({
    basePath: 'http://localhost:6006'
});

const categoryApi: CategoriesApi = new CategoriesApi(config);
export const Default: Story = {

    args: {
        categoryApi: categoryApi
    },
};