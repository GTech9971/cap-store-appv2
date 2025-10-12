import { useCallback, useEffect, useState } from "react"
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonImg,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonModal,
    IonThumbnail,
    IonTitle,
    IonToolbar
} from "@ionic/react"
import { closeOutline } from "ionicons/icons"

export interface Prop {
    isOpen: boolean
    images: string[]
    onChange?: (images: string[]) => void
    onDismiss: () => void
}

export const ImageCarouselSelectModal: React.FC<Prop> = ({
    isOpen,
    images,
    onChange,
    onDismiss
}) => {
    const [localImages, setLocalImages] = useState<string[]>(images);
    const [newImageInput, setNewImageInput] = useState<string>("");

    useEffect(() => {
        if (isOpen) {
            setLocalImages(images);
            setNewImageInput("");
        }
    }, [isOpen, images]);

    const handleRemoveImage = useCallback((url: string) => {
        setLocalImages((prev) => prev.filter((item) => item !== url));
    }, []);



    const handleAddImage = useCallback(() => {
        const candidates = newImageInput
            .split(",")
            .map((url) => url.trim())
            .filter((url) => url.length > 0);

        if (candidates.length === 0) { return }

        setLocalImages((prev) => {
            const next = [...prev];
            candidates.forEach((url) => {
                if (!next.includes(url)) {
                    next.push(url);
                }
            })
            return next;
        });
        setNewImageInput("");
    }, [newImageInput]);

    const handleKeydown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newImageInput) {
            handleAddImage();
        };
    }, [newImageInput, handleAddImage]);

    const handleCancel = useCallback(() => {
        setLocalImages(images)
        setNewImageInput("")
        onDismiss()
    }, [onDismiss, images])

    const handleSave = useCallback(() => {
        onChange?.(localImages)
        onDismiss()
    }, [onChange, localImages, onDismiss])

    return (
        <IonModal isOpen={isOpen} backdropDismiss={false}>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton fill="clear" onClick={handleCancel}>
                            キャンセル
                        </IonButton>
                    </IonButtons>
                    <IonTitle>画像の編集</IonTitle>
                    <IonButtons slot="end">

                        <IonButton fill="clear" onClick={handleSave}>
                            保存
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonList inset>
                    {localImages.map((url) => (
                        <IonItem key={url}>
                            <IonThumbnail>
                                <IonImg src={url} />
                            </IonThumbnail>
                            <IonLabel style={{ whiteSpace: "normal" }}>{url}</IonLabel>
                            <IonButton
                                slot="end"
                                fill="clear"
                                color="danger"
                                onClick={() => handleRemoveImage(url)}>
                                <IonIcon icon={closeOutline} />
                            </IonButton>
                        </IonItem>
                    ))}
                    {localImages.length === 0 && (
                        <IonItem>
                            <IonLabel color="medium">画像がありません。追加してください。</IonLabel>
                        </IonItem>
                    )}
                </IonList>

                <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <IonInput
                        label="画像URLを追加"
                        labelPlacement="stacked"
                        placeholder="画像URL（カンマ区切りで複数可）"
                        value={newImageInput}
                        onKeyDown={handleKeydown}
                        onIonInput={(e) => setNewImageInput(e.detail.value ?? "")}
                    />
                    <IonButton onClick={handleAddImage} disabled={newImageInput.trim().length === 0}>
                        追加
                    </IonButton>
                </div>
            </IonContent>
        </IonModal>
    )
}

export default ImageCarouselSelectModal;