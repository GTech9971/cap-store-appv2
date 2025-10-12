import type { Meta, StoryObj } from '@storybook/react-vite';

import { ImageCarousel } from './ImageCarousel';

const meta: Meta<typeof ImageCarousel> = {
  title: 'Components/ImageCarousel',
  component: ImageCarousel,
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
    images: ['https://akizukidenshi.com//img/goods/L/113065.jpg'],
    onDelete: undefined,
  },
};

export const MultipleImages: Story = {
  args: {
    images: [
      'https://akizukidenshi.com//img/goods/L/113065.jpg',
      'https://akizukidenshi.com//img/goods/1/113065.jpg',
      'https://akizukidenshi.com//img/goods/2/113065.jpg',
      'https://akizukidenshi.com//img/goods/3/113065.jpg',
      'https://akizukidenshi.com//img/goods/4/113065.jpg'
    ],
    onDelete: undefined,
  },
};

export const WithDeleteButton: Story = {
  args: {
    images: [
      'https://akizukidenshi.com//img/goods/L/113065.jpg',
      'https://akizukidenshi.com//img/goods/1/113065.jpg',
      'https://akizukidenshi.com//img/goods/2/113065.jpg',
      'https://akizukidenshi.com//img/goods/3/113065.jpg',
      'https://akizukidenshi.com//img/goods/4/113065.jpg'
    ],
    onDelete: (index: number) => console.log(`Delete image at index: ${index}`),
  },
};
