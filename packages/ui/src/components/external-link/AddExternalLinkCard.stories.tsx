import type { Meta, StoryObj } from "@storybook/react-vite";
import { AddExternalLinkCard } from "./AddExternalLinkCard";

const meta: Meta<typeof AddExternalLinkCard> = {
    title: 'Components/AddExternalLinkCard',
    component: AddExternalLinkCard,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],

} satisfies Meta<typeof AddExternalLinkCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
};