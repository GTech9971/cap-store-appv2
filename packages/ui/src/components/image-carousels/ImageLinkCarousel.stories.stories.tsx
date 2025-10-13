import type { Meta, StoryObj } from '@storybook/react-vite';
import { ImageLinkCarousel } from './ImageLinkCarousel';

const meta: Meta<typeof ImageLinkCarousel> = {
    title: 'Components/images/ImageLinkCarousel',
    component: ImageLinkCarousel,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
    args: {
        images: [],
        onDelete: undefined,
    },
};

export const SingleImage: Story = {
    args: {
        images: [
            {
                url: 'https://akizukidenshi.com//img/goods/L/113065.jpg',
                title: 'メイン',
                tag: 'タグ'
            },
        ],
        onDelete: undefined,
    },
};

export const MultipleImages: Story = {
    args: {
        images: [
            {
                url: 'https://akizukidenshi.com//img/goods/L/113065.jpg',
                title: 'メイン',
                tag: 'メイン'
            },
            {
                url: 'https://akizukidenshi.com//img/goods/1/113065.jpg',
                title: 'サブ',
                tag: 'サブ'
            }
        ],
        onDelete: undefined,
    },
};

