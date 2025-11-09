import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExternalLinkItem } from './ExternalLinkItem';


const meta: Meta<typeof ExternalLinkItem> = {
    title: 'Components/ExternalLinks/Item',
    component: ExternalLinkItem,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],

} satisfies Meta<typeof ExternalLinkItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        link: 'https://github.com/GTech9971/CapStore-api-definition',
        onEditedLink: (link) => console.warn(link),
        title: 'Github',
        onEditedTitle: (title) => console.warn(title),
        tag: 'Github',
        onEditedTag: (tag) => console.warn(tag)
    },
};

export const DeleteButton: Story = {
    args: {
        link: 'https://github.com/GTech9971/CapStore-api-definition',
        onEditedLink: (link) => console.warn(link),
        title: 'Github',
        onEditedTitle: (title) => console.warn(title),
        tag: 'Github',
        onEditedTag: (tag) => console.warn(tag),
        onDelete: (link) => console.warn(link)
    },
};