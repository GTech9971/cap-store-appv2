import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExternalLinkList } from './ExternalLinkList';
import type { ProjectExternalLink } from 'cap-store-api-def';
import { EmptyExternalLink } from '../../types/EmptyExternalLink';

const meta: Meta<typeof ExternalLinkList> = {
    title: 'Components/ExternalLinks/List',
    component: ExternalLinkList,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],

} satisfies Meta<typeof ExternalLinkList>;

export default meta;
type Story = StoryObj<typeof meta>;

const links: ProjectExternalLink[] = [
    {
        link: 'https://github.com/GTech9971/CapStore-api-definition',
        title: 'Github',
        tag: 'Github',
    },
    {
        link: 'https://github.com/GTech9971/CapStore-api-definition',
    }
];

export const Default: Story = {
    args: {
        links: links,
        onEditedLink: (link) => console.warn(link),
        onEditedTitle: (title) => console.warn(title),
        onEditedTag: (tag) => console.warn(tag)
    },
};

export const DeleteButton: Story = {
    args: {
        links: links,
        onEditedLink: (link) => console.warn(link),
        onEditedTitle: (title) => console.warn(title),
        onEditedTag: (tag) => console.warn(tag),
        onDelete: () => console.warn(),
        onAddEmptyLink: () => links.push(EmptyExternalLink)
    },
};