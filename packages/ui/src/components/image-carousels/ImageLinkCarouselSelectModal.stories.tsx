import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { IonButton, IonText } from '@ionic/react';
import { ImageLinkCarouselSelectModal } from './ImageLinkCarouselSelectModal';
import ImageLinkCarousel, { type ImageLink } from './ImageLinkCarousel';


const meta: Meta<typeof ImageLinkCarouselSelectModal> = {
    title: 'Components/images/ImageLinkCarouselSelectModal',
    component: ImageLinkCarouselSelectModal,
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
        const [images, setImages] = useState<ImageLink[]>([
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
        ]);
        const [isOpen, setIsOpen] = useState(false);
        const { isOpen: _ignoredIsOpen, images: _ignoredImages, onChange: _ignoredOnChange, onDismiss: _ignoredOnDismiss, ...rest } = args;

        return (
            <>
                <ImageLinkCarousel images={images} />
                <IonButton onClick={() => setIsOpen(true)}>画像を編集</IonButton>
                <IonText color="medium" style={{ marginTop: '8px' }}>
                    タイトルやタグのテキストをクリックして編集し、保存してください。
                </IonText>

                <ImageLinkCarouselSelectModal
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
