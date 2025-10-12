import React, { useEffect, useState } from 'react';
import { IonButton, IonIcon, IonImg, IonText } from '@ionic/react';
import { chevronBack, chevronForward, close, imageOutline } from 'ionicons/icons';

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
                backgroundColor: '#f5f5f5',
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
                    <IonButton
                        fill="clear"
                        color="danger"
                        size="small"
                        onClick={() => onDelete(index)}
                        style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            zIndex: 10,
                            '--padding-start': '8px',
                            '--padding-end': '8px',
                            '--padding-top': '4px',
                            '--padding-bottom': '4px',
                            minHeight: '24px'
                        }}
                    >
                        <IonIcon icon={close} style={{ fontSize: '16px' }} />
                    </IonButton>
                )}

                {images.length > 1 && (
                    <>
                        <IonButton
                            fill="clear"
                            size="small"
                            onClick={() => setIndex((index - 1 + images.length) % images.length)}
                            style={{
                                position: 'absolute',
                                left: '8px',
                                '--padding-start': '6px',
                                '--padding-end': '6px',
                                '--padding-top': '6px',
                                '--padding-bottom': '6px',
                                minHeight: '32px',
                                opacity: 0.8
                            }}
                        >
                            <IonIcon icon={chevronBack} />
                        </IonButton>
                        <IonButton
                            fill="clear"
                            size="small"
                            onClick={() => setIndex((index + 1) % images.length)}
                            style={{
                                position: 'absolute',
                                right: '8px',
                                '--padding-start': '6px',
                                '--padding-end': '6px',
                                '--padding-top': '6px',
                                '--padding-bottom': '6px',
                                minHeight: '32px',
                                opacity: 0.8
                            }}
                        >
                            <IonIcon icon={chevronForward} />
                        </IonButton>
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
                    <div
                        key={i}
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: i === index ? 'var(--ion-color-primary)' : '#ccc',
                            cursor: 'pointer'
                        }}
                        onClick={() => setIndex(i)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ImageCarousel;