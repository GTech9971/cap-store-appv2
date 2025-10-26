import React, { useEffect, useState } from 'react';
import { IonIcon, IonImg, IonText } from '@ionic/react';
import { imageOutline } from 'ionicons/icons';
import { Indicator } from './Indicator';
import { PreviousButton } from './PreviousButton';
import { NextButton } from './NextButtons';
import { DeleteButton } from './DeleteButton';

export interface ImageCarouselProps {
    images: string[];
    onDelete?: (index: number) => void;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, onDelete }) => {
    const [index, setIndex] = useState<number>(0);

    useEffect(() => {
        if (index >= images.length) {
            setIndex(images.length > 0 ? images.length - 1 : 0);
        }
    }, [images, index]);

    if (!images || images.length === 0) {
        return (
            <div style={{
                height: '192px',
                backgroundColor: 'var(--ion-color-light)',
                border: '1px solid #ddd',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <IonText color="medium" style={{ padding: '20px', textAlign: 'center', }}>
                    画像プレビュー
                </IonText>
                <br />
                <IonIcon icon={imageOutline} />
            </div>
        );
    }

    return (
        <div style={{ width: '100%' }}>
            <div style={{
                position: 'relative',
                width: '100%',
                height: '192px',
                backgroundColor: 'var(--ion-color-light)',
                border: '1px solid #ddd',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <IonImg
                    src={images[index]}
                    alt="preview"
                    style={{
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: '8px'
                    }}
                />
                {onDelete && (
                    <DeleteButton
                        onDelete={() => onDelete(index)} />
                )}

                {images.length > 1 && (
                    <>
                        <PreviousButton
                            onClick={() => setIndex((index - 1 + images.length) % images.length)} />

                        <NextButton
                            onClick={() => setIndex((index + 1) % images.length)} />
                    </>
                )}
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                paddingTop: '8px'
            }}>
                {images.map((_, i) => (
                    <Indicator
                        key={i}
                        isSelected={i === index}
                        onClick={() => setIndex(i)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ImageCarousel;