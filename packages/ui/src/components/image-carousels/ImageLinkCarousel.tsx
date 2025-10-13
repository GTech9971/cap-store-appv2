import { IonBadge, IonIcon, IonImg, IonLabel, IonText } from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import { imageOutline } from 'ionicons/icons';
import { Indicator } from "./Indicator";
import { DeleteButton } from "./DeleteButton";
import { PreviousButton } from "./PreviousButton";
import { NextButton } from "./NextButtons";

export type ImageLink = {
    url: string,
    title?: string,
    tag?: string
}

export interface ImageLinkCarouselProps {
    images: ImageLink[];
    onDelete?: (index: number) => void;
}

export const ImageLinkCarousel: React.FC<ImageLinkCarouselProps> = ({
    images,
    onDelete
}) => {

    const [index, setIndex] = useState<number>(0);

    useEffect(() => {
        if (index >= images.length) {
            setIndex(images.length > 0 ? images.length - 1 : 0);
        }
    }, [images, index]);

    const url: string = useMemo(() => images[index].url, [images, index]);
    const title: string = useMemo(() => images[index]?.title ?? 'タイトル無し', [images, index]);
    const tag: string = useMemo(() => images[index]?.tag ?? 'タグ無し', [images, index]);

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
                    src={url}
                    alt="preview"
                    style={{
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: '8px'
                    }}
                />

                <IonLabel
                    style={{
                        position: 'absolute',
                        right: '4px',
                        top: '4px',
                        zIndex: 10,
                        '--padding-start': '8px',
                        '--padding-end': '8px',
                        '--padding-top': '4px',
                        '--padding-bottom': '4px',
                    }}>
                    {title}
                </IonLabel>


                <IonBadge
                    style={{
                        position: 'absolute',
                        right: '8px',
                        top: '28px',
                        zIndex: 10,
                        '--padding-start': '8px',
                        '--padding-end': '8px',
                        '--padding-top': '4px',
                        '--padding-bottom': '4px',
                    }}>
                    {tag}
                </IonBadge>

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
        </div >
    );
}


export default ImageLinkCarousel;