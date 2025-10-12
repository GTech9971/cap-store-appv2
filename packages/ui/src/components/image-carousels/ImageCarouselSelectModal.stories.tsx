import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { IonButton, } from '@ionic/react';

import { ImageCarouselSelectModal } from './ImageCarouselSelectModal';
import ImageCarousel from './ImageCarousel';

const meta: Meta<typeof ImageCarouselSelectModal> = {
    title: 'Components/images/ImageCarouselSelectModal',
    component: ImageCarouselSelectModal,
    parameters: {
        layout: 'centered',
    },
    argTypes: {
        isOpen: { control: false },
        images: { control: false },
        onChange: { control: false },
        onDismiss: { control: false },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => {
        const [images, setImages] = useState<string[]>([
            'https://akizukidenshi.com//img/goods/L/113065.jpg',
            'https://akizukidenshi.com//img/goods/1/113065.jpg',
            'https://akizukidenshi.com//img/goods/2/113065.jpg',
            'https://akizukidenshi.com//img/goods/3/113065.jpg',
            'https://akizukidenshi.com//img/goods/4/113065.jpg'
        ]);
        const [isOpen, setIsOpen] = useState(false);
        const { isOpen: _ignoredIsOpen, images: _ignoredImages, onChange: _ignoredOnChange, onDismiss: _ignoredOnDismiss, ...rest } = args;

        return (
            <>
                <ImageCarousel images={images} />
                <IonButton onClick={() => setIsOpen(true)}>画像を編集</IonButton>

                <ImageCarouselSelectModal
                    {...rest}
                    isOpen={isOpen}
                    images={images}
                    onChange={(next) => setImages(next)}
                    onDismiss={() => setIsOpen(false)}
                />
            </>
        );
    }
}
