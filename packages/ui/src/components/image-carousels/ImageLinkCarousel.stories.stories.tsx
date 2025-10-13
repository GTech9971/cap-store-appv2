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
        onEditedTitle: (index, title) => { console.warn(index, title) },
        onEditedTag: (index, tag) => { console.warn(index, tag) },
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

            // 'https://akizukidenshi.com//img/goods/2/113065.jpg',
            // 'https://akizukidenshi.com//img/goods/3/113065.jpg',
            // 'https://akizukidenshi.com//img/goods/4/113065.jpg'
        ],
        onEditedTitle: (index, title) => { console.warn(index, title) },
        onEditedTag: (index, tag) => { console.warn(index, tag) },
        onDelete: undefined,
    },
};

// export const WithDeleteButton: Story = {
//     args: {
//         images: [
//             'https://akizukidenshi.com//img/goods/L/113065.jpg',
//             'https://akizukidenshi.com//img/goods/1/113065.jpg',
//             'https://akizukidenshi.com//img/goods/2/113065.jpg',
//             'https://akizukidenshi.com//img/goods/3/113065.jpg',
//             'https://akizukidenshi.com//img/goods/4/113065.jpg'
//         ],
//         onDelete: (index: number) => console.log(`Delete image at index: ${index}`),
//     },
// };
